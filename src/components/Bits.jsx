import { motion } from 'motion/react'
import { fmtDue, fmtDuration } from '../lib/dates'
import { catLabel, PRIORITIES } from '../lib/meta'

export const Bar = ({ value }) => (
  <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <motion.i initial={false} animate={{ width: `${value}%` }} transition={{ type: 'spring', stiffness: 80, damping: 16 }} />
  </div>
)

export const PriorityChip = ({ p }) => <span className={'chip ' + p}>{PRIORITIES.find((x) => x.id === p)?.label}</span>
export const DueChip = ({ date }) => <span className="chip due">Due: {fmtDue(date)}</span>
export const CatChip = ({ c }) => <span className="chip cat">{catLabel(c)}</span>
export const TimeChip = ({ m }) => <span className="chip cat">{fmtDuration(m)}</span>

export const Card = ({ title, icon, right, children, className = '' }) => (
  <section className={'card ' + className}>
    {(title || right) && (
      <header className="card-head">
        <h3>{icon}{title}</h3>
        {right}
      </header>
    )}
    {children}
  </section>
)

export const Tabs = ({ items, value, onChange }) => (
  <div className="tabs" role="tablist">
    {items.map((it) => (
      <button key={it.id} role="tab" aria-selected={value === it.id} className={value === it.id ? 'on' : ''} onClick={() => onChange(it.id)}>
        {it.icon}{it.label}
      </button>
    ))}
  </div>
)
