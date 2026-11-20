export const iso = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
export const today = () => iso(new Date())
export const addDays = (s, n) => {
  const d = s ? new Date(s + 'T00:00:00') : new Date()
  d.setDate(d.getDate() + n)
  return iso(d)
}
export const daysUntil = (s) => {
  if (!s) return null
  const a = new Date(today() + 'T00:00:00')
  const b = new Date(s + 'T00:00:00')
  return Math.round((b - a) / 864e5)
}
export const fmtDate = (s) =>
  s ? new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'
export const fmtDue = (s) => {
  const n = daysUntil(s)
  if (n === null) return 'No deadline'
  if (n < 0) return 'Waiting since ' + fmtDate(s)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  return fmtDate(s)
}
export const fmtDuration = (m) => (m < 60 ? `${m} min` : `${Math.round((m / 60) * 10) / 10} h`)
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
