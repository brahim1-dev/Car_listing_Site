const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

export const formatPostedTime = (dateValue) => {
  if (!dateValue) return "date unavailable"

  const timestamp = new Date(dateValue).getTime()
  if (!Number.isFinite(timestamp)) return "date unavailable"

  const seconds = Math.round((timestamp - Date.now()) / 1000)
  const intervals = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ]

  for (const [unit, secondsPerUnit] of intervals) {
    if (Math.abs(seconds) >= secondsPerUnit) {
      return relativeTime.format(Math.round(seconds / secondsPerUnit), unit)
    }
  }

  return "a few seconds ago"
}
