import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { generalLimiter } from '../src/middleware/rateLimiter';
import { errorHandler } from '../src/middleware/errorHandler';
import logger from '../src/utils/logger';
import { sendSuccess } from '../src/utils/response';
import apiRouter from '../src/routes/index';

dotenv.config();

const app = express();

// CORS must come BEFORE helmet
// Allow production domain and Vercel preview deployments
const allowedOrigins = process.env.CLIENT_URL?.split(',') || ['*'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Configure helmet to be less strict in development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

app.get('/api/health', (_req, res) => sendSuccess(res, { status: 'ok' }));

app.use('/api', apiRouter);

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(errorHandler);

export default app;
