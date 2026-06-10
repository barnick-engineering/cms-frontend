import type { CostingBreakdownData } from '@/components/costing/CostingBreakdownCard'
import { COMPANY_DETAILS } from '@/config/companyDetails'
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

export type CostingThermalReceiptData = CostingBreakdownData & {
  itemTitle: string
  timestamp: string
}

function buildCostingThermalSlipHtml(data: CostingThermalReceiptData) {
  const currency = data.currency
  const dateStr = new Date(data.timestamp).toLocaleString()
  const parts: string[] = []

  parts.push(slipCenter(escapeSlipHtml(COMPANY_DETAILS.name), true, 14))
  parts.push(slipCenter('Print costing quote', false, 10))
  parts.push(slipCenter(escapeSlipHtml(data.itemTitle), true, 11))
  if (data.description) {
    parts.push(slipCenter(escapeSlipHtml(data.description), false, 10))
  }

  parts.push(slipDivider())

  for (const block of data.extraSectionBlocks ?? []) {
    if (block.title) {
      parts.push(slipCenter(escapeSlipHtml(block.title.toUpperCase()), true, 10))
    }
    for (const line of block.lines) {
      parts.push(
        slipRow(escapeSlipHtml(line.label), escapeSlipHtml(line.value))
      )
    }
    parts.push(slipDivider())
  }

  for (const line of data.rows.filter((r) => !r.hidden)) {
    parts.push(
      slipRow(
        escapeSlipHtml(line.label),
        escapeSlipHtml(fmtSlipAmount(line.value, line.decimals ?? 2, currency))
      )
    )
  }

  parts.push(slipDivider())
  parts.push(
    slipRow(
      escapeSlipHtml(data.totalLabel),
      escapeSlipHtml(fmtSlipAmount(data.totalValue, 2, currency)),
      true
    )
  )

  if (data.profitMargin !== undefined) {
    parts.push(
      slipRow('Profit margin', escapeSlipHtml(`${data.profitMargin}%`))
    )
  }

  parts.push(slipDivider())
  parts.push(
    slipRow(
      'Final price',
      escapeSlipHtml(fmtSlipAmount(data.finalPrice, 2, currency)),
      true
    )
  )

  if (data.perUnitLabel && data.perUnitValue !== undefined) {
    parts.push(slipDivider())
    parts.push(
      slipCenter(
        escapeSlipHtml(
          `${data.perUnitLabel}: ${fmtSlipAmount(data.perUnitValue, 2, currency)}`
        ),
        true,
        11
      )
    )
  }

  parts.push(slipDivider())
  parts.push(slipCenter(escapeSlipHtml(dateStr), false, 9))

  return wrapSlipHtml(parts.join(''))
}

/**
 * Download internal costing slip as JPG (80mm thermal layout).
 */
export async function downloadCostingThermalSlip(data: CostingThermalReceiptData) {
  const html = buildCostingThermalSlipHtml(data)
  const filename = `Costing_Slip_${sanitizeSlipFilename(data.itemTitle)}_${Date.now()}.jpg`
  await downloadSlipAsJpg(html, filename)
}
