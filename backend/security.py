# Simplified Security Module for Smart Complaint System
import hashlib
import hmac
import time
import re
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta

class SecurityManager:
    def __init__(self):
        self.failed_attempts = {}
        self.blocked_ips = {}
        
    def is_ip_blocked(self, ip):
        """Check if IP is temporarily blocked"""
        if ip in self.blocked_ips:
            if datetime.now() > self.blocked_ips[ip]:
                del self.blocked_ips[ip]
                return False
            return True
        return False
    
    def record_failed_attempt(self, ip, identifier):
        """Record failed login attempt"""
        key = f"{ip}:{identifier}"
        if key not in self.failed_attempts:
            self.failed_attempts[key] = []
        
        self.failed_attempts[key].append(datetime.now())
        
        # Clean old attempts (older than 1 hour)
        cutoff = datetime.now() - timedelta(hours=1)
        self.failed_attempts[key] = [
            attempt for attempt in self.failed_attempts[key] 
            if attempt > cutoff
        ]
        
        # Block if too many attempts (5 in 15 minutes)
        recent_attempts = [
            attempt for attempt in self.failed_attempts[key]
            if attempt > datetime.now() - timedelta(minutes=15)
        ]
        
        if len(recent_attempts) >= 5:
            self.blocked_ips[ip] = datetime.now() + timedelta(minutes=15)
            return True
        
        return False

# Global security manager
security_manager = SecurityManager()

# Validation rules
VALIDATION_RULES = {
    'student_registration': {
        'name': {'required': True, 'min_length': 2, 'max_length': 100},
        'email': {'required': True, 'pattern': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'},
        'phone': {'required': True, 'pattern': r'^\d{10,15}$'},
        'course_id': {'required': True, 'type': 'int'},
        'year': {'required': True, 'type': 'int', 'min': 1, 'max': 6},
        'semester': {'required': True, 'type': 'int', 'min': 1, 'max': 12}
    },
    'complaint_submission': {
        'title': {'required': True, 'min_length': 5, 'max_length': 200},
        'description': {'required': True, 'min_length': 10, 'max_length': 2000},
        'category_id': {'required': True, 'type': 'int'},
        'department_id': {'required': True, 'type': 'int'}
    }
}

def validate_request(rules):
    """Validate request data against rules"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON data provided'}), 400
            
            # Validate each field
            for field, rule in rules.items():
                value = data.get(field)
                
                # Check required fields
                if rule.get('required') and not value:
                    return jsonify({'error': f'{field} is required'}), 400
                
                if value is not None:
                    # Check type
                    if rule.get('type') == 'int':
                        try:
                            value = int(value)
                            data[field] = value
                        except (ValueError, TypeError):
                            return jsonify({'error': f'{field} must be an integer'}), 400
                    
                    # Check string length
                    if isinstance(value, str):
                        if rule.get('min_length') and len(value) < rule['min_length']:
                            return jsonify({'error': f'{field} must be at least {rule["min_length"]} characters'}), 400
                        if rule.get('max_length') and len(value) > rule['max_length']:
                            return jsonify({'error': f'{field} must be at most {rule["max_length"]} characters'}), 400
                    
                    # Check pattern
                    if rule.get('pattern') and isinstance(value, str):
                        if not re.match(rule['pattern'], value):
                            return jsonify({'error': f'{field} format is invalid'}), 400
                    
                    # Check numeric range
                    if isinstance(value, (int, float)):
                        if rule.get('min') and value < rule['min']:
                            return jsonify({'error': f'{field} must be at least {rule["min"]}'}), 400
                        if rule.get('max') and value > rule['max']:
                            return jsonify({'error': f'{field} must be at most {rule["max"]}'}), 400
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def rate_limit(max_attempts=5, window_minutes=15):
    """Rate limiting decorator"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            ip = request.remote_addr
            
            # Check if IP is blocked
            if security_manager.is_ip_blocked(ip):
                return jsonify({'error': 'Too many failed attempts. Please try again later.'}), 429
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

def security_headers(response):
    """Add security headers to response"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response