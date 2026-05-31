from pydantic import BaseModel
from typing import Literal, List


class DownloadRequest(BaseModel):
    url: str
    format: Literal["mp4", "mp3", "mkv"]
    quality: Literal["best", "2160", "1080", "720", "480", "360"]


class VideoInfo(BaseModel):
    title: str
    thumbnail: str
    duration: int  # seconds
    uploader: str
    available_qualities: List[str]
    supports_4k: bool
