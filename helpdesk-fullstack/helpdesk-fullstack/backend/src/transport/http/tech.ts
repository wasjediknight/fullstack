import { Router } from 'express'
import { prisma } from '../../core/db.js'
import { authRequired, requireRole } from '../../core/auth.js'
import { z } from 'zod'

export const techRouter = Router()
techRouter.use(authRequired, requireRole('TECH'))

techRouter.get('/me', async (req: any, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user.sub }, include: { technician: true } })
  res.json(me)
})

techRouter.patch('/me', async (req: any, res) => {
  const schema = z.object({ name: z.string().min(3).optional(), bio: z.string().optional(), availability: z.array(z.string()).optional() })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  if (parse.data.name) await prisma.user.update({ where: { id: req.user.sub }, data: { name: parse.data.name } })
  const tech = await prisma.technicianProfile.findUnique({ where: { userId: req.user.sub } })
  if (tech) await prisma.technicianProfile.update({ where: { id: tech.id }, data: { bio: parse.data.bio, availability: parse.data.availability } })
  res.json({ ok: true })
})

techRouter.get('/tickets', async (req: any, res) => {
  const tech = await prisma.technicianProfile.findUnique({ where: { userId: req.user.sub } })
  if (!tech) return res.status(404).json({ error: 'Tech not found' })
  const list = await prisma.ticket.findMany({ where: { technicianId: tech.id }, include: { items: { include: { service: true } }, client: { include: { user: true } } } })
  res.json(list)
})

techRouter.post('/tickets/:id/services', async (req: any, res) => {
  const schema = z.object({ serviceId: z.string(), quantity: z.number().int().min(1).default(1) })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const t = await prisma.ticket.findUnique({ where: { id: req.params.id }, include: { items: true } })
  if (!t) return res.status(404).json({ error: 'Not found' })
  const svc = await prisma.service.findUnique({ where: { id: parse.data.serviceId } })
  if (!svc) return res.status(400).json({ error: 'Invalid service' })
  await prisma.ticketService.create({ data: { ticketId: t.id, serviceId: svc.id, unitPrice: svc.price, quantity: parse.data.quantity } })
  const items = await prisma.ticketService.findMany({ where: { ticketId: t.id } })
  const total = items.reduce((acc, it) => acc + Number(it.unitPrice) * it.quantity, 0)
  await prisma.ticket.update({ where: { id: t.id }, data: { totalCached: total } })
  res.status(201).json({ ok: true, total })
})

techRouter.patch('/tickets/:id/status', async (req, res) => {
  const schema = z.object({ to: z.enum(['OPEN','IN_PROGRESS','CLOSED']) })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const t = await prisma.ticket.findUnique({ where: { id: String(req.params.id) } })
  if (!t) return res.status(404).json({ error: 'Not found' })
  // v1: allow linear transitions only
  const allowed = (from: string, to: string) =>
    (from === 'OPEN' && to === 'IN_PROGRESS') ||
    (from === 'IN_PROGRESS' && to === 'CLOSED')
  if (!allowed(t.status, parse.data.to)) return res.status(400).json({ error: 'Invalid transition' })
  const updated = await prisma.ticket.update({ where: { id: t.id }, data: { status: parse.data.to, statusHistory: { create: { from: t.status, to: parse.data.to, changedBy: 'TECH' } } } })
  res.json(updated)
})
