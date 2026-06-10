import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CostingItem, CostingInputs } from '@/interface/costingInterface'
import {
  calculateForItem,
  getDefaultInputsForItem,
  resultsToFlatRecord,
} from '@/lib/costing/calculateCosting'

export function useCostingCalculator(item: CostingItem | undefined) {
  const [inputs, setInputs] = useState<CostingInputs>({})

  useEffect(() => {
    if (item) {
      setInputs(getDefaultInputsForItem(item))
    }
  }, [item?.id])

  const calculation = useMemo(() => {
    if (!item) return null
    return calculateForItem(item, inputs)
  }, [item, inputs])

  const flatResults = useMemo(() => {
    if (!calculation) return {}
    return resultsToFlatRecord(calculation)
  }, [calculation])

  const updateInput = useCallback(
    (key: string, value: string | number | boolean) => {
      setInputs((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const setAllInputs = useCallback((next: CostingInputs) => {
    setInputs(next)
  }, [])

  return {
    inputs,
    updateInput,
    setAllInputs,
    calculation,
    flatResults,
  }
}
