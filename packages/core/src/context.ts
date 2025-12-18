import { User, Request, ContextData, Severity } from './types';

/**
 * Context manager
 */
export class ContextManager {
  private user: User | null = null;
  private tags: Record<string, string> = {};
  private extra: Record<string, unknown> = {};
  private level: Severity | null = null;
  private fingerprint: string[] = [];
  private request: Request | null = null;

  /**
   * Set user context
   */
  setUser(user: User | null): void {
    this.user = user ? { ...user } : null;
  }

  /**
   * Get user context
   */
  getUser(): User | null {
    return this.user ? { ...this.user } : null;
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Set multiple tags
   */
  setTags(tags: Record<string, string>): void {
    this.tags = { ...this.tags, ...tags };
  }

  /**
   * Get tags
   */
  getTags(): Record<string, string> {
    return { ...this.tags };
  }

  /**
   * Set extra data
   */
  setExtra(key: string, value: unknown): void {
    this.extra[key] = value;
  }

  /**
   * Set multiple extra data
   */
  setExtras(extras: Record<string, unknown>): void {
    this.extra = { ...this.extra, ...extras };
  }

  /**
   * Get extra data
   */
  getExtras(): Record<string, unknown> {
    return { ...this.extra };
  }

  /**
   * Set level
   */
  setLevel(level: Severity | null): void {
    this.level = level;
  }

  /**
   * Get level
   */
  getLevel(): Severity | null {
    return this.level;
  }

  /**
   * Set fingerprint
   */
  setFingerprint(fingerprint: string[]): void {
    this.fingerprint = [...fingerprint];
  }

  /**
   * Get fingerprint
   */
  getFingerprint(): string[] {
    return [...this.fingerprint];
  }

  /**
   * Set request context
   */
  setRequest(request: Request | null): void {
    this.request = request ? { ...request } : null;
  }

  /**
   * Get request context
   */
  getRequest(): Request | null {
    return this.request ? { ...this.request } : null;
  }

  /**
   * Get all context data
   */
  getContextData(): ContextData {
    return {
      user: this.user ? { ...this.user } : undefined,
      tags: Object.keys(this.tags).length > 0 ? { ...this.tags } : undefined,
      extra: Object.keys(this.extra).length > 0 ? { ...this.extra } : undefined,
      level: this.level || undefined,
      fingerprint: this.fingerprint.length > 0 ? [...this.fingerprint] : undefined,
      request: this.request ? { ...this.request } : undefined,
    };
  }

  /**
   * Clear all context
   */
  clear(): void {
    this.user = null;
    this.tags = {};
    this.extra = {};
    this.level = null;
    this.fingerprint = [];
    this.request = null;
  }
}

