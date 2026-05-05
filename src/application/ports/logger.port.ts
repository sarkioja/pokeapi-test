export interface LoggerPort {
  warn(message: string): void;
  error(message: string, trace?: unknown): void;
}
