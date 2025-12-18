"""
Flask integration for error tracking
"""
from typing import Optional
from flask import Flask, request, has_request_context, g

from ..tracker import ErrorTracker
from ..types import ErrorTrackerConfig, Request as RequestType, User as UserType


class FlaskIntegration:
    """Flask integration for error tracking"""
    
    def __init__(self, app: Optional[Flask] = None, tracker: Optional[ErrorTracker] = None):
        self.tracker = tracker or self._create_tracker(app)
        
        if app:
            self.init_app(app)
    
    def _create_tracker(self, app: Optional[Flask] = None) -> ErrorTracker:
        """Create tracker from Flask app config"""
        if app:
            dsn = app.config.get('ERROR_TRACKER_DSN')
        else:
            dsn = None
        
        if not dsn:
            raise ValueError("ERROR_TRACKER_DSN must be set in Flask config")
        
        config = ErrorTrackerConfig(
            dsn=dsn,
            environment=app.config.get('ERROR_TRACKER_ENVIRONMENT') if app else None,
            release=app.config.get('ERROR_TRACKER_RELEASE') if app else None,
            server_name=app.config.get('ERROR_TRACKER_SERVER_NAME') if app else None,
        )
        
        return ErrorTracker(config)
    
    def init_app(self, app: Flask) -> None:
        """Initialize Flask app with error tracking"""
        # Register error handlers
        @app.errorhandler(Exception)
        def handle_exception(e):
            self.capture_request()
            self.tracker.capture_exception(e)
            raise  # Re-raise to let Flask handle it
        
        # Capture request context before each request
        @app.before_request
        def capture_request_context():
            self.capture_request()
    
    def capture_request(self) -> None:
        """Capture request context"""
        if not has_request_context():
            return
        
        # Set request context
        request_data = RequestType(
            url=request.url,
            method=request.method,
            headers=dict(request.headers),
            query_string=request.query_string.decode('utf-8'),
            cookies=dict(request.cookies),
        )
        self.tracker.set_request(request_data)
        
        # Set user context if available
        if hasattr(g, 'user') and g.user:
            user = UserType(
                id=str(getattr(g.user, 'id', None)),
                email=getattr(g.user, 'email', None),
                username=getattr(g.user, 'username', None),
                ip_address=request.remote_addr,
            )
            self.tracker.set_user(user)

