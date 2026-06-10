import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CostingQuoteSnapshot } from '@/interface/costingInterface'

const COMPANY_NAME = 'Barnick Pracharani'

export async function generateCostingQuotePDF(snapshot: CostingQuoteSnapshot) {
  const doc = new jsPDF()
  const margin = 14
  let y = margin

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_NAME, margin, y)
  y += 8

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Print Costing Quote', margin, y)
  y += 6

  doc.setFontSize(10)
  doc.text(`Product: ${snapshot.itemTitle}`, margin, y)
  y += 5
  doc.text(`Date: ${new Date(snapshot.timestamp).toLocaleString()}`, margin, y)
  y += 10

  const inputRows = Object.entries(snapshot.inputs).map(([k, v]) => [
    k,
    String(v),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Input', 'Value']],
    body: inputRows,
    theme: 'grid',
    headStyles: { fillColor: [52, 58, 64] },
    margin: { left: margin, right: margin },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 40
  y += 8

  const resultRows = Object.entries(snapshot.results).map(([k, v]) => [
    k,
    `${Number(v).toFixed(2)} ${snapshot.currency}`,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Line', 'Amount']],
    body: resultRows,
    theme: 'grid',
    headStyles: { fillColor: [52, 58, 64] },
    margin: { left: margin, right: margin },
  })

  const finalPrice =
    snapshot.results.finalPrice ??
    snapshot.results.totalProductionCost ??
    snapshot.results.totalCost ??
    0

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 40
  y += 12

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(
    `Final Price: ${Number(finalPrice).toFixed(2)} ${snapshot.currency}`,
    margin,
    y
  )

  doc.save(
    `Costing_${snapshot.itemTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`
  )
}
