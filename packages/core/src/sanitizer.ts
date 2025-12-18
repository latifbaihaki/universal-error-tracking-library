/**
 * Default sensitive keys that should be sanitized
 */
const DEFAULT_SENSITIVE_KEYS = [
  'password',
  'passwd',
  'secret',
  'api_key',
  'apikey',
  'access_token',
  'auth_token',
  'token',
  'credit_card',
  'card_number',
  'cvv',
  'ssn',
  'social_security_number',
  'email',
  'phone',
  'phone_number',
];

/**
 * Sanitize a value by replacing it with a placeholder
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return '[Sanitized]';
  }
  if (typeof value === 'number') {
    return 0;
  }
  if (typeof value === 'boolean') {
    return false;
  }
  return '[Sanitized]';
}

/**
 * Check if a key is sensitive
 */
function isSensitiveKey(key: string, sensitiveKeys: string[]): boolean {
  const lowerKey = key.toLowerCase();
  return sensitiveKeys.some((sensitiveKey) => lowerKey.includes(sensitiveKey.toLowerCase()));
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject(
  obj: unknown,
  sensitiveKeys: string[] = DEFAULT_SENSITIVE_KEYS,
  maxDepth: number = 10,
  currentDepth: number = 0
): unknown {
  if (currentDepth >= maxDepth) {
    return '[Max Depth Reached]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, sensitiveKeys, maxDepth, currentDepth + 1));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key, sensitiveKeys)) {
      sanitized[key] = sanitizeValue(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, sensitiveKeys, maxDepth, currentDepth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize error event data
 */
export function sanitizeErrorEvent(event: unknown, sensitiveKeys?: string[]): unknown {
  return sanitizeObject(event, sensitiveKeys);
}

