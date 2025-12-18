import { ErrorTracker, ErrorTrackerConfig, Severity } from '@error-tracker/core';
import { NodeHttpTransport } from './transports/http';

/**
 * Node.js-specific error tracker
 */
export class NodeErrorTracker extends ErrorTracker {
  private uncaughtExceptionHandler?: (error: Error) => void;
  private unhandledRejectionHandler?: (reason: unknown, promise: Promise<unknown>) => void;

  constructor(config: ErrorTrackerConfig) {
    super({
      ...config,
      transport: config.transport || new NodeHttpTransport(config.dsn),
    });
  }

  /**
   * Initialize Node.js error tracker with automatic error handlers
   */
  init(): void {
    super.init();

    // Capture uncaught exceptions
    this.uncaughtExceptionHandler = (error: Error) => {
      this.captureException(error, Severity.Fatal);
    };
    process.on('uncaughtException', this.uncaughtExceptionHandler);

    // Capture unhandled promise rejections
    this.unhandledRejectionHandler = (reason: unknown, promise: Promise<unknown>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.captureException(error, Severity.Error);
    };
    process.on('unhandledRejection', this.unhandledRejectionHandler);

    // Set default server name from hostname
    if (!this['config'].serverName) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const os = require('os');
      this['config'].serverName = os.hostname();
    }
  }

  /**
   * Set request context from Node.js request object
   */
  setRequestFromHttp(req: {
    url?: string;
    method?: string;
    headers?: Record<string, string | string[]>;
  }): void {
    const headers: Record<string, string> = {};
    if (req.headers) {
      for (const [key, value] of Object.entries(req.headers)) {
        headers[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }

    this.setRequest({
      url: req.url,
      method: req.method,
      headers,
    });
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    if (this.uncaughtExceptionHandler) {
      process.removeListener('uncaughtException', this.uncaughtExceptionHandler);
    }
    if (this.unhandledRejectionHandler) {
      process.removeListener('unhandledRejection', this.unhandledRejectionHandler);
    }
  }
}

