import html2canvas from 'html2canvas'

export const SLIP_WIDTH_PX = 300

export function escapeSlipHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function fmtSlipAmount(n: number, decimals = 2, currency?: string) {
  const safe = Number.isFinite(n) ? n : 0
  const num = decimals === 0 ? String(safe) : safe.toFixed(decimals)
  return currency ? `${num} ${currency}` : num
}

export function sanitizeSlipFilename(text: string) {
  return text.replace(/[^\w-]+/g, '_').replace(/_+/g, '_')
}

/** Single-line inline styles — multiline breaks innerHTML attribute parsing. */
const SLIP_ROOT_STYLE = [
  `width:${SLIP_WIDTH_PX}px`,
  'padding:14px 12px',
  'font-family:Courier New,Courier,monospace',
  'font-size:11px',
  'line-height:1.4',
  'color:#000000',
  'background:#ffffff',
  'box-sizing:border-box',
].join(';')

export function wrapSlipHtml(inner: string) {
  return `<div style="${SLIP_ROOT_STYLE}">${inner}</div>`
}

export function slipCenter(text: string, bold = false, size = 11) {
  return `<div style="text-align:center;font-size:${size}px;font-weight:${bold ? '700' : '400'};margin:2px 0;color:#000000">${text}</div>`
}

/** Table layout — html2canvas handles this more reliably than flex. */
export function slipRow(label: string, value: string, bold = false) {
  return `<table style="width:100%;border-collapse:collapse;margin:3px 0;font-size:${bold ? '12' : '11'}px;font-weight:${bold ? '700' : '400'};color:#000000"><tr><td style="padding:0;vertical-align:top;color:#000000">${label}</td><td style="padding:0;text-align:right;vertical-align:top;white-space:nowrap;color:#000000">${value}</td></tr></table>`
}

export function slipDivider() {
  return `<hr style="border:none;border-top:1px dashed #000000;margin:8px 0" />`
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/** Isolated document — avoids Tailwind oklch() colors on the main page breaking html2canvas. */
function buildIsolatedSlipDocument(slipHtml: string) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
  }
  * {
    color: #000000;
    border-color: #000000;
  }
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;color:#000000">
${slipHtml}
</body>
</html>`
}

function stripUnsupportedColors(root: HTMLElement) {
  root.querySelectorAll('*').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('color', '#000000', 'important')
    if (el.tagName === 'HR') {
      el.style.setProperty('border-top-color', '#000000', 'important')
    }
  })
  root.style.setProperty('background', '#ffffff', 'important')
  root.style.setProperty('color', '#000000', 'important')
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  )
  if (blob) return blob

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  const response = await fetch(dataUrl)
  return await response.blob()
}

function triggerDownload(blob: Blob, filename: string) {
  const name = filename.endsWith('.jpg') ? filename : `${filename}.jpg`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Renders slip in an isolated iframe (no app Tailwind/oklch styles) and downloads as JPEG.
 */
export async function downloadSlipAsJpg(html: string, filename: string) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.setAttribute('title', 'Slip export')
  iframe.style.cssText =
    'position:fixed;left:0;top:0;width:320px;height:900px;border:0;opacity:0.01;pointer-events:none;z-index:2147483647'

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    iframe.remove()
    throw new Error('Could not create slip frame')
  }

  doc.open()
  doc.write(buildIsolatedSlipDocument(html))
  doc.close()

  await waitForPaint()

  const root = doc.body.firstElementChild as HTMLElement | null
  if (!root) {
    iframe.remove()
    throw new Error('Slip render failed')
  }

  try {
    const canvas = await html2canvas(root, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      onclone: (_clonedDoc, element) => {
        stripUnsupportedColors(element)
      },
    })

    if (!canvas.width || !canvas.height) {
      throw new Error('Image capture returned empty canvas')
    }

    const blob = await canvasToJpegBlob(canvas)
    triggerDownload(blob, filename)
  } finally {
    iframe.remove()
  }
}
