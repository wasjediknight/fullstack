import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function TechProfile() {
  const [me, setMe] = useState<any>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => { (async()=>{
    const { data } = await api.get('/tech/me'); setMe(data); setName(data?.name||''); setBio(data?.technician?.bio||'')
  })() }, [])

  async function save() {
    await api.patch('/tech/me', { name, bio })
    alert('Salvo')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Perfil do Técnico</h2>
      <div className="grid gap-2 max-w-md">
        <label className="text-sm">Nome</label>
        <input className="border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} />
        <label className="text-sm">Bio</label>
        <textarea className="border p-2 rounded" value={bio} onChange={e=>setBio(e.target.value)} />
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={save}>Salvar</button>
      </div>
    </div>
  )
}
