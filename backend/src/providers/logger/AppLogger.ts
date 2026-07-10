export interface AppLogger {
  info(msg: string, ...args: any[]): void;
  warn(msg: string, ...args: any[]): void;
  error(err: any, msg?: string, ...args: any[]): void;
  fatal(err: any, msg?: string, ...args: any[]): void;
}
