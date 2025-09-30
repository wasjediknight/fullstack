import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export type JwtUser = { sub: string, role: 'ADMIN'|'TECH'|'CLIENT' }

export const signToken = (payload: JwtUser) => {
  const secret = process.env.JWT_SECRET as string
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function authRequired(req: Request & { user?: JwtUser }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const token = auth.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtUser
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles: JwtUser['role'][]) {
  return (req: Request & { user?: JwtUser }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
