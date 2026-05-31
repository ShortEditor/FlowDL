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
      <div className="flex flex-col sm:flex-row gap-6 items-stretch">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-full sm:w-56 h-36 sm:h-32 rounded-2xl overflow-hidden shadow-2xl group border border-white/10">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/20 to-violet-500/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-bold border border-white/10">
            {formatDuration(video.duration)}
          </div>

          {/* Thumbnail overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            {/* Title & Reset Button */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base sm:text-lg font-bold leading-snug text-white line-clamp-2">
                {firstWord && (
                  <span className="gradient-text">{firstWord} </span>
                )}
                <span>{restOfTitle}</span>
              </h3>

              <button
                onClick={onReset}
                className="
                  flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-white/50 hover:text-white/90
                  bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20
                  transition-all duration-200 cursor-pointer
                "
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>CHANGE</span>
              </button>
            </div>

            {/* Uploader Pill */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 shadow-md">
                {getInitials(video.uploader)}
              </div>
              <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-full">
                <span className="text-xs font-semibold text-white/70 truncate max-w-[150px]">{video.uploader}</span>
                <svg className="w-3 h-3 text-indigo-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Details / Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/[0.03] border border-white/5 text-white/50 px-2.5 py-1 rounded-lg">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(video.duration)}
            </span>

            {video.supports_4k && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-500/20 border border-indigo-500/35 text-indigo-200 px-2.5 py-1 rounded-lg font-bold shadow-sm animate-pulse-glow">
                ✦ 4K ULTRA HD
              </span>
            )}

            {video.available_qualities.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/[0.03] border border-white/5 text-white/40 px-2.5 py-1 rounded-lg font-medium">
                Qualities: {video.available_qualities.slice(0, 4).join(', ')}
                {video.available_qualities.length > 4 && '…'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
