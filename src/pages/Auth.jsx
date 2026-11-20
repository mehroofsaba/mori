import { useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BellRing, Brain, Lock, Sprout } from 'lucide-react'
import { useAuth } from '../auth'
import { configured } from '../lib/supabase'
import Garden from '../components/Garden'
import { CatMascot, Logo } from '../components/Art'

const Shell = ({ children, art = true }) => (
  <div className="stage">
    <div className={'auth-window' + (art ? '' : ' solo')}>
      <div className="auth-left">
        <Link to="/" className="wordmark auth-brand" aria-label="Mori home"><span className="display">Mori</span><Logo size={30} /></Link>
        <small className="auth-sub display">The Thought Garden</small>
        {children}
      </div>
      {art && (
        <div className="auth-right" aria-hidden="true">
          <Garden tasks={[]} signTitle="Plant your thoughts." signSub="Grow your days." />
          <div className="auth-cat"><CatMascot size={120} /></div>
        </div>
      )}
    </div>
  </div>
)

function Field({ label, ...p }) {
  return <label>{label}<input {...p} /></label>
}
function Err({ children }) {
  return children ? <p className="form-err" role="alert">{children}</p> : null
}

export function Welcome() {
  return (
    <Shell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="welcome">
        {!configured && <p className="setup-note">Developer note: Supabase isn’t connected yet. Log in and sign up will show setup steps until you add your <code>.env</code>.</p>}
        <h1 className="display">Plant your thoughts.<br />Grow your days.</h1>
        <p>Mori is a gentle place to unload everything on your mind, turn it into tasks you actually approve, and watch your own garden grow as you make progress.</p>
        <div className="cta-row">
          <Link to="/signup" className="btn primary big">Create my garden ♥</Link>
          <Link to="/login" className="btn ghost big">Log in</Link>
        </div>
        <ul className="promises">
          <li><Lock size={18} /><span><b>Private by design.</b> Every garden belongs to one person. Nobody else can open it.</span></li>
          <li><Brain size={18} /><span><b>Brain dump, then approve.</b> Mori suggests a plan. Nothing is added until you say so.</span></li>
          <li><BellRing size={18} /><span><b>Reminders from your real deadlines.</b> Gentle, never guilt-tripping.</span></li>
          <li><Sprout size={18} /><span><b>Starts empty.</b> Flowers only grow when you make progress.</span></li>
        </ul>
      </motion.div>
    </Shell>
  )
}

export function Login() {
  const { signIn } = useAuth()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { await signIn(f) } catch (x) { setErr(x.message); setBusy(false) }
  }
  if (!configured) return <SetupNeeded />
  return (
    <Shell>
      <form className="auth-card" onSubmit={submit}>
        <h2 className="display">Welcome back</h2>
        <p className="muted">Your garden has been waiting.</p>
        <Field label="Email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field label="Password" type="password" autoComplete="current-password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Err>{err}</Err>
        <button className="btn primary wide" disabled={busy}>{busy ? 'Opening your garden…' : 'Log in'}</button>
        <p className="auth-alt"><Link to="/forgot">Forgot your password?</Link></p>
        <p className="auth-alt">New here? <Link to="/signup">Create your garden</Link></p>
      </form>
    </Shell>
  )
}

export function Signup() {
  const { signUp } = useAuth()
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (f.password.length < 8) return setErr('Your password needs at least 8 characters.')
    setBusy(true)
    try {
      const { needsConfirm } = await signUp(f)
      if (needsConfirm) { setSent(true); setBusy(false) }
    } catch (x) { setErr(x.message); setBusy(false) }
  }
  if (!configured) return <SetupNeeded />
  if (sent)
    return (
      <Shell>
        <div className="auth-card">
          <h2 className="display">Check your inbox ♥</h2>
          <p>We sent a confirmation link to <b>{f.email}</b>. Open it and your brand-new, empty garden will be ready.</p>
          <p className="auth-alt"><Link to="/login">Back to log in</Link></p>
        </div>
      </Shell>
    )
  return (
    <Shell>
      <form className="auth-card" onSubmit={submit}>
        <h2 className="display">Create your garden</h2>
        <p className="muted">It starts completely empty. The first seed is yours to plant.</p>
        <Field label="What should Mori call you?" autoComplete="given-name" maxLength={24} required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Field label="Email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Field label="Password (8+ characters)" type="password" autoComplete="new-password" minLength={8} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Err>{err}</Err>
        <button className="btn primary wide" disabled={busy}>{busy ? 'Planting…' : 'Create my garden'}</button>
        <p className="auth-alt">Already have a garden? <Link to="/login">Log in</Link></p>
      </form>
    </Shell>
  )
}

export function Forgot() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try { await resetPassword(email); setDone(true) } catch (x) { setErr(x.message) }
  }
  if (!configured) return <SetupNeeded />
  return (
    <Shell>
      <form className="auth-card" onSubmit={submit}>
        <h2 className="display">Reset your password</h2>
        {done ? (
          <p>If an account exists for <b>{email}</b>, a reset link is on its way.</p>
        ) : (
          <>
            <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Err>{err}</Err>
            <button className="btn primary wide">Send reset link</button>
          </>
        )}
        <p className="auth-alt"><Link to="/login">Back to log in</Link></p>
      </form>
    </Shell>
  )
}

export function SetNewPassword() {
  const { updatePassword } = useAuth()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const submit = async (e) => {
    e.preventDefault()
    if (pw.length < 8) return setErr('Your password needs at least 8 characters.')
    try { await updatePassword(pw); nav('/', { replace: true }) } catch (x) { setErr(x.message) }
  }
  return (
    <Shell art={false}>
      <form className="auth-card" onSubmit={submit}>
        <h2 className="display">Choose a new password</h2>
        <Field label="New password (8+ characters)" type="password" autoComplete="new-password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} />
        <Err>{err}</Err>
        <button className="btn primary wide">Save password</button>
      </form>
    </Shell>
  )
}

export function SetupNeeded() {
  return (
    <Shell>
      <div className="auth-card setup">
        <h2 className="display">One quick setup step</h2>
        <p>Mori keeps every garden private using Supabase accounts. This copy isn’t connected to a Supabase project yet.</p>
        <ol>
          <li>Create a free project at <b>supabase.com</b>.</li>
          <li>Open <b>SQL Editor</b>, paste <code>supabase/schema.sql</code> and run it.</li>
          <li>Copy <code>.env.example</code> to <code>.env</code> and fill in your project URL and anon key (Project Settings → API).</li>
          <li>Restart <code>npm run dev</code>.</li>
        </ol>
        <p className="muted">Until it’s connected, Mori won’t store anything, so nobody’s tasks can end up in the wrong place.</p>
      </div>
    </Shell>
  )
}

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
