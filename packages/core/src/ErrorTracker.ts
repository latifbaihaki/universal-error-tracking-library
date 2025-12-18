import {
  ErrorEvent,
  ErrorTrackerConfig,
  Severity,
  Exception,
  Transport,
  BreadcrumbType,
  BreadcrumbLevel,
} from './types';
import { BreadcrumbManager, createBreadcrumb } from './breadcrumbs';
import { ContextManager } from './context';
import { QueueManager } from './queue';
import { HttpTransport, ConsoleTransport } from './transport';
import { sanitizeErrorEvent } from './sanitizer';

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse error to exception format
 */
function parseError(error: Error): Exception {
  const stack = error.stack || '';
  const frames: Exception['stacktrace'] = { frames: [] };

  if (stack) {
    const lines = stack.split('\n').slice(1);
    frames.frames = lines
      .map((line) => {
        // Simple stack frame parser (can be enhanced)
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          return {
            function: match[1],
            filename: match[2],
            lineno: parseInt(match[3], 10),
            colno: parseInt(match[4], 10),
            in_app: true,
          };
        }
        return null;
      })
      .filter((frame): frame is NonNullable<typeof frame> => frame !== null)
      .reverse();
  }

  return {
    type: error.name || 'Error',
    value: error.message || String(error),
    stacktrace: frames,
    mechanism: {
      type: 'generic',
      handled: true,
    },
  };
}

/**
 * Core Error Tracker class
 */
export class ErrorTracker {
  private config: Required<Omit<ErrorTrackerConfig, 'transport' | 'beforeSend' | 'beforeBreadcrumb'>> &
    Pick<ErrorTrackerConfig, 'transport' | 'beforeSend' | 'beforeBreadcrumb'>;
  private breadcrumbs: BreadcrumbManager;
  private context: ContextManager;
  private queue: QueueManager;
  private transport: Transport;
  private initialized: boolean = false;

  constructor(config: ErrorTrackerConfig) {
    // Validate DSN
    if (!config.dsn) {
      throw new Error('DSN is required');
    }

    // Set defaults
    this.config = {
      dsn: config.dsn,
      environment: config.environment || 'production',
      release: config.release || '',
      serverName: config.serverName || '',
      maxBreadcrumbs: config.maxBreadcrumbs || 100,
      sampleRate: config.sampleRate ?? 1.0,
      maxQueueSize: config.maxQueueSize || 100,
      enabled: config.enabled !== false,
      transport: config.transport,
      beforeSend: config.beforeSend,
      beforeBreadcrumb: config.beforeBreadcrumb,
    };

    // Initialize managers
    this.breadcrumbs = new BreadcrumbManager(this.config.maxBreadcrumbs);
    this.context = new ContextManager();
    this.queue = new QueueManager(this.config.maxQueueSize);

    // Setup transport
    if (this.config.transport) {
      this.transport = this.config.transport;
    } else if (this.config.dsn === 'console://') {
      this.transport = new ConsoleTransport();
    } else {
      this.transport = new HttpTransport(this.config.dsn);
    }
  }

  /**
   * Initialize error tracker
   */
  init(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    // Process queue if there are pending events
    this.processQueue();
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, level: Severity = Severity.Error): void {
    if (!this.config.enabled) {
      return;
    }

    // Apply sample rate
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const exception = parseError(error);
    const event = this.createEvent(level, undefined, {
      values: [exception],
    });

    this.sendEvent(event);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: Severity = Severity.Info): void {
    if (!this.config.enabled) {
      return;
    }

    // Apply sample rate
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    const event = this.createEvent(level, message);
    this.sendEvent(event);
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(
    type: BreadcrumbType,
    level: BreadcrumbLevel,
    message?: string,
    category?: string,
    data?: Record<string, unknown>
  ): void {
    let breadcrumb = createBreadcrumb(type, level, message, category, data);

    // Apply beforeBreadcrumb hook
    if (this.config.beforeBreadcrumb) {
      const result = this.config.beforeBreadcrumb({
        ...breadcrumb,
        timestamp: Date.now() / 1000,
      });
      if (!result) {
        return; // Breadcrumb was filtered out
      }
      breadcrumb = result;
    }

    this.breadcrumbs.add(breadcrumb);
  }

  /**
   * Set user context
   */
  setUser(user: import('./types').User | null): void {
    this.context.setUser(user);
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    this.context.setTag(key, value);
  }

  /**
   * Set tags
   */
  setTags(tags: Record<string, string>): void {
    this.context.setTags(tags);
  }

  /**
   * Set extra data
   */
  setExtra(key: string, value: unknown): void {
    this.context.setExtra(key, value);
  }

  /**
   * Set extras
   */
  setExtras(extras: Record<string, unknown>): void {
    this.context.setExtras(extras);
  }

  /**
   * Set request context
   */
  setRequest(request: import('./types').Request | null): void {
    this.context.setRequest(request);
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context.clear();
    this.breadcrumbs.clear();
  }

  /**
   * Create error event
   */
  private createEvent(
    level: Severity,
    message?: string,
    exception?: { values: Exception[] }
  ): ErrorEvent {
    const contextData = this.context.getContextData();
    const event: ErrorEvent = {
      event_id: generateEventId(),
      timestamp: Date.now() / 1000,
      level,
      platform: 'javascript', // Will be overridden by platform-specific code
      environment: this.config.environment,
      release: this.config.release,
      server_name: this.config.serverName || undefined,
      message,
      exception,
      breadcrumbs: this.breadcrumbs.getAll(),
      user: contextData.user || undefined,
      request: contextData.request || undefined,
      tags: contextData.tags || undefined,
      extra: contextData.extra || undefined,
      sdk: {
        name: '@error-tracker/core',
        version: '0.1.0',
      },
    };

    return event;
  }

  /**
   * Send event
   */
  private async sendEvent(event: ErrorEvent): Promise<void> {
    // Apply beforeSend hook
    let finalEvent = event;
    if (this.config.beforeSend) {
      const result = this.config.beforeSend(event);
      if (!result) {
        return; // Event was filtered out
      }
      finalEvent = result;
    }

    // Sanitize event
    const sanitizedEvent = sanitizeErrorEvent(finalEvent) as ErrorEvent;

    try {
      await this.transport.send(sanitizedEvent);
    } catch (error) {
      // If send fails, add to queue
      this.queue.add(sanitizedEvent);
    }
  }

  /**
   * Process queue
   */
  private async processQueue(): Promise<void> {
    while (!this.queue.isEmpty()) {
      const item = this.queue.getNext();
      if (!item) {
        break;
      }

      try {
        await this.transport.send(item.event);
        this.queue.remove(item);
      } catch (error) {
        // Increment retry or remove if max retries reached
        if (!this.queue.incrementRetry(item)) {
          // Item was removed due to max retries
          continue;
        }
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, item.retries) * 1000));
      }
    }
  }

  /**
   * Flush pending events
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (this.transport.flush) {
      return await this.transport.flush(timeout);
    }
    return true;
  }
}

