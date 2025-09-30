import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function ClientNewTicket() {
  const [slot, setSlot] = useState('08:00')
  const [techs, setTechs] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedTech, setSelectedTech] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [items, setItems] = useState<{serviceId: string, quantity: number}[]>([])

  useEffect(() => {
    (async()=>{
      const s = await api.get('/client/services')
      setServices(s.data)
      const t = await api.get('/client/technicians/available', { params: { slot } })
      setTechs(t.data)
    })()
  }, [slot])

  function addItem() {
    if (!selectedService) return
    setItems(prev => [...prev, { serviceId: selectedService, quantity: 1 }])
    setSelectedService('')
  }

  async function create() {
    const res = await api.post('/client/tickets', { technicianId: selectedTech, services: items, slot })
    alert('Chamado criado #' + res.data.id.slice(-6))
    setItems([])
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold">Novo Chamado</h2>
      <div className="grid gap-2">
        <label className="text-sm">Slot</label>
        <select className="border p-2 rounded" value={slot} onChange={e=>setSlot(e.target.value)}>
          {['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map(s=>(
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="text-sm">Técnico</label>
        <select className="border p-2 rounded" value={selectedTech} onChange={e=>setSelectedTech(e.target.value)}>
          <option value="">Selecione...</option>
          {techs.map((t:any)=>(<option key={t.id} value={t.id}>{t.user.name}</option>))}
        </select>

        <label className="text-sm">Serviços</label>
        <div className="flex gap-2">
          <select className="border p-2 rounded" value={selectedService} onChange={e=>setSelectedService(e.target.value)}>
            <option value="">Selecionar serviço...</option>
            {services.map((s:any)=>(<option key={s.id} value={s.id}>{s.name}</option>))}
          </select>
          <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={addItem}>Adicionar</button>
        </div>
        <ul className="text-sm">
          {items.map((it, idx)=>(<li key={idx}>• {services.find(s=>s.id===it.serviceId)?.name || it.serviceId}</li>))}
        </ul>

        <button className="mt-4 px-4 py-2 rounded bg-emerald-600 text-white w-fit" onClick={create}>Criar Chamado</button>
      </div>
    </div>
  )
}
