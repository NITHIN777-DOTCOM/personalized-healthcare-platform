import { AppLogger } from './AppLogger';
import logger from '../../utils/logger';

export class AzureMonitorLogger implements AppLogger {
  private telemetryClient: any = null;

  constructor() {
    this.initTelemetry();
  }

  private async initTelemetry() {
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    if (!connectionString) return;
    try {
      const appInsights = await import('applicationinsights');
      appInsights.setup(connectionString)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .start();
      this.telemetryClient = appInsights.defaultClient;
    } catch (err) {
      console.warn('⚠️ Application Insights SDK failed to load. Falling back to local logging.');
    }
  }

  info(msg: string, ...args: any[]): void {
    logger.info(msg, ...args);
    if (this.telemetryClient) {
      this.telemetryClient.trackTrace({ message: msg, severity: 1 });
    }
  }

  warn(msg: string, ...args: any[]): void {
    logger.warn(msg, ...args);
    if (this.telemetryClient) {
      this.telemetryClient.trackTrace({ message: msg, severity: 2 });
    }
  }

  error(err: any, msg?: string, ...args: any[]): void {
    logger.error(err, msg, ...args);
    if (this.telemetryClient) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      this.telemetryClient.trackException({ exception: errorObj, properties: { message: msg || '' } });
    }
  }

  fatal(err: any, msg?: string, ...args: any[]): void {
    logger.fatal(err, msg, ...args);
    if (this.telemetryClient) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      this.telemetryClient.trackException({ exception: errorObj, properties: { message: msg || '', fatal: 'true' } });
    }
  }
}
