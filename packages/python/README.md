# error-tracker-python

Python SDK for Universal Error Tracking & Analytics Library.

## Installation

```bash
pip install error-tracker-python
```

## Usage

```python
from error_tracker import ErrorTracker

tracker = ErrorTracker(
    dsn='https://your-endpoint.com/api/errors',
    environment='production',
    release='1.0.0'
)

tracker.init()
```

## License

MIT

