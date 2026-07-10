import { AppLogger } from './AppLogger';
import { baseLogger } from '../../utils/logger';

export class LocalLogger implements AppLogger {
  info(msg: string, ...args: any[]): void {
    baseLogger.info(msg, ...args);
  }
  warn(msg: string, ...args: any[]): void {
    baseLogger.warn(msg, ...args);
  }
  error(err: any, msg?: string, ...args: any[]): void {
    baseLogger.error(err, msg, ...args);
  }
  fatal(err: any, msg?: string, ...args: any[]): void {
    baseLogger.fatal(err, msg, ...args);
  }
}
export default LocalLogger;
