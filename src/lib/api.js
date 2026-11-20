// All database access. Row Level Security guarantees every query only ever sees the signed-in user's rows.
import { supabase } from './supabase'

const must = ({ data, error }) => {
  if (error) throw error
  return data
}

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description || '',
  category: r.category || 'General',
  priority: r.priority,
  deadline: r.deadline || '',
  minutes: r.minutes,
  progress: r.progress,
  subtasks: Array.isArray(r.subtasks) ? r.subtasks : [],
  dependsOn: r.depends_on || [],
  snoozedUntil: r.snoozed_until || '',
  completedAt: r.completed_at ? new Date(r.completed_at).getTime() : null,
  createdAt: new Date(r.created_at).getTime(),
})

const toRow = (t, userId) => ({
  id: t.id,
  user_id: userId,
  title: t.title.slice(0, 300),
  description: (t.description || '').slice(0, 5000),
  category: (t.category || 'General').slice(0, 60),
  priority: t.priority,
  deadline: t.deadline || null,
  minutes: Math.max(1, Math.min(1440, Math.round(t.minutes || 45))),
  progress: Math.max(0, Math.min(100, Math.round(t.progress || 0))),
  subtasks: t.subtasks || [],
  depends_on: t.dependsOn || [],
  snoozed_until: t.snoozedUntil || null,
  completed_at: t.completedAt ? new Date(t.completedAt).toISOString() : null,
  created_at: new Date(t.createdAt || Date.now()).toISOString(),
})

export const fetchTasks = async () =>
  must(await supabase.from('tasks').select('*').order('created_at', { ascending: true })).map(fromRow)
export const insertTasks = async (tasks, userId) => must(await supabase.from('tasks').insert(tasks.map((t) => toRow(t, userId))))
export const upsertTask = async (task, userId) => must(await supabase.from('tasks').upsert(toRow(task, userId)))
export const deleteTask = async (id) => must(await supabase.from('tasks').delete().eq('id', id))
export const deleteAllTasks = async (userId) => must(await supabase.from('tasks').delete().eq('user_id', userId))

export const fetchProfile = async (userId) =>
  must(await supabase.from('profiles').select('display_name, preferences').eq('id', userId).maybeSingle())
export const saveProfile = async (userId, { name, preferences }) =>
  must(await supabase.from('profiles').upsert({ id: userId, display_name: name || '', preferences }))
