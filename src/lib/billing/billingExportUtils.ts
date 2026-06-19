const MOBILE_BREAKPOINT = 768

export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/** True when export should use direct PDF download instead of window.print(). */
export function isMobileExport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < MOBILE_BREAKPOINT || isIosSafari()
}

export function billingPdfFilename(
  documentType: 'invoice' | 'quotation' | 'delivery_challan',
  documentNumber?: string | null
): string {
  const prefix =
    documentType === 'invoice'
      ? 'Invoice'
      : documentType === 'delivery_challan'
        ? 'Delivery-Challan'
        : 'Quotation'
  const suffix = (documentNumber ?? 'draft').trim() || 'draft'
  return `${prefix}-${suffix}.pdf`.replace(/[^\w.-]+/g, '_')
}
