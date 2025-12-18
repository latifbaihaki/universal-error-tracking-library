# Error Tracker Examples

This directory contains example applications demonstrating how to use the Error Tracker library.

## JavaScript Examples

### Browser Example

The browser example demonstrates error tracking in a web browser environment.

```bash
# Open examples/js-browser/index.html in a browser
# Or use a local server:
cd examples/js-browser
python -m http.server 8000
# Then open http://localhost:8000
```

### Node.js Example

The Node.js example demonstrates error tracking in a Node.js environment.

```bash
cd examples/js-node
node index.js
```

## Python Examples

### Basic Usage

Basic usage example showing core features.

```bash
cd examples/python
python basic_usage.py
```

### Flask Integration

Example showing Flask framework integration.

```bash
cd examples/python
python flask_example.py
# Then visit http://localhost:5000/error to trigger an error
```

## Notes

- All examples use `console://` as the DSN, which outputs errors to the console
- In production, replace with your actual error tracking endpoint
- Make sure to build the packages first: `npm run build` from the root directory

