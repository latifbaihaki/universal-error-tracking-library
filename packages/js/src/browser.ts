import { ErrorTracker, ErrorTrackerConfig, Severity, BreadcrumbType, BreadcrumbLevel } from '@error-tracker/core';
import { BrowserHttpTransport } from './transports/http';

/**
 * Browser-specific error tracker
 */
export class BrowserErrorTracker extends ErrorTracker {
  private unhandledErrorHandler?: (event: ErrorEvent) => void;
  private unhandledRejectionHandler?: (event: PromiseRejectionEvent) => void;

  constructor(config: ErrorTrackerConfig) {
    super({
      ...config,
      transport: config.transport || new BrowserHttpTransport(config.dsn),
    });
  }

  /**
   * Initialize browser error tracker with automatic error handlers
   */
  init(): void {
    super.init();

    // Capture unhandled errors
    this.unhandledErrorHandler = (event: ErrorEvent) => {
      this.captureException(event.error || new Error(event.message || 'Unhandled error'), Severity.Error);
    };
    window.addEventListener('error', this.unhandledErrorHandler);

    // Capture unhandled promise rejections
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.captureException(error, Severity.Error);
    };
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);

    // Capture console errors
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      this.addBreadcrumb(
        BreadcrumbType.Console,
        BreadcrumbLevel.Error,
        args.map((arg) => String(arg)).join(' ')
      );
      originalConsoleError.apply(console, args);
    };

    // Track navigation
    this.trackNavigation();

    // Track user interactions
    this.trackUserInteractions();
  }

  /**
   * Track navigation changes
   */
  private trackNavigation(): void {
    // Track popstate (back/forward)
    window.addEventListener('popstate', () => {
      this.addBreadcrumb(BreadcrumbType.Navigation, BreadcrumbLevel.Info, 'Navigation', 'popstate', {
        url: window.location.href,
      });
    });

    // Track hash changes
    window.addEventListener('hashchange', () => {
      this.addBreadcrumb(BreadcrumbType.Navigation, BreadcrumbLevel.Info, 'Navigation', 'hashchange', {
        url: window.location.href,
      });
    });
  }

  /**
   * Track user interactions
   */
  private trackUserInteractions(): void {
    const trackInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const tagName = target.tagName?.toLowerCase();
      const id = target.id;
      const className = target.className;

      this.addBreadcrumb(
        BreadcrumbType.User,
        BreadcrumbLevel.Info,
        `User ${event.type}`,
        'user.interaction',
        {
          tag: tagName || '',
          id: id || undefined,
          className: typeof className === 'string' ? className : undefined,
        }
      );
    };

    // Track clicks
    document.addEventListener('click', trackInteraction, true);

    // Track form submissions
    document.addEventListener('submit', trackInteraction, true);
  }

  /**
   * Set request context from current page
   */
  setRequestFromPage(): void {
    this.setRequest({
      url: window.location.href,
      method: 'GET',
      headers: {
        'User-Agent': navigator.userAgent,
        'Referer': document.referrer || undefined,
      },
      query_string: window.location.search.substring(1),
    });
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    if (this.unhandledErrorHandler) {
      window.removeEventListener('error', this.unhandledErrorHandler);
    }
    if (this.unhandledRejectionHandler) {
      window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
    }
  }
}

