import { BASE_URL } from '@/config/api'
import type { SampleHubItem } from '@/interface/sampleHubInterface'

type SampleHubImageSource = Pick<
  SampleHubItem,
  'file_path' | 'drive_file_id' | 'id'
>

/** Extract Google Drive file id from drive_file_id or a Drive URL. */
export function extractGoogleDriveFileId(
  driveFileId?: string | null,
  filePath?: string | null
): string | null {
  const id = driveFileId?.trim()
  if (id) return id

  if (!filePath) return null

  const idParam = filePath.match(/[?&]id=([^&]+)/i)?.[1]
  if (idParam) return decodeURIComponent(idParam)

  const dMatch = filePath.match(/\/d\/([^/]+)/i)?.[1]
  if (dMatch) return decodeURIComponent(dMatch)

  return null
}

/** Resolve relative media paths against the API base URL. */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path?.trim()) return null

  const trimmed = path.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`

  const base = BASE_URL.replace(/\/$/, '')
  const pathPart = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${base}${pathPart}`
}

export function googleDriveThumbnailUrl(fileId: string, width = 1200): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${width}`
}

export function googleDriveLh3Url(fileId: string, width = 1200): string {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w${width}`
}

/**
 * Ordered image URL candidates. Drive thumbnail URLs work better in <img> than
 * uc?export=view links, which often return HTML instead of image bytes.
 */
export function getSampleHubImageUrlCandidates(
  item: SampleHubImageSource,
  variant: 'thumb' | 'full' = 'thumb'
): string[] {
  const width = variant === 'full' ? 2000 : 800
  const candidates: string[] = []
  const seen = new Set<string>()

  const push = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    candidates.push(url)
  }

  const fileId = extractGoogleDriveFileId(item.drive_file_id, item.file_path)
  if (fileId) {
    push(googleDriveThumbnailUrl(fileId, width))
    push(googleDriveLh3Url(fileId, width))
  }

  push(resolveMediaUrl(item.file_path))

  return candidates
}

export function getSampleHubImageUrl(
  item: SampleHubImageSource,
  variant: 'thumb' | 'full' = 'thumb'
): string {
  return getSampleHubImageUrlCandidates(item, variant)[0] ?? ''
}
