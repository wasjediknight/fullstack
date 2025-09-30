import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  async function load(includeInactive=false) {
    const { data } = await api.get('/admin/services', { params: { includeInactive } })
    setServices(data)
  }
  useEffect(() => { load() }, [])

  async function createService() {
    await api.post('/admin/services', { name, price: Number(price) })
    setName(''); setPrice(''); load()
  }

  async function deactivate(id: string) {
    await api.patch(`/admin/services/${id}/deactivate`)
    load(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Serviços</h2>
      <div className="flex gap-2">
        <input className="border p-2 rounded" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Preço" value={price} onChange={e=>setPrice(e.target.value)} />
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={createService}>Criar</button>
      </div>
      <ul className="grid gap-2">
        {services.map(s => (
          <li key={s.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm opacity-70">R$ {s.price} {s.active ? '' : '(inativo)'}</div>
            </div>
            {s.active && <button className="text-sm px-3 py-1 rounded bg-rose-600 text-white" onClick={()=>deactivate(s.id)}>Desativar</button>}
          </li>
        ))}
      </ul>
    </div>
  )
}
