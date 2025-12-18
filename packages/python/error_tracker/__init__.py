"""
Universal Error Tracking & Analytics Library - Python SDK
"""

from .tracker import ErrorTracker
from .transports import HttpTransport, ConsoleTransport

__version__ = "0.1.0"
__all__ = ["ErrorTracker", "HttpTransport", "ConsoleTransport"]

