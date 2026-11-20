import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Flower2, Leaf, Sprout } from 'lucide-react'
import { stageOf } from '../lib/meta'

/** Counts come only from the user's real tasks. A new account shows 0 / 0 / 0. */
export default function Stats({ tasks, title }) {
  const s = useMemo(() => {
    let bloomed = 0, growing = 0, seeds = 0
    tasks.forEach((t) => { const st = stageOf(t); if (st === 3) bloomed++; else if (st === 0) seeds++; else growing++ })
    return { bloomed, growing, seeds }
  }, [tasks])
  const items = [
    { n: s.seeds, l: 'Seeds', icon: <Leaf size={26} /> },
    { n: s.growing, l: 'Growing', icon: <Sprout size={26} /> },
    { n: s.bloomed, l: 'Bloomed', icon: <Flower2 size={26} /> },
  ]
  return (
    <div className="stats-card">
      {title && <h3 className="display"><Sprout size={20} />{title}</h3>}
      <div className="stats">
        {items.map((i, k) => (
          <motion.div key={i.l} className="stat" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * 0.07 }}>
            <span className="stat-icon">{i.icon}</span>
            <b>{i.n}</b>
            <small>{i.l}</small>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
