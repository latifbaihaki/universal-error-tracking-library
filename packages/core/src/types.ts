/**
 * Severity levels for errors
 */
export enum Severity {
  Fatal = 'fatal',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Debug = 'debug',
}

/**
 * Breadcrumb types
 */
export enum BreadcrumbType {
  Navigation = 'navigation',
  User = 'user',
  Http = 'http',
  Console = 'console',
  Custom = 'custom',
}

/**
 * Breadcrumb level
 */
export enum BreadcrumbLevel {
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Fatal = 'fatal',
}

/**
 * Breadcrumb data
 */
export interface Breadcrumb {
  type: BreadcrumbType;
  level: BreadcrumbLevel;
  message?: string;
  category?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

/**
 * User context
 */
export interface User {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
  [key: string]: unknown;
}

/**
 * Request context
 */
export interface Request {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  query_string?: string;
  data?: unknown;
  cookies?: Record<string, string>;
}

/**
 * Stack frame
 */
export interface StackFrame {
  filename?: string;
  function?: string;
  lineno?: number;
  colno?: number;
  in_app?: boolean;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
}

/**
 * Exception data
 */
export interface Exception {
  type: string;
  value: string;
  stacktrace?: {
    frames: StackFrame[];
  };
  mechanism?: {
    type: string;
    handled: boolean;
  };
}

/**
 * Error event
 */
export interface ErrorEvent {
  event_id?: string;
  timestamp: number;
  level: Severity;
  platform: string;
  logger?: string;
  transaction?: string;
  server_name?: string;
  release?: string;
  environment?: string;
  message?: string;
  exception?: {
    values: Exception[];
  };
  breadcrumbs?: Breadcrumb[];
  user?: User;
  request?: Request;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  sdk?: {
    name: string;
    version: string;
  };
}

/**
 * Error tracker configuration
 */
export interface ErrorTrackerConfig {
  dsn: string;
  environment?: string;
  release?: string;
  serverName?: string;
  maxBreadcrumbs?: number;
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null;
  beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
  sampleRate?: number;
  maxQueueSize?: number;
  transport?: Transport;
  enabled?: boolean;
}

/**
 * Transport interface for sending events
 */
export interface Transport {
  send(event: ErrorEvent): Promise<void> | void;
  flush?(timeout?: number): Promise<boolean>;
}

/**
 * Context data
 */
export interface ContextData {
  user?: User;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: Severity;
  fingerprint?: string[];
  request?: Request;
}

