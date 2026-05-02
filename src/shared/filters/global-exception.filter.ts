import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { TeamFullException } from '../../domain/exceptions/team-full.exception';
import { DuplicatePokemonException } from '../../domain/exceptions/duplicate-pokemon.exception';
import { TeamArchivedException } from '../../domain/exceptions/team-archived.exception';
import { InvalidCepException } from '../../domain/exceptions/invalid-cep.exception';
import { EmailConflictException } from '../../domain/exceptions/email-conflict.exception';
import {
  ExternalServiceException,
  CepNotFoundExternalException,
  ResourceNotFoundException,
} from '../../domain/exceptions/external-service.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, error, message } = this.resolveException(exception);

    if (status >= 500) {
      this.logger.error({ message, path: request.url, exception });
    } else {
      this.logger.warn({ message, path: request.url });
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveException(exception: unknown): {
    status: number;
    error: string;
    message: string;
  } {
    if (exception instanceof TeamFullException) {
      return { status: 422, error: 'TEAM_FULL', message: exception.message };
    }
    if (exception instanceof DuplicatePokemonException) {
      return { status: 409, error: 'DUPLICATE_POKEMON', message: exception.message };
    }
    if (exception instanceof EmailConflictException) {
      return { status: 409, error: 'EMAIL_CONFLICT', message: exception.message };
    }
    if (exception instanceof TeamArchivedException) {
      return { status: 422, error: 'TEAM_ARCHIVED', message: exception.message };
    }
    if (exception instanceof InvalidCepException) {
      return { status: 400, error: 'INVALID_CEP', message: exception.message };
    }
    if (exception instanceof CepNotFoundExternalException) {
      return { status: 404, error: 'CEP_NOT_FOUND', message: exception.message };
    }
    if (exception instanceof ResourceNotFoundException) {
      return { status: 404, error: 'NOT_FOUND', message: exception.message };
    }
    if (exception instanceof ExternalServiceException) {
      return { status: 502, error: 'EXTERNAL_SERVICE_ERROR', message: exception.message };
    }
    if (exception instanceof DomainException) {
      return { status: 422, error: 'DOMAIN_ERROR', message: exception.message };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : (res as { message?: string | string[] }).message
            ? Array.isArray((res as { message: string[] }).message)
              ? (res as { message: string[] }).message.join(', ')
              : ((res as { message: string }).message as string)
            : exception.message;
      return { status, error: HttpStatus[status] ?? 'HTTP_ERROR', message };
    }

    return {
      status: 500,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    };
  }
}
