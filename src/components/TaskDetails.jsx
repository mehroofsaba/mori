import { Check, Pencil, Sunrise, Trash2, RotateCcw } from 'lucide-react'
import { useStore } from '../store'
import { useUI } from '../ui'
import { PlantIcon } from './Art'
import { Bar, CatChip, DueChip, PriorityChip, TimeChip, Card } from './Bits'
import { kindFor, stageOf, isDone } from '../lib/meta'
import { blockers } from '../lib/planner'

export default function TaskDetails({ task, onClose }) {
  const { tasks, update, toggleSub, complete, reopen, postpone, remove } = useStore()
  const { openTask, notify } = useUI()

  if (!task)
    return (
      <Card title="Task Details" className="details">
        <p className="muted empty-note">Tap a plant in the garden to see its task, deadline and progress.</p>
      </Card>
    )
  const wait = blockers(task, tasks)
  const done = isDone(task)
  return (
    <Card
      title="Task Details"
      className="details"
      right={onClose && <button className="icon-btn" onClick={onClose} aria-label="Close details">×</button>}
    >
      <div className="details-top">
        <PlantIcon kind={kindFor(task.category)} stage={stageOf(task)} size={52} />
        <div>
          <h4>{task.title}</h4>
          <div className="chips"><PriorityChip p={task.priority} /><DueChip date={task.deadline} /><CatChip c={task.category} /><TimeChip m={task.minutes} /></div>
        </div>
      </div>
      {task.description && <p className="desc">{task.description}</p>}
      {wait.length > 0 && <p className="note-y">Waits for: {wait.map((w) => w.title).join(', ')}</p>}
      <div className="prog-line"><Bar value={task.progress} /><b>{task.progress}%</b></div>
      {!done && task.subtasks.length === 0 && (
        <input type="range" min="0" max="100" step="5" value={task.progress} onChange={(e) => update(task.id, { progress: +e.target.value })} aria-label="Progress" />
      )}
      {task.subtasks.length > 0 && (
        <ul className="subs">
          {task.subtasks.map((s) => (
            <li key={s.id}>
              <label className={'check' + (s.done ? ' done' : '')}>
                <input type="checkbox" checked={s.done} onChange={() => toggleSub(task.id, s.id)} />
                {s.title}
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="actions">
        {done ? (
          <button className="btn small ghost" onClick={() => reopen(task.id)}><RotateCcw size={14} />Keep growing</button>
        ) : (
          <button className="btn small primary" onClick={() => { complete(task.id); notify('A flower bloomed! Well done ♥') }}><Check size={14} />Bloom it</button>
        )}
        {!done && <button className="btn small ghost" onClick={() => { postpone(task.id); notify('Moved to tomorrow. No pressure.') }}><Sunrise size={14} />Tomorrow</button>}
        <button className="btn small ghost" onClick={() => openTask(task)}><Pencil size={14} />Edit</button>
        <button className="btn small ghost danger" onClick={() => window.confirm('Remove this plant from your garden?') && remove(task.id)}><Trash2 size={14} />Delete</button>
      </div>
    </Card>
  )
}
