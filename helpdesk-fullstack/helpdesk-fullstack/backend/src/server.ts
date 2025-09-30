import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { json } from 'express'
import { authRouter } from './transport/http/auth.js'
import { adminRouter } from './transport/http/admin.js'
import { clientRouter } from './transport/http/client.js'
import { techRouter } from './transport/http/tech.js'
import path from 'path'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }))
app.use(json())

app.use('/uploads', express.static(path.resolve(process.env.AVATAR_STORAGE_DIR || './uploads')))

app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/client', clientRouter)
app.use('/tech', techRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

const port = Number(process.env.PORT || 3333)
app.listen(port, () => console.log(`API running on http://localhost:${port}`))
