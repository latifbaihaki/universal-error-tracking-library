"""
Django integration for error tracking
"""
from typing import Optional
from django.conf import settings
from django.core.exceptions import DisallowedHost
from django.http import HttpRequest

from ..tracker import ErrorTracker
from ..types import ErrorTrackerConfig, Request as RequestType, User as UserType


class DjangoIntegration:
    """Django integration for error tracking"""
    
    def __init__(self, tracker: Optional[ErrorTracker] = None):
        self.tracker = tracker or self._create_tracker()
        self._setup_middleware()
    
    def _create_tracker(self) -> ErrorTracker:
        """Create tracker from Django settings"""
        dsn = getattr(settings, 'ERROR_TRACKER_DSN', None)
        if not dsn:
            raise ValueError("ERROR_TRACKER_DSN must be set in Django settings")
        
        config = ErrorTrackerConfig(
            dsn=dsn,
            environment=getattr(settings, 'ERROR_TRACKER_ENVIRONMENT', None),
            release=getattr(settings, 'ERROR_TRACKER_RELEASE', None),
            server_name=getattr(settings, 'ERROR_TRACKER_SERVER_NAME', None),
        )
        
        return ErrorTracker(config)
    
    def _setup_middleware(self) -> None:
        """Setup Django middleware"""
        # This would typically be done via Django middleware class
        # For now, we'll provide a middleware class that users can add
        pass
    
    def capture_request(self, request: HttpRequest) -> None:
        """Capture request context"""
        # Set request context
        request_data = RequestType(
            url=request.build_absolute_uri(),
            method=request.method,
            headers=dict(request.headers),
            query_string=request.GET.urlencode(),
            cookies=dict(request.COOKIES),
        )
        self.tracker.set_request(request_data)
        
        # Set user context if authenticated
        if hasattr(request, 'user') and request.user.is_authenticated:
            user = UserType(
                id=str(request.user.pk),
                email=getattr(request.user, 'email', None),
                username=getattr(request.user, 'username', None),
                ip_address=self._get_client_ip(request),
            )
            self.tracker.set_user(user)
    
    def _get_client_ip(self, request: HttpRequest) -> Optional[str]:
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ErrorTrackingMiddleware:
    """Django middleware for automatic error tracking"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.integration = DjangoIntegration()
    
    def __call__(self, request):
        # Capture request context
        self.integration.capture_request(request)
        
        try:
            response = self.get_response(request)
            return response
        except Exception as exc:
            # Capture exception
            self.integration.tracker.capture_exception(exc)
            raise
    
    def process_exception(self, request, exception):
        """Process exception"""
        self.integration.tracker.capture_exception(exception)
        return None

