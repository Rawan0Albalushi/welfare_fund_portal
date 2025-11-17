/**
 * Logger utility that only logs in development mode
 * Prevents sensitive information from being exposed in production
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

interface LogContext {
  [key: string]: any;
}

class Logger {
  private shouldLog(): boolean {
    return isDev || (!isProd && import.meta.env.VITE_ENABLE_LOGS === 'true');
  }

  /**
   * Log informational messages (only in dev)
   */
  log(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.log(`[${new Date().toISOString()}] ${message}`, ...args);
    }
  }

  /**
   * Log error messages (always logged, but sanitized in prod)
   */
  error(message: string, error?: any, context?: LogContext): void {
    if (isDev) {
      console.error(`[${new Date().toISOString()}] ❌ ${message}`, error, context);
    } else {
      // In production, only log sanitized error info
      const sanitizedError = error instanceof Error 
        ? { message: error.message, name: error.name }
        : typeof error === 'object' 
        ? { type: typeof error }
        : error;
      console.error(`[${new Date().toISOString()}] ❌ ${message}`, sanitizedError);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.warn(`[${new Date().toISOString()}] ⚠️ ${message}`, ...args);
    }
  }

  /**
   * Log debug messages (only in dev)
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.debug(`[${new Date().toISOString()}] 🔍 ${message}`, ...args);
    }
  }

  /**
   * Log API requests (sanitized in prod)
   */
  apiRequest(method: string, url: string, context?: LogContext): void {
    if (this.shouldLog()) {
      this.log(`🌐 [API] ${method} ${url}`, context);
    }
  }

  /**
   * Log API responses
   */
  apiResponse(method: string, url: string, status: number, context?: LogContext): void {
    if (this.shouldLog()) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      this.log(`${emoji} [API] ${method} ${url} - ${status}`, context);
    }
  }

  /**
   * Log authentication events
   */
  auth(event: string, context?: LogContext): void {
    if (this.shouldLog()) {
      this.log(`🔐 [AUTH] ${event}`, context);
    }
  }
}

export const logger = new Logger();

