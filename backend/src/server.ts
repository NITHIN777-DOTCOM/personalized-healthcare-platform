import app from './app';
import config from './config';
import logger from './utils/logger';
import prisma from './config/db';

const server = app.listen(config.PORT, async () => {
  logger.info(`⚡ Server is running on port ${config.PORT} in ${config.NODE_ENV} mode.`);
  
  try {
    // Attempt database verification check
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
