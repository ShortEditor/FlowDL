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

  return (
    <div className="flex flex-col flex-1 items-center justify-between min-h-screen py-12 px-4 sm:px-6 md:px-8">
      {/* Top Banner Zone */}
      <div className="w-full max-w-2xl flex flex-col gap-4 mb-4">
        <ColdStartBanner visible={showColdStart} />
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
      </div>

      {/* Main Container */}
      <main className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 my-auto">
        {/* Brand Hero */}
        <div className="text-center mb-8 flex flex-col items-center select-none">
          <h1 className="text-5xl font-black tracking-tight mb-2">
            <span className="gradient-text">FlowDL</span>
          </h1>
          <p className="text-white/60 text-lg font-medium">
            Download anything. Instantly.
          </p>
        </div>

        {/* Core Glass Card */}
        <div className="w-full glass-card p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Inner ambient glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

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

      {/* Footer Zone */}
      <footer className="w-full max-w-2xl mt-12 flex flex-col gap-8 items-center text-center">
        <SupportedSites />
        
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/20 leading-relaxed max-w-md">
            FlowDL is for personal, educational, and archival use. Please respect local and international copyright laws when downloading media.
          </p>
          <p className="text-xs text-white/30 font-medium">
            Powered by <span className="text-brand-light">yt-dlp</span> &amp; <span className="text-violet-400">FFmpeg</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
