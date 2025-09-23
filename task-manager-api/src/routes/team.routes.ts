import { Router } from 'express';
import { prisma } from '../setup/prisma.js';
import { auth, requireRole } from '../middlewares/auth.js';
import { createTeamSchema, addMemberSchema } from '../validators/team.schemas.js';

export const teamRouter = Router();

// Admin: create team
teamRouter.post('/', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = createTeamSchema.parse(req.body);
    const team = await prisma.team.create({ data });
    res.status(201).json(team);
  } catch (e) { next(e); }
});

// Admin: list teams
teamRouter.get('/', auth, requireRole('admin'), async (_req, res, next) => {
  try {
    const teams = await prisma.team.findMany({ include: { members: true } });
    res.json(teams);
  } catch (e) { next(e); }
});

// Admin: add member
teamRouter.post('/:id/members', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = addMemberSchema.parse(req.body);
    const tm = await prisma.teamMember.create({ data: { teamId: id, userId: data.userId } });
    res.status(201).json(tm);
  } catch (e) { next(e); }
});

// Admin: remove member
teamRouter.delete('/:id/members/:userId', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.params.userId);
    await prisma.teamMember.delete({ where: { userId_teamId: { userId, teamId: id } } });
    res.status(204).end();
  } catch (e) { next(e); }
});
