"""
Transport implementations for sending error events
"""
import json
import sys
from typing import Optional
from .types import ErrorEvent
import requests


class Transport:
    """Base transport class"""
    
    def send(self, event: ErrorEvent) -> None:
        """Send an error event"""
        raise NotImplementedError
    
    def flush(self, timeout: Optional[float] = None) -> bool:
        """Flush pending events"""
        return True


class HttpTransport(Transport):
    """HTTP transport for sending events via HTTP POST"""
    
    def __init__(self, dsn: str, timeout: float = 5.0, headers: Optional[dict] = None):
        self.dsn = dsn
        self.timeout = timeout
        self.headers = {
            "Content-Type": "application/json",
            **(headers or {})
        }
    
    def send(self, event: ErrorEvent) -> None:
        """Send event via HTTP POST"""
        try:
            # Convert event to dict
            event_dict = self._event_to_dict(event)
            
            response = requests.post(
                self.dsn,
                json=event_dict,
                headers=self.headers,
                timeout=self.timeout
            )
            response.raise_for_status()
        except Exception as e:
            # Silently fail - transport errors should not break the app
            print(f"[ErrorTracker] Failed to send event: {e}", file=sys.stderr)
    
    def _event_to_dict(self, event: ErrorEvent) -> dict:
        """Convert ErrorEvent to dictionary"""
        result = {}
        
        if event.event_id:
            result["event_id"] = event.event_id
        result["timestamp"] = event.timestamp
        result["level"] = event.level.value
        result["platform"] = event.platform
        
        if event.logger:
            result["logger"] = event.logger
        if event.transaction:
            result["transaction"] = event.transaction
        if event.server_name:
            result["server_name"] = event.server_name
        if event.release:
            result["release"] = event.release
        if event.environment:
            result["environment"] = event.environment
        if event.message:
            result["message"] = event.message
        
        if event.exception:
            result["exception"] = {
                "values": [
                    {
                        "type": exc.type,
                        "value": exc.value,
                        "stacktrace": self._stacktrace_to_dict(exc.stacktrace) if exc.stacktrace else None,
                        "mechanism": exc.mechanism,
                    }
                    for exc in event.exception.get("values", [])
                ]
            }
        
        if event.breadcrumbs:
            result["breadcrumbs"] = [
                {
                    "type": bc.type.value,
                    "level": bc.level.value,
                    "message": bc.message,
                    "category": bc.category,
                    "data": bc.data,
                    "timestamp": bc.timestamp,
                }
                for bc in event.breadcrumbs
            ]
        
        if event.user:
            result["user"] = {
                "id": event.user.id,
                "email": event.user.email,
                "username": event.user.username,
                "ip_address": event.user.ip_address,
                **event.user.extra,
            }
        
        if event.request:
            result["request"] = {
                "url": event.request.url,
                "method": event.request.method,
                "headers": event.request.headers,
                "query_string": event.request.query_string,
                "data": event.request.data,
                "cookies": event.request.cookies,
            }
        
        if event.tags:
            result["tags"] = event.tags
        if event.extra:
            result["extra"] = event.extra
        if event.contexts:
            result["contexts"] = event.contexts
        if event.sdk:
            result["sdk"] = event.sdk
        
        return result
    
    def _stacktrace_to_dict(self, stacktrace: dict) -> Optional[dict]:
        """Convert stacktrace to dictionary"""
        if not stacktrace:
            return None
        
        frames = stacktrace.get("frames", [])
        return {
            "frames": [
                {
                    "filename": frame.filename,
                    "function": frame.function,
                    "lineno": frame.lineno,
                    "colno": frame.colno,
                    "in_app": frame.in_app,
                    "context_line": frame.context_line,
                    "pre_context": frame.pre_context,
                    "post_context": frame.post_context,
                }
                for frame in frames
            ]
        }


class ConsoleTransport(Transport):
    """Console transport for debugging"""
    
    def send(self, event: ErrorEvent) -> None:
        """Print event to console"""
        print("[ErrorTracker]", json.dumps(self._event_to_dict(event), indent=2, default=str))
    
    def _event_to_dict(self, event: ErrorEvent) -> dict:
        """Convert event to dict (simplified for console)"""
        exception_data = None
        if event.exception and event.exception.get("values"):
            exc = event.exception["values"][0]
            exception_data = {
                "type": exc.type,
                "value": exc.value,
            }
        
        return {
            "event_id": event.event_id,
            "timestamp": event.timestamp,
            "level": event.level.value,
            "message": event.message,
            "exception": exception_data,
        }

