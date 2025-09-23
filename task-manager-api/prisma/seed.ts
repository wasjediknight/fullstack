import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password,
      role: Role.admin
    }
  });

  const team = await prisma.team.create({
    data: {
      name: 'Core Team',
      description: 'Time principal'
    }
  });

  await prisma.teamMember.create({
    data: { userId: admin.id, teamId: team.id }
  });

  console.log({ admin, team });
}

main().finally(() => prisma.$disconnect());
