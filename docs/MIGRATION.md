# Migration Guide

## Migrating from Sentry

### JavaScript/TypeScript

**Before (Sentry):**
```typescript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: 'production',
  release: '1.0.0',
});

Sentry.captureException(error);
Sentry.setUser({ id: '123', email: 'user@example.com' });
```

**After (Error Tracker):**
```typescript
import { BrowserErrorTracker } from '@error-tracker/js';

const tracker = new BrowserErrorTracker({
  dsn: 'https://your-endpoint.com/api/errors',
  environment: 'production',
  release: '1.0.0',
});

tracker.init();
tracker.captureException(error);
tracker.setUser({ id: '123', email: 'user@example.com' });
```

### Python

**Before (Sentry):**
```python
import sentry_sdk

sentry_sdk.init(
    dsn='https://xxx@sentry.io/xxx',
    environment='production',
    release='1.0.0',
)

sentry_sdk.capture_exception(error)
sentry_sdk.set_user({'id': '123', 'email': 'user@example.com'})
```

**After (Error Tracker):**
```python
from error_tracker import ErrorTracker

tracker = ErrorTracker(
    dsn='https://your-endpoint.com/api/errors',
    environment='production',
    release='1.0.0',
)

tracker.init()
tracker.capture_exception(error)
tracker.set_user(User(id='123', email='user@example.com'))
```

## Key Differences

1. **DSN Format**: Error Tracker uses your custom endpoint, not a Sentry DSN
2. **Initialization**: Explicit `init()` call required
3. **User Context**: Python uses `User` dataclass instead of dict
4. **Framework Integration**: Different integration classes

## Feature Parity

| Sentry Feature | Error Tracker | Notes |
|---------------|---------------|-------|
| Error capture | ✅ | `captureException()` / `capture_exception()` |
| Message capture | ✅ | `captureMessage()` / `capture_message()` |
| Breadcrumbs | ✅ | `addBreadcrumb()` / `add_breadcrumb()` |
| User context | ✅ | `setUser()` / `set_user()` |
| Tags | ✅ | `setTag()` / `set_tag()` |
| Extra data | ✅ | `setExtra()` / `set_extra()` |
| Request context | ✅ | `setRequest()` / `set_request()` |
| Before send hook | ✅ | `beforeSend` / `before_send` |
| Sample rate | ✅ | `sampleRate` / `sample_rate` |
| Environment | ✅ | `environment` config |
| Release tracking | ✅ | `release` config |
| Source maps | ⚠️ | Manual setup required |
| Performance monitoring | ⚠️ | Basic support |
| Session replay | ❌ | Not available |

## Migration Checklist

- [ ] Install Error Tracker package
- [ ] Replace Sentry initialization with Error Tracker
- [ ] Update DSN to your custom endpoint
- [ ] Replace `captureException` calls
- [ ] Replace `setUser` calls (Python: use `User` dataclass)
- [ ] Update framework integrations
- [ ] Test error reporting
- [ ] Remove Sentry dependencies
- [ ] Update documentation

