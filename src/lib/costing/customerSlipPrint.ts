import { COMPANY_DETAILS } from '@/config/companyDetails'
import type { CostingCurrency } from '@/interface/costingInterface'
import {
  downloadSlipAsJpg,
  escapeSlipHtml,
  fmtSlipAmount,
  sanitizeSlipFilename,
  slipCenter,
  slipDivider,
  slipRow,
  wrapSlipHtml,
} from './slipImageExport'

export type CostingCustomerSlipData = {
  itemTitle: string
  productDetails?: string[]
  quantity: number
  quantityLabel?: string
  unitPrice: number
  unitPriceLabel?: string
  subtotal: number
  total: number
  currency: CostingCurrency
  timestamp: string
}

function buildCustomerSlipHtml(data: CostingCustomerSlipData) {
  const currency = data.currency
  const dateStr = new Date(data.timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const parts: string[] = []

  parts.push(slipCenter(escapeSlipHtml(COMPANY_DETAILS.name), true, 14))
  parts.push(slipCenter(escapeSlipHtml(COMPANY_DETAILS.tagline), false, 10))
  if (COMPANY_DETAILS.address) {
    parts.push(slipCenter(escapeSlipHtml(COMPANY_DETAILS.address), false, 9))
  }
  parts.push(slipCenter(escapeSlipHtml(COMPANY_DETAILS.phone), false, 10))
  parts.push(slipCenter('QUOTATION', true, 12))
  parts.push(slipCenter(escapeSlipHtml(dateStr), false, 9))

  parts.push(slipDivider())

  parts.push(slipCenter(escapeSlipHtml(data.itemTitle), true, 11))
  for (const detail of data.productDetails ?? []) {
    parts.push(slipCenter(escapeSlipHtml(detail), false, 10))
  }

  parts.push(slipDivider())

  const qtyLabel = data.quantityLabel ?? 'Quantity'
  const unitLabel = data.unitPriceLabel ?? 'Unit price'

  parts.push(slipRow(escapeSlipHtml(qtyLabel), String(data.quantity)))
  parts.push(
    slipRow(
      escapeSlipHtml(unitLabel),
      escapeSlipHtml(fmtSlipAmount(data.unitPrice, 2, currency))
    )
  )
  parts.push(
    slipRow(
      'Subtotal',
      escapeSlipHtml(fmtSlipAmount(data.subtotal, 2, currency))
    )
  )

  parts.push(slipDivider())
  parts.push(
    slipRow(
      'TOTAL',
      escapeSlipHtml(fmtSlipAmount(data.total, 2, currency)),
      true
    )
  )

  parts.push(slipDivider())
  parts.push(slipCenter('Thank you for your business!', false, 10))
  parts.push(slipCenter(escapeSlipHtml(COMPANY_DETAILS.name), true, 9))

  return wrapSlipHtml(parts.join(''))
}

/**
 * Download customer quote slip as JPG for instant sharing.
 */
export async function downloadCostingCustomerSlip(data: CostingCustomerSlipData) {
  const html = buildCustomerSlipHtml(data)
  const filename = `Customer_Quote_${sanitizeSlipFilename(data.itemTitle)}_${Date.now()}.jpg`
  await downloadSlipAsJpg(html, filename)
}
