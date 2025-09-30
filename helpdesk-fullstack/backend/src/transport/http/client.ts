import { Router } from 'express'
import { prisma } from '../../core/db.js'
import { authRequired, requireRole } from '../../core/auth.js'
import { z } from 'zod'

export const clientRouter = Router()
clientRouter.use(authRequired, requireRole('CLIENT'))

clientRouter.get('/me', async (req: any, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user.sub }, include: { client: true } })
  res.json(me)
})

clientRouter.patch('/me', async (req: any, res) => {
  const schema = z.object({ name: z.string().min(3).optional() })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })
  const updated = await prisma.user.update({ where: { id: req.user.sub }, data: { name: parse.data.name } })
  res.json(updated)
})

clientRouter.delete('/me', async (req: any, res) => {
  await prisma.user.delete({ where: { id: req.user.sub } })
  res.status(204).send()
})

clientRouter.get('/services', async (_req, res) => {
  const services = await prisma.service.findMany({ where: { active: true } })
  res.json(services)
})

clientRouter.get('/technicians/available', async (req, res) => {
  const slot = String(req.query.slot || '')
  if (!/^\d{2}:\d{2}$/.test(slot)) return res.status(400).json({ error: 'slot invalid' })
  const techs = await prisma.technicianProfile.findMany({ where: { availability: { has: slot } }, include: { user: true } })
  res.json(techs)
})

clientRouter.post('/tickets', async (req: any, res) => {
  const schema = z.object({
    technicianId: z.string(),
    services: z.array(z.object({ serviceId: z.string(), quantity: z.number().int().min(1).default(1) })).min(1),
    slot: z.string().optional()
  })
  const parse = schema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { technicianId, services, slot } = parse.data
  const itemsData = await Promise.all(services.map(async (s) => {
    const svc = await prisma.service.findUnique({ where: { id: s.serviceId } })
    if (!svc || !svc.active) throw new Error('Invalid service')
    return { serviceId: svc.id, unitPrice: svc.price, quantity: s.quantity }
  }))

  const total = itemsData.reduce((acc, it) => acc + Number(it.unitPrice) * it.quantity, 0)
  const ticket = await prisma.ticket.create({
    data: {
      client: { connect: { userId: req.user.sub } },
      technician: { connect: { id: technicianId } },
      scheduledAt: slot ? new Date() : null,
      totalCached: total,
      items: { create: itemsData }
    },
    include: { items: true }
  })
  res.status(201).json(ticket)
})

clientRouter.get('/tickets/my', async (req: any, res) => {
  const list = await prisma.ticket.findMany({
    where: { client: { userId: req.user.sub } },
    include: { items: { include: { service: true } }, technician: { include: { user: true } } }
  })
  res.json(list)
})
