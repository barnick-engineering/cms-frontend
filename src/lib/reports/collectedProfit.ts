export function computeRealizedProfit(collected: number, expenses: number) {
  return collected - expenses
}

export function computeMarginOnCollected(collected: number, netProfit: number) {
  if (collected <= 0) return undefined
  return (netProfit / collected) * 100
}

export function computePendingAmount(workValue: number, collected: number) {
  return Math.max(0, workValue - collected)
}

export function computeCollectionRate(workValue: number, collected: number) {
  if (workValue <= 0) return 0
  return (collected / workValue) * 100
}

export function formatReportCurrency(value: number) {
  return `৳${value.toLocaleString('en-IN')}`
}
