// Re-export core types and classes
export * from '@error-tracker/core';

// Export platform-specific implementations
export { BrowserErrorTracker } from './browser';
export { NodeErrorTracker } from './node';
export { BrowserHttpTransport, NodeHttpTransport } from './transports/http';
