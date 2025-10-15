import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Server } from 'http';
import type { Application } from 'express';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Trust proxy headers (for IP detection behind reverse proxy/load balancer)
  const expressApp = app.getHttpAdapter().getInstance() as Application;
  expressApp.set('trust proxy', true);

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // Set global request timeout (30 seconds)
  const server = app.getHttpServer() as Server;
  server.timeout = 30000; // 30 seconds
  server.keepAliveTimeout = 65000; // 65 seconds (must be > timeout)
  server.headersTimeout = 66000; // 66 seconds (must be > keepAliveTimeout)

  // Enable CORS
  const corsOrigin = configService.get<string>('cors.origin');
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: false,
  });

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = configService.get<number>('port') || 3000;
  const host = configService.get<string>('host') || '0.0.0.0';
  const nodeEnv = configService.get<string>('nodeEnv') || 'development';

  await app.listen(port, host);

  logger.log(`Server started successfully`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`Listening on: ${host}:${port}`);
  logger.log(`API endpoints: /api/visits, /api/stats, /api/health`);

  // Log example URLs only in development
  if (nodeEnv === 'development') {
    logger.log(`\n📍 Local URLs:`);
    logger.log(`   - Health check: http://localhost:${port}/api/health`);
    logger.log(`   - API docs: http://localhost:${port}/api`);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
