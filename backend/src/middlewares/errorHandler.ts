import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';

export interface CustomError extends Error {
  statusCode?: number;
  errorCode?: string;
  details?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'SYS_INTERNAL_ERROR';
  
  // Log the complete stack trace for server diagnostics
  logger.error({
    msg: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: statusCode === 500 && config.NODE_ENV === 'production' 
        ? 'An unexpected error occurred. Please contact system support.' 
        : err.message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(err.details ? { details: err.details } : {}),
    },
  });
};

export default errorHandler;
