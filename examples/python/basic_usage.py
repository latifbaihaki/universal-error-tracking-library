"""
Basic usage example for error-tracker-python
"""
from error_tracker import ErrorTracker
from error_tracker.types import Severity, BreadcrumbType, BreadcrumbLevel

# Initialize error tracker
tracker = ErrorTracker(
    dsn='console://',  # Use console transport for demo
    environment='development',
    release='1.0.0',
)

tracker.init()

# Set user context
from error_tracker.types import User
tracker.set_user(User(id='123', email='user@example.com'))

# Test 1: Capture a message
print('\n=== Test 1: Capture Message ===')
tracker.capture_message('This is a test message', Severity.INFO)

# Test 2: Capture an exception
print('\n=== Test 2: Capture Exception ===')
try:
    raise ValueError('This is a test error!')
except Exception as e:
    tracker.capture_exception(e, Severity.ERROR)

# Test 3: Add breadcrumb
print('\n=== Test 3: Add Breadcrumb ===')
tracker.add_breadcrumb(
    BreadcrumbType.USER,
    BreadcrumbLevel.INFO,
    message='Processing request',
    category='request'
)

# Test 4: Set request context
print('\n=== Test 4: Set Request Context ===')
from error_tracker.types import Request
tracker.set_request(Request(
    url='https://example.com/api/users',
    method='GET',
    headers={'User-Agent': 'Python Example'},
))

# Test 5: Capture another error with context
print('\n=== Test 5: Capture Error with Context ===')
try:
    raise RuntimeError('Error with context')
except Exception as e:
    tracker.capture_exception(e)

print('\n=== All tests completed ===')

