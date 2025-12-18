# API Documentation

## JavaScript/TypeScript SDK

### Installation

```bash
npm install @error-tracker/js
```

### Basic Usage

```typescript
import { BrowserErrorTracker, Severity } from '@error-tracker/js';

const tracker = new BrowserErrorTracker({
  dsn: 'https://your-endpoint.com/api/errors',
  environment: 'production',
  release: '1.0.0',
});

tracker.init();
```

### Configuration Options

```typescript
interface ErrorTrackerConfig {
  dsn: string;                    // Required: Endpoint URL for error reporting
  environment?: string;            // Environment name (e.g., 'production', 'staging')
  release?: string;                // Release version
  serverName?: string;             // Server name
  maxBreadcrumbs?: number;         // Max breadcrumbs to store (default: 100)
  beforeSend?: (event) => event;   // Hook to modify events before sending
  beforeBreadcrumb?: (bc) => bc;   // Hook to modify breadcrumbs
  sampleRate?: number;             // Sample rate 0.0-1.0 (default: 1.0)
  maxQueueSize?: number;           // Max queue size for offline storage (default: 100)
  transport?: Transport;           // Custom transport
  enabled?: boolean;                // Enable/disable tracking (default: true)
}
```

### Methods

#### `captureException(error: Error, level?: Severity)`

Capture an exception.

```typescript
try {
  // code
} catch (error) {
  tracker.captureException(error, Severity.Error);
}
```

#### `captureMessage(message: string, level?: Severity)`

Capture a message.

```typescript
tracker.captureMessage('Something happened', Severity.Info);
```

#### `addBreadcrumb(type, level, message?, category?, data?)`

Add a breadcrumb.

```typescript
tracker.addBreadcrumb(
  BreadcrumbType.User,
  BreadcrumbLevel.Info,
  'User clicked button',
  'user.interaction',
  { buttonId: 'submit' }
);
```

#### `setUser(user: User | null)`

Set user context.

```typescript
tracker.setUser({
  id: '123',
  email: 'user@example.com',
  username: 'johndoe',
});
```

#### `setTag(key: string, value: string)`

Set a tag.

```typescript
tracker.setTag('component', 'checkout');
```

#### `setTags(tags: Record<string, string>)`

Set multiple tags.

```typescript
tracker.setTags({
  component: 'checkout',
  version: '1.0.0',
});
```

#### `setExtra(key: string, value: unknown)`

Set extra data.

```typescript
tracker.setExtra('customData', { foo: 'bar' });
```

#### `setRequest(request: Request | null)`

Set request context.

```typescript
tracker.setRequest({
  url: '/api/users',
  method: 'GET',
  headers: { 'User-Agent': 'MyApp' },
});
```

#### `clearContext()`

Clear all context.

```typescript
tracker.clearContext();
```

#### `flush(timeout?: number): Promise<boolean>`

Flush pending events.

```typescript
await tracker.flush(2000);
```

## Python SDK

### Installation

```bash
pip install error-tracker-python
```

### Basic Usage

```python
from error_tracker import ErrorTracker
from error_tracker.types import Severity

tracker = ErrorTracker(
    dsn='https://your-endpoint.com/api/errors',
    environment='production',
    release='1.0.0',
)

tracker.init()
```

### Configuration Options

```python
ErrorTrackerConfig(
    dsn: str,                      # Required: Endpoint URL
    environment: Optional[str],    # Environment name
    release: Optional[str],        # Release version
    server_name: Optional[str],     # Server name
    max_breadcrumbs: int = 100,    # Max breadcrumbs
    before_send: Optional[Callable], # Hook to modify events
    before_breadcrumb: Optional[Callable], # Hook to modify breadcrumbs
    sample_rate: float = 1.0,      # Sample rate 0.0-1.0
    max_queue_size: int = 100,      # Max queue size
    transport: Optional[Transport], # Custom transport
    enabled: bool = True,           # Enable/disable tracking
)
```

### Methods

#### `capture_exception(exception: BaseException, level: Severity = Severity.ERROR)`

Capture an exception.

```python
try:
    # code
except Exception as e:
    tracker.capture_exception(e, Severity.ERROR)
```

#### `capture_message(message: str, level: Severity = Severity.INFO)`

Capture a message.

```python
tracker.capture_message('Something happened', Severity.INFO)
```

#### `add_breadcrumb(type, level, message=None, category=None, data=None)`

Add a breadcrumb.

```python
tracker.add_breadcrumb(
    BreadcrumbType.USER,
    BreadcrumbLevel.INFO,
    message='User clicked button',
    category='user.interaction',
    data={'button_id': 'submit'}
)
```

#### `set_user(user: User | None)`

Set user context.

```python
from error_tracker.types import User

tracker.set_user(User(
    id='123',
    email='user@example.com',
    username='johndoe',
))
```

#### `set_tag(key: str, value: str)`

Set a tag.

```python
tracker.set_tag('component', 'checkout')
```

#### `set_tags(tags: Dict[str, str])`

Set multiple tags.

```python
tracker.set_tags({
    'component': 'checkout',
    'version': '1.0.0',
})
```

#### `set_extra(key: str, value: Any)`

Set extra data.

```python
tracker.set_extra('custom_data', {'foo': 'bar'})
```

#### `set_request(request: Request | None)`

Set request context.

```python
from error_tracker.types import Request

tracker.set_request(Request(
    url='/api/users',
    method='GET',
    headers={'User-Agent': 'MyApp'},
))
```

#### `clear_context()`

Clear all context.

```python
tracker.clear_context()
```

#### `flush(timeout: Optional[float] = None) -> bool`

Flush pending events.

```python
tracker.flush(2.0)
```

## Framework Integrations

### React

```typescript
import { useErrorTracker, ErrorBoundary } from '@error-tracker/js';
import { BrowserErrorTracker } from '@error-tracker/js';

const tracker = new BrowserErrorTracker({ dsn: '...' });
tracker.init();

function App() {
  const { captureException, setUser } = useErrorTracker(tracker);

  return (
    <ErrorBoundary tracker={tracker}>
      {/* Your app */}
    </ErrorBoundary>
  );
}
```

### Flask

```python
from flask import Flask
from error_tracker.integrations import FlaskIntegration

app = Flask(__name__)
app.config['ERROR_TRACKER_DSN'] = 'https://your-endpoint.com/api/errors'

integration = FlaskIntegration(app)
```

### Django

```python
# settings.py
ERROR_TRACKER_DSN = 'https://your-endpoint.com/api/errors'

# middleware.py
from error_tracker.integrations import ErrorTrackingMiddleware

MIDDLEWARE = [
    # ...
    'your_app.middleware.ErrorTrackingMiddleware',
]
```

### FastAPI

```python
from fastapi import FastAPI
from error_tracker.integrations import FastAPIIntegration

app = FastAPI()
app.state.error_tracker_dsn = 'https://your-endpoint.com/api/errors'

integration = FastAPIIntegration(app)
```

