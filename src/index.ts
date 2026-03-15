import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb, disconnectDb } from './config/db';
import tasksRoutes from './routes/tasksRoutes';
import holidaysRoutes from './routes/holidaysRoutes';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://calendar-frontend-opal.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/tasks', tasksRoutes);
app.use('/holidays', holidaysRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

type AppError = {
  statusCode?: number;
  code?: string;
  message?: string;
};

function isAppError(err: unknown): err is AppError {
  return typeof err === 'object' && err !== null;
}

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);

    const fallbackStatus = 500;

    const statusCode =
      isAppError(err) &&
      typeof err.statusCode === 'number' &&
      err.statusCode >= 400
        ? err.statusCode
        : fallbackStatus;

    const message =
      isAppError(err) && typeof err.message === 'string'
        ? err.message
        : 'Internal server error';

    const code =
      isAppError(err) && typeof err.code === 'string'
        ? err.code
        : 'INTERNAL_ERROR';

    res.status(statusCode).json({
      message,
      code,
    });
  },
);

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await connectDb();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
      void disconnectDb().finally(() => {
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
