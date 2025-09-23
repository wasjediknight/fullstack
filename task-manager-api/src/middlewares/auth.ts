import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../setup/env.js';

export interface JwtPayloadExt {
  sub: number;
  role: 'admin' | 'member';
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayloadExt;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role: 'admin' | 'member') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayloadExt | undefined;
    if (!user) return res.status(401).json({ error: 'Unauthenticated' });
    if (user.role !== role && user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
