import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { createRoot } from 'react-dom/client'
import { BillingDocumentPreview } from '@/components/billing/BillingDocumentPreview'
import type { BillingDocumentFormPayload } from '@/interface/billingInterface'
import { billingPdfFilename, isMobileExport } from '@/lib/billing/billingExportUtils'
import { getEffectivePageHeightPx, layoutBillingFooter, printBillingPreview } from '@/lib/billing/billingPrint'

const A4_WIDTH_MM = 210
const A4_PAGE_HEIGHT_MM = 297

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

async function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll('img'))
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
    )
  )
}

function stripUnsupportedColors(root: HTMLElement) {
  root.querySelectorAll('*').forEach((node) => {
    const el = node as HTMLElement
    if (el.style.color?.includes('oklch')) {
      el.style.removeProperty('color')
    }
    if (el.style.backgroundColor?.includes('oklch')) {
      el.style.removeProperty('background-color')
    }
  })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function canvasToPdf(canvas: HTMLCanvasElement, filename: string) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = A4_WIDTH_MM
  const pageHeight = A4_PAGE_HEIGHT_MM

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  triggerDownload(pdf.output('blob'), filename)
}

/** Render billing document off-screen, capture as multi-page A4 PDF, and download. */
export async function downloadBillingPdf(data: BillingDocumentFormPayload) {
  const mount = document.createElement('div')
  mount.setAttribute('aria-hidden', 'true')
  mount.style.cssText =
    'position:fixed;left:0;top:0;width:210mm;opacity:0.01;pointer-events:none;z-index:-1;overflow:visible;'
  document.body.appendChild(mount)

  const root = createRoot(mount)
  root.render(<BillingDocumentPreview data={data} />)

  try {
    await waitForPaint()
    await waitForImages(mount)
    await layoutBillingFooter(mount)

    const preview = mount.querySelector('.billing-preview') as HTMLElement | null
    if (!preview) {
      throw new Error('Billing preview failed to render')
    }

    const pageHeightPx = getEffectivePageHeightPx()
    const scale = 2

    const canvas = await html2canvas(preview, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true,
      logging: false,
      width: preview.offsetWidth,
      height: Math.max(preview.scrollHeight, pageHeightPx),
      windowWidth: preview.offsetWidth,
      windowHeight: Math.max(preview.scrollHeight, pageHeightPx),
      onclone: (_doc, element) => {
        stripUnsupportedColors(element)
      },
    })

    if (!canvas.width || !canvas.height) {
      throw new Error('PDF capture returned empty canvas')
    }

    const filename = billingPdfFilename(data.document_type, data.document_number)
    canvasToPdf(canvas, filename)
  } finally {
    root.unmount()
    mount.remove()
  }
}

/** Export from an on-screen preview (mobile) or print dialog (desktop). */
export async function exportBillingPreview(
  source: HTMLElement | null,
  data?: BillingDocumentFormPayload
) {
  if (isMobileExport() && data) {
    await downloadBillingPdf(data)
    return
  }

  await printBillingPreview(source)
}
