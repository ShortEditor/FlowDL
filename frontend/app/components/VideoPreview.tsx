'use client'

import Image from 'next/image'
import type { VideoInfo } from '@/app/lib/types'

interface VideoPreviewProps {
  video: VideoInfo
  onReset: () => void
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function VideoPreview({ video, onReset }: VideoPreviewProps) {
  const titleWords = video.title.split(' ')
  const firstWord = titleWords[0]
  const restOfTitle = titleWords.slice(1).join(' ')

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-full sm:w-48 h-32 sm:h-28 rounded-xl overflow-hidden shadow-2xl group">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/30 to-violet-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs font-mono px-2 py-0.5 rounded-md">
            {formatDuration(video.duration)}
          </div>

          {/* Thumbnail overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Reset button — top right */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-bold leading-snug text-white line-clamp-2">
              {firstWord && (
                <span className="gradient-text">{firstWord} </span>
              )}
              <span className="text-white">{restOfTitle}</span>
            </h3>

            <button
              onClick={onReset}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors duration-200 glass-card px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>New URL</span>
            </button>
          </div>

          {/* Uploader */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-violet-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {getInitials(video.uploader)}
            </div>
            <span className="text-sm text-white/60 truncate">{video.uploader}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-white/60 px-2.5 py-1 rounded-lg">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(video.duration)}
            </span>

            {video.supports_4k && (
              <span className="inline-flex items-center gap-1 text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-lg font-semibold">
                ✦ 4K Available
              </span>
            )}

            {video.available_qualities.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-white/5 border border-white/10 text-white/50 px-2.5 py-1 rounded-lg">
                {video.available_qualities.slice(0, 3).join(', ')}
                {video.available_qualities.length > 3 && '…'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
