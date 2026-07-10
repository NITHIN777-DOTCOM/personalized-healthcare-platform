import { AppLogger } from './AppLogger';
import logger from '../../utils/logger';

export class LocalLogger implements AppLogger {
  info(msg: string, ...args: any[]): void {
    logger.info(msg, ...args);
  }
  warn(msg: string, ...args: any[]): void {
    logger.warn(msg, ...args);
  }
  error(err: any, msg?: string, ...args: any[]): void {
    logger.error(err, msg, ...args);
  }
  fatal(err: any, msg?: string, ...args: any[]): void {
    logger.fatal(err, msg, ...args);
  }
}
