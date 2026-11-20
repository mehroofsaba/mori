// Deterministic planning: no AI involved, so deadlines and dependencies are always respected.
import { daysUntil, today } from './dates'
import { isDone } from './meta'

const PW = { high: 30, medium: 15, low: 5 }

export const needsAttention = (t) => {
  if (isDone(t) || !t.deadline) return false
  return daysUntil(t.deadline) <= 1
}

const urgency = (t) => {
  const n = daysUntil(t.deadline)
  if (n === null) return 0
  if (n < 0) return 60
  if (n === 0) return 50
  if (n === 1) return 45
  if (n <= 3) return 35
  if (n <= 7) return 20
  if (n <= 14) return 8
  return 2
}

export function scoreTask(t, all) {
  const unlocks = all.filter((o) => !isDone(o) && o.dependsOn.includes(t.id)).length
  return PW[t.priority] + urgency(t) + (t.progress > 0 ? 5 : 0) + unlocks * 6 + (t.minutes <= 20 ? 2 : 0)
}

export const blockers = (t, all) => all.filter((o) => t.dependsOn.includes(o.id) && !isDone(o))

/** Order tasks so prerequisites always come first, most pressing first otherwise. */
export function sequence(tasks, pool = tasks) {
  const left = tasks.filter((t) => !isDone(t)).map((t) => ({ t, s: scoreTask(t, pool) }))
  const placed = new Set()
  const out = []
  while (left.length) {
    const ready = left.filter(({ t }) => t.dependsOn.every((d) => placed.has(d) || !left.some((l) => l.t.id === d)))
    const pickFrom = ready.length ? ready : left // cycle guard
    pickFrom.sort((a, b) => b.s - a.s)
    const next = pickFrom[0]
    out.push(next.t)
    placed.add(next.t.id)
    left.splice(left.indexOf(next), 1)
  }
  return out
}

function reason(t, all) {
  const n = daysUntil(t.deadline)
  const unlocked = all.find((o) => !isDone(o) && o.dependsOn.includes(t.id))
  if (n !== null && n < 0) return 'Waiting for you since ' + Math.abs(n) + 'd — a small step helps'
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  if (n !== null && n <= 3) return `Due in ${n} days`
  if (unlocked) return `Unlocks “${unlocked.title}”`
  if (t.progress > 0) return 'Already growing — keep going'
  if (t.priority === 'high') return 'High priority'
  if (t.minutes <= 20) return 'A quick win'
  return 'A good next step'
}

export function dailyPlan(tasks, prefs = {}) {
  const hours = prefs.hours ?? 4
  const limit = prefs.gentle ? 3 : 8
  const t0 = today()
  const active = tasks.filter((t) => !isDone(t))
  const snoozed = active.filter((t) => t.snoozedUntil && t.snoozedUntil > t0)
  const pool = active.filter((t) => !(t.snoozedUntil && t.snoozedUntil > t0))
  const budget = hours * 60
  let used = 0
  const todayList = []
  const later = []
  for (const t of sequence(pool, tasks)) {
    const rem = Math.max(10, Math.round(t.minutes * (1 - t.progress / 100)))
    const wait = blockers(t, tasks)
    if (wait.length) {
      later.push({ task: t, minutes: rem, reason: `Waits for “${wait[0].title}”` })
    } else if ((todayList.length === 0 || used + rem <= budget) && todayList.length < limit) {
      used += rem
      todayList.push({ task: t, minutes: rem, reason: reason(t, tasks) })
    } else {
      later.push({ task: t, minutes: rem, reason: needsAttention(t) ? 'Due soon — fit it in if you can' : 'Can safely wait' })
    }
  }
  return { today: todayList, later, snoozed, total: used }
}
