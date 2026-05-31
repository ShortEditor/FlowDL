import type { VideoInfo, Format, Quality, AppError } from '@/app/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function makeAppError(
  type: AppError['type'],
  message: string
): AppError {
  return { type, message }
}

export async function fetchVideoInfo(
  url: string,
  onColdStart?: () => void
): Promise<VideoInfo> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  // Cold start warning after 5s
  let coldStartTimer: ReturnType<typeof setTimeout> | null = null
  if (onColdStart) {
    coldStartTimer = setTimeout(onColdStart, 5000)
  }

  try {
    const response = await fetch(
      `${API_URL}/info?url=${encodeURIComponent(url)}`,
      { signal: controller.signal }
    )

    clearTimeout(timeoutId)
    if (coldStartTimer) clearTimeout(coldStartTimer)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const msg: string = data?.detail || data?.message || 'Unknown error'

      if (response.status === 400) {
        if (msg.toLowerCase().includes('unsupported')) {
          throw makeAppError('unsupported_site', msg)
        }
        throw makeAppError('invalid_url', msg)
      }
      if (response.status === 504 || response.status === 408) {
        throw makeAppError('timeout', msg)
      }
      throw makeAppError('server_error', msg)
    }

    const info: VideoInfo = await response.json()
    return info
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    if (coldStartTimer) clearTimeout(coldStartTimer)

    // Already an AppError
    if (
      err &&
      typeof err === 'object' &&
      'type' in err &&
      'message' in err
    ) {
      throw err
    }

    // AbortError → timeout
    if (err instanceof Error && err.name === 'AbortError') {
      throw makeAppError('timeout', 'Request timed out after 30 seconds.')
    }

    // Network error
    throw makeAppError('server_error', 'Could not connect to server.')
  }
}

export async function downloadVideo(
  url: string,
  format: Format,
  quality: Quality,
  filename: string
): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 120000)

  try {
    const response = await fetch(`${API_URL}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format, quality }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const msg: string = data?.detail || data?.message || 'Download failed'

      if (response.status === 504 || response.status === 408) {
        throw makeAppError('timeout', msg)
      }
      throw makeAppError('server_error', msg)
    }

    // Stream → Blob → Object URL → click
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    const ext = format
    const safeFilename = filename.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')

    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `${safeFilename}.${ext}`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    // Revoke after short delay to allow download to start
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000)
  } catch (err: unknown) {
    clearTimeout(timeoutId)

    if (
      err &&
      typeof err === 'object' &&
      'type' in err &&
      'message' in err
    ) {
      throw err
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw makeAppError('timeout', 'Download timed out. Try a lower quality.')
    }

    throw makeAppError('server_error', 'Download failed. Please try again.')
  }
}
