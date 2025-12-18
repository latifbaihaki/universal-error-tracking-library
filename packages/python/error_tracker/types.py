"""
Type definitions for error tracker
"""
from enum import Enum
from typing import Optional, Dict, Any, List, Callable
from dataclasses import dataclass, field
from datetime import datetime


class Severity(str, Enum):
    """Severity levels for errors"""
    FATAL = "fatal"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    DEBUG = "debug"


class BreadcrumbType(str, Enum):
    """Breadcrumb types"""
    NAVIGATION = "navigation"
    USER = "user"
    HTTP = "http"
    CONSOLE = "console"
    CUSTOM = "custom"


class BreadcrumbLevel(str, Enum):
    """Breadcrumb levels"""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    FATAL = "fatal"


@dataclass
class Breadcrumb:
    """Breadcrumb data"""
    type: BreadcrumbType
    level: BreadcrumbLevel
    message: Optional[str] = None
    category: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    timestamp: float = field(default_factory=lambda: datetime.now().timestamp())


@dataclass
class User:
    """User context"""
    id: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None
    ip_address: Optional[str] = None
    extra: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Request:
    """Request context"""
    url: Optional[str] = None
    method: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    query_string: Optional[str] = None
    data: Optional[Any] = None
    cookies: Optional[Dict[str, str]] = None


@dataclass
class StackFrame:
    """Stack frame"""
    filename: Optional[str] = None
    function: Optional[str] = None
    lineno: Optional[int] = None
    colno: Optional[int] = None
    in_app: bool = True
    context_line: Optional[str] = None
    pre_context: List[str] = field(default_factory=list)
    post_context: List[str] = field(default_factory=list)


@dataclass
class Exception:
    """Exception data"""
    type: str
    value: str
    stacktrace: Optional[Dict[str, List[StackFrame]]] = None
    mechanism: Optional[Dict[str, Any]] = None


@dataclass
class ErrorEvent:
    """Error event"""
    event_id: Optional[str] = None
    timestamp: float = field(default_factory=lambda: datetime.now().timestamp())
    level: Severity = Severity.ERROR
    platform: str = "python"
    logger: Optional[str] = None
    transaction: Optional[str] = None
    server_name: Optional[str] = None
    release: Optional[str] = None
    environment: Optional[str] = None
    message: Optional[str] = None
    exception: Optional[Dict[str, List[Exception]]] = None
    breadcrumbs: List[Breadcrumb] = field(default_factory=list)
    user: Optional[User] = None
    request: Optional[Request] = None
    tags: Optional[Dict[str, str]] = None
    extra: Optional[Dict[str, Any]] = None
    contexts: Optional[Dict[str, Any]] = None
    sdk: Optional[Dict[str, str]] = None


@dataclass
class ErrorTrackerConfig:
    """Error tracker configuration"""
    dsn: str
    environment: Optional[str] = None
    release: Optional[str] = None
    server_name: Optional[str] = None
    max_breadcrumbs: int = 100
    before_send: Optional[Callable[[ErrorEvent], Optional[ErrorEvent]]] = None
    before_breadcrumb: Optional[Callable[[Breadcrumb], Optional[Breadcrumb]]] = None
    sample_rate: float = 1.0
    max_queue_size: int = 100
    transport: Optional[Any] = None
    enabled: bool = True

