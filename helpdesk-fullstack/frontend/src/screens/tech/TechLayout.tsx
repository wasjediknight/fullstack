import { Routes, Route, Link, Navigate } from 'react-router-dom'
import TechProfile from './TechProfile'
import TechTickets from './TechTickets'

export default function TechLayout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="p-4 border-b flex gap-4">
        <Link to="/tech">Meus Chamados</Link>
        <Link to="/tech/profile">Meu Perfil</Link>
      </header>
      <main className="p-4">
        <Routes>
          <Route index element={<TechTickets />} />
          <Route path="profile" element={<TechProfile />} />
          <Route path="*" element={<Navigate to="/tech" />} />
        </Routes>
      </main>
    </div>
  )
}
