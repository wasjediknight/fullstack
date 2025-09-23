import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assignedTo: z.number().int().positive().optional(),
  teamId: z.number().int().positive()
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assignedTo: z.number().int().positive().nullable().optional()
});
