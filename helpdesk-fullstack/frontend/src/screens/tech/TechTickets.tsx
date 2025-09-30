import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function TechTickets() {
  const [list, setList] = useState<any[]>([])
  const [to, setTo] = useState('IN_PROGRESS')
  const [serviceId, setServiceId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [services, setServices] = useState<any[]>([])

  async function load() {
    const { data } = await api.get('/tech/tickets')
    setList(data)
    const { data: svcs } = await api.get('/admin/services', { params: { includeInactive: true } })
    setServices(svcs)
  }
  useEffect(() => { load() }, [])

  async function changeStatus(id: string) {
    await api.patch(`/tech/tickets/${id}/status`, { to })
    load()
  }

  async function addService(id: string) {
    if (!serviceId) return
    await api.post(`/tech/tickets/${id}/services`, { serviceId, quantity })
    load()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Meus Chamados</h2>
      <div className="flex gap-2 items-center">
        <span>Status:</span>
        <select className="border p-2 rounded" value={to} onChange={e=>setTo(e.target.value)}>
          <option value="IN_PROGRESS">Em atendimento</option>
          <option value="CLOSED">Encerrado</option>
        </select>
      </div>
      <ul className="grid gap-2">
        {list.map(t => (
          <li key={t.id} className="border rounded p-3 space-y-2">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">#{t.id.slice(-6)} — {t.status}</div>
                <div className="text-sm opacity-70">Cliente: {t.client.user.name}</div>
                <div className="text-sm">Total: R$ {t.totalCached}</div>
              </div>
              <button className="px-3 py-1 rounded bg-indigo-600 text-white h-fit" onClick={()=>changeStatus(t.id)}>Aplicar</button>
            </div>
            <div className="flex gap-2 items-center">
              <select className="border p-2 rounded" value={serviceId} onChange={e=>setServiceId(e.target.value)}>
                <option value="">Adicionar serviço...</option>
                {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="number" className="border p-2 rounded w-24" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} />
              <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={()=>addService(t.id)}>Adicionar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
