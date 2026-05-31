'use client'

import { useState, useRef, useEffect } from 'react'

interface UrlInputProps {
  onFetch: (url: string) => void
  isLoading: boolean
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function UrlInput({ onFetch, isLoading }: UrlInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const invalid = touched && value.trim() !== '' && !isValidUrl(value.trim())

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit() {
    setTouched(true)
    const trimmed = value.trim()
    if (!trimmed || !isValidUrl(trimmed) || isLoading) return
    onFetch(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="w-full">
      {/* Container with animated gradient border */}
      <div
        className={`
          relative rounded-2xl p-[1.5px] transition-all duration-500
          ${focused
            ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer shadow-[0_0_30px_rgba(99,102,241,0.4)]'
            : invalid
              ? 'bg-gradient-to-r from-rose-500/80 to-pink-500/80'
              : 'bg-white/10'
          }
        `}
      >
        <div className="flex items-center gap-2 rounded-2xl bg-[#080e24] px-4 py-3">
          {/* URL icon */}
          <svg
            className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${focused ? 'text-brand-light' : 'text-white/30'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>

          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setTouched(true) }}
            onKeyDown={handleKeyDown}
            placeholder="Paste YouTube, TikTok, Instagram, Vimeo URL..."
            disabled={isLoading}
            className="
              flex-1 bg-transparent text-white placeholder-white/25 text-base
              outline-none border-none min-w-0 py-1
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear button */}
          {value && !isLoading && (
            <button
              onClick={() => { setValue(''); setTouched(false); inputRef.current?.focus() }}
              className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors duration-200 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Fetch button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            className="
              relative flex-shrink-0 flex items-center gap-2
              btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none
              overflow-hidden
            "
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin-slow"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <span>Fetch Info</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Error hint */}
      {invalid && (
        <p className="mt-2 text-xs text-rose-400 pl-2 animate-slide-down">
          Please enter a valid URL starting with http:// or https://
        </p>
      )}
    </div>
  )
}
