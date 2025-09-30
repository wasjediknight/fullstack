import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function AdminClients() {
  const [list, setList] = useState<any[]>([])
  useEffect(() => { (async()=>{ const { data } = await api.get('/admin/clients'); setList(data) })() }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Clientes</h2>
      <ul className="grid gap-2">
        {list.map(c => (
          <li key={c.id} className="border rounded p-3">
            <div className="font-medium">{c.user.name}</div>
            <div className="text-sm opacity-70">{c.user.email}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
