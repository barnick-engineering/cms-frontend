/** Extensions accepted when the browser omits or misreports MIME (e.g. iPhone HEIC). */
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.heic',
  '.heif',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.tif',
  '.tiff',
  '.avif',
  '.svg',
])

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot < 0) return ''
  return filename.slice(dot).toLowerCase()
}

export function isAllowedSampleImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name))
}

export function isHeicLikeFile(file: File): boolean {
  const ext = getFileExtension(file.name)
  return (
    ext === '.heic' ||
    ext === '.heif' ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  )
}

export const SAMPLE_IMAGE_ACCEPT =
  'image/*,.heic,.heif,.HEIC,.HEIF'
