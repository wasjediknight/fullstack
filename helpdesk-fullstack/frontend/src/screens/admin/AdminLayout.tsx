import { Link, Routes, Route, Navigate } from 'react-router-dom'
import AdminServices from './AdminServices'
import AdminTechnicians from './AdminTechnicians'
import AdminClients from './AdminClients'
import AdminTickets from './AdminTickets'

export default function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="p-4 border-b flex gap-4">
        <Link to="/admin/services">Serviços</Link>
        <Link to="/admin/technicians">Técnicos</Link>
        <Link to="/admin/clients">Clientes</Link>
        <Link to="/admin/tickets">Chamados</Link>
      </header>
      <main className="p-4">
        <Routes>
          <Route path="services" element={<AdminServices />} />
          <Route path="technicians" element={<AdminTechnicians />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="*" element={<Navigate to="services" />} />
        </Routes>
      </main>
    </div>
  )
}
