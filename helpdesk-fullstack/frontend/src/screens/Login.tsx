import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const nav = useNavigate()

  async function onSubmit(data: any) {
    const res = await api.post('/auth/login', data)
    localStorage.setItem('auth', JSON.stringify(res.data))
    const role = res.data.role
    if (role === 'ADMIN') nav('/admin')
    else if (role === 'TECH') nav('/tech')
    else nav('/client')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4 p-6 rounded-2xl shadow border">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded p-2" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{String(errors.email.message)}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input className="w-full border rounded p-2" type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-600">{String(errors.password.message)}</p>}
        </div>
        <button disabled={isSubmitting} className="w-full py-2 rounded-xl bg-indigo-600 text-white font-semibold">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
