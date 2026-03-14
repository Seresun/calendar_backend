import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb, disconnectDb } from './config/db';
import tasksRoutes from './routes/tasksRoutes';
import holidaysRoutes from './routes/holidaysRoutes';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  }),
);
app.use(express.json());

app.use('/tasks', tasksRoutes);
app.use('/holidays', holidaysRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);

    const statusCode =
      typeof err.statusCode === 'number' && err.statusCode >= 400
        ? err.statusCode
        : 500;

    res.status(statusCode).json({
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    });
  },
);

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await connectDb();

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });

  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log('Shutting down server...');
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
