import { Injectable, Logger } from '@nestjs/common';
import { LoggerPort } from '../../application/ports/logger.port';

@Injectable()
export class NestLoggerAdapter implements LoggerPort {
  private readonly logger = new Logger('Application');

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string, trace?: unknown): void {
    this.logger.error(message, trace instanceof Error ? trace.stack : trace);
  }
}
