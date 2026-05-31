'use client'

interface ColdStartBannerProps {
  visible: boolean
}

export default function ColdStartBanner({ visible }: ColdStartBannerProps) {
  if (!visible) return null

  return (
    <div className="animate-slide-down w-full">
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
        {/* Pulsing moon icon */}
        <div className="flex-shrink-0 animate-breathing">
          <span className="text-2xl leading-none select-none">🌙</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-300">
            Server is waking up...
          </p>
          <p className="text-xs text-amber-300/70 mt-0.5">
            This usually takes 20–30 seconds on first use. Please wait.
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-breathing"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
