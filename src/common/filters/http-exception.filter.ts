import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter
 * Catches all exceptions and formats them consistently
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log error details
    this.logger.error('Exception caught:', {
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack:
        process.env.NODE_ENV === 'development' && exception instanceof Error
          ? exception.stack
          : undefined,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    // Send standardized error response
    response.status(status).json(
      typeof message === 'string'
        ? {
            statusCode: status,
            message,
            error: HttpStatus[status] || 'Error',
          }
        : message,
    );
  }
}
