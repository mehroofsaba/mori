import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAuth } from './auth'
import { deleteAllTasks, deleteTask, fetchProfile, fetchTasks, insertTasks, saveProfile, upsertTask } from './lib/api'
import { addDays, today } from './lib/dates'
import { makeTask } from './lib/meta'

export const DEFAULT_PREFS = {
  name: '', gardenTheme: 'meadow', vibe: 'soft', hours: 4, gentle: false,
  reminders: false, reminderTime: '09:00', remindLead: 1, remindOverdue: true, lastReminder: '', browserAI: false,
}

const norm = (t) => {
  const p = Math.max(0, Math.min(100, Math.round(t.progress || 0)))
  return { ...t, progress: p, completedAt: p >= 100 ? t.completedAt || Date.now() : null }
}

function reducer(s, a) {
  switch (a.type) {
    case 'loaded': return { ...s, tasks: a.tasks, prefs: a.prefs, status: 'ready', error: '' }
    case 'refreshed': return { ...s, tasks: a.tasks }
    case 'failed': return { ...s, status: s.status === 'loading' ? 'error' : s.status, error: a.error }
    case 'clearError': return { ...s, error: '' }
    case 'add': return { ...s, tasks: [...s.tasks, ...a.tasks] }
    case 'put': return { ...s, tasks: s.tasks.map((t) => (t.id === a.task.id ? a.task : t)) }
    case 'delete': return { ...s, tasks: s.tasks.filter((t) => t.id !== a.id), selectedId: s.selectedId === a.id ? null : s.selectedId }
    case 'clear': return { ...s, tasks: [], selectedId: null }
    case 'prefs': return { ...s, prefs: { ...s.prefs, ...a.patch } }
    case 'select': return { ...s, selectedId: a.id }
    default: return s
  }
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const msg = (e) => (e?.message?.toLowerCase().includes('fetch') ? 'Can’t reach the server. Your last change may not be saved yet.' : 'Couldn’t save your last change. Check your connection and try again.')

export function StoreProvider({ children }) {
  const { user } = useAuth()
  const uid = user.id
  const [state, dispatch] = useReducer(reducer, { tasks: [], prefs: DEFAULT_PREFS, selectedId: null, status: 'loading', error: '' })
  const ref = useRef(state)
  ref.current = state
  const timers = useRef({})
  const prefTimer = useRef(null)

  const load = useCallback(async () => {
    try {
      const [tasks, profile] = await Promise.all([fetchTasks(), fetchProfile(uid)])
      dispatch({
        type: 'loaded', tasks,
        prefs: { ...DEFAULT_PREFS, ...(profile?.preferences || {}), name: profile?.display_name || user.user_metadata?.display_name || '' },
      })
    } catch (e) { dispatch({ type: 'failed', error: msg(e) }) }
  }, [uid]) // eslint-disable-line
  useEffect(() => { load() }, [load])

  // pick up changes made on another device when the tab regains focus
  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState !== 'visible' || ref.current.status !== 'ready' || Object.keys(timers.current).length) return
      try { dispatch({ type: 'refreshed', tasks: await fetchTasks() }) } catch { /* try again next time */ }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.vibe = state.prefs.vibe
    document.documentElement.dataset.garden = state.prefs.gardenTheme
  }, [state.prefs.vibe, state.prefs.gardenTheme])
  useEffect(() => () => { delete document.documentElement.dataset.vibe; delete document.documentElement.dataset.garden }, [])

  const fail = useCallback((e) => dispatch({ type: 'failed', error: msg(e) }), [])
  const queueSave = useCallback((id) => {
    clearTimeout(timers.current[id])
    timers.current[id] = setTimeout(async () => {
      delete timers.current[id]
      const t = ref.current.tasks.find((x) => x.id === id)
      if (!t) return
      try { await upsertTask(t, uid) } catch (e) { fail(e) }
    }, 350)
  }, [uid, fail])
  const put = useCallback((task) => { dispatch({ type: 'put', task }); queueSave(task.id) }, [queueSave])
  const find = (id) => ref.current.tasks.find((t) => t.id === id)
  const update = useCallback((id, patch) => { const t = find(id); if (t) put(norm({ ...t, ...patch })) }, [put])

  const api = useMemo(
    () => ({
      ...state,
      selected: state.tasks.find((t) => t.id === state.selectedId) || null,
      reload: load,
      dismissError: () => dispatch({ type: 'clearError' }),
      add: async (tasks) => {
        dispatch({ type: 'add', tasks })
        try { await insertTasks(tasks, uid) } catch (e) { fail(e); load() }
      },
      update,
      toggleSub: (id, subId) => {
        const t = find(id)
        if (!t) return
        const subtasks = t.subtasks.map((x) => (x.id === subId ? { ...x, done: !x.done } : x))
        put(norm({ ...t, subtasks, progress: Math.round((subtasks.filter((x) => x.done).length / subtasks.length) * 100) }))
      },
      addSubs: (id, titles) => {
        const t = find(id)
        if (t) update(id, { subtasks: [...t.subtasks, ...titles.map((title) => ({ id: crypto.randomUUID(), title, done: false }))] })
      },
      remove: async (id) => {
        clearTimeout(timers.current[id]); delete timers.current[id]
        dispatch({ type: 'delete', id })
        try { await deleteTask(id) } catch (e) { fail(e); load() }
      },
      complete: (id) => { const t = find(id); if (t) update(id, { progress: 100, subtasks: t.subtasks.map((x) => ({ ...x, done: true })) }) },
      reopen: (id) => update(id, { progress: 90 }),
      postpone: (id) => {
        const t = find(id)
        if (t) update(id, { snoozedUntil: addDays(today(), 1), deadline: t.deadline && t.deadline <= today() ? addDays(today(), 1) : t.deadline })
      },
      select: (id) => dispatch({ type: 'select', id }),
      setPrefs: (patch) => {
        dispatch({ type: 'prefs', patch })
        clearTimeout(prefTimer.current)
        prefTimer.current = setTimeout(async () => {
          const { name, ...preferences } = { ...ref.current.prefs }
          try { await saveProfile(uid, { name, preferences }) } catch (e) { fail(e) }
        }, 500)
      },
      importTasks: async (list) => {
        const idMap = Object.fromEntries(list.map((t) => [t.id, crypto.randomUUID()]))
        const fresh = list.map((t) => makeTask({ ...t, id: idMap[t.id], dependsOn: (t.dependsOn || []).map((d) => idMap[d]).filter(Boolean) }))
        dispatch({ type: 'add', tasks: fresh })
        try { await insertTasks(fresh, uid) } catch (e) { fail(e); load() }
      },
      clearAll: async () => {
        dispatch({ type: 'clear' })
        try { await deleteAllTasks(uid) } catch (e) { fail(e); load() }
      },
    }),
    [state, uid, update, put, load, fail],
  )

  if (state.status === 'loading') return <div className="boot">Opening your garden…</div>
  if (state.status === 'error' && state.tasks.length === 0 && !ref.current.prefs.name && state.error)
    return (
      <div className="boot col">
        <p>{state.error}</p>
        <button className="btn primary" onClick={() => { dispatch({ type: 'clearError' }); load() }}>Try again</button>
      </div>
    )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
