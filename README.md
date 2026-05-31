# FlowDL — Universal Video Downloader

FlowDL is a production-grade web application that allows users to download videos from 1,000+ websites (including YouTube, TikTok, Instagram, Vimeo, and more) by simply pasting a URL. 

Built with **Next.js (Frontend)** and **FastAPI (Backend)**, it leverages `yt-dlp` and `FFmpeg` to process and stream video files directly to the user's browser with **zero server-side storage**.

## Core Architecture: Piped Streaming

FlowDL v2.0 uses a memory-efficient piped streaming architecture:
1. The user inputs a video URL and selects the format/quality.
2. The FastAPI backend spawns `yt-dlp` with the output stream piped directly to `stdout`.
3. The backend reads chunks from the process stream and yields them immediately to the HTTP client using an asynchronous generator.
4. The file is never downloaded or saved to the server's disk, keeping RAM consumption constant at **~50MB** even for 4K video files.

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI endpoints & CORS configuration
│   │   ├── downloader.py   # yt-dlp execution & command generation
│   │   └── models.py       # Pydantic schemas for requests/responses
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── components/     # UI elements (buttons, selectors, marquee, error handling)
│   │   ├── lib/            # Types and fetch clients
│   │   ├── globals.css     # Design system styles and custom animations
│   │   ├── layout.tsx      # Metadata and document frame
│   │   └── page.tsx        # Centralized app state controller
│   ├── tailwind.config.ts
│   └── package.json
└── docker-compose.yml
```

---

## Quick Start (Local Development)

### Method A — Docker Compose (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed.

1. Clone or copy the project files.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Method B — Manual Running

#### 1. Running the Backend
Ensure you have Python 3.11+, `ffmpeg`, and `yt-dlp` installed on your path.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The backend API will be live at [http://localhost:8000](http://localhost:8000).

#### 2. Running the Frontend
Ensure you have Node.js 18+ installed.

```bash
cd frontend
npm install
npm run dev
```
The frontend app will be live at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Backend Configuration (`backend/.env`)
- `ALLOWED_ORIGIN`: The URL of your deployed frontend (e.g. `https://flowdl.vercel.app`) to restrict CORS access (defaults to `*` if unspecified).

### Frontend Configuration (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`: The URL of your backend API service (defaults to `http://localhost:8000` for local dev).

---

## Deployment Guide

Detailed step-by-step credentials and configurations are located in [api_setup_guide.md](file:///C:/Users/Admin/.gemini/antigravity/brain/b503a37e-df82-4bc5-b48b-925e15acd327/api_setup_guide.md).

1. **Frontend**: Deploy `frontend/` directory to **Vercel** (connect GitHub repository, select `frontend` root, and set `NEXT_PUBLIC_API_URL`).
2. **Backend**: Deploy `backend/` to **Render** (select **Web Service**, set runtime to **Docker**, and set `ALLOWED_ORIGIN` to your Vercel domain).
