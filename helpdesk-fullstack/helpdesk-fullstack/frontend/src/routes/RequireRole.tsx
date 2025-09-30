import { Navigate, Outlet } from 'react-router-dom'

function getUser() {
  const raw = localStorage.getItem('auth')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export default function RequireRole({ role }: { role: 'ADMIN'|'TECH'|'CLIENT' }) {
  const auth = getUser()
  if (!auth?.accessToken || auth?.role !== role) return <Navigate to="/login" />
  return <Outlet />
}
