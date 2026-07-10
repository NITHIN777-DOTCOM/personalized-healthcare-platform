import { initializeSecrets } from './providers/secret/loader';

async function startServer() {
  // 1. Asynchronously pre-fetch secrets from Azure Key Vault if USE_AZURE_KEYVAULT is true
  await initializeSecrets();

  // 2. Dynamically import modules after environment variables are successfully loaded and injected
  const app = (await import('./app')).default;
  const config = (await import('./config')).default;
  const logger = (await import('./utils/logger')).default;
  const prisma = (await import('./config/db')).default;

  const server = app.listen(config.PORT, async () => {
    logger.info(`⚡ Server is running on port ${config.PORT} in ${config.NODE_ENV} mode.`);
    
    try {
      // Attempt database connection check
      await prisma.$connect();
      logger.info('💾 Connection to SQLite database established successfully.');
    } catch (error) {
      logger.error(error, '❌ Database connection failure during startup:');
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal(error, '💥 Uncaught Exception encountered:');
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.fatal(reason, '💥 Unhandled Rejection encountered:');
    process.exit(1);
  });

  // Handle termination signals for graceful shutdown
  const gracefulShutdown = () => {
    logger.info('🛑 Shutting down server gracefully...');
    server.close(async () => {
      logger.info('👋 HTTP server closed.');
      await prisma.$disconnect();
      logger.info('💾 Database client disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer().catch((error) => {
  console.error('💥 Critical failure during application startup:', error);
  process.exit(1);
});
