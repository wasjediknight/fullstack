import { Router } from 'express';
import { prisma } from '../setup/prisma.js';
import { auth, requireRole } from '../middlewares/auth.js';

export const userRouter = Router();

// Admin: list users
userRouter.get('/', auth, requireRole('admin'), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (e) { next(e); }
});

// Admin: update role
userRouter.patch('/:id/role', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body as { role?: 'admin' | 'member' };
    if (!role) return res.status(400).json({ error: 'role required' });
    const user = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ id: user.id, role: user.role });
  } catch (e) { next(e); }
});
