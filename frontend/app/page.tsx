'use client'

import { useState, useEffect } from 'react'
import type { AppState, Format, Quality, AppError, VideoInfo } from '@/app/lib/types'
import { fetchVideoInfo, downloadVideo } from '@/app/lib/api'

import UrlInput from '@/app/components/UrlInput'
import VideoPreview from '@/app/components/VideoPreview'
import FormatSelector from '@/app/components/FormatSelector'
import QualitySelector from '@/app/components/QualitySelector'
import MkvNotice from '@/app/components/MkvNotice'
import DownloadButton from '@/app/components/DownloadButton'
import SupportedSites from '@/app/components/SupportedSites'
import ColdStartBanner from '@/app/components/ColdStartBanner'
import ErrorMessage from '@/app/components/ErrorMessage'

export default function Home() {
  const [state, setState] = useState<AppState>('idle')
  const [url, setUrl] = useState('')
  const [video, setVideo] = useState<VideoInfo | null>(null)
  const [format, setFormat] = useState<Format>('mp4')
  const [quality, setQuality] = useState<Quality>('best')
  const [error, setError] = useState<AppError | null>(null)
  const [showColdStart, setShowColdStart] = useState(false)

  // Redesign additional states
  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  // Auto-lock/unlock format/quality logic
  useEffect(() => {
    if (quality === '2160') {
      setFormat('mkv')
    } else if (format === 'mkv') {
      setFormat('mp4')
    }
  }, [quality])

  useEffect(() => {
    if (format === 'mp3') {
      setQuality('best')
    }
  }, [format])

  async function handleFetch(inputUrl: string) {
    setState('fetching')
    setError(null)
    setUrl(inputUrl)
    setShowColdStart(false)

    const coldStartTimer = setTimeout(() => {
      setShowColdStart(true)
    }, 5000)

    try {
      const info = await fetchVideoInfo(inputUrl)
      clearTimeout(coldStartTimer)
      setShowColdStart(false)
      setVideo(info)
      setState('preview')
    } catch (e: any) {
      clearTimeout(coldStartTimer)
      setShowColdStart(false)
      setError(e)
      setState('error')
    }
  }

  async function handleDownload() {
    if (!video || !url) return
    setState('downloading')
    setError(null)

    try {
      await downloadVideo(url, format, quality, video.title)
      setState('preview')
    } catch (e: any) {
      setError(e)
      setState('error')
    }
  }

  function handleReset() {
    setState('idle')
    setVideo(null)
    setUrl('')
    setError(null)
    setFormat('mp4')
    setQuality('best')
    setShowColdStart(false)
  }

  const isLockedToMkv = quality === '2160'
  const isMkvSelected = format === 'mkv' || quality === '2160'

  const mainSites = [
    { name: 'YouTube', hoverClass: 'hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.12)]', color: 'text-red-500', icon: '🎬' },
    { name: 'Instagram', hoverClass: 'hover:border-pink-500/30 hover:shadow-[0_0_20px_rgba(236,72,153,0.12)]', color: 'text-pink-500', icon: '📸' },
    { name: 'TikTok', hoverClass: 'hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]', color: 'text-cyan-400', icon: '🎵' },
    { name: 'Twitter / X', hoverClass: 'hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]', color: 'text-white', icon: '🐦' },
    { name: 'Twitch', hoverClass: 'hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]', color: 'text-purple-400', icon: '🎮' },
    { name: 'Vimeo', hoverClass: 'hover:border-sky-400/30 hover:shadow-[0_0_20px_rgba(14,165,233,0.12)]', color: 'text-sky-400', icon: '🎥' }
  ]

  const features = [
    {
      title: "Zero Server Storage",
      desc: "Pipes downloads directly from subprocess stdout to browser chunks. Files never touch server disks.",
      icon: "⚡"
    },
    {
      title: "Ultra HD & 4K",
      desc: "Full support for maximum stream resolutions. Automatically optimizes format to high-speed MKV.",
      icon: "✦"
    },
    {
      title: "1000+ Platforms",
      desc: "Universal parsing powered by yt-dlp. Supports YouTube, TikTok, Instagram, Twitter/X, Vimeo, and more.",
      icon: "🌍"
    },
    {
      title: "Privacy First",
      desc: "No registrations, no tracking logs, no user data storing. Pure, high-speed open-source downloads.",
      icon: "🛡️"
    }
  ]

  const faqs = [
    {
      q: "How does the zero-storage streaming work?",
      a: "Normally, web downloaders save files to their local disk first, consuming high memory and disk space. FlowDL spawns a yt-dlp streaming subprocess and pipes stdout directly into the HTTP chunked response. The video streams directly to your browser memory in real-time, keeping server RAM constant at ~50MB."
    },
    {
      q: "Why does 4K require the MKV format?",
      a: "To output in high-definition (1080p+ or 4K), separate audio and video streams must be combined. Doing this live on-the-fly requires a container that supports header-first, real-time stream merging. MKV natively supports this stream piping, whereas MP4 requires writing the whole file to disk first."
    },
    {
      q: "Why am I getting a bot block error?",
      a: "Public cloud hosting servers use datacenter IP addresses that YouTube flags as automation bots. To bypass this block, you can easily export cookies from your personal YouTube session using a standard browser extension, and paste them into the YT_COOKIES environment variable in your Render dashboard."
    },
    {
      q: "Is FlowDL completely free to host?",
      a: "Yes! Because the server uses zero storage and minimal RAM, it runs flawlessly inside the free tiers of Vercel (for frontend) and Render (for backend)."
    }
  ]

  return (
    <div className="relative min-h-screen bg-grid flex flex-col items-center justify-between pb-12">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-1/10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-brand/5 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/3 right-1/10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none animate-float-delayed" />

      {/* Header / Navbar */}
      <header className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-white/5 relative z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center font-black text-white shadow-lg shadow-brand/20 select-none">
            F
          </div>
          <span className="text-xl font-black tracking-tight select-none">
            Flow<span className="gradient-text">DL</span>
          </span>
          <span className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/50 select-none">v2.0</span>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          <a href="#features" className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors duration-250">Features</a>
          <a href="#faq" className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors duration-250">FAQ</a>
          <button 
            onClick={() => setIsApiModalOpen(true)}
            className="text-xs sm:text-sm text-indigo-300 hover:text-indigo-200 transition-colors duration-250 cursor-pointer font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
          >
            Setup Guide
          </button>
        </nav>

        {/* Pulsing Status Dot */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 px-3 py-1.5 rounded-full select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">System Live</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-3xl px-4 sm:px-6 flex flex-col items-center justify-center flex-1 mt-12 sm:mt-16 z-10">
        
        {/* Brand Hero */}
        <div className="text-center mb-8 flex flex-col items-center select-none animate-slide-down">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3">
            Download anything. <span className="gradient-text">Instantly.</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-lg leading-relaxed font-medium">
            Paste a URL to stream videos directly from YouTube, TikTok, Instagram, and more to your browser with zero limits.
          </p>
        </div>

        {/* Top Banner Zone */}
        <div className="w-full flex flex-col gap-4 mb-4">
          <ColdStartBanner visible={showColdStart} />
          <ErrorMessage error={error} onDismiss={() => setError(null)} />
        </div>

        {/* Core Glass Card */}
        <div className="w-full glass-card p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Inner ambient glow */}
          <div className="absolute -top-24 -left-24 w-52 h-52 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6">
            {(state === 'idle' || state === 'fetching' || (state === 'error' && !video)) && (
              <UrlInput onFetch={handleFetch} isLoading={state === 'fetching'} />
            )}

            {(state === 'preview' || state === 'downloading' || (state === 'error' && video)) && video && (
              <>
                <VideoPreview video={video} onReset={handleReset} />
                
                <FormatSelector
                  selected={format}
                  onChange={setFormat}
                  lockedToMkv={isLockedToMkv}
                />

                <QualitySelector
                  selected={quality}
                  onChange={setQuality}
                  supports4k={video.supports_4k}
                  hidden={format === 'mp3'}
                />

                <MkvNotice visible={isMkvSelected} />

                <DownloadButton
                  isLoading={state === 'downloading'}
                  onClick={handleDownload}
                  format={format}
                  quality={quality}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Marquee Stripe */}
      <section className="w-full mt-20 relative z-10">
        <SupportedSites />
      </section>

      {/* Core Features Grid Section */}
      <section id="features" className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-24 relative z-10 scroll-mt-10">
        <div className="text-center mb-12 select-none">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Built for Performance & Privacy</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">Discover the cutting-edge tech that powers FlowDL.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-card-interactive p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/10 to-violet-500/10 border border-brand/20 flex items-center justify-center text-lg select-none">
                {feat.icon}
              </div>
              <h3 className="font-bold text-white/90">{feat.title}</h3>
              <p className="text-xs text-white/45 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Supported Sites Interactive Grid */}
      <section className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mt-24 relative z-10">
        <div className="text-center mb-10 select-none">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">Supported Platforms</h2>
          <p className="text-white/40 text-xs">Instantly parsing files from your favorite websites.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {mainSites.map((site, idx) => (
            <div 
              key={idx} 
              className={`
                flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5
                transition-all duration-300 select-none cursor-default
                ${site.hoverClass}
              `}
            >
              <span className="text-lg leading-none">{site.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-white/60">{site.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="w-full max-w-3xl px-4 sm:px-6 mt-24 relative z-10 scroll-mt-10">
        <div className="text-center mb-12 select-none">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Frequently Asked Questions</h2>
          <p className="text-white/40 text-sm">Clear answers on how FlowDL streams and functions.</p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-white/80 hover:text-white hover:bg-white/[0.01] transition-all duration-200 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <svg 
                    className={`w-4 h-4 text-white/30 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-60 opacity-100 border-t border-white/5 p-5' : 'max-h-0 opacity-0'}
                    overflow-hidden bg-white/[0.005]
                  `}
                >
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer Zone */}
      <footer className="w-full max-w-3xl mt-24 flex flex-col gap-6 items-center text-center px-4 relative z-10">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/20 leading-relaxed max-w-md">
            FlowDL is for personal, educational, and archival use. Please respect copyright regulations when extracting media.
          </p>
          <p className="text-xs text-white/30 font-medium">
            Powered by <span className="text-indigo-400 font-semibold">yt-dlp</span> &amp; <span className="text-violet-400 font-semibold">FFmpeg</span>
          </p>
        </div>
      </footer>

      {/* API Setup Guide Modal */}
      {isApiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Backdrop overlay */}
          <div 
            onClick={() => setIsApiModalOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-2xl bg-[#080d22]/90 border border-white/15 rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl z-10 animate-fade-in scrollbar-thin">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsApiModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Title */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
                FlowDL Setup & Deployment Guide
              </h2>
              <p className="text-xs text-indigo-300/80 font-semibold uppercase tracking-wider">
                Host your own free instances with zero paid API keys
              </p>
            </div>

            {/* Modal Content */}
            <div className="text-sm text-white/70 flex flex-col gap-6">
              
              <div>
                <h3 className="font-extrabold text-white text-base mb-2">Step 1: GitHub Repository</h3>
                <p className="text-xs leading-relaxed text-white/50 mb-2">
                  Vercel and Render deploy your project assets straight from your GitHub account.
                </p>
                <ol className="list-decimal pl-5 text-xs text-white/60 space-y-1">
                  <li>Create a new repository named <code className="text-indigo-300">flowdl</code> on GitHub.</li>
                  <li>Make the repository public.</li>
                  <li>Push your codebase onto this repository.</li>
                </ol>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="font-extrabold text-white text-base mb-2">Step 2: Deploy Backend to Render (Free)</h3>
                <p className="text-xs leading-relaxed text-white/50 mb-2">
                  Render runs your FastAPI subprocesses.
                </p>
                <ol className="list-decimal pl-5 text-xs text-white/60 space-y-1">
                  <li>Log in to Render and link your GitHub repository.</li>
                  <li>Create a new **Web Service** with the environment set to **Docker**.</li>
                  <li>Add an Environment Variable: <code className="text-indigo-300">ALLOWED_ORIGIN</code> set to your Vercel URL.</li>
                  <li>Render will compile your Docker file and host your backend api.</li>
                </ol>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="font-extrabold text-white text-base mb-2">Step 3: Deploy Frontend to Vercel (Free)</h3>
                <p className="text-xs leading-relaxed text-white/50 mb-2">
                  Vercel compiles and hosts the Next.js interface.
                </p>
                <ol className="list-decimal pl-5 text-xs text-white/60 space-y-1">
                  <li>Log in to Vercel and import your GitHub repository.</li>
                  <li>Set the **Root Directory** setting to the <code className="text-indigo-300">frontend/</code> folder.</li>
                  <li>Add a deployment Environment Variable: <code className="text-indigo-300">NEXT_PUBLIC_API_URL</code> set to your Render API link.</li>
                  <li>Deploy your site.</li>
                </ol>
              </div>

              <div className="border-t border-indigo-500/20 bg-indigo-500/5 p-4.5 rounded-2xl border">
                <h3 className="font-extrabold text-indigo-200 text-base mb-1.5 flex items-center gap-1.5">
                  <span>🍪 Bypass YouTube Bot Blocks</span>
                </h3>
                <p className="text-xs leading-relaxed text-indigo-200/60 mb-2.5">
                  Hosting providers like Render run on datacenter IPs that YouTube flags as automation bots. To download successfully in production, you must supply browser authentication cookies.
                </p>
                <ol className="list-decimal pl-5 text-xs text-indigo-200/70 space-y-1.5">
                  <li>Install a cookie exporter extension (like **Get cookies.txt LOCALLY** on Chrome).</li>
                  <li>Go to **YouTube.com**, log in, open the extension, and download the cookies file in **Netscape** format.</li>
                  <li>Open the file, copy all text content.</li>
                  <li>On Render, go to **Environment** settings and create an environment variable called <code className="text-white font-bold bg-indigo-900/50 px-1 py-0.5 rounded">YT_COOKIES</code>, then paste the entire copied cookie text.</li>
                  <li>Save changes. Render will automatically redeploy the backend with cookie authentication enabled!</li>
                </ol>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setIsApiModalOpen(false)}
                className="btn-primary px-6 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
