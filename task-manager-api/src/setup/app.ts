import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRouter } from '../routes/auth.routes.js';
import { userRouter } from '../routes/user.routes.js';
import { teamRouter } from '../routes/team.routes.js';
import { taskRouter } from '../routes/task.routes.js';

export const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// routes
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/teams', teamRouter);
app.use('/tasks', taskRouter);

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message ?? 'Internal Server Error' });
});
