import { useCallback, useMemo, useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { useSearchParams } from 'react-router-dom'

export type DatePresetId = '7d' | '30d' | 'this_month' | 'last_month' | 'custom'

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'custom', label: 'Custom' },
]

function getRangeForPreset(preset: DatePresetId): DateRange {
  const today = new Date()
  switch (preset) {
    case '7d':
      return { from: subDays(today, 7), to: today }
    case '30d':
      return { from: subDays(today, 30), to: today }
    case 'this_month':
      return { from: startOfMonth(today), to: endOfMonth(today) }
    case 'last_month': {
      const last = subMonths(today, 1)
      return { from: startOfMonth(last), to: endOfMonth(last) }
    }
    default:
      return { from: subDays(today, 30), to: today }
  }
}

export function useReportDateRange() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialFromUrl = useMemo(() => {
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')
    if (fromStr && toStr) {
      const from = new Date(fromStr)
      const to = new Date(toStr)
      if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
        return { from, to } as DateRange
      }
    }
    return getRangeForPreset('30d')
  }, []) // only on mount

  const [dateRange, setDateRangeState] = useState<DateRange | undefined>(initialFromUrl)
  const [preset, setPreset] = useState<DatePresetId>(
    searchParams.get('from') ? 'custom' : '30d'
  )

  const syncUrl = useCallback(
    (range: DateRange | undefined) => {
      const next = new URLSearchParams(searchParams)
      if (range?.from && range?.to) {
        next.set('from', format(range.from, 'yyyy-MM-dd'))
        next.set('to', format(range.to, 'yyyy-MM-dd'))
      } else {
        next.delete('from')
        next.delete('to')
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const setDateRange = useCallback(
    (range: DateRange | undefined) => {
      setDateRangeState(range)
      setPreset('custom')
      syncUrl(range)
    },
    [syncUrl]
  )

  const applyPreset = useCallback(
    (id: DatePresetId) => {
      if (id === 'custom') {
        setPreset('custom')
        return
      }
      const range = getRangeForPreset(id)
      setDateRangeState(range)
      setPreset(id)
      syncUrl(range)
    },
    [syncUrl]
  )

  const handleDateChange = useCallback(
    (from?: Date, to?: Date) => {
      if (from && to) {
        setDateRange({ from, to })
      }
    },
    [setDateRange]
  )

  const reportHookParams = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    if (!from || !to) return undefined
    return {
      startDate: format(from, 'yyyy-MM-dd'),
      endDate: format(to, 'yyyy-MM-dd'),
    }
  }, [dateRange])

  const exportDateRange = useMemo(() => {
    const from = dateRange?.from
    const to = dateRange?.to
    if (!from || !to) return undefined
    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd'),
    }
  }, [dateRange])

  return {
    dateRange,
    preset,
    setDateRange,
    applyPreset,
    handleDateChange,
    reportHookParams,
    exportDateRange,
    reportsEnabled: !!reportHookParams,
  }
}
