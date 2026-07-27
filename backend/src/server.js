const fs = require('fs');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

fs.mkdirSync('logs', { recursive: true });
fs.mkdirSync(`${env.upload.dir}/avatars`, { recursive: true });

const server = app.listen(env.port, () => {
  logger.info(`${env.appName} backend running on port ${env.port} [${env.nodeEnv}]`);
  logger.info(`API docs available at ${env.appUrl}/api/docs`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => process.exit(0));
});
