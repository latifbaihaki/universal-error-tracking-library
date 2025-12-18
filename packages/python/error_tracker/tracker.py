"""
Core Error Tracker implementation
"""
import sys
import traceback
import uuid
import random
from typing import Optional, List, Dict, Any
from datetime import datetime
import socket

from .types import (
    ErrorEvent,
    ErrorTrackerConfig,
    Severity,
    Breadcrumb,
    BreadcrumbType,
    BreadcrumbLevel,
    User,
    Request,
    Exception as ExceptionData,
    StackFrame,
    Transport,
)
from .transports import HttpTransport, ConsoleTransport
from .sanitizer import sanitize_error_event


class BreadcrumbManager:
    """Manages breadcrumbs"""
    
    def __init__(self, max_breadcrumbs: int = 100):
        self.max_breadcrumbs = max_breadcrumbs
        self.breadcrumbs: List[Breadcrumb] = []
    
    def add(self, breadcrumb: Breadcrumb) -> None:
        """Add a breadcrumb"""
        self.breadcrumbs.append(breadcrumb)
        
        # Keep only the last N breadcrumbs
        if len(self.breadcrumbs) > self.max_breadcrumbs:
            self.breadcrumbs = self.breadcrumbs[-self.max_breadcrumbs:]
    
    def get_all(self) -> List[Breadcrumb]:
        """Get all breadcrumbs"""
        return self.breadcrumbs.copy()
    
    def clear(self) -> None:
        """Clear all breadcrumbs"""
        self.breadcrumbs = []
    
    def count(self) -> int:
        """Get breadcrumb count"""
        return len(self.breadcrumbs)


class ContextManager:
    """Manages context data"""
    
    def __init__(self):
        self.user: Optional[User] = None
        self.tags: Dict[str, str] = {}
        self.extra: Dict[str, Any] = {}
        self.level: Optional[Severity] = None
        self.fingerprint: List[str] = []
        self.request: Optional[Request] = None
    
    def set_user(self, user: Optional[User]) -> None:
        """Set user context"""
        self.user = user
    
    def get_user(self) -> Optional[User]:
        """Get user context"""
        return self.user
    
    def set_tag(self, key: str, value: str) -> None:
        """Set a tag"""
        self.tags[key] = value
    
    def set_tags(self, tags: Dict[str, str]) -> None:
        """Set multiple tags"""
        self.tags.update(tags)
    
    def get_tags(self) -> Dict[str, str]:
        """Get all tags"""
        return self.tags.copy()
    
    def set_extra(self, key: str, value: Any) -> None:
        """Set extra data"""
        self.extra[key] = value
    
    def set_extras(self, extras: Dict[str, Any]) -> None:
        """Set multiple extra data"""
        self.extra.update(extras)
    
    def get_extras(self) -> Dict[str, Any]:
        """Get all extra data"""
        return self.extra.copy()
    
    def set_level(self, level: Optional[Severity]) -> None:
        """Set level"""
        self.level = level
    
    def get_level(self) -> Optional[Severity]:
        """Get level"""
        return self.level
    
    def set_fingerprint(self, fingerprint: List[str]) -> None:
        """Set fingerprint"""
        self.fingerprint = fingerprint.copy()
    
    def get_fingerprint(self) -> List[str]:
        """Get fingerprint"""
        return self.fingerprint.copy()
    
    def set_request(self, request: Optional[Request]) -> None:
        """Set request context"""
        self.request = request
    
    def get_request(self) -> Optional[Request]:
        """Get request context"""
        return self.request
    
    def clear(self) -> None:
        """Clear all context"""
        self.user = None
        self.tags = {}
        self.extra = {}
        self.level = None
        self.fingerprint = []
        self.request = None


def parse_exception(exc: BaseException) -> ExceptionData:
    """Parse exception to ExceptionData format"""
    exc_type = type(exc).__name__
    exc_value = str(exc)
    
    # Get stack trace
    tb = exc.__traceback__
    frames: List[StackFrame] = []
    
    if tb:
        # Extract frames from traceback
        while tb:
            frame = tb.tb_frame
            code = frame.f_code
            
            frames.append(StackFrame(
                filename=code.co_filename,
                function=code.co_name,
                lineno=tb.tb_lineno,
                in_app=True,
            ))
            
            tb = tb.tb_next
        
        # Reverse to get chronological order
        frames.reverse()
    
    return ExceptionData(
        type=exc_type,
        value=exc_value,
        stacktrace={"frames": frames} if frames else None,
        mechanism={
            "type": "generic",
            "handled": True,
        },
    )


class ErrorTracker:
    """Core Error Tracker class"""
    
    def __init__(self, config: ErrorTrackerConfig):
        if not config.dsn:
            raise ValueError("DSN is required")
        
        self.config = config
        self.breadcrumbs = BreadcrumbManager(config.max_breadcrumbs)
        self.context = ContextManager()
        self.initialized = False
        
        # Setup transport
        if config.transport:
            self.transport = config.transport
        elif config.dsn == "console://":
            self.transport = ConsoleTransport()
        else:
            self.transport = HttpTransport(config.dsn)
        
        # Set default server name
        if not config.server_name:
            try:
                self.config.server_name = socket.gethostname()
            except:
                self.config.server_name = "unknown"
    
    def init(self) -> None:
        """Initialize error tracker"""
        if self.initialized:
            return
        
        self.initialized = True
    
    def capture_exception(
        self,
        exception: BaseException,
        level: Severity = Severity.ERROR
    ) -> None:
        """Capture an exception"""
        if not self.config.enabled:
            return
        
        # Apply sample rate
        if random.random() > self.config.sample_rate:
            return
        
        exc_data = parse_exception(exception)
        event = self._create_event(
            level=level,
            message=None,
            exception={"values": [exc_data]}
        )
        
        self._send_event(event)
    
    def capture_message(
        self,
        message: str,
        level: Severity = Severity.INFO
    ) -> None:
        """Capture a message"""
        if not self.config.enabled:
            return
        
        # Apply sample rate
        if random.random() > self.config.sample_rate:
            return
        
        event = self._create_event(level=level, message=message)
        self._send_event(event)
    
    def add_breadcrumb(
        self,
        type: BreadcrumbType,
        level: BreadcrumbLevel,
        message: Optional[str] = None,
        category: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add a breadcrumb"""
        breadcrumb = Breadcrumb(
            type=type,
            level=level,
            message=message,
            category=category,
            data=data,
        )
        
        # Apply before_breadcrumb hook
        if self.config.before_breadcrumb:
            result = self.config.before_breadcrumb(breadcrumb)
            if not result:
                return  # Breadcrumb was filtered out
            breadcrumb = result
        
        self.breadcrumbs.add(breadcrumb)
    
    def set_user(self, user: Optional[User]) -> None:
        """Set user context"""
        self.context.set_user(user)
    
    def set_tag(self, key: str, value: str) -> None:
        """Set a tag"""
        self.context.set_tag(key, value)
    
    def set_tags(self, tags: Dict[str, str]) -> None:
        """Set multiple tags"""
        self.context.set_tags(tags)
    
    def set_extra(self, key: str, value: Any) -> None:
        """Set extra data"""
        self.context.set_extra(key, value)
    
    def set_extras(self, extras: Dict[str, Any]) -> None:
        """Set multiple extra data"""
        self.context.set_extras(extras)
    
    def set_request(self, request: Optional[Request]) -> None:
        """Set request context"""
        self.context.set_request(request)
    
    def clear_context(self) -> None:
        """Clear all context"""
        self.context.clear()
        self.breadcrumbs.clear()
    
    def _create_event(
        self,
        level: Severity,
        message: Optional[str] = None,
        exception: Optional[Dict[str, List[ExceptionData]]] = None
    ) -> ErrorEvent:
        """Create an error event"""
        event_id = f"{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:9]}"
        
        event = ErrorEvent(
            event_id=event_id,
            timestamp=datetime.now().timestamp(),
            level=level,
            platform="python",
            environment=self.config.environment or "production",
            release=self.config.release,
            server_name=self.config.server_name,
            message=message,
            exception=exception,
            breadcrumbs=self.breadcrumbs.get_all(),
            user=self.context.get_user(),
            request=self.context.get_request(),
            tags=self.context.get_tags() if self.context.get_tags() else None,
            extra=self.context.get_extras() if self.context.get_extras() else None,
            sdk={
                "name": "error-tracker-python",
                "version": "0.1.0",
            },
        )
        
        return event
    
    def _send_event(self, event: ErrorEvent) -> None:
        """Send an error event"""
        # Apply before_send hook
        final_event = event
        if self.config.before_send:
            result = self.config.before_send(event)
            if not result:
                return  # Event was filtered out
            final_event = result
        
        # Sanitize event
        sanitized_event = sanitize_error_event(final_event)
        
        try:
            self.transport.send(sanitized_event)
        except Exception as e:
            # Silently fail - transport errors should not break the app
            print(f"[ErrorTracker] Failed to send event: {e}", file=sys.stderr)
    
    def flush(self, timeout: Optional[float] = None) -> bool:
        """Flush pending events"""
        if hasattr(self.transport, 'flush'):
            return self.transport.flush(timeout)
        return True

