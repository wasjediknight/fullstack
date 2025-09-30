import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function AdminTickets() {
  const [list, setList] = useState<any[]>([])
  const [to, setTo] = useState('OPEN')

  async function load() {
    const { data } = await api.get('/admin/tickets')
    setList(data)
  }
  useEffect(() => { load() }, [])

  async function changeStatus(id: string) {
    await api.patch(`/admin/tickets/${id}/status`, { to })
    load()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Chamados</h2>
      <div className="flex gap-2 items-center">
        <span>Alterar para:</span>
        <select className="border p-2 rounded" value={to} onChange={e=>setTo(e.target.value)}>
          <option value="OPEN">Aberto</option>
          <option value="IN_PROGRESS">Em atendimento</option>
          <option value="CLOSED">Encerrado</option>
        </select>
      </div>
      <ul className="grid gap-2">
        {list.map(t => (
          <li key={t.id} className="border rounded p-3 flex justify-between">
            <div>
              <div className="font-medium">#{t.id.slice(-6)} — {t.status}</div>
              <div className="text-sm opacity-70">Cliente: {t.client.user.name} | Técnico: {t.technician.user.name}</div>
              <div className="text-sm">Total: R$ {t.totalCached}</div>
            </div>
            <button className="px-3 py-1 rounded bg-indigo-600 text-white h-fit" onClick={()=>changeStatus(t.id)}>Aplicar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
