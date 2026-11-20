// Categories are free text: users name their own. These are only suggestions.
export const SUGGESTED_CATEGORIES = ['Study', 'Work', 'Project', 'Home', 'Health', 'People', 'Errands']
export const DEFAULT_CATEGORY = 'General'

const KINDS = ['tulip', 'daisy', 'cosmos', 'lavender', 'sunny']
const HINTS = [
  [/study|school|class|exam|learn|course|homework|uni/, 'tulip'],
  [/project|work|code|dev|build|career|job/, 'lavender'],
  [/home|house|chore|errand|garden|clean/, 'sunny'],
  [/health|fit|gym|self|well|mind/, 'cosmos'],
  [/people|social|family|friend|love/, 'daisy'],
]
/** Any category name maps to a flower kind, so custom categories get a flower too. */
export const kindFor = (cat = '') => {
  const s = cat.toLowerCase()
  const hit = HINTS.find(([re]) => re.test(s))
  if (hit) return hit[1]
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return KINDS[h % KINDS.length]
}
export const catLabel = (cat) => (cat && cat.trim()) || DEFAULT_CATEGORY

export const PRIORITIES = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]
export const isDone = (t) => t.progress >= 100
/** 0 seed, 1 sprout, 2 growing, 3 bloomed. Derived only from real progress. */
export const stageOf = (t) => (t.progress >= 100 ? 3 : t.progress >= 40 ? 2 : t.progress > 0 ? 1 : 0)
export const makeTask = (p = {}) => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  category: DEFAULT_CATEGORY,
  priority: 'medium',
  deadline: '',
  minutes: 45,
  progress: 0,
  subtasks: [],
  dependsOn: [],
  createdAt: Date.now(),
  completedAt: null,
  snoozedUntil: '',
  ...p,
})
