'use client'

import type { AppError } from '@/app/lib/types'

interface ErrorMessageProps {
  error: AppError | null
  onDismiss: () => void
}

const errorConfig: Record<AppError['type'], { title: string; message: string; emoji: string }> = {
  invalid_url: {
    title: 'Invalid URL',
    message: 'Please enter a valid video URL (e.g., https://youtube.com/watch?v=...).',
    emoji: '🔗',
  },
  unsupported_site: {
    title: 'Unsupported Site',
    message: 'This site is not supported. Try YouTube, Instagram, TikTok, or Vimeo.',
    emoji: '🚫',
  },
  timeout: {
    title: 'Request Timed Out',
    message: 'The download timed out. Try a lower quality or a shorter video.',
    emoji: '⏱️',
  },
  server_error: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a moment.',
    emoji: '⚠️',
  },
  cold_start: {
    title: 'Server Starting Up',
    message: 'The server is waking up. Please wait a moment and try again.',
    emoji: '🌙',
  },
}

export default function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  if (!error) return null

  const config = errorConfig[error.type]

  return (
    <div className="animate-slide-down w-full">
      <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-300 mb-0.5">
            {config.emoji} {config.title}
          </p>
          <p className="text-xs text-rose-300/70 leading-relaxed">
            {config.message}
          </p>
          {error.message && error.message !== config.message && (
            <p className="text-xs text-rose-300/40 mt-1 font-mono">
              {error.message}
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-rose-400/50 hover:text-rose-300 transition-colors duration-200 p-1 -mt-0.5"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
