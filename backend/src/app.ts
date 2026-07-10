import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';
import requestLogger from './middlewares/requestLogger';
import notFoundHandler from './middlewares/notFoundHandler';
import errorHandler from './middlewares/errorHandler';
import apiRouter from './routes';

const app = express();

// Security Headers Setup
app.use(helmet());

// Cross-Origin Requests Setup
const allowedOrigin = config.FRONTEND_URL.replace(/\/$/, '');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (
      normalizedOrigin === allowedOrigin ||
      normalizedOrigin.endsWith('.vercel.app') ||
      normalizedOrigin.startsWith('http://localhost:') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body Parsers Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use(requestLogger);

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// Primary API Namespace
app.use('/api', apiRouter);

// Fallback 404 Handler
app.use(notFoundHandler);

// Global Error Interceptor
app.use(errorHandler);

export default app;
