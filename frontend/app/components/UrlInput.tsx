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

// Brand detection based on URL
function getSiteBrand(urlStr: string) {
  const url = urlStr.trim().toLowerCase()
  if (!url) return null

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return {
      name: 'YouTube',
      colorClass: 'youtube-focus',
      icon: (
        <svg className="w-5 h-5 text-red-500 fill-current animate-fade-in flex-shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    }
  }
  if (url.includes('tiktok.com')) {
    return {
      name: 'TikTok',
      colorClass: 'tiktok-focus',
      icon: (
        <svg className="w-5 h-5 text-cyan-400 fill-current animate-fade-in flex-shrink-0" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.05 1.62 4.2 1.07 1.27 2.58 2.1 4.22 2.37v3.91c-1.89-.07-3.71-.8-5.14-2.07-.12-.11-.22-.22-.33-.34a12.6 12.6 0 0 1-.32 3.73c-.66 2.45-2.27 4.62-4.51 5.79-2.52 1.34-5.63 1.48-8.24.32A8.347 8.347 0 0 1 .42 11.23c-.3-2.92.83-5.89 3.02-7.79 2.05-1.78 4.88-2.48 7.55-1.85V5.7c-1.57-.45-3.32-.12-4.57.94-1.28 1.07-1.92 2.85-1.56 4.5.39 1.77 1.83 3.19 3.6 3.47 1.8.27 3.65-.63 4.29-2.31.25-.66.36-1.37.35-2.08V.02z" />
        </svg>
      ),
    }
  }
  if (url.includes('instagram.com')) {
    return {
      name: 'Instagram',
      colorClass: 'instagram-focus',
      icon: (
        <svg className="w-5 h-5 text-pink-500 stroke-current fill-none animate-fade-in flex-shrink-0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    }
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return {
      name: 'Twitter/X',
      colorClass: 'x-focus',
      icon: (
        <svg className="w-5 h-5 text-white fill-current animate-fade-in flex-shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    }
  }
  if (url.includes('twitch.tv')) {
    return {
      name: 'Twitch',
      colorClass: 'twitch-focus',
      icon: (
        <svg className="w-5 h-5 text-purple-400 fill-current animate-fade-in flex-shrink-0" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      ),
    }
  }
  if (url.includes('vimeo.com')) {
    return {
      name: 'Vimeo',
      colorClass: 'vimeo-focus',
      icon: (
        <svg className="w-5 h-5 text-sky-400 fill-current animate-fade-in flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.396 7.42c-.08 1.905-1.408 4.512-3.987 7.82-2.58 3.326-4.76 4.985-6.544 4.985-1.106 0-2.037-1.023-2.793-3.072-.51-1.875-1.023-3.753-1.536-5.632-.56-2.062-1.168-3.093-1.82-3.093-.15 0-.665.317-1.545.95l-.924-1.19c.92-.81 1.83-1.616 2.73-2.422C6.98 1.954 8.21.996 9.722.996c1.18 0 1.912.802 2.2 2.41.313 1.777.534 2.87.66 3.275.4 1.79.83 2.686 1.285 2.686.35 0 .886-.583 1.613-1.75 1.343-2.148 1.287-3.218-.17-3.218-.68 0-1.39.308-2.13.923-1.455-1.9-3.22-3.8-5.3-5.7C10.15 1.54 12.33 0 14.59 0c3.784 0 5.617 2.473 5.497 7.42Z" />
        </svg>
      ),
    }
  }
  return null
}

export default function UrlInput({ onFetch, isLoading }: UrlInputProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [touched, setTouched] = useState(false)
  const [hasClipboard, setHasClipboard] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const brand = getSiteBrand(value)
  const invalid = touched && value.trim() !== '' && !isValidUrl(value.trim())

  useEffect(() => {
    inputRef.current?.focus()
    // Check if Clipboard API is supported & allowed
    if (typeof window !== 'undefined' && navigator.clipboard) {
      setHasClipboard(true)
    }
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

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setValue(text)
        setTouched(true)
        inputRef.current?.focus()
      }
    } catch (err) {
      console.warn('Clipboard access blocked or unsupported: ', err)
    }
  }

  return (
    <div className="w-full">
      {/* Container with animated gradient border */}
      <div
        className={`
          relative rounded-2xl p-[1.5px] transition-all duration-500
          ${focused
            ? brand
              ? brand.colorClass
              : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_100%] animate-shimmer shadow-[0_0_30px_rgba(99,102,241,0.35)]'
            : invalid
              ? 'bg-gradient-to-r from-rose-500/80 to-pink-500/80'
              : 'bg-white/10'
          }
        `}
      >
        <div className="flex items-center gap-2 rounded-2xl bg-[#060b1e] px-4 py-3 sm:py-3.5">
          {/* Dynamic icon detection */}
          {brand ? (
            <div className="flex-shrink-0">{brand.icon}</div>
          ) : (
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${focused ? 'text-brand-light' : 'text-white/30'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          )}

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
              flex-1 bg-transparent text-white placeholder-white/20 text-sm sm:text-base
              outline-none border-none min-w-0 py-1
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            autoComplete="off"
            spellCheck={false}
          />

          {/* Paste from clipboard button */}
          {hasClipboard && !value && !isLoading && (
            <button
              onClick={handlePaste}
              title="Paste from Clipboard"
              className="
                flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-white/50 hover:text-white/90
                bg-white/[0.05] border border-white/10 px-2 py-1.5 rounded-lg
                transition-all duration-200 cursor-pointer
              "
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>PASTE</span>
            </button>
          )}

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
              btn-primary px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none
              overflow-hidden cursor-pointer
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
                  <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* Brand Hint */}
      {brand && !invalid && (
        <p className="mt-2 text-xs text-white/40 pl-2 animate-slide-down">
          Detected <span className="text-white/60 font-semibold">{brand.name}</span> URL. Ready to extract metadata.
        </p>
      )}
    </div>
  )
}
