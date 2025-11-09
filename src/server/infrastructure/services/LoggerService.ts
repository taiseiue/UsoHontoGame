/**
 * LoggerService - Centralized logging with structured output
 *
 * Features:
 * - Structured logging with context
 * - Log levels: debug, info, warn, error
 * - Request/response correlation
 * - Error tracking with stack traces
 * - Performance monitoring
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  requestId?: string;
  sessionId?: string;
  participantId?: string;
  teamId?: string;
  userId?: string;
  method?: string;
  path?: string;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class LoggerService {
  private static instance: LoggerService;
  private logLevel: LogLevel;

  private constructor() {
    // Set log level from environment or default to INFO
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel;
    this.logLevel = envLevel || LogLevel.INFO;
  }

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    const output = JSON.stringify(entry);

    if (entry.level === LogLevel.ERROR) {
      console.error(output);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.formatLog(LogLevel.DEBUG, message, context);
    this.writeLog(entry);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.formatLog(LogLevel.INFO, message, context);
    this.writeLog(entry);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.formatLog(LogLevel.WARN, message, context);
    this.writeLog(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.formatLog(LogLevel.ERROR, message, context, error);
    this.writeLog(entry);
  }

  /**
   * Log HTTP request
   */
  logRequest(method: string, path: string, context?: LogContext): void {
    this.info(`HTTP ${method} ${path}`, {
      ...context,
      method,
      path,
    });
  }

  /**
   * Log HTTP response with duration
   */
  logResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    const message = `HTTP ${method} ${path} ${statusCode} ${duration}ms`;

    const entry = this.formatLog(level, message, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });

    this.writeLog(entry);
  }

  /**
   * Log performance metric
   */
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 3000 ? LogLevel.WARN : LogLevel.INFO;

    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration,
    });
  }

  /**
   * Log security event
   */
  logSecurity(event: string, context?: LogContext): void {
    this.warn(`Security: ${event}`, {
      ...context,
      securityEvent: event,
    });
  }

  /**
   * Log business event
   */
  logEvent(event: string, context?: LogContext): void {
    this.info(`Event: ${event}`, {
      ...context,
      eventType: event,
    });
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();
