/**
 * Node.js example for error tracking
 */
const { NodeErrorTracker, Severity } = require('../../packages/js/dist/index.js');

// Initialize error tracker
const tracker = new NodeErrorTracker({
  dsn: 'console://', // Use console transport for demo
  environment: 'development',
  release: '1.0.0',
});

tracker.init();

// Set user context
tracker.setUser({ id: '123', email: 'user@example.com' });

// Test 1: Capture a message
console.log('\n=== Test 1: Capture Message ===');
tracker.captureMessage('This is a test message', Severity.Info);

// Test 2: Capture an exception
console.log('\n=== Test 2: Capture Exception ===');
try {
  throw new Error('This is a test error!');
} catch (error) {
  tracker.captureException(error, Severity.Error);
}

// Test 3: Add breadcrumb
console.log('\n=== Test 3: Add Breadcrumb ===');
tracker.addBreadcrumb(
  require('../../packages/js/dist/index.js').BreadcrumbType.User,
  require('../../packages/js/dist/index.js').BreadcrumbLevel.Info,
  'Processing request',
  'request'
);

// Test 4: Simulate HTTP request context
console.log('\n=== Test 4: Set Request Context ===');
tracker.setRequestFromHttp({
  url: '/api/users',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js Example',
    'Accept': 'application/json',
  },
});

// Test 5: Capture another error with context
console.log('\n=== Test 5: Capture Error with Context ===');
try {
  throw new Error('Error with context');
} catch (error) {
  tracker.captureException(error);
}

console.log('\n=== All tests completed ===');

