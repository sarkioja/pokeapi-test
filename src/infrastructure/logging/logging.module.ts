import { Module } from '@nestjs/common';
import { LOGGER_PORT } from '../../application/di/tokens';
import { NestLoggerAdapter } from './nest-logger.adapter';

@Module({
  providers: [NestLoggerAdapter, { provide: LOGGER_PORT, useExisting: NestLoggerAdapter }],
  exports: [LOGGER_PORT],
})
export class LoggingModule {}
