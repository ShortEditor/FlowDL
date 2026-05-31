'use client'

import type { Quality } from '@/app/lib/types'

interface QualitySelectorProps {
  selected: Quality
  onChange: (q: Quality) => void
  supports4k: boolean
  hidden: boolean
}

type QualityOption = {
  value: Quality
  label: string
  tag?: string
}

export default function QualitySelector({
  selected,
  onChange,
  supports4k,
  hidden,
}: QualitySelectorProps) {
  if (hidden) return null

  const qualities: QualityOption[] = [
    { value: 'best', label: 'Best' },
    ...(supports4k ? [{ value: '2160' as Quality, label: '4K', tag: 'MKV' }] : []),
    { value: '1080', label: '1080p' },
    { value: '720', label: '720p' },
    { value: '480', label: '480p' },
    { value: '360', label: '360p' },
  ]

  return (
    <div className="w-full animate-fade-in">
      <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2.5">
        Quality
      </label>

      <div className="flex flex-wrap gap-2">
        {qualities.map(({ value, label, tag }) => {
          const isActive = selected === value

          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={`
                relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
                border transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-brand to-violet-500 border-transparent text-white shadow-[0_0_16px_rgba(99,102,241,0.5)] scale-[1.03]'
                  : 'bg-white/[0.04] border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/[0.07]'
                }
              `}
            >
              {label}
              {tag && (
                <span
                  className={`
                    text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none
                    ${isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-violet-500/30 text-violet-300 border border-violet-500/30'
                    }
                  `}
                >
                  {tag}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
