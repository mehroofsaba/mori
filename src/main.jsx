import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider, useAuth } from './auth'
import { StoreProvider } from './store'
import { UIProvider } from './ui'
import { PublicRoutes, SetNewPassword } from './pages/Auth'
import './styles.css'

function Gate() {
  const { user, loading, recovery } = useAuth()
  if (loading) return <div className="boot">Opening the garden gate…</div>
  if (recovery && user) return <SetNewPassword />
  if (!user) return <PublicRoutes />
  // key = user id: switching accounts rebuilds everything, so one person's data can never linger for the next.
  return (
    <StoreProvider key={user.id}>
      <UIProvider>
        <App />
      </UIProvider>
    </StoreProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
