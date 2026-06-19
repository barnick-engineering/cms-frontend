import { isIosSafari, isMobileExport } from '@/lib/billing/billingExportUtils'

const PRINT_ROOT_ID = 'billing-print-root'
const PRINT_STYLE_ID = 'billing-print-styles'

/** Full A4 page height (full-bleed, @page margin 0). */
export const A4_PAGE_HEIGHT_MM = 297
const IOS_PRINT_INSET_MM = 24

const PRINT_STYLES = `
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body > *:not(#${PRINT_ROOT_ID}) {
    display: none !important;
  }
  #${PRINT_ROOT_ID} {
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }
  #${PRINT_ROOT_ID} .billing-preview {
    box-shadow: none !important;
    max-width: none !important;
    width: 100% !important;
    margin: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #${PRINT_ROOT_ID} .billing-print-single-page .billing-print-closing-pin {
    display: flex !important;
    flex-direction: column !important;
  }
  #${PRINT_ROOT_ID} .billing-print-single-page .billing-print-closing-pin .billing-document-footer {
    margin-top: auto !important;
  }
  #${PRINT_ROOT_ID} .billing-print-multi-page .billing-print-closing-pin {
    display: flex !important;
    flex-direction: column !important;
  }
  #${PRINT_ROOT_ID} .billing-print-multi-page .billing-print-closing-pin .billing-document-footer {
    margin-top: auto !important;
  }
  #${PRINT_ROOT_ID} .billing-totals-block {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  #${PRINT_ROOT_ID} .billing-document-footer {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  #${PRINT_ROOT_ID} .billing-footer-closing {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  #${PRINT_ROOT_ID} .billing-preview * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  #${PRINT_ROOT_ID} table {
    page-break-inside: auto;
  }
  #${PRINT_ROOT_ID} tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  #${PRINT_ROOT_ID} thead {
    display: table-header-group;
  }
  #${PRINT_ROOT_ID} tfoot {
    display: table-footer-group;
  }
}
`

export function mmToPx(mm: number): number {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;height:0;width:0;'
  const inner = document.createElement('div')
  inner.style.height = `${mm}mm`
  probe.appendChild(inner)
  document.body.appendChild(probe)
  const px = inner.offsetHeight
  probe.remove()
  return px
}

export function getEffectivePageHeightPx(): number {
  const fullHeight = mmToPx(A4_PAGE_HEIGHT_MM)
  if (isIosSafari() || (typeof window !== 'undefined' && window.innerWidth < 768)) {
    return mmToPx(A4_PAGE_HEIGHT_MM - IOS_PRINT_INSET_MM)
  }
  return fullHeight
}

function clearPrintLayoutStyles(
  preview: HTMLElement,
  body: HTMLElement | null,
  closing: HTMLElement | null,
  pin: HTMLElement | null,
  footer: HTMLElement
) {
  preview.classList.remove('billing-print-single-page', 'billing-print-multi-page')
  for (const prop of ['height', 'min-height', 'position', 'overflow'] as const) {
    preview.style.removeProperty(prop)
  }
  if (body) {
    body.style.removeProperty('padding-bottom')
  }
  for (const el of [closing, pin]) {
    if (!el) continue
    for (const prop of [
      'display',
      'flex-direction',
      'min-height',
      'page-break-before',
      'break-before',
    ] as const) {
      el.style.removeProperty(prop)
    }
  }
  for (const prop of [
    'position',
    'bottom',
    'left',
    'right',
    'width',
    'margin-top',
    'page-break-before',
    'break-before',
  ] as const) {
    footer.style.removeProperty(prop)
  }
}

function applyPinFlexLayout(
  preview: HTMLElement,
  pin: HTMLElement,
  footer: HTMLElement,
  pageHeightPx: number,
  remainder: number,
  layoutClass: 'billing-print-single-page' | 'billing-print-multi-page'
) {
  preview.classList.add(layoutClass)

  const minHeight = pageHeightPx - remainder

  pin.style.setProperty('display', 'flex', 'important')
  pin.style.setProperty('flex-direction', 'column', 'important')
  pin.style.setProperty('min-height', `${minHeight}px`, 'important')
  footer.style.setProperty('margin-top', 'auto', 'important')
}

async function applyPageBreakBeforePin(
  preview: HTMLElement,
  closing: HTMLElement,
  pin: HTMLElement,
  pageHeightPx: number
): Promise<number> {
  const pinHeight = pin.offsetHeight
  let contentBeforePin = pin.offsetTop - preview.offsetTop
  let remainder = contentBeforePin % pageHeightPx

  if (remainder === 0 && contentBeforePin > 0 && pinHeight <= pageHeightPx) {
    return remainder
  }

  if (remainder + pinHeight <= pageHeightPx) {
    return remainder
  }

  const totalsBlock = closing.querySelector('.billing-totals-block') as HTMLElement | null
  const totalsHeight = totalsBlock?.offsetHeight ?? 0
  const totalsFitOnCurrentPage =
    totalsBlock && totalsHeight > 0 && remainder + totalsHeight <= pageHeightPx

  const breakTarget = totalsFitOnCurrentPage ? pin : closing
  breakTarget.style.setProperty('break-before', 'page', 'important')
  breakTarget.style.setProperty('page-break-before', 'always', 'important')

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  void breakTarget.offsetTop

  return 0
}

async function applyMultiPageFooterLayout(
  preview: HTMLElement,
  closing: HTMLElement,
  pin: HTMLElement,
  footer: HTMLElement,
  pageHeightPx: number
) {
  const remainder = await applyPageBreakBeforePin(preview, closing, pin, pageHeightPx)

  applyPinFlexLayout(
    preview,
    pin,
    footer,
    pageHeightPx,
    remainder,
    'billing-print-multi-page'
  )
}

function applySinglePageFooterLayout(
  preview: HTMLElement,
  pin: HTMLElement,
  footer: HTMLElement,
  pageHeightPx: number
) {
  const contentBeforePin = pin.offsetTop - preview.offsetTop
  const remainder = contentBeforePin % pageHeightPx
  applyPinFlexLayout(
    preview,
    pin,
    footer,
    pageHeightPx,
    remainder,
    'billing-print-single-page'
  )
}

/** Pin footer to page bottom — works in screen DOM (PDF export) and print clone. */
export async function layoutBillingFooter(root: HTMLElement) {
  const preview = root.querySelector('.billing-preview') as HTMLElement | null
  const body = root.querySelector('.billing-preview-body') as HTMLElement | null
  const closing = root.querySelector('.billing-print-closing') as HTMLElement | null
  const pin = root.querySelector('.billing-print-closing-pin') as HTMLElement | null
  const footer = root.querySelector('.billing-document-footer') as HTMLElement | null
  if (!preview || !closing || !pin || !footer) return

  clearPrintLayoutStyles(preview, body, closing, pin, footer)

  const pageHeightPx = getEffectivePageHeightPx()
  const topBar = preview.firstElementChild as HTMLElement | null
  const topBarHeight = topBar?.offsetHeight ?? 0
  const bodyHeight = body?.scrollHeight ?? 0
  const closingHeight = closing.offsetHeight
  const totalHeight = topBarHeight + bodyHeight + closingHeight

  if (totalHeight <= pageHeightPx) {
    applySinglePageFooterLayout(preview, pin, footer, pageHeightPx)
  } else {
    await applyMultiPageFooterLayout(preview, closing, pin, footer, pageHeightPx)
  }
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

function getPreviewElement(source: HTMLElement): HTMLElement | null {
  return source.querySelector('.billing-preview') ?? source.closest('.billing-preview')
}

/** Print only the billing document — not the app shell, dialog, or sidebar. */
export async function printBillingPreview(source: HTMLElement | null) {
  if (!source) return

  const preview = getPreviewElement(source)
  if (!preview) return

  document.getElementById(PRINT_ROOT_ID)?.remove()
  document.getElementById(PRINT_STYLE_ID)?.remove()

  const root = document.createElement('div')
  root.id = PRINT_ROOT_ID
  root.appendChild(preview.cloneNode(true))
  document.body.appendChild(root)

  const style = document.createElement('style')
  style.id = PRINT_STYLE_ID
  style.textContent = PRINT_STYLES
  document.head.appendChild(style)

  await waitForImages(root)

  const cleanup = () => {
    root.remove()
    style.remove()
    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)

  await layoutBillingFooter(root)
  window.print()
  setTimeout(cleanup, 2000)
}

export { isMobileExport }
