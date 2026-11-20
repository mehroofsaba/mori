import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Butterfly, Mushroom, Plant, Sparkle, Wild, WateringCan } from './Art'
import { kindFor, stageOf, isDone } from '../lib/meta'
import { needsAttention } from '../lib/planner'

const W = 900
const H = 480
const S = (v) => ({ fill: `var(${v})` })

// Decorative scenery only. These wildflowers are NOT tasks; task plants are drawn from real progress below.
const rnd = (i) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x) }
const TINY = Array.from({ length: 30 }, (_, i) => ({ x: 14 + rnd(i) * 872, y: 308 + rnd(i + 90) * 168, c: ['#FFFFFF', '#FFD6DD', '#FFE59A', '#D8C8F3'][i % 4] }))
const WILD = [
  [34, 400, 1.5, '#F7A3C7'], [78, 440, 1.2, '#D8C8F3'], [128, 468, 1.4, '#FFE59A'], [18, 330, 1.1, '#FFFFFF'],
  [150, 330, 1.0, '#FFD6DD'], [872, 392, 1.5, '#F7A3C7'], [826, 452, 1.3, '#FFE59A'], [868, 330, 1.1, '#D8C8F3'],
  [760, 470, 1.2, '#FFFFFF'], [200, 462, 1.1, '#FFD6DD'], [700, 340, 0.9, '#FFD6DD'],
]

// Patch of soil: an ellipse. Task plants are laid out in rows inside it.
const PX = 450, PY = 404, RX = 250, RY = 60

function layout(sorted) {
  const n = sorted.length
  const R = n <= 6 ? 1 : n <= 15 ? 2 : n <= 30 ? 3 : 4
  const perRow = Math.ceil(n / R)
  const sc = Math.max(0.5, Math.min(1.05, 7.5 / Math.max(perRow, 1) + 0.15))
  const out = []
  sorted.forEach((t, i) => {
    const r = i % R
    const k = Math.floor(i / R)
    const rowsN = Math.ceil((n - r) / R)
    const yy = R === 1 ? PY + 14 : PY - RY * 0.45 + (r * (RY * 1.15)) / (R - 1)
    const half = RX * 0.84 * Math.sqrt(Math.max(0.1, 1 - ((yy - PY) / RY) ** 2))
    const x = rowsN === 1 ? PX : PX - half + (k * (2 * half)) / (rowsN - 1)
    out.push({ t, x, y: yy, s: sc * (0.85 + (r / Math.max(R - 1, 1)) * 0.25), r })
  })
  return out.sort((a, b) => a.r - b.r)
}

export default function Garden({ tasks, selectedId, onSelect, signTitle = 'Your garden is empty…', signSub = 'Add a task and watch your garden bloom!' }) {
  const [hover, setHover] = useState(null)
  const sorted = useMemo(() => [...tasks].sort((a, b) => a.createdAt - b.createdAt), [tasks])
  const plants = useMemo(() => layout(sorted), [sorted])
  const hovered = plants.find((p) => p.t.id === hover)
  const empty = tasks.length === 0

  return (
    <div className="garden">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={empty ? 'An empty garden waiting for its first task.' : 'Your garden. Each plant is one of your tasks.'}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--sky1)' }} /><stop offset="1" style={{ stopColor: 'var(--sky2)' }} /></linearGradient>
          <radialGradient id="sun"><stop offset="0" stopColor="#FFF6C9" /><stop offset="1" stopColor="#FFF6C9" stopOpacity="0" /></radialGradient>
          <radialGradient id="glow"><stop offset="0" stopColor="#FFF2A8" stopOpacity=".9" /><stop offset="1" stopColor="#FFF2A8" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        <circle cx="690" cy="86" r="120" fill="url(#sun)" />
        {[[120, 70, 1], [470, 48, 0.8], [800, 120, 0.7]].map(([x, y, s], i) => (
          <motion.g key={i} animate={{ x: [0, 26, 0] }} transition={{ duration: 28 + i * 6, repeat: Infinity, ease: 'easeInOut' }}>
            <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity=".7"><ellipse rx="40" ry="12" /><ellipse cx="-18" cy="-8" rx="20" ry="12" /><ellipse cx="14" cy="-12" rx="24" ry="14" /></g>
          </motion.g>
        ))}
        <path d="M0 250 Q140 190 300 238 T620 230 T900 214 V480 H0Z" style={S('--hill-far')} />
        <path d="M0 280 Q200 232 420 272 T900 258 V480 H0Z" style={S('--hill-mid')} />
        {[[640, 240, 0.85], [760, 226, 1], [210, 246, 0.8], [330, 252, 0.7]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M-4 0 q2 -34 -1 -56 h10 q-3 22 -1 56Z" fill="#8A5A44" />
            <circle cx="-4" cy="-72" r="38" style={S('--tree')} /><circle cx="-30" cy="-56" r="26" style={S('--tree')} /><circle cx="26" cy="-58" r="28" style={S('--tree')} />
            {[[-20, -80], [10, -90], [26, -62], [-34, -54], [0, -62], [-8, -100]].map(([bx, by], k) => <circle key={k} cx={bx} cy={by} r="5" fill={k % 2 ? '#FFC9D8' : '#FFFFFF'} opacity=".95" />)}
          </g>
        ))}
        {/* fence */}
        <g>
          <rect x="0" y="262" width={W} height="7" rx="3" fill="#C9966A" /><rect x="0" y="286" width={W} height="7" rx="3" fill="#C9966A" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 58 + 8} 304 V258 q8 -10 16 0 V304Z`} fill="#DDAC7C" stroke="#B98354" strokeWidth="1.2" />)}
        </g>
        {/* birdhouse with bluebird */}
        <g transform="translate(120 308)">
          <rect x="-4" y="-96" width="9" height="96" rx="3" fill="#8A5A44" />
          <rect x="-26" y="-132" width="52" height="40" rx="5" fill="#F3D9B2" stroke="#C9966A" strokeWidth="2" />
          <circle cx="0" cy="-114" r="8" fill="#5A3A2E" />
          <path d="M-34 -130 L0 -158 L34 -130Z" fill="#C0724F" stroke="#8A5236" strokeWidth="2" strokeLinejoin="round" />
          <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <ellipse cx="-4" cy="-168" rx="10" ry="8" fill="#8FC2E8" /><circle cx="-12" cy="-172" r="5" fill="#8FC2E8" /><path d="M-17 -172 l-5 2 l5 2z" fill="#F4B35C" /><circle cx="-13" cy="-173" r="1.1" fill="#2B2B2B" />
            <path d="M0 -166 l12 4 l-12 2z" fill="#6FA6D3" />
          </motion.g>
        </g>
        <path d="M0 300 Q220 276 450 300 T900 292 V480 H0Z" style={S('--grass1')} />
        <path d="M0 360 Q300 330 600 360 T900 350 V480 H0Z" style={S('--grass2')} opacity=".6" />
        {/* scenery (decorative, not tasks) */}
        <g aria-hidden="true">
          {TINY.map((f, i) => (
            <g key={i} transform={`translate(${f.x} ${f.y})`}>
              <path d="M0 0 v8" stroke="#5FA57F" strokeWidth="1.4" />
              {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cy="-3" rx="1.8" ry="3" fill={f.c} transform={`rotate(${a})`} />)}
              <circle r="1.5" fill="#FFB347" />
            </g>
          ))}
          {WILD.map(([x, y, s, c], i) => <Wild key={i} x={x} y={y} s={s} c={c} />)}
          <ellipse cx="190" cy="438" rx="22" ry="9" fill="#CFC6BC" /><ellipse cx="660" cy="478" rx="20" ry="8" fill="#CFC6BC" />
        </g>
        {/* soil patch */}
        <ellipse cx={PX} cy={PY + 6} rx={RX + 12} ry={RY + 8} fill="var(--soil-dark)" />
        <ellipse cx={PX} cy={PY} rx={RX} ry={RY} style={S('--soil')} />
        <path d={`M${PX - 150} ${PY + 10} q60 14 140 4 M${PX + 30} ${PY - 18} q80 10 150 -2 M${PX - 90} ${PY - 30} q50 6 110 0`} stroke="var(--soil-dark)" strokeWidth="2" fill="none" opacity=".35" strokeLinecap="round" />
        <g transform="translate(736 408)"><WateringCan size={90} /></g>
        <Mushroom x={40} y={474} s={1.1} />
        <Mushroom x={866} y={474} s={0.9} />

        {/* sign: big and welcoming when empty, small when the garden has plants */}
        {empty ? (
          <g transform="translate(450 244)">
            <rect x="-5" y="40" width="10" height="82" rx="3" fill="#8A5A44" />
            <path d="M0 -4 C -6 -14 -16 -14 -18 -8 C -10 -4 -4 -4 0 -4Z M0 -4 C 6 -14 16 -14 18 -8 C 10 -4 4 -4 0 -4Z" fill="#8CCB9E" stroke="#5FA57F" strokeWidth="1.2" />
            <g transform="rotate(-3)">
              <rect x="-176" y="0" width="352" height="86" rx="12" fill="#F6E3C4" stroke="#C9966A" strokeWidth="4" />
              <text x="0" y="34" textAnchor="middle" fontFamily="var(--font-display)" fontSize="27" fill="#5A3A2E">{signTitle}</text>
              <text x="0" y="62" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="17" fill="#8A6657">{signSub} ♥</text>
            </g>
          </g>
        ) : (
          <g transform="translate(34 336) rotate(-6)">
            <rect x="52" y="30" width="8" height="70" rx="3" fill="#8A5A44" />
            <rect x="0" y="0" width="116" height="52" rx="8" fill="#F6E3C4" stroke="#C9966A" strokeWidth="3" />
            <text x="58" y="22" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="16" fill="#5A3A2E">Small steps,</text>
            <text x="58" y="41" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="16" fill="#5A3A2E">big blooms ♥</text>
          </g>
        )}

        {/* task plants: stage comes only from real progress */}
        {plants.map(({ t, x, y, s }, i) => {
          const stage = stageOf(t)
          const sel = selectedId === t.id
          const top = y - [10, 36, 58, 92][stage] * s
          return (
            <g
              key={t.id} role="button" tabIndex={0} className="plant-hit"
              aria-label={`${t.title}. ${isDone(t) ? 'Bloomed' : stage === 0 ? 'Seed' : 'Growing'}`}
              onClick={() => onSelect?.(t.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect?.(t.id))}
              onMouseEnter={() => setHover(t.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(t.id)} onBlur={() => setHover(null)}
            >
              {sel && <circle cx={x} cy={y - 40 * s} r={58 * s} fill="url(#glow)" />}
              <rect x={x - 22 * s} y={y - 100 * s} width={44 * s} height={108 * s} fill="transparent" />
              <motion.g whileHover={{ scale: 1.08 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
                <Plant kind={kindFor(t.category)} stage={stage} x={x} y={y} scale={s * (stage === 0 ? 1.5 : 1)} delay={(i % 7) * 0.1} />
              </motion.g>
              {needsAttention(t) && (
                <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
                  <circle cx={x + 16 * s} cy={top - 8} r="8" fill="#FFE59A" stroke="#E7B94F" strokeWidth="1.4" />
                  <text x={x + 16 * s} y={top - 4.5} textAnchor="middle" fontSize="11" fontWeight="800" fill="#8A5A2E" fontFamily="var(--font-ui)">!</text>
                </motion.g>
              )}
            </g>
          )
        })}
        {hovered && (
          <g pointerEvents="none" transform={`translate(${Math.min(Math.max(hovered.x, 110), W - 110)} ${hovered.y - 118 * hovered.s})`}>
            <rect x={-Math.min(hovered.t.title.length * 4.2 + 14, 104)} y="-18" width={Math.min(hovered.t.title.length * 8.4 + 28, 208)} height="26" rx="13" fill="#FFFAF4" stroke="#F0C9BC" strokeWidth="1.5" />
            <text textAnchor="middle" y="0" fontFamily="var(--font-ui)" fontWeight="700" fontSize="12.5" fill="#5A3A2E">{hovered.t.title.length > 24 ? hovered.t.title.slice(0, 23) + '…' : hovered.t.title}</text>
          </g>
        )}
        <Butterfly x={560} y={190} path={60} dur={11} />
        <Butterfly x={300} y={150} color="#FFE59A" path={-50} dur={13} delay={2} scale={0.8} />
        <Butterfly x={740} y={300} color="#FFE59A" path={40} dur={9} delay={1} scale={0.7} />
        {[[150, 160], [440, 120], [610, 330], [250, 290]].map(([x, y], i) => (
          <motion.g key={i} animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}><Sparkle x={x} y={y} /></motion.g>
        ))}
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${i * 42 + 6} 484 q-4 -22 -10 -24 q8 2 12 14 q2 -16 8 -24 q-2 20 0 34Z`} style={S('--grass2')} />)}
      </svg>
    </div>
  )
}
