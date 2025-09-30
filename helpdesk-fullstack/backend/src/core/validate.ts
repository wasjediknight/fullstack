import { AnyZodObject } from 'zod'
import { Request, Response, NextFunction } from 'express'

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = { body: req.body, query: req.query, params: req.params }
    const parsed = schema.safeParse(data)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
    // overwrite with parsed to coerce types
    req.body = parsed.data.body
    req.query = parsed.data.query as any
    req.params = parsed.data.params as any
    next()
  }
}
