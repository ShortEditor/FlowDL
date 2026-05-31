'use client'

const sites = [
  { name: 'YouTube', emoji: '🎬' },
  { name: 'Instagram', emoji: '📸' },
  { name: 'TikTok', emoji: '🎵' },
  { name: 'Twitter / X', emoji: '🐦' },
  { name: 'Vimeo', emoji: '🎥' },
  { name: 'Facebook', emoji: '📘' },
  { name: 'Reddit', emoji: '🤖' },
  { name: 'Twitch', emoji: '🎮' },
  { name: 'Dailymotion', emoji: '▶️' },
  { name: 'SoundCloud', emoji: '🎵' },
  { name: 'Bilibili', emoji: '📺' },
  { name: 'Rumble', emoji: '🎯' },
]

// Duplicate for seamless loop
const allSites = [...sites, ...sites]

export default function SupportedSites() {
  return (
    <div className="w-full">
      {/* Label */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <span className="text-xs font-semibold text-white/30 uppercase tracking-widest whitespace-nowrap">
          Works with 1000+ sites
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>

      {/* Marquee strip */}
      <div className="relative overflow-hidden rounded-xl glass-card border-white/5 py-3">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050818] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050818] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee gap-0" style={{ width: 'max-content' }}>
          {allSites.map((site, i) => (
            <div
              key={`${site.name}-${i}`}
              className="flex items-center gap-2 px-5 py-1 mx-1"
            >
              <span className="text-base leading-none">{site.emoji}</span>
              <span className="text-sm font-medium text-white/50 whitespace-nowrap">
                {site.name}
              </span>
              <span className="text-white/10 ml-3 text-xs">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
