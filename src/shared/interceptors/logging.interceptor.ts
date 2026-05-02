import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const correlationId = (req.headers['x-correlation-id'] as string) ?? uuidv4();
    req.headers['x-correlation-id'] = correlationId;

    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - start;
          this.logger.log(
            JSON.stringify({ correlationId, method, url, statusCode: res.statusCode, duration }),
          );
        },
        error: (err: Error) => {
          const duration = Date.now() - start;
          this.logger.warn(
            JSON.stringify({ correlationId, method, url, error: err.name, duration }),
          );
        },
      }),
      finalize(() => undefined),
    );
  }
}
