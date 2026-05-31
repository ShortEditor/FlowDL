import asyncio
import os
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .downloader import (
    build_yt_dlp_cmd,
    get_media_type,
    get_video_info,
    sanitize_filename,
    COOKIES_PATH,
)
from .models import DownloadRequest, VideoInfo

# ---------------------------------------------------------------------------
# App setup & YouTube Cookies writing
# ---------------------------------------------------------------------------

# Write YouTube cookies dynamically from environment variable to bypass anti-bot blocks
yt_cookies = os.getenv("YT_COOKIES")
if yt_cookies:
    try:
        # Ensure parent directories exist
        os.makedirs(os.path.dirname(COOKIES_PATH), exist_ok=True)
        
        # Determine if cookies are in JSON format
        cookies_str = yt_cookies.strip()
        if cookies_str.startswith("[") and cookies_str.endswith("]"):
            import json
            try:
                cookies_list = json.loads(cookies_str)
                if isinstance(cookies_list, list):
                    lines = [
                        "# Netscape HTTP Cookie File",
                        "# http://curl.haxx.se/rfc/cookie_spec.html",
                        "# This file is generated dynamically by FlowDL.",
                    ]
                    for cookie in cookies_list:
                        domain = cookie.get("domain", "")
                        host_only = cookie.get("hostOnly", False)
                        include_subdomains = "FALSE" if host_only else "TRUE"
                        path = cookie.get("path", "/")
                        secure = "TRUE" if cookie.get("secure", False) else "FALSE"
                        
                        exp = cookie.get("expirationDate")
                        expiration = str(int(float(exp))) if exp is not None else "0"
                        
                        name = cookie.get("name", "")
                        value = cookie.get("value", "")
                        
                        if domain and name:
                            lines.append(f"{domain}\t{include_subdomains}\t{path}\t{secure}\t{expiration}\t{name}\t{value}")
                    
                    cookies_str = "\n".join(lines) + "\n"
                    print("Detected JSON cookies. Successfully converted to Netscape format.")
            except Exception as json_err:
                print(f"Failed to parse cookies as JSON, treating as raw Netscape: {json_err}")

        with open(COOKIES_PATH, "w", encoding="utf-8") as f:
            f.write(cookies_str)
        print("Successfully initialized YouTube cookies from YT_COOKIES environment variable.")
    except Exception as e:
        print(f"Warning: Failed to write cookies.txt from environment variable: {e}")

app = FastAPI(
    title="FlowDL API",
    description="Universal video downloader powered by yt-dlp. Zero server storage — piped streaming.",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "*")

# Always allow localhost for local dev
origins = [ALLOWED_ORIGIN] if ALLOWED_ORIGIN != "*" else ["*"]
if ALLOWED_ORIGIN != "*":
    origins += [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_url(url: str) -> None:
    """Basic URL sanity check — raises HTTPException on failure."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError
    except Exception:
        raise HTTPException(status_code=400, detail="invalid_url")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    """Health check endpoint for Render and pre-warm pings."""
    return {"status": "ok", "version": "2.0.0"}


@app.get("/info", response_model=VideoInfo)
async def info(url: str = Query(..., description="URL-encoded video URL")):
    """
    Fetch video metadata using yt-dlp --dump-json.
    Returns title, thumbnail, duration, uploader, available qualities, and 4K support flag.
    """
    _validate_url(url)

    try:
        data = await get_video_info(url)
        return VideoInfo(**data)
    except ValueError as e:
        msg = str(e)
        if msg == "unsupported_site":
            raise HTTPException(status_code=422, detail="unsupported_site")
        raise HTTPException(status_code=422, detail=msg)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/download")
async def download(req: DownloadRequest):
    """
    Piped streaming download endpoint.

    Spawns yt-dlp with -o - (stdout mode). Reads 64KB chunks from the process
    stdout and yields them immediately via StreamingResponse. The video file never
    touches server disk. RAM usage is ~50MB constant regardless of file size.
    """
    _validate_url(req.url)

    # Determine actual output format (quality 2160 forces mkv)
    output_format = req.format
    if req.quality == "2160":
        output_format = "mkv"

    # Build yt-dlp command
    cmd = build_yt_dlp_cmd(req.url, output_format, req.quality)

    # Spawn subprocess — stdout piped, stderr captured for error reporting
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="yt-dlp is not installed on the server.")

    # Fetch a clean filename (best-effort — may be empty on some sites)
    try:
        meta = await get_video_info(req.url)
        raw_title = meta.get("title", "video") if isinstance(meta, dict) else "video"
    except Exception:
        raw_title = "video"

    filename = f"{sanitize_filename(raw_title)}.{output_format}"
    media_type = get_media_type(output_format)

    # Async generator: pipe yt-dlp stdout → HTTP response in 64KB chunks
    async def stream_generator():
        try:
            while True:
                chunk = await process.stdout.read(65536)  # 64KB — OS pipe buffer size
                if not chunk:
                    break
                yield chunk
        except (BrokenPipeError, ConnectionResetError):
            # Client disconnected — clean up yt-dlp process
            pass
        finally:
            if process.returncode is None:
                try:
                    process.terminate()
                    await asyncio.wait_for(process.wait(), timeout=5.0)
                except Exception:
                    pass

    return StreamingResponse(
        stream_generator(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store",
        },
    )
