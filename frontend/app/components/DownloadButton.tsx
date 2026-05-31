'use client'

import type { Format, Quality } from '@/app/lib/types'

interface DownloadButtonProps {
  isLoading: boolean
  onClick: () => void
  format: Format
  quality: Quality
}

const formatLabels: Record<Format, string> = {
  mp4: 'MP4 Video',
  mp3: 'MP3 Audio',
  mkv: 'MKV Video',
}

const qualityLabels: Record<Quality, string> = {
  best: 'Best Quality',
  '2160': '4K Ultra HD',
  '1080': '1080p Full HD',
  '720': '720p HD',
  '480': '480p',
  '360': '360p',
}

export default function DownloadButton({
  isLoading,
  onClick,
  format,
  quality,
}: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        group relative w-full flex items-center justify-center gap-3
        py-4 px-6 rounded-2xl text-base font-bold text-white
        transition-all duration-300 overflow-hidden select-none
        ${isLoading
          ? 'bg-gradient-to-r from-brand/60 to-violet-500/60 cursor-not-allowed border border-white/5 opacity-80'
          : 'bg-gradient-to-r from-brand to-violet-600 hover:from-brand-light hover:to-violet-500 cursor-pointer hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:scale-[1.01] active:scale-[0.99] border border-white/10'
        }
      `}
    >
      {/* Shimmer overlay on hover */}
      {!isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      )}

      {/* Background glowing halo */}
      <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <span className="relative z-10 flex items-center gap-3">
        {isLoading ? (
          <>
            <svg
              className="w-5 h-5 animate-spin-slow text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="tracking-wide">Piping stream to browser...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="tracking-wide font-extrabold">
              Download {formatLabels[format]}
              <span className="ml-2 text-sm font-normal text-white/70">
                · {qualityLabels[quality]}
              </span>
            </span>
          </>
        )}
      </span>
    </button>
  )
}
