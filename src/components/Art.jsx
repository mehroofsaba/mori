import { motion } from 'motion/react'

const HEAD = {
  tulip: { c: '#F26B8A', c2: '#FF9DB3' },
  daisy: { c: '#FFFFFF', c2: '#FFD35E' },
  cosmos: { c: '#F7A3C7', c2: '#FFD35E' },
  lavender: { c: '#B499E8', c2: '#8F72D4' },
  sunny: { c: '#FFC64A', c2: '#8A5A3C' },
}
const STEM = '#6BB88C'
const LEAF = '#8CCB9E'
const rot = (n, step = 360 / n) => Array.from({ length: n }, (_, i) => i * step)

function Leaf({ x, y, s = 1, flip = 1, a = 35 }) {
  return (
    <path
      d="M0 0 C 6 -9 15 -9 20 -3 C 14 3 6 4 0 0Z"
      fill={LEAF}
      stroke="#5FA57F"
      strokeWidth="0.8"
      transform={`translate(${x} ${y}) scale(${s * flip} ${s}) rotate(${-a})`}
    />
  )
}

function Head({ kind }) {
  const { c, c2 } = HEAD[kind] || HEAD.daisy
  switch (kind) {
    case 'tulip':
      return (
        <g>
          <path d="M-10 -3 C-12 -17 -4 -23 0 -26 C4 -23 12 -17 10 -3 C5 2 -5 2 -10 -3Z" fill={c} stroke="#D9567A" strokeWidth="0.8" />
          <path d="M-3 -2 C-6 -13 -1 -21 1 -25 C5 -20 6 -10 4 -2Z" fill={c2} opacity=".75" />
        </g>
      )
    case 'lavender':
      return (
        <g fill={c} stroke={c2} strokeWidth="0.6">
          {[-4, -10, -16, -22, -28].map((y, i) => (
            <g key={y}>
              <ellipse cx={-3.2} cy={y} rx={3} ry={4.2} transform={`rotate(-20 -3 ${y})`} />
              <ellipse cx={3.2} cy={y} rx={3} ry={4.2} transform={`rotate(20 3 ${y})`} />
              {i === 4 && <ellipse cx={0} cy={y - 4} rx={2.6} ry={3.8} />}
            </g>
          ))}
        </g>
      )
    case 'sunny':
      return (
        <g>
          {rot(12).map((a) => (
            <ellipse key={a} cx="0" cy="-11" rx="3.6" ry="9" fill={c} stroke="#E2A22B" strokeWidth="0.6" transform={`rotate(${a})`} />
          ))}
          <circle r="6.5" fill={c2} />
          <circle r="2.2" cx="-1.5" cy="-1.5" fill="#B07C58" opacity=".7" />
        </g>
      )
    case 'cosmos':
      return (
        <g>
          {rot(8).map((a) => (
            <ellipse key={a} cx="0" cy="-10" rx="6.2" ry="9.6" fill={c} stroke="#E57BA6" strokeWidth="0.6" transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill={c2} />
        </g>
      )
    default:
      return (
        <g>
          {rot(8).map((a) => (
            <ellipse key={a} cx="0" cy="-10" rx="4.2" ry="9" fill={c} stroke="#F1BFCB" strokeWidth="0.9" transform={`rotate(${a})`} />
          ))}
          <circle r="4.6" fill={c2} stroke="#F1B93B" strokeWidth="0.6" />
        </g>
      )
  }
}

/** A plant at a given growth stage. Origin (0,0) is the base of the stem; it grows upward. */
export function Plant({ kind = 'daisy', stage = 0, x = 0, y = 0, scale = 1, sway = true, delay = 0 }) {
  const h = [0, 26, 46, 64][stage]
  const stem = `M0 0 C -4 ${-h * 0.3} 4 ${-h * 0.62} 0 ${-h}`
  const body =
    stage === 0 ? (
      <g>
        <ellipse cx="0" cy="-1" rx="10" ry="4.5" fill="#8A5A44" />
        <ellipse cx="-3" cy="-3.6" rx="3.2" ry="2.1" fill="#EBCB9A" stroke="#B88A5E" strokeWidth=".6" />
        <path d="M5 -8 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z" fill="#FFE59A" />
      </g>
    ) : (
      <g>
        <path d={stem} stroke={STEM} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {stage === 1 && (
          <>
            <Leaf x={0} y={-h + 2} s={1.1} flip={1} a={40} />
            <Leaf x={0} y={-h + 4} s={1.1} flip={-1} a={40} />
          </>
        )}
        {stage >= 2 && (
          <>
            <Leaf x={0.5} y={-h * 0.22} s={1.3} flip={1} a={28} />
            <Leaf x={-0.5} y={-h * 0.42} s={1.15} flip={-1} a={32} />
            {stage === 3 && <Leaf x={0.5} y={-h * 0.62} s={0.9} flip={1} a={40} />}
          </>
        )}
        {stage === 2 && (
          <g transform={`translate(0 ${-h})`}>
            <ellipse cx="0" cy="-5" rx="5.5" ry="7.5" fill={(HEAD[kind] || HEAD.daisy).c === '#FFFFFF' ? '#FFD6DD' : (HEAD[kind] || HEAD.daisy).c} stroke="#6BB88C" strokeWidth=".8" opacity=".95" />
            <path d="M-5 -1 Q0 -6 5 -1 Q0 3 -5 -1Z" fill={LEAF} />
          </g>
        )}
        {stage === 3 && (
          <g transform={`translate(0 ${-h})`}>
            <motion.g
              initial={{ scale: 0.2, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 9, delay: delay + 0.1 }}
              style={{ transformBox: 'fill-box', transformOrigin: '50% 90%' }}
            >
              <Head kind={kind} />
            </motion.g>
          </g>
        )}
      </g>
    )
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <motion.g
        animate={sway && stage > 0 ? { rotate: [-1.6, 1.6, -1.6] } : undefined}
        transition={{ duration: 4 + (delay % 2), repeat: Infinity, ease: 'easeInOut', delay }}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
      >
        <motion.g
          key={stage}
          initial={{ scaleY: 0.3, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 110, damping: 12, delay }}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        >
          {body}
        </motion.g>
      </motion.g>
    </g>
  )
}

export function PlantIcon({ kind, stage = 3, size = 56 }) {
  return (
    <svg viewBox="-34 -104 68 112" width={size} height={size * (112 / 68)} aria-hidden="true">
      <Plant kind={kind} stage={stage} sway={false} />
    </svg>
  )
}

export function Butterfly({ x = 0, y = 0, color = '#F7A3C7', path = 40, dur = 9, delay = 0, scale = 1 }) {
  return (
    <motion.g
      initial={{ x, y }}
      animate={{ x: [x, x + path, x + path * 0.4, x - path * 0.3, x], y: [y, y - 24, y - 6, y - 30, y] }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <g transform={`scale(${scale})`}>
        <motion.g
          animate={{ scaleX: [1, 0.35, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
        >
          <ellipse cx="-5" cy="-3" rx="6" ry="7" fill={color} stroke="#C97A98" strokeWidth=".6" />
          <ellipse cx="5" cy="-3" rx="6" ry="7" fill={color} stroke="#C97A98" strokeWidth=".6" />
          <ellipse cx="-4" cy="4" rx="4" ry="4.5" fill="#FFE59A" stroke="#E0B65A" strokeWidth=".5" />
          <ellipse cx="4" cy="4" rx="4" ry="4.5" fill="#FFE59A" stroke="#E0B65A" strokeWidth=".5" />
        </motion.g>
        <rect x="-1" y="-6" width="2" height="12" rx="1" fill="#5A3A2E" />
      </g>
    </motion.g>
  )
}

export const Sparkle = ({ x = 0, y = 0, s = 1, color = '#FFE59A' }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill={color} />
)

const CanPaths = () => (
  <g>
    <path d="M62 14 C74 16 76 30 66 36" stroke="#D86A8A" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M10 18 L32 6 L36 12 L16 26Z" fill="#E88AA6" stroke="#C25577" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 24 H56 Q60 24 60 30 L58 54 Q58 60 52 60 H20 Q14 60 14 54Z" fill="#F29AB4" stroke="#C25577" strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="36" cy="25" rx="22" ry="5" fill="#F7B6C8" stroke="#C25577" strokeWidth="1.5" />
    <path d="M22 34 q4 -4 8 0 t8 0" stroke="#FFE59A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="46" cy="46" r="3" fill="#FFE59A" />
  </g>
)
export function WateringCan({ size = 70 }) {
  return (
    <svg viewBox="0 0 80 64" width={size} aria-hidden="true">
      <CanPaths />
    </svg>
  )
}

export function CatMascot({ size = 130 }) {
  return (
    <svg viewBox="0 0 140 110" width={size} aria-hidden="true">
      <ellipse cx="70" cy="86" rx="52" ry="22" fill="#FFF8EE" stroke="#E3C8B6" strokeWidth="2" />
      <path d="M36 84 q-8 -14 4 -26 q10 -8 20 0" fill="#F4B98C" opacity=".85" />
      <path d="M92 86 q16 -10 6 -24 q-6 -4 -12 2" fill="#F4B98C" opacity=".85" />
      <path d="M32 54 L36 28 L54 42Z" fill="#FFF8EE" stroke="#E3C8B6" strokeWidth="2" strokeLinejoin="round" />
      <path d="M108 54 L104 28 L86 42Z" fill="#FFF8EE" stroke="#E3C8B6" strokeWidth="2" strokeLinejoin="round" />
      <path d="M38 40 L41 34 L48 42Z" fill="#FFC9D4" />
      <path d="M102 40 L99 34 L92 42Z" fill="#FFC9D4" />
      <ellipse cx="70" cy="62" rx="40" ry="32" fill="#FFF8EE" stroke="#E3C8B6" strokeWidth="2" />
      <path d="M46 40 q8 -8 18 -6 q-4 10 -8 18 q-8 -2 -10 -12Z" fill="#F4B98C" opacity=".85" />
      <path d="M52 64 q5 5 11 0 M77 64 q5 5 11 0" stroke="#5A3A2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M67 72 h6 l-3 4z" fill="#F29AB4" />
      <path d="M70 76 q-3 4 -7 2 M70 76 q3 4 7 2" stroke="#5A3A2E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="74" rx="6" ry="3.6" fill="#FFB5C5" opacity=".7" />
      <ellipse cx="90" cy="74" rx="6" ry="3.6" fill="#FFB5C5" opacity=".7" />
      <path d="M30 70 h-12 M31 76 l-12 4 M110 70 h12 M109 76 l12 4" stroke="#CDB3A3" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="52" cy="98" rx="14" ry="8" fill="#FFF8EE" stroke="#E3C8B6" strokeWidth="2" />
      <ellipse cx="88" cy="98" rx="14" ry="8" fill="#FFF8EE" stroke="#E3C8B6" strokeWidth="2" />
    </svg>
  )
}

export function Mushroom({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-4 0 q-1 -12 1 -14 h6 q2 2 1 14Z" fill="#FFF3E4" stroke="#E3C8B6" strokeWidth="1" />
      <path d="M-14 -13 q14 -22 28 0 q-14 5 -28 0Z" fill="#F27C96" stroke="#D9567A" strokeWidth="1" />
      <circle cx="-5" cy="-17" r="2" fill="#fff" /><circle cx="4" cy="-14" r="1.6" fill="#fff" /><circle cx="7" cy="-19" r="1.4" fill="#fff" />
    </g>
  )
}

export function Logo({ size = 44 }) {
  return (
    <svg viewBox="-20 -20 40 40" width={size} height={size} aria-hidden="true">
      {rot(5).map((a) => <ellipse key={a} cx="0" cy="-9" rx="5.5" ry="8" fill="#F7A3C7" stroke="#E57BA6" strokeWidth="1" transform={`rotate(${a})`} />)}
      <circle r="4.5" fill="#FFE59A" stroke="#E0B65A" strokeWidth="1" />
    </svg>
  )
}

/** Decorative scenery flower. NOT a task: tasks are drawn by <Plant />. Stem rooted at (0,0), head facing up. */
export function Wild({ x = 0, y = 0, s = 1, c = '#FFD6DD', c2 = '#FFE59A', h = 26 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true">
      <path d={`M0 0 C -2 ${-h * 0.4} 2 ${-h * 0.7} 0 ${-h}`} stroke={STEM} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M0 -6 C 5 -12 11 -11 13 -7 C 8 -3 3 -3 0 -6Z" fill={LEAF} />
      <path d="M0 -11 C -5 -17 -11 -16 -13 -12 C -8 -8 -3 -8 0 -11Z" fill={LEAF} />
      <g transform={`translate(0 ${-h})`}>
        {rot(5).map((a) => <ellipse key={a} cx="0" cy="-4.2" rx="2.8" ry="4.4" fill={c} stroke="#E9B3C0" strokeWidth=".5" transform={`rotate(${a})`} />)}
        <circle r="2.4" fill={c2} />
      </g>
    </g>
  )
}

export function SproutBuddy({ size = 96 }) {
  return (
    <svg viewBox="0 0 110 110" width={size} aria-hidden="true">
      <ellipse cx="55" cy="100" rx="30" ry="5" fill="#5A3A2E" opacity=".1" />
      <path d="M55 20 C 55 12 58 8 62 4" stroke="#6BB88C" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M55 20 C 40 14 30 20 28 28 C 40 32 52 28 55 20Z" fill="#8CCB9E" stroke="#5FA57F" strokeWidth="1.5" />
      <path d="M56 20 C 70 12 82 16 84 24 C 72 30 60 28 56 20Z" fill="#8CCB9E" stroke="#5FA57F" strokeWidth="1.5" />
      <path d="M22 70 C 20 40 38 26 55 26 C 74 26 90 42 88 70 C 87 88 72 98 55 98 C 38 98 24 88 22 70Z" fill="#FFFAF0" stroke="#E3C8B6" strokeWidth="2" />
      <circle cx="43" cy="64" r="3.4" fill="#5A3A2E" /><circle cx="67" cy="64" r="3.4" fill="#5A3A2E" />
      <path d="M50 72 q5 5 10 0" stroke="#5A3A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="74" rx="5" ry="3" fill="#FFB5C5" opacity=".8" /><ellipse cx="74" cy="74" rx="5" ry="3" fill="#FFB5C5" opacity=".8" />
      <g transform="translate(84 84)">
        <path d="M0 0 V14" stroke="#6BB88C" strokeWidth="2.4" strokeLinecap="round" />
        {rot(5).map((a) => <ellipse key={a} cx="0" cy="-5" rx="3.6" ry="5.4" fill="#F7A3C7" transform={`rotate(${a})`} />)}
        <circle r="3" fill="#FFE59A" />
      </g>
    </svg>
  )
}
