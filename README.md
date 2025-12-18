# Universal Error Tracking & Analytics Library

> Track errors like a pro, without the complexity. A lightweight, flexible, and privacy-first error tracking library that works seamlessly across JavaScript/TypeScript and Python.

Tired of heavy error tracking solutions that lock you into their platform? This library gives you the power to track errors your way - send them to your own endpoint, customize everything, and keep your data private. All while being incredibly lightweight (< 10KB) and easy to use.

## 📑 Table of Contents

- [Why This Library?](#why-this-library)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
  - [Basic Error Tracking](#basic-error-tracking)
  - [Adding Context](#adding-context)
  - [Breadcrumbs](#breadcrumbs)
  - [Custom Configuration](#custom-configuration)
- [Framework Integrations](#framework-integrations)
  - [React](#react)
  - [Flask](#flask)
  - [Django](#django)
  - [FastAPI](#fastapi)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Why This Library?

You've probably used Sentry, Rollbar, or Bugsnag. They're great, but they come with some trade-offs:

- **Heavy and complex** - Large bundle sizes, complex setup
- **Locked in** - You're stuck with their platform
- **Privacy concerns** - Your data goes to third-party servers
- **Expensive** - Costs can add up quickly

This library solves all of that. It's:
- **Lightweight** - Less than 10KB gzipped
- **Flexible** - Send errors to YOUR endpoint
- **Privacy-first** - Built-in data sanitization
- **Free** - Open source, MIT licensed

## Features

- 🚀 **Lightweight**: Less than 10KB gzipped for JavaScript bundle
- 🔌 **Flexible**: Send errors to your custom endpoint - no vendor lock-in
- 🔒 **Privacy-first**: Built-in data sanitization to protect sensitive information
- 🌍 **Universal**: Works with JavaScript/TypeScript and Python with consistent API
- 🔧 **Extensible**: Plugin system for custom integrations
- 💻 **Developer-friendly**: Full TypeScript support, excellent DX
- 📦 **Open source**: MIT license, community-driven
- ⚡ **Automatic**: Captures unhandled errors and promise rejections automatically
- 🍞 **Breadcrumbs**: Track user actions leading up to errors
- 🔄 **Offline support**: Queues errors when offline, sends when back online

## Installation

Instalasi melalui package manager (npm, pip, atau lainnya) mungkin akan ditambahkan di masa depan. Untuk saat ini, silakan clone repository ini dan gunakan langsung dari source code.

## Quick Start

### JavaScript/TypeScript

```typescript
import { BrowserErrorTracker, Severity } from '@error-tracker/js';

// Initialize the tracker
const tracker = new BrowserErrorTracker({
  dsn: 'https://your-api.com/api/errors', // Your endpoint
  environment: 'production',
  release: '1.0.0',
});

// Start tracking (this enables automatic error capture)
tracker.init();

// That's it! Unhandled errors are now automatically captured.
// You can also manually capture errors:
try {
  // Your code here
} catch (error) {
  tracker.captureException(error);
}
```

### Python

```python
from error_tracker import ErrorTracker
from error_tracker.types import Severity

# Initialize the tracker
tracker = ErrorTracker(
    dsn='https://your-api.com/api/errors',  # Your endpoint
    environment='production',
    release='1.0.0',
)

# Start tracking
tracker.init()

# Automatic exception capture is enabled
# Or manually capture:
try:
    # Your code here
    pass
except Exception as e:
    tracker.capture_exception(e, Severity.ERROR)
```

## Usage Guide

### Basic Error Tracking

The library automatically captures unhandled errors, but you can also manually track errors and messages.

#### JavaScript/TypeScript

```typescript
// Capture an exception
try {
  riskyOperation();
} catch (error) {
  tracker.captureException(error, Severity.ERROR);
}

// Capture a message (for logging important events)
tracker.captureMessage('User completed checkout', Severity.INFO);

// Capture with different severity levels
tracker.captureMessage('API rate limit approaching', Severity.WARNING);
tracker.captureException(criticalError, Severity.FATAL);
```

#### Python

```python
# Capture an exception
try:
    risky_operation()
except Exception as e:
    tracker.capture_exception(e, Severity.ERROR)

# Capture a message
tracker.capture_message('User completed checkout', Severity.INFO)

# Different severity levels
tracker.capture_message('API rate limit approaching', Severity.WARNING)
tracker.capture_exception(critical_error, Severity.FATAL)
```

### Adding Context

Add user information, tags, and extra data to help debug errors.

#### JavaScript/TypeScript

```typescript
// Set user context (do this after user logs in)
tracker.setUser({
  id: '12345',
  email: 'user@example.com',
  username: 'johndoe',
});

// Add tags for filtering and grouping
tracker.setTag('component', 'checkout');
tracker.setTag('version', '2.1.0');
tracker.setTags({
  environment: 'production',
  region: 'us-east-1',
});

// Add extra data
tracker.setExtra('orderId', 'ORD-12345');
tracker.setExtra('cartValue', 99.99);
tracker.setExtras({
  featureFlags: ['new-checkout', 'dark-mode'],
  sessionId: 'sess_abc123',
});

// Set request context (for web apps)
tracker.setRequest({
  url: '/api/checkout',
  method: 'POST',
  headers: {
    'User-Agent': navigator.userAgent,
  },
});
```

#### Python

```python
from error_tracker.types import User, Request

# Set user context
tracker.set_user(User(
    id='12345',
    email='user@example.com',
    username='johndoe',
))

# Add tags
tracker.set_tag('component', 'checkout')
tracker.set_tags({
    'environment': 'production',
    'version': '2.1.0',
})

# Add extra data
tracker.set_extra('order_id', 'ORD-12345')
tracker.set_extras({
    'feature_flags': ['new-checkout', 'dark-mode'],
    'session_id': 'sess_abc123',
})

# Set request context
tracker.set_request(Request(
    url='/api/checkout',
    method='POST',
    headers={'User-Agent': 'MyApp/1.0'},
))
```

### Breadcrumbs

Breadcrumbs help you understand what the user was doing before an error occurred.

#### JavaScript/TypeScript

```typescript
import { BreadcrumbType, BreadcrumbLevel } from '@error-tracker/js';

// Track user actions
tracker.addBreadcrumb(
  BreadcrumbType.User,
  BreadcrumbLevel.Info,
  'User clicked checkout button',
  'user.interaction',
  { buttonId: 'checkout-btn' }
);

// Track navigation
tracker.addBreadcrumb(
  BreadcrumbType.Navigation,
  BreadcrumbLevel.Info,
  'Navigated to checkout page',
  'navigation',
  { from: '/cart', to: '/checkout' }
);

// Track API calls
tracker.addBreadcrumb(
  BreadcrumbType.Http,
  BreadcrumbLevel.Info,
  'API request completed',
  'http',
  { url: '/api/cart', status: 200 }
);
```

#### Python

```python
from error_tracker.types import BreadcrumbType, BreadcrumbLevel

# Track user actions
tracker.add_breadcrumb(
    BreadcrumbType.USER,
    BreadcrumbLevel.INFO,
    message='User clicked checkout button',
    category='user.interaction',
    data={'button_id': 'checkout-btn'}
)

# Track API calls
tracker.add_breadcrumb(
    BreadcrumbType.HTTP,
    BreadcrumbLevel.INFO,
    message='API request completed',
    category='http',
    data={'url': '/api/cart', 'status': 200}
)
```

### Custom Configuration

Customize the tracker behavior to fit your needs.

#### JavaScript/TypeScript

```typescript
const tracker = new BrowserErrorTracker({
  dsn: 'https://your-api.com/api/errors',
  environment: 'production',
  release: '1.0.0',
  serverName: 'web-server-01',
  
  // Limit breadcrumbs
  maxBreadcrumbs: 50,
  
  // Sample rate (0.0 to 1.0) - only capture 10% of errors
  sampleRate: 0.1,
  
  // Modify events before sending
  beforeSend: (event) => {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event; // Return null to drop the event
  },
  
  // Filter breadcrumbs
  beforeBreadcrumb: (breadcrumb) => {
    // Don't track console logs in production
    if (breadcrumb.type === 'console' && process.env.NODE_ENV === 'production') {
      return null; // Drop this breadcrumb
    }
    return breadcrumb;
  },
  
  // Disable tracking (useful for development)
  enabled: process.env.NODE_ENV === 'production',
});
```

#### Python

```python
def before_send(event):
    # Remove sensitive data
    if event.request and event.request.headers:
        event.request.headers.pop('Authorization', None)
    return event  # Return None to drop the event

def before_breadcrumb(breadcrumb):
    # Filter out console breadcrumbs in production
    if breadcrumb.type == BreadcrumbType.CONSOLE:
        return None
    return breadcrumb

tracker = ErrorTracker(
    dsn='https://your-api.com/api/errors',
    environment='production',
    release='1.0.0',
    max_breadcrumbs=50,
    sample_rate=0.1,  # Only capture 10% of errors
    before_send=before_send,
    before_breadcrumb=before_breadcrumb,
    enabled=True,
)
```

## Framework Integrations

### React

Wrap your app with ErrorBoundary for automatic error tracking.

```typescript
import React from 'react';
import { BrowserErrorTracker } from '@error-tracker/js';
import { ErrorBoundary, useErrorTracker } from '@error-tracker/js/integrations/react';

// Initialize tracker (do this once, maybe in a separate file)
const tracker = new BrowserErrorTracker({
  dsn: process.env.REACT_APP_ERROR_DSN!,
  environment: process.env.NODE_ENV,
});
tracker.init();

function App() {
  return (
    <ErrorBoundary tracker={tracker}>
      <YourApp />
    </ErrorBoundary>
  );
}

// Use the hook in components
function CheckoutButton() {
  const { captureException, setUser } = useErrorTracker(tracker);
  
  const handleClick = async () => {
    try {
      await processCheckout();
    } catch (error) {
      captureException(error);
    }
  };
  
  return <button onClick={handleClick}>Checkout</button>;
}
```

### Flask

Automatic error tracking for Flask applications.

```python
from flask import Flask, request
from error_tracker.integrations import FlaskIntegration

app = Flask(__name__)
app.config['ERROR_TRACKER_DSN'] = 'https://your-api.com/api/errors'
app.config['ERROR_TRACKER_ENVIRONMENT'] = 'production'

# Initialize integration (automatically captures exceptions)
integration = FlaskIntegration(app)

@app.route('/checkout', methods=['POST'])
def checkout():
    # Set user context if authenticated
    if current_user.is_authenticated:
        integration.tracker.set_user(User(
            id=str(current_user.id),
            email=current_user.email,
        ))
    
    # Your code here - exceptions are automatically captured
    process_checkout()
    return {'status': 'success'}
```

### Django

Add middleware for automatic error tracking.

```python
# settings.py
ERROR_TRACKER_DSN = 'https://your-api.com/api/errors'
ERROR_TRACKER_ENVIRONMENT = 'production'
ERROR_TRACKER_RELEASE = '1.0.0'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # ... other middleware
    'error_tracker.integrations.ErrorTrackingMiddleware',  # Add this
    # ... rest of middleware
]

# views.py
from error_tracker.integrations import DjangoIntegration

integration = DjangoIntegration()

def checkout_view(request):
    # Set user context
    if request.user.is_authenticated:
        integration.tracker.set_user(User(
            id=str(request.user.id),
            email=request.user.email,
        ))
    
    # Your code - exceptions are automatically captured
    process_checkout()
```

### FastAPI

Automatic error tracking for FastAPI applications.

```python
from fastapi import FastAPI, Request
from error_tracker.integrations import FastAPIIntegration

app = FastAPI()

# Configure error tracking
app.state.error_tracker_dsn = 'https://your-api.com/api/errors'
app.state.error_tracker_environment = 'production'

# Initialize integration
integration = FastAPIIntegration(app)

@app.post('/checkout')
async def checkout(request: Request):
    # Set user context if available
    if hasattr(request.state, 'user') and request.state.user:
        integration.tracker.set_user(User(
            id=str(request.state.user.id),
            email=request.state.user.email,
        ))
    
    # Your code - exceptions are automatically captured
    await process_checkout()
    return {'status': 'success'}
```

## Advanced Usage

### Custom Transport

Create your own transport to send errors anywhere.

```typescript
import { Transport, ErrorEvent } from '@error-tracker/core';

class CustomTransport implements Transport {
  async send(event: ErrorEvent): Promise<void> {
    // Send to your custom endpoint, database, queue, etc.
    await fetch('https://your-custom-endpoint.com/errors', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }
  
  async flush(): Promise<boolean> {
    // Flush any pending events
    return true;
  }
}

const tracker = new BrowserErrorTracker({
  dsn: 'dummy', // Not used when custom transport is provided
  transport: new CustomTransport(),
});
```

### Offline Queue

Errors are automatically queued when offline and sent when connection is restored.

```typescript
// The library handles this automatically, but you can manually flush
await tracker.flush(2000); // Wait up to 2 seconds
```

### Error Grouping

Errors are automatically grouped by:
- Error type and message
- Stack trace
- User context (optional)
- Custom fingerprint (optional)

```typescript
// Set custom fingerprint for grouping
tracker.setFingerprint(['checkout', 'payment-gateway']);
```

## API Reference

For complete API documentation, see:
- [JavaScript/TypeScript API](./docs/API.md#javascripttypescript-sdk)
- [Python API](./docs/API.md#python-sdk)

## Examples

Check out the [examples directory](./examples/) for complete working examples:

- [Browser Example](./examples/js-browser/) - Basic browser usage
- [Node.js Example](./examples/js-node/) - Server-side usage
- [Python Example](./examples/python/basic_usage.py) - Basic Python usage
- [Flask Integration](./examples/python/flask_example.py) - Flask app with error tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this in your projects, commercial or otherwise.

---

**Made with ❤️ for developers who want control over their error tracking**
