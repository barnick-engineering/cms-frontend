import { useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

// Debounced effect hook
export function useDebounceEffect(effect: () => void, deps: unknown[], delay = 500) {
    const debouncedDeps = useDebounce(deps, delay)

    useEffect(() => {
        effect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedDeps])
}