import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { errorResponse } from '../utils/response.util';
import { sanitizeRequestBody } from '../helper/sanitize-req-body.helper';

/**
 * Global exception filter that normalizes all errors
 * into a consistent API error response format.
 * Handles HttpException, QueryFailedError, and unknown errors.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, errors } = this.extractErrorInfo(exception);

    this.logError(exception, request);

    const body = errorResponse(statusCode, message, request.url, errors);
    response.status(statusCode).json(body);
  }

  private extractErrorInfo(exception: unknown): {
    statusCode: number;
    message: string;
    errors?: string[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        const rawMessage = resp['message'];

        // class-validator returns message as string[] for validation errors
        if (Array.isArray(rawMessage)) {
          return {
            statusCode: status,
            message: 'Validation failed',
            errors: rawMessage as string[],
          };
        }

        return {
          statusCode: status,
          message: (rawMessage as string) || exception.message,
        };
      }

      return { statusCode: status, message: exception.message };
    }

    if (exception instanceof QueryFailedError) {
      if (exception.message.includes('violates foreign key constraint')) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Referenced record not found',
        };
      }

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Database query failed',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }

  private logError(exception: unknown, request: Request): void {
    const context = `[${request.method}] ${request.url}`;

    if (exception instanceof HttpException) {
      this.logger.error(
        `${context} → HTTP ${exception.getStatus()}: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof QueryFailedError) {
      this.logger.error(
        `${context} → Database Error: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      this.logger.error(
        `${context} → Unexpected Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `${context} → Unhandled Error: ${JSON.stringify(exception)}`,
      );
    }

    if (request.body && Object.keys(request.body).length > 0) {
      this.logger.debug(
        `Request Body: ${JSON.stringify(sanitizeRequestBody(request.body))}`,
      );
    }
  }
}
