import { useEffect, useState } from 'react'

/** Re-renders every minute so relative deadline labels stay current. */
export function useMinuteTicker() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return now
}
