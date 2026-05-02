import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private validKeys!: Set<string>;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const rawKeys = this.configService.get<string>('API_KEYS', '');
    if (!rawKeys || rawKeys.trim() === '') {
      throw new Error('API_KEYS must not be empty — application cannot start without valid API keys');
    }
    this.validKeys = new Set(
      rawKeys
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    );
    this.logger.log(`ApiKeyGuard initialized with ${this.validKeys.size} key(s)`);
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey || !this.validKeys.has(apiKey)) {
      throw new UnauthorizedException('Invalid or missing X-API-Key header');
    }
    return true;
  }
}
