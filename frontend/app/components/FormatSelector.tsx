'use client'

import type { Format } from '@/app/lib/types'

interface FormatSelectorProps {
  selected: Format
  onChange: (f: Format) => void
  lockedToMkv: boolean
}

const formats: { value: Format; label: string; icon: string }[] = [
  { value: 'mp4', label: 'MP4', icon: '🎬' },
  { value: 'mp3', label: 'MP3', icon: '🎵' },
  { value: 'mkv', label: 'MKV', icon: '📦' },
]

export default function FormatSelector({ selected, onChange, lockedToMkv }: FormatSelectorProps) {
  const activeIndex = formats.findIndex((f) => f.value === selected)

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2.5">
        Format
      </label>

      <div className="relative flex rounded-xl bg-white/[0.04] border border-white/10 p-1 gap-0.5">
        {/* Sliding active indicator */}
        {activeIndex !== -1 && (
          <div
            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-brand to-violet-500 shadow-[0_0_16px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out"
            style={{
              width: `calc(${100 / formats.length}% - 4px)`,
              left: `calc(${(activeIndex * 100) / formats.length}% + 4px)`,
            }}
          />
        )}

        {formats.map(({ value, label, icon }) => {
          const isActive = selected === value
          const isDisabled = lockedToMkv && value !== 'mkv'

          return (
            <button
              key={value}
              onClick={() => {
                if (!isDisabled) onChange(value)
              }}
              disabled={isDisabled}
              className={`
                relative z-10 flex-1 flex items-center justify-center gap-1.5
                py-2.5 px-3 rounded-lg text-sm font-semibold
                transition-colors duration-200
                ${isActive
                  ? 'text-white'
                  : isDisabled
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-white/50 hover:text-white/80 cursor-pointer'
                }
              `}
            >
              <span className={`text-base transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                {icon}
              </span>
              <span>{label}</span>
              {lockedToMkv && value === 'mkv' && (
                <span className="text-[9px] bg-white/20 px-1 py-0.5 rounded text-white/80 font-bold leading-none">
                  LOCK
                </span>
              )}
            </button>
          )
        })}
      </div>

      {lockedToMkv && (
        <p className="mt-2 text-xs text-violet-400/80 pl-1 animate-slide-down">
          4K quality requires MKV container
        </p>
      )}
    </div>
  )
}
