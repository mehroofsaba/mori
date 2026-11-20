// Reminders come only from the user's real deadlines.
import { daysUntil } from './dates'
import { isDone } from './meta'

export function reminderGroups(tasks, prefs = {}) {
  const lead = prefs.remindLead ?? 1
  const withDate = tasks.filter((t) => !isDone(t) && t.deadline)
  const by = (f) => withDate.filter((t) => f(daysUntil(t.deadline))).sort((a, b) => a.deadline.localeCompare(b.deadline))
  const overdue = prefs.remindOverdue === false ? [] : by((n) => n < 0)
  const dueToday = by((n) => n === 0)
  const soon = by((n) => n > 0 && n <= lead)
  return { overdue, dueToday, soon, count: overdue.length + dueToday.length + soon.length }
}

export function reminderSummary(g) {
  const parts = []
  if (g.overdue.length) parts.push(`${g.overdue.length} waiting for you`)
  if (g.dueToday.length) parts.push(`${g.dueToday.length} due today`)
  if (g.soon.length) parts.push(`${g.soon.length} coming up`)
  return parts.join(' · ')
}
