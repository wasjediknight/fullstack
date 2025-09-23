import { Router } from 'express';
import { prisma } from '../setup/prisma.js';
import { registerSchema, loginSchema } from '../validators/auth.schemas.js';
import { hash, compare } from '../utils/hash.js';
import { signJwt } from '../utils/jwt.js';

export const authRouter = Router();

/**
 * @route POST /auth/register
 * @body {name, email, password}
 * Creates a member user by default.
 */
authRouter.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const user = await prisma.user.create({
      data: { ...data, password: await hash(data.password) }
    });
    const token = signJwt(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) { next(e); }
});

/**
 * @route POST /auth/login
 * @body {email, password}
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await compare(data.password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt(user.id, user.role);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) { next(e); }
});
