import { Router } from 'express'
import { prisma } from '../../core/db.js'
import { authRequired, requireRole } from '../../core/auth.js'
import { z } from 'zod'

export const adminRouter = Router()
adminRouter.use(authRequired, requireRole('ADMIN'))

// Technicians
adminRouter.post('/technicians', async (req, res) => {
  const schema = z.object({ name: z.string().min(3), email: z.string().email(), password: z.string().min(6) })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const { name, email, password } = parse.data
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.default.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash: hash, role: 'TECH' } })
  await prisma.technicianProfile.create({ data: { userId: user.id, availability: ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'] } })
  return res.status(201).json(user)
})

adminRouter.get('/technicians', async (_req, res) => {
  const list = await prisma.technicianProfile.findMany({ include: { user: true } })
  res.json(list)
})

adminRouter.patch('/technicians/:id', async (req, res) => {
  const schema = z.object({ availability: z.array(z.string()).optional(), bio: z.string().optional(), name: z.string().optional() })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const id = req.params.id
  const tech = await prisma.technicianProfile.update({ where: { id }, data: { availability: parse.data.availability, bio: parse.data.bio } })
  if (parse.data.name) await prisma.user.update({ where: { id: tech.userId }, data: { name: parse.data.name } })
  res.json({ ok: true })
})

// Services
adminRouter.post('/services', async (req, res) => {
  const schema = z.object({ name: z.string().min(3), price: z.coerce.number().positive() })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const created = await prisma.service.create({ data: { name: parse.data.name, price: parse.data.price } })
  res.status(201).json(created)
})

adminRouter.get('/services', async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true'
  const where = includeInactive ? {} : { active: true }
  const list = await prisma.service.findMany({ where })
  res.json(list)
})

adminRouter.patch('/services/:id', async (req, res) => {
  const id = req.params.id
  const schema = z.object({ name: z.string().optional(), price: z.coerce.number().positive().optional() })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const updated = await prisma.service.update({ where: { id }, data: parse.data })
  res.json(updated)
})

adminRouter.patch('/services/:id/deactivate', async (req, res) => {
  const id = req.params.id
  const updated = await prisma.service.update({ where: { id }, data: { active: false } })
  res.json(updated)
})

// Clients
adminRouter.get('/clients', async (_req, res) => {
  const list = await prisma.clientProfile.findMany({ include: { user: true } })
  res.json(list)
})

adminRouter.patch('/clients/:id', async (req, res) => {
  const id = req.params.id
  const schema = z.object({ name: z.string().optional() })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const client = await prisma.clientProfile.findUnique({ where: { id } })
  if (!client) return res.status(404).json({ error: 'Not found' })
  if (parse.data.name) await prisma.user.update({ where: { id: client.userId }, data: { name: parse.data.name } })
  res.json({ ok: true })
})

adminRouter.delete('/clients/:id', async (req, res) => {
  const id = req.params.id
  const client = await prisma.clientProfile.findUnique({ where: { id } })
  if (!client) return res.status(404).json({ error: 'Not found' })
  await prisma.user.delete({ where: { id: client.userId } }) // cascade tickets via relations
  res.status(204).send()
})

// Tickets
adminRouter.get('/tickets', async (_req, res) => {
  const list = await prisma.ticket.findMany({ include: { client: { include: { user: true } }, technician: { include: { user: true } }, items: { include: { service: true } } } })
  res.json(list)
})

adminRouter.patch('/tickets/:id/status', async (req, res) => {
  const id = req.params.id
  const schema = z.object({ to: z.enum(['OPEN','IN_PROGRESS','CLOSED']) })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const t = await prisma.ticket.findUnique({ where: { id } })
  if (!t) return res.status(404).json({ error: 'Not found' })
  const updated = await prisma.ticket.update({ where: { id }, data: { status: parse.data.to, statusHistory: { create: { from: t.status, to: parse.data.to, changedBy: 'ADMIN' } } } })
  res.json(updated)
})
