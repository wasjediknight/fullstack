import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function ClientHistory() {
  const [list, setList] = useState<any[]>([])
  useEffect(() => { (async()=>{ const { data } = await api.get('/client/tickets/my'); setList(data) })() }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Histórico de Chamados</h2>
      <ul className="grid gap-2">
        {list.map(t => (
          <li key={t.id} className="border rounded p-3">
            <div className="font-medium">#{t.id.slice(-6)} — {t.status}</div>
            <div className="text-sm opacity-70">Técnico: {t.technician.user.name}</div>
            <div className="text-sm">Total: R$ {t.totalCached}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
