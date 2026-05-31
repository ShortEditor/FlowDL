'use client'

interface MkvNoticeProps {
  visible: boolean
}

export default function MkvNotice({ visible }: MkvNoticeProps) {
  if (!visible) return null

  return (
    <div className="animate-slide-down w-full">
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
        <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-indigo-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-300 mb-0.5">MKV Container</p>
          <p className="text-xs text-indigo-300/70 leading-relaxed">
            4K downloads as <span className="font-semibold text-indigo-300">.mkv</span> — compatible with{' '}
            <span className="text-white/70">VLC</span>,{' '}
            <span className="text-white/70">Premiere Pro</span>,{' '}
            <span className="text-white/70">DaVinci Resolve</span> &amp;{' '}
            <span className="text-white/70">Final Cut Pro</span>
          </p>
        </div>
      </div>
    </div>
  )
}
