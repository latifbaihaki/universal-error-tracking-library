"""
Data sanitization utilities
"""
from typing import Any, Dict, List, Optional

# Default sensitive keys that should be sanitized
DEFAULT_SENSITIVE_KEYS = [
    "password",
    "passwd",
    "secret",
    "api_key",
    "apikey",
    "access_token",
    "auth_token",
    "token",
    "credit_card",
    "card_number",
    "cvv",
    "ssn",
    "social_security_number",
    "email",
    "phone",
    "phone_number",
]


def sanitize_value(value: Any) -> Any:
    """Sanitize a value by replacing it with a placeholder"""
    if isinstance(value, str):
        return "[Sanitized]"
    if isinstance(value, (int, float)):
        return 0
    if isinstance(value, bool):
        return False
    return "[Sanitized]"


def is_sensitive_key(key: str, sensitive_keys: List[str]) -> bool:
    """Check if a key is sensitive"""
    lower_key = key.lower()
    return any(sensitive_key.lower() in lower_key for sensitive_key in sensitive_keys)


def sanitize_object(
    obj: Any,
    sensitive_keys: Optional[List[str]] = None,
    max_depth: int = 10,
    current_depth: int = 0
) -> Any:
    """Sanitize an object recursively"""
    if current_depth >= max_depth:
        return "[Max Depth Reached]"
    
    if obj is None:
        return obj
    
    if not isinstance(obj, (dict, list)):
        return obj
    
    if isinstance(obj, list):
        return [
            sanitize_object(item, sensitive_keys, max_depth, current_depth + 1)
            for item in obj
        ]
    
    if isinstance(obj, dict):
        sanitized: Dict[str, Any] = {}
        keys = sensitive_keys or DEFAULT_SENSITIVE_KEYS
        
        for key, value in obj.items():
            if is_sensitive_key(key, keys):
                sanitized[key] = sanitize_value(value)
            elif isinstance(value, (dict, list)):
                sanitized[key] = sanitize_object(value, sensitive_keys, max_depth, current_depth + 1)
            else:
                sanitized[key] = value
        
        return sanitized
    
    return obj


def sanitize_error_event(event: Any) -> Any:
    """Sanitize error event data"""
    return sanitize_object(event)

