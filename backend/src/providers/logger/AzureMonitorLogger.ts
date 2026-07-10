import { AppLogger } from './AppLogger';
import { baseLogger } from '../../utils/logger';

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
    baseLogger.info(msg, ...args);
    if (this.telemetryClient) {
      this.telemetryClient.trackTrace({ message: msg, severity: 1 });
    }
  }

  warn(msg: string, ...args: any[]): void {
    baseLogger.warn(msg, ...args);
    if (this.telemetryClient) {
      this.telemetryClient.trackTrace({ message: msg, severity: 2 });
    }
  }

  error(err: any, msg?: string, ...args: any[]): void {
    baseLogger.error(err, msg, ...args);
    if (this.telemetryClient) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      this.telemetryClient.trackException({ exception: errorObj, properties: { message: msg || '' } });
    }
  }

  fatal(err: any, msg?: string, ...args: any[]): void {
    baseLogger.fatal(err, msg, ...args);
    if (this.telemetryClient) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      this.telemetryClient.trackException({ exception: errorObj, properties: { message: msg || '', fatal: 'true' } });
    }
  }
}
export default AzureMonitorLogger;
