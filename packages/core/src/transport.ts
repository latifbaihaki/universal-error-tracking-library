import { ErrorEvent, Transport } from './types';
import { sanitizeErrorEvent } from './sanitizer';

/**
 * HTTP Transport implementation
 */
export class HttpTransport implements Transport {
  private dsn: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(dsn: string, timeout: number = 5000, headers: Record<string, string> = {}) {
    this.dsn = dsn;
    this.timeout = timeout;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  /**
   * Send event via HTTP
   */
  async send(event: ErrorEvent): Promise<void> {
    // Sanitize event before sending
    const sanitizedEvent = sanitizeErrorEvent(event) as ErrorEvent;

    try {
      // This is a platform-agnostic interface
      // Actual implementation will be provided by platform-specific code
      await this.sendHttpRequest(this.dsn, sanitizedEvent);
    } catch (error) {
      // Silently fail - transport errors should not break the app
      console.error('[ErrorTracker] Failed to send event:', error);
    }
  }

  /**
   * Flush pending events (no-op for HTTP transport)
   */
  async flush(): Promise<boolean> {
    return true;
  }

  /**
   * Send HTTP request (to be implemented by platform-specific code)
   */
  protected async sendHttpRequest(url: string, data: ErrorEvent): Promise<void> {
    // This will be implemented by platform-specific transports
    throw new Error('sendHttpRequest must be implemented by platform-specific transport');
  }
}

/**
 * Console transport for debugging
 */
export class ConsoleTransport implements Transport {
  /**
   * Send event to console
   */
  send(event: ErrorEvent): void {
    console.error('[ErrorTracker]', JSON.stringify(event, null, 2));
  }

  /**
   * Flush (no-op for console transport)
   */
  async flush(): Promise<boolean> {
    return true;
  }
}

