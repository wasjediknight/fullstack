import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

const slots = (...pairs: [number, number][]) =>
  pairs.flatMap(([start, end]) =>
    Array.from({ length: end - start }, (_, i) =>
      `${String(start + i).padStart(2, '0')}:00`
    )
  )

async function main() {
  const adminPass = await bcrypt.hash('Admin@123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@helpdesk.local' },
    update: {},
    create: { name: 'Admin', email: 'admin@helpdesk.local', passwordHash: adminPass, role: 'ADMIN' }
  })

  const t1Pass = await bcrypt.hash('Tec1@123', 10)
  const t2Pass = await bcrypt.hash('Tec2@123', 10)
  const t3Pass = await bcrypt.hash('Tec3@123', 10)

  const t1 = await prisma.user.create({ data: { name: 'Técnico 1', email: 'tec1@helpdesk.local', passwordHash: t1Pass, role: 'TECH' } })
  await prisma.technicianProfile.create({ data: { userId: t1.id, availability: slots([8,12],[14,18]) } })
  const t2 = await prisma.user.create({ data: { name: 'Técnico 2', email: 'tec2@helpdesk.local', passwordHash: t2Pass, role: 'TECH' } })
  await prisma.technicianProfile.create({ data: { userId: t2.id, availability: slots([10,14],[16,20]) } })
  const t3 = await prisma.user.create({ data: { name: 'Técnico 3', email: 'tec3@helpdesk.local', passwordHash: t3Pass, role: 'TECH' } })
  await prisma.technicianProfile.create({ data: { userId: t3.id, availability: slots([12,16],[18,22]) } })

  const services: [string, string][] = [
    ['Instalação/atualização de softwares', '120.00'],
    ['Instalação/atualização de hardwares', '180.00'],
    ['Diagnóstico e remoção de vírus', '150.00'],
    ['Suporte a impressoras', '90.00'],
    ['Backup e recuperação de dados', '250.00'],
    ['Otimização de desempenho do SO', '110.00'],
    ['Configuração de VPN/Acesso Remoto', '130.00']
  ]

  for (const [name, price] of services) {
    await prisma.service.upsert({ where: { name }, update: {}, create: { name, price } })
  }

  console.log('Seed concluído.')
}

main().finally(() => prisma.$disconnect())
