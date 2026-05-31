import asyncio
import json
import re
import subprocess
import os
from typing import List

QUALITY_FORMAT_MAP = {
    "360": "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]/best",
    "480": "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]/best",
    "720": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]/best",
    "1080": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]/best",
    "best": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    "2160": "bestvideo[height<=2160]+bestaudio/best",
}

import tempfile

COOKIES_PATH = os.path.join(tempfile.gettempdir(), "flowdl_cookies.txt")


async def get_video_info(url: str) -> dict:
    """
    Run yt-dlp --dump-json to fetch video metadata.
    Returns a dict with title, thumbnail, duration, uploader,
    available_qualities, and supports_4k.
    Raises ValueError on failure.
    """
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--no-playlist",
        "--no-warnings",
        "--quiet",
    ]
    if os.path.exists(COOKIES_PATH):
        cmd.extend(["--cookies", COOKIES_PATH])
    cmd.append(url)

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=30.0)
    except asyncio.TimeoutError:
        raise ValueError("Metadata fetch timed out. The server may be busy or the URL is unreachable.")
    except FileNotFoundError:
        raise RuntimeError("yt-dlp is not installed or not in PATH.")

    if process.returncode != 0:
        error_msg = stderr.decode("utf-8", errors="replace").strip()
        if "Unsupported URL" in error_msg or "is not a valid URL" in error_msg:
            raise ValueError("unsupported_site")
        if "Unable to extract" in error_msg or "ERROR" in error_msg:
            raise ValueError(error_msg or "Could not fetch video info. Check the URL and try again.")
        raise ValueError(error_msg or "Unknown yt-dlp error.")

    try:
        data = json.loads(stdout.decode("utf-8"))
    except json.JSONDecodeError:
        raise ValueError("Failed to parse video metadata.")

    # Extract available heights from formats
    formats = data.get("formats", [])
    heights = set()
    for f in formats:
        h = f.get("height")
        if h and isinstance(h, int):
            heights.add(h)

    available_qualities = []
    supports_4k = False

    for label, min_height in [("2160", 2160), ("1080", 1080), ("720", 720), ("480", 480), ("360", 360)]:
        # Include quality if any format meets or exceeds it (with some tolerance)
        if any(h >= min_height * 0.9 for h in heights):
            available_qualities.append(label)

    if "2160" in available_qualities:
        supports_4k = True

    # Always include "best" as a fallback
    if not available_qualities:
        available_qualities = ["best"]

    return {
        "title": data.get("title", "Unknown Title"),
        "thumbnail": data.get("thumbnail", ""),
        "duration": int(data.get("duration", 0) or 0),
        "uploader": data.get("uploader", data.get("channel", "Unknown")),
        "available_qualities": available_qualities,
        "supports_4k": supports_4k,
    }


def build_yt_dlp_cmd(url: str, format: str, quality: str) -> List[str]:
    """
    Build the yt-dlp command for piped streaming.
    Uses -o - to write output to stdout (no disk writes).
    """
    base = ["yt-dlp", "--no-playlist", "--no-warnings"]
    if os.path.exists(COOKIES_PATH):
        base.extend(["--cookies", COOKIES_PATH])

    if format == "mp3":
        return base + [
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "-o", "-",
            url,
        ]

    if quality == "2160" or format == "mkv":
        # 4K: dual stream merge, MKV required (header-first, pipe-safe)
        return base + [
            "-f", QUALITY_FORMAT_MAP["2160"],
            "--merge-output-format", "mkv",
            "-o", "-",
            url,
        ]

    # MP4 for all other qualities
    fmt = QUALITY_FORMAT_MAP.get(quality, QUALITY_FORMAT_MAP["best"])
    return base + [
        "-f", fmt,
        "--merge-output-format", "mp4",
        "-o", "-",
        url,
    ]


def sanitize_filename(title: str) -> str:
    """Strip characters unsafe for Content-Disposition headers."""
    # Remove non-ASCII and special shell/path characters
    safe = re.sub(r'[\\/*?:"<>|]', "", title)
    safe = re.sub(r'\s+', " ", safe).strip()
    # Limit length
    return safe[:100] if safe else "video"


def get_media_type(format: str) -> str:
    """Return the correct MIME type for each output format."""
    return {
        "mp4": "video/mp4",
        "mp3": "audio/mpeg",
        "mkv": "video/x-matroska",
        "webm": "video/webm",
    }.get(format, "application/octet-stream")
