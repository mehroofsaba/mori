import { BellRing } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Card } from './Bits'
import { fmtDue } from '../lib/dates'
import { reminderGroups } from '../lib/reminders'

export default function Reminders() {
  const { tasks, prefs, select } = useStore()
  const nav = useNavigate()
  const g = reminderGroups(tasks, prefs)
  if (!g.count) return null
  const rows = [['Waiting for you', g.overdue], ['Due today', g.dueToday], ['Coming up', g.soon]].filter(([, l]) => l.length)
  return (
    <Card title="Gentle reminders" icon={<BellRing size={18} />}>
      {rows.map(([label, list]) => (
        <div key={label} className="rem-group">
          <small className="when">{label}</small>
          {list.map((t) => (
            <button key={t.id} className="pop-item" onClick={() => { select(t.id); nav('/garden') }}>{t.title}<small>{fmtDue(t.deadline)}</small></button>
          ))}
        </div>
      ))}
    </Card>
  )
}
