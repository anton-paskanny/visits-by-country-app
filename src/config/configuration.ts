/**
 * Configuration factory for the application
 * Loads and validates environment variables
 */
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});
