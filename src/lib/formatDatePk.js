/**
 * Format dates in Pakistan Standard Time (UTC+5) for UI display.
 * Prevents "July 4 00:30 PKT showing as July 3" when using UTC ISO slice.
 */
export function formatDatePk(value, { withTime = false } = {}) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    const raw = String(value)
    return withTime ? raw.slice(0, 19).replace('T', ' ') : raw.slice(0, 10)
  }

  const shifted = new Date(date.getTime() + 5 * 60 * 60 * 1000)
  const y = shifted.getUTCFullYear()
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const d = String(shifted.getUTCDate()).padStart(2, '0')
  if (!withTime) return `${y}-${m}-${d}`

  const hh = String(shifted.getUTCHours()).padStart(2, '0')
  const mm = String(shifted.getUTCMinutes()).padStart(2, '0')
  const ss = String(shifted.getUTCSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}
