# Best Practices

## General Guidelines

### 1. Initialize Early

Initialize error tracking as early as possible in your application lifecycle.

**JavaScript:**
```typescript
// app.ts
import { BrowserErrorTracker } from '@error-tracker/js';

const tracker = new BrowserErrorTracker({
  dsn: process.env.ERROR_TRACKER_DSN!,
  environment: process.env.NODE_ENV,
  release: process.env.APP_VERSION,
});

tracker.init();
```

**Python:**
```python
# app.py
from error_tracker import ErrorTracker

tracker = ErrorTracker(
    dsn=os.getenv('ERROR_TRACKER_DSN'),
    environment=os.getenv('ENVIRONMENT', 'production'),
    release=os.getenv('APP_VERSION'),
)

tracker.init()
```

### 2. Use Environment Variables

Never hardcode DSN or sensitive configuration.

```typescript
// ❌ Bad
const tracker = new BrowserErrorTracker({
  dsn: 'https://api.example.com/errors',
});

// ✅ Good
const tracker = new BrowserErrorTracker({
  dsn: process.env.ERROR_TRACKER_DSN!,
});
```

### 3. Sanitize Sensitive Data

Use `beforeSend` hook to sanitize sensitive data.

```typescript
const tracker = new BrowserErrorTracker({
  dsn: process.env.ERROR_TRACKER_DSN!,
  beforeSend: (event) => {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    return event;
  },
});
```

### 4. Set User Context

Always set user context when available.

```typescript
// After user login
tracker.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// After user logout
tracker.setUser(null);
```

### 5. Use Breadcrumbs

Add breadcrumbs for important user actions.

```typescript
tracker.addBreadcrumb(
  BreadcrumbType.User,
  BreadcrumbLevel.Info,
  'User added item to cart',
  'cart.add',
  { itemId: '123', quantity: 2 }
);
```

### 6. Use Appropriate Severity Levels

```typescript
// Fatal: Application cannot continue
tracker.captureException(error, Severity.Fatal);

// Error: Error occurred but app can continue
tracker.captureException(error, Severity.Error);

// Warning: Potential issue
tracker.captureMessage('Deprecated API used', Severity.Warning);

// Info: Informational message
tracker.captureMessage('User logged in', Severity.Info);
```

### 7. Handle Offline Scenarios

Error Tracker automatically queues events when offline. Ensure your endpoint can handle batch requests.

### 8. Use Sample Rate for High-Volume Applications

```typescript
const tracker = new BrowserErrorTracker({
  dsn: process.env.ERROR_TRACKER_DSN!,
  sampleRate: 0.1, // Only capture 10% of errors
});
```

### 9. Set Request Context

Always set request context in web applications.

**JavaScript:**
```typescript
tracker.setRequest({
  url: window.location.href,
  method: 'GET',
  headers: {
    'User-Agent': navigator.userAgent,
  },
});
```

**Python:**
```python
tracker.set_request(Request(
    url=request.url,
    method=request.method,
    headers=dict(request.headers),
))
```

### 10. Test Error Tracking

Test that errors are being captured correctly.

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  tracker.captureMessage('Error tracking test', Severity.Info);
}
```

## Framework-Specific

### React

Use Error Boundary for automatic error capture.

```typescript
import { ErrorBoundary } from '@error-tracker/js';

function App() {
  return (
    <ErrorBoundary tracker={tracker}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Flask

Use Flask integration for automatic request context.

```python
from error_tracker.integrations import FlaskIntegration

app = Flask(__name__)
app.config['ERROR_TRACKER_DSN'] = os.getenv('ERROR_TRACKER_DSN')

integration = FlaskIntegration(app)
```

### Django

Use middleware for automatic error capture.

```python
# settings.py
MIDDLEWARE = [
    'error_tracker.integrations.ErrorTrackingMiddleware',
    # ...
]
```

## Performance Considerations

1. **Async Sending**: Error Tracker sends events asynchronously by default
2. **Batch Sending**: Consider implementing batch sending for high-volume apps
3. **Sample Rate**: Use sample rate to reduce volume
4. **Queue Size**: Adjust `maxQueueSize` based on your needs

## Security Considerations

1. **Sanitize Data**: Always sanitize sensitive data in `beforeSend`
2. **HTTPS Only**: Always use HTTPS for DSN
3. **Rate Limiting**: Implement rate limiting on your endpoint
4. **Authentication**: Use authentication for your error tracking endpoint

## Monitoring

1. **Monitor Your Endpoint**: Ensure your error tracking endpoint is available
2. **Set Up Alerts**: Set up alerts for error spikes
3. **Review Regularly**: Regularly review error reports
4. **Track Trends**: Track error trends over time

