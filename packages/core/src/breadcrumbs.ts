import { Breadcrumb, BreadcrumbType, BreadcrumbLevel } from './types';

/**
 * Breadcrumb manager
 */
export class BreadcrumbManager {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs: number;

  constructor(maxBreadcrumbs: number = 100) {
    this.maxBreadcrumbs = maxBreadcrumbs;
  }

  /**
   * Add a breadcrumb
   */
  add(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now() / 1000,
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Get all breadcrumbs
   */
  getAll(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear all breadcrumbs
   */
  clear(): void {
    this.breadcrumbs = [];
  }

  /**
   * Get breadcrumbs count
   */
  count(): number {
    return this.breadcrumbs.length;
  }
}

/**
 * Helper functions for creating breadcrumbs
 */
export const createBreadcrumb = (
  type: BreadcrumbType,
  level: BreadcrumbLevel,
  message?: string,
  category?: string,
  data?: Record<string, unknown>
): Omit<Breadcrumb, 'timestamp'> => {
  return {
    type,
    level,
    message,
    category,
    data,
  };
};

