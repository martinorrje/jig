export function formatElapsedTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${padTimeUnit(minutes)}:${padTimeUnit(remainingSeconds)}`
}

function padTimeUnit(value: number) {
  return value.toString().padStart(2, '0')
}
