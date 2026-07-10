import pino from 'pino';
import config from '../config';

// Underlying local Pino logger
export const baseLogger = pino({
  level: config.NODE_ENV === 'test' ? 'silent' : 'info',
  transport:
    config.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        }
      : undefined,
});

// Abstraction wrapper routing to Azure AppLogger if configured, else base pino logger
export const logger = {
  info: (msg: string, ...args: any[]) => {
    import('../providers')
      .then(({ appLogger }) => {
        appLogger.info(msg, ...args);
      })
      .catch(() => {
        baseLogger.info(msg, ...args);
      });
  },
  warn: (msg: string, ...args: any[]) => {
    import('../providers')
      .then(({ appLogger }) => {
        appLogger.warn(msg, ...args);
      })
      .catch(() => {
        baseLogger.warn(msg, ...args);
      });
  },
  error: (err: any, msg?: string, ...args: any[]) => {
    import('../providers')
      .then(({ appLogger }) => {
        appLogger.error(err, msg, ...args);
      })
      .catch(() => {
        baseLogger.error(err, msg, ...args);
      });
  },
  fatal: (err: any, msg?: string, ...args: any[]) => {
    import('../providers')
      .then(({ appLogger }) => {
        appLogger.fatal(err, msg, ...args);
      })
      .catch(() => {
        baseLogger.fatal(err, msg, ...args);
      });
  }
};

export default logger;
