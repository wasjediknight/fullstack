import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function AdminTechnicians() {
  const [list, setList] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  async function load() {
    const { data } = await api.get('/admin/technicians')
    setList(data)
  }
  useEffect(() => { load() }, [])

  async function create() {
    await api.post('/admin/technicians', form)
    setForm({ name: '', email: '', password: '' })
    load()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Técnicos</h2>
      <div className="flex flex-wrap gap-2">
        <input className="border p-2 rounded" placeholder="Nome" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Senha provisória" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={create}>Criar</button>
      </div>
      <ul className="grid gap-2">
        {list.map(t => (
          <li key={t.id} className="border rounded p-3">
            <div className="font-medium">{t.user.name} — <span className="text-sm opacity-70">{t.user.email}</span></div>
            <div className="text-sm mt-1">Slots: {t.availability.join(', ')}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
