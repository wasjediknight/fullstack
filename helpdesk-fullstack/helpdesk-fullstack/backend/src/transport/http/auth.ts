import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../core/db.js'
import bcrypt from 'bcryptjs'
import { signToken, authRequired } from '../../core/auth.js'

export const authRouter = Router()

const RegisterSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6)
  })
})

authRouter.post('/register', async (req, res) => {
  const parse = RegisterSchema.safeParse({ body: req.body })
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { name, email, password } = parse.data.body
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ error: 'Email already in use' })

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name, email, passwordHash: hash, role: 'CLIENT',
      client: { create: {} }
    }
  })
  const token = signToken({ sub: user.id, role: 'CLIENT' })
  return res.status(201).json({ accessToken: token })
})

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
})

authRouter.post('/login', async (req, res) => {
  const parse = LoginSchema.safeParse({ body: req.body })
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { email, password } = parse.data.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = signToken({ sub: user.id, role: user.role as any })
  return res.json({ accessToken: token, role: user.role })
})

const ChangeSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6)
  })
})

authRouter.post('/change-password', authRequired, async (req: any, res) => {
  const parse = ChangeSchema.safeParse({ body: req.body })
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const me = await prisma.user.findUnique({ where: { id: req.user.sub } })
  if (!me) return res.status(404).json({ error: 'User not found' })
  const ok = await bcrypt.compare(req.body.oldPassword, me.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const hash = await bcrypt.hash(req.body.newPassword, 10)
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: hash } })
  return res.status(204).send()
})
