import jwt from 'jsonwebtoken';
import { env } from '../setup/env.js';

export function signJwt(sub: number, role: 'admin' | 'member') {
  return jwt.sign({ sub, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}
