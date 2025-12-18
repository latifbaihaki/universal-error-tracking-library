"""
FastAPI integration for error tracking
"""
from typing import Optional
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

from ..tracker import ErrorTracker
from ..types import ErrorTrackerConfig, Request as RequestType, User as UserType


class FastAPIIntegration:
    """FastAPI integration for error tracking"""
    
    def __init__(self, app: Optional[FastAPI] = None, tracker: Optional[ErrorTracker] = None):
        self.tracker = tracker or self._create_tracker(app)
        
        if app:
            self.init_app(app)
    
    def _create_tracker(self, app: Optional[FastAPI] = None) -> ErrorTracker:
        """Create tracker from FastAPI app"""
        if app:
            dsn = app.state.error_tracker_dsn if hasattr(app.state, 'error_tracker_dsn') else None
        else:
            dsn = None
        
        if not dsn:
            raise ValueError("ERROR_TRACKER_DSN must be set in FastAPI app state")
        
        config = ErrorTrackerConfig(
            dsn=dsn,
            environment=getattr(app.state, 'error_tracker_environment', None) if app else None,
            release=getattr(app.state, 'error_tracker_release', None) if app else None,
            server_name=getattr(app.state, 'error_tracker_server_name', None) if app else None,
        )
        
        return ErrorTracker(config)
    
    def init_app(self, app: FastAPI) -> None:
        """Initialize FastAPI app with error tracking"""
        # Add exception handler
        @app.exception_handler(Exception)
        async def exception_handler(request: Request, exc: Exception):
            self.capture_request(request)
            self.tracker.capture_exception(exc)
            raise  # Re-raise to let FastAPI handle it
        
        # Add middleware
        app.add_middleware(ErrorTrackingMiddleware, tracker=self.tracker)
    
    def capture_request(self, request: Request) -> None:
        """Capture request context"""
        # Set request context
        request_data = RequestType(
            url=str(request.url),
            method=request.method,
            headers=dict(request.headers),
            query_string=str(request.query_params),
            cookies=dict(request.cookies),
        )
        self.tracker.set_request(request_data)
        
        # Set user context if available
        if hasattr(request.state, 'user') and request.state.user:
            user = UserType(
                id=str(getattr(request.state.user, 'id', None)),
                email=getattr(request.state.user, 'email', None),
                username=getattr(request.state.user, 'username', None),
                ip_address=request.client.host if request.client else None,
            )
            self.tracker.set_user(user)


class ErrorTrackingMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for error tracking"""
    
    def __init__(self, app, tracker: ErrorTracker):
        super().__init__(app)
        self.tracker = tracker
    
    async def dispatch(self, request: Request, call_next):
        # Capture request context
        integration = FastAPIIntegration(tracker=self.tracker)
        integration.capture_request(request)
        
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            self.tracker.capture_exception(exc)
            raise

