export type Format = 'mp4' | 'mp3' | 'mkv'
export type Quality = 'best' | '2160' | '1080' | '720' | '480' | '360'

export interface VideoInfo {
  title: string
  thumbnail: string
  duration: number
  uploader: string
  available_qualities: string[]
  supports_4k: boolean
}

export type AppState = 'idle' | 'fetching' | 'preview' | 'downloading' | 'error'

export interface AppError {
  type: 'invalid_url' | 'unsupported_site' | 'server_error' | 'timeout' | 'cold_start'
  message: string
}
