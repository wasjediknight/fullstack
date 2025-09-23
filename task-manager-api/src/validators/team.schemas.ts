import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional()
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive()
});
