import { Router } from 'express';
import { prisma } from '../setup/prisma.js';
import { auth, requireRole } from '../middlewares/auth.js';
import { createTaskSchema, updateTaskSchema } from '../validators/task.schemas.js';

export const taskRouter = Router();

// List tasks
taskRouter.get('/', auth, async (req, res, next) => {
  try {
    const user = (req as any).user as { sub: number; role: 'admin' | 'member' };
    if (user.role === 'admin') {
      const tasks = await prisma.task.findMany();
      return res.json(tasks);
    }
    // member: tasks where user is in team OR assigned to them? We'll keep simple: all tasks from teams user belongs to
    const teams = await prisma.teamMember.findMany({ where: { userId: user.sub } });
    const teamIds = teams.map(t => t.teamId);
    const tasks = await prisma.task.findMany({ where: { teamId: { in: teamIds } } });
    res.json(tasks);
  } catch (e) { next(e); }
});

// Create task (admin or member if belongs to team)
taskRouter.post('/', auth, async (req, res, next) => {
  try {
    const current = (req as any).user as { sub: number; role: 'admin' | 'member' };
    const data = createTaskSchema.parse(req.body);

    if (current.role !== 'admin') {
      const membership = await prisma.teamMember.findFirst({ where: { userId: current.sub, teamId: data.teamId } });
      if (!membership) return res.status(403).json({ error: 'Not a member of the team' });
    }

    const task = await prisma.task.create({ data });
    res.status(201).json(task);
  } catch (e) { next(e); }
});

// Get single
taskRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (e) { next(e); }
});

// Update task
taskRouter.patch('/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = updateTaskSchema.parse(req.body);
    const current = (req as any).user as { sub: number; role: 'admin' | 'member' };

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    if (current.role !== 'admin') {
      if (existing.assignedTo !== current.sub) {
        return res.status(403).json({ error: 'Members can only edit their own tasks' });
      }
    }

    // create history if status changed
    let oldStatus = undefined as any;
    if (data.status && data.status !== existing.status) {
      oldStatus = existing.status;
    }

    const updated = await prisma.task.update({ where: { id }, data });

    if (oldStatus) {
      await prisma.taskHistory.create({
        data: {
          taskId: id,
          changedBy: current.sub,
          oldStatus,
          newStatus: updated.status
        }
      });
    }

    res.json(updated);
  } catch (e) { next(e); }
});

// Delete task
taskRouter.delete('/:id', auth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = (req as any).user as { sub: number; role: 'admin' | 'member' };

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    if (current.role !== 'admin') {
      if (existing.assignedTo !== current.sub) {
        return res.status(403).json({ error: 'Members can only delete their own tasks' });
      }
    }

    await prisma.task.delete({ where: { id } });
    res.status(204).end();
  } catch (e) { next(e); }
});
