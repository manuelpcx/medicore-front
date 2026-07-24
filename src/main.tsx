import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

const container = document.getElementById('root')!

// Peek síncrono y defensivo del store persistido de auth (zustand/persist,
// key 'MediHistory-auth', ver auth.store.ts) — SIN montar React todavía,
// solo para decidir la estrategia de montaje. Si algo falla al leerlo
// (localStorage bloqueado, JSON corrupto), se asume "hay sesión" (fail
// closed hacia el render de cliente normal): un hydrateRoot fallido es
// justo el error de consola que esta feature debe evitar (R4/R5); un
// createRoot de más solo cuesta una optimización de perf, no correctitud.
function hasPersistedSession(): boolean {
  try {
    const raw = localStorage.getItem('MediHistory-auth')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return !!parsed?.state?.accessToken
  } catch {
    return true
  }
}

const canHydrate =
  window.location.pathname === '/' &&
  container.hasChildNodes() &&
  !hasPersistedSession()

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

if (canHydrate) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
