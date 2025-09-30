import { Routes, Route, Link, Navigate } from 'react-router-dom'
import ClientDashboard from './ClientDashboard'
import ClientNewTicket from './ClientNewTicket'
import ClientHistory from './ClientHistory'

export default function ClientLayout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="p-4 border-b flex gap-4">
        <Link to="/client">Novo Chamado</Link>
        <Link to="/client/history">Histórico</Link>
      </header>
      <main className="p-4">
        <Routes>
          <Route index element={<ClientNewTicket />} />
          <Route path="history" element={<ClientHistory />} />
          <Route path="*" element={<Navigate to="/client" />} />
        </Routes>
      </main>
    </div>
  )
}
