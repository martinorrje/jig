import { useEffect, useRef, useState } from 'react'

export function useElapsedSeconds(active: boolean) {
  const startedAtRef = useRef<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!active) {
      startedAtRef.current = null
      return
    }

    startedAtRef.current = Date.now()
    const resetId = window.setTimeout(() => setElapsedSeconds(0), 0)

    const intervalId = window.setInterval(() => {
      const startedAt = startedAtRef.current
      setElapsedSeconds(
        startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
      )
    }, 1000)

    return () => {
      window.clearTimeout(resetId)
      window.clearInterval(intervalId)
    }
  }, [active])

  return active ? elapsedSeconds : 0
}
