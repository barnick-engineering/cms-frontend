import { BRAND_COLORS, COMPANY_DETAILS } from '@/config/companyDetails'
import type { BillingDocumentFormPayload, BillingDocumentType } from '@/interface/billingInterface'
import { BILLING_DOCUMENT_TYPE_LABELS, computeBillingTotals, resolveBillingDocumentSubject } from '@/interface/billingInterface'
import { parseDateString } from '@/lib/loanDateUtils'

const { primary, primaryDark, accent, primaryLight } = BRAND_COLORS

type PreviewData = BillingDocumentFormPayload & {
  subtotal?: number
  total?: number
  balance_due?: number
}

function documentTitle(type: BillingDocumentType) {
  return BILLING_DOCUMENT_TYPE_LABELS[type]?.toUpperCase() ?? 'DOCUMENT'
}

function documentNumberLabel(type: BillingDocumentType) {
  if (type === 'invoice') return 'Invoice No.'
  if (type === 'delivery_challan') return 'Challan No.'
  return 'Quotation No.'
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try {
    const d = parseDateString(dateStr.split('T')[0])
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatAmount(value: number) {
  return `${Math.round(value).toLocaleString('en-IN')}/-`
}

function fieldValue(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed.length > 0 ? trimmed : null
}

type BillingDocumentPreviewProps = {
  data: PreviewData
}

export function BillingDocumentPreview({ data }: BillingDocumentPreviewProps) {
  const { items, subtotal, total } = computeBillingTotals(
    data.line_items ?? [],
    data.delivery_cost,
    data.discount
  )
  const showPricing = data.document_type !== 'delivery_challan'
  const showTotals =
    showPricing &&
    (data.document_type === 'invoice' ||
      (data.document_type === 'quotation' && data.show_totals !== false))
  const balanceDue =
    data.document_type === 'invoice'
      ? Math.max(total - (Number(data.advance_payment) || 0), 0)
      : 0
  const showAdvance =
    data.document_type === 'invoice' && (Number(data.advance_payment) || 0) > 0
  const termsLines = (data.terms || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const showTerms = data.document_type === 'quotation' && termsLines.length > 0
  const recipient = fieldValue(data.recipient)
  const phone = fieldValue(data.phone)
  const subject = fieldValue(
    resolveBillingDocumentSubject(data.document_type, data.line_items ?? [], data.subject)
  )
  const address = fieldValue(data.address)

  return (
    <div className="billing-preview mx-auto box-border w-full min-w-0 max-w-[800px] overflow-hidden bg-white text-black shadow-lg print:mx-0 print:max-w-none print:overflow-visible print:shadow-none">
      {/* Brand accent bars */}
      <div className="flex h-2 w-full print:h-1.5">
        <div className="flex-[2]" style={{ backgroundColor: primary }} />
        <div className="flex-1" style={{ backgroundColor: accent }} />
      </div>

      <div className="billing-preview-body print:px-[8mm] print:pt-[8mm]">
        {/* Header */}
        <header
          className="flex flex-col gap-4 border-b px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-8 sm:py-6 print:flex-row print:items-start print:justify-between print:px-0 print:py-4"
          style={{ borderBottomColor: primary, borderBottomWidth: '2px' }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/images/favicon.png"
              alt="Logo"
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 print:h-12 print:w-12"
            />
            <div>
              <h1
                className="whitespace-nowrap text-xl font-bold uppercase tracking-wide sm:text-2xl print:text-xl"
                style={{ color: primaryDark }}
              >
                {COMPANY_DETAILS.name}
              </h1>
              <p
                className="mt-0.5 whitespace-nowrap text-sm leading-snug"
                style={{ color: primary }}
              >
                {COMPANY_DETAILS.tagline}
              </p>
            </div>
          </div>
          <div className="min-w-0 w-full sm:text-right">
            <p
              className="inline-block max-w-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white sm:px-4 sm:text-sm print:text-xs"
              style={{ backgroundColor: primary }}
            >
              {documentTitle(data.document_type)}
            </p>
            {data.document_number && (
              <p className="mt-2 break-words text-sm text-neutral-700">
                {documentNumberLabel(data.document_type)}{' '}
                <span className="font-semibold" style={{ color: primaryDark }}>
                  {data.document_number}
                </span>
              </p>
            )}
            {data.document_date && (
              <p className="mt-1 text-sm text-neutral-700">
                Date:{' '}
                <span className="font-semibold" style={{ color: primaryDark }}>
                  {formatDate(data.document_date)}
                </span>
              </p>
            )}
          </div>
        </header>

        {/* Recipient block */}
        <section
          className="mt-4 border px-4 py-4 sm:mt-6 sm:px-5 print:mt-4"
          style={{
            borderColor: `${primary}33`,
            backgroundColor: primaryLight,
            borderLeftWidth: '4px',
            borderLeftColor: accent,
          }}
        >
          <p
            className="mb-3 text-xs font-bold uppercase tracking-widest"
            style={{ color: primary }}
          >
            Bill To
          </p>
          <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {recipient && (
              <div>
                <span className="font-semibold" style={{ color: primaryDark }}>
                  Recipient:{' '}
                </span>
                {recipient}
              </div>
            )}
            {phone && (
              <div>
                <span className="font-semibold" style={{ color: primaryDark }}>
                  Phone:{' '}
                </span>
                {phone}
              </div>
            )}
            {subject && (
              <div className="sm:col-span-2">
                <span className="font-semibold" style={{ color: primaryDark }}>
                  Subject:{' '}
                </span>
                {subject}
              </div>
            )}
            {address && (
              <div className="sm:col-span-2">
                <span className="font-semibold" style={{ color: primaryDark }}>
                  Address:{' '}
                </span>
                {address}
              </div>
            )}
          </div>
        </section>

        {/* Line items */}
        <section className="px-4 py-5 sm:px-8 sm:py-6 print:px-0 print:py-4">
          <table className="w-full table-fixed border-collapse text-xs sm:text-sm print:text-xs">
            <thead>
              <tr className="text-white" style={{ backgroundColor: primary }}>
                <th className="w-[18%] px-1.5 py-2 text-left font-bold uppercase tracking-wide sm:px-2 sm:py-2.5">
                  Product
                </th>
                <th className="w-[28%] px-1.5 py-2 text-left font-bold uppercase tracking-wide sm:px-2 sm:py-2.5">
                  Description
                </th>
                <th className="w-[12%] px-1.5 py-2 text-center font-bold uppercase tracking-wide sm:px-2 sm:py-2.5">
                  Qty
                </th>
                {showPricing && (
                  <>
                    <th className="w-[20%] px-1.5 py-2 text-right font-bold uppercase tracking-wide sm:px-2 sm:py-2.5">
                      Rate
                    </th>
                    <th className="w-[22%] px-1.5 py-2 text-right font-bold uppercase tracking-wide sm:px-2 sm:py-2.5">
                      Amount
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-neutral-200"
                  style={{
                    pageBreakInside: 'avoid',
                    backgroundColor: idx % 2 === 1 ? primaryLight : 'white',
                  }}
                >
                  <td className="break-words px-1.5 py-2 align-top sm:px-2 sm:py-2.5">
                    {item.product || '—'}
                  </td>
                  <td className="break-words px-1.5 py-2 align-top text-neutral-700 sm:px-2 sm:py-2.5">
                    {item.description || 'As per Sample'}
                  </td>
                  <td className="px-1.5 py-2 text-center align-top sm:px-2 sm:py-2.5">
                    {item.quantity || 0}
                  </td>
                  {showPricing && (
                    <>
                      <td className="px-1.5 py-2 text-right align-top tabular-nums sm:px-2 sm:py-2.5">
                        {Number(item.rate || 0).toFixed(2)}/-
                      </td>
                      <td
                        className="px-1.5 py-2 text-right align-top tabular-nums font-medium sm:px-2 sm:py-2.5"
                        style={{ color: primaryDark }}
                      >
                        {formatAmount(item.amount || 0)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="billing-print-closing print:px-[8mm]">
        {showTotals && (
          <div
            className="billing-totals-block mt-6 flex justify-end px-4 sm:px-8 print:mt-4 print:px-0"
            style={{ pageBreakInside: 'avoid' }}
          >
            <div
              className="w-full space-y-1.5 pt-3 text-sm sm:w-72"
              style={{ borderTop: `2px solid ${primary}` }}
            >
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="tabular-nums font-medium">{formatAmount(subtotal)}</span>
              </div>
              {(data.delivery_cost ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Delivery Cost</span>
                  <span className="tabular-nums font-medium">
                    {formatAmount(Number(data.delivery_cost))}
                  </span>
                </div>
              )}
              {(data.discount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Discount</span>
                  <span className="tabular-nums font-medium">
                    {formatAmount(Number(data.discount))}
                  </span>
                </div>
              )}
              <div
                className="flex justify-between border-t pt-2 text-base font-bold"
                style={{ borderColor: accent, color: primaryDark }}
              >
                <span>Total</span>
                <span className="tabular-nums">{formatAmount(total)}</span>
              </div>
              {showAdvance && (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Advance Payment</span>
                    <span className="tabular-nums font-medium">
                      {formatAmount(Number(data.advance_payment))}
                    </span>
                  </div>
                  <div
                    className="flex justify-between font-bold"
                    style={{ color: primaryDark }}
                  >
                    <span>Balance Due</span>
                    <span className="tabular-nums">{formatAmount(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      {/* Footer — terms, signature, and contact stay together on export */}
      <footer className="billing-document-footer mt-4 print:mt-0">
        <div className="billing-footer-closing px-4 pb-4 sm:px-8 print:px-[8mm]">
          <div
            className={
              showTerms
                ? 'grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-8'
                : undefined
            }
          >
            {showTerms && (
              <div
                className="pl-4 md:mb-0 md:pb-0 print:mb-0"
                style={{ borderLeft: `4px solid ${accent}` }}
              >
                <h3
                  className="mb-2 text-sm font-bold uppercase tracking-wide"
                  style={{ color: primaryDark }}
                >
                  Terms &amp; Conditions
                </h3>
                <ul className="list-disc space-y-1 pl-4 text-sm text-neutral-700">
                  {termsLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className={`flex items-end gap-6 sm:gap-8 ${
                data.document_type === 'delivery_challan'
                  ? 'justify-between md:col-span-2'
                  : showTerms
                    ? 'justify-end md:justify-end'
                    : 'justify-end'
              }`}
            >
              {data.document_type === 'delivery_challan' && (
                <div className="w-full max-w-[11rem] text-center sm:w-44">
                  <div className="mb-1 h-10" />
                  <div
                    className="pt-1 text-sm"
                    style={{ borderTop: `1px solid ${primary}` }}
                  >
                    Received by
                  </div>
                </div>
              )}
              <div className="w-full max-w-[13rem] text-center sm:w-52">
                <div className="mb-1 h-10" />
                <div
                  className="pt-1 text-sm italic text-neutral-600"
                  style={{ borderTop: `1px solid ${primary}` }}
                >
                  Authorized signature
                </div>
                <p className="mt-1 text-sm" style={{ color: primaryDark }}>
                  On behalf of {COMPANY_DETAILS.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        <div
          className="px-4 py-4 text-center text-sm text-white sm:px-8 print:px-6 print:py-3 print:text-xs"
          style={{ backgroundColor: primary }}
        >
          <p className="break-all sm:break-normal">{COMPANY_DETAILS.email}</p>
          <p className="mt-1">
            {COMPANY_DETAILS.phone}
            {COMPANY_DETAILS.phoneSecondary
              ? ` · ${COMPANY_DETAILS.phoneSecondary}`
              : ''}
          </p>
          {COMPANY_DETAILS.address && (
            <p className="mt-1 opacity-80">{COMPANY_DETAILS.address}</p>
          )}
        </div>

        <div className="flex h-2 w-full print:h-1.5">
          <div className="flex-1" style={{ backgroundColor: accent }} />
          <div className="flex-[2]" style={{ backgroundColor: primary }} />
        </div>
      </footer>
      </div>
    </div>
  )
}
