# Simplified Error Handling Module
import logging
import traceback
from datetime import datetime
from functools import wraps
from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError

class ErrorHandler:
    def __init__(self, app=None):
        self.app = app
        self.error_counts = {}
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize error handling for Flask app"""
        self.app = app
        
        # Register error handlers
        @app.errorhandler(400)
        def handle_bad_request(error):
            return jsonify({'error': 'Bad request'}), 400
        
        @app.errorhandler(401)
        def handle_unauthorized(error):
            return jsonify({'error': 'Unauthorized'}), 401
        
        @app.errorhandler(403)
        def handle_forbidden(error):
            return jsonify({'error': 'Forbidden'}), 403
        
        @app.errorhandler(404)
        def handle_not_found(error):
            return jsonify({'error': 'Not found'}), 404
        
        @app.errorhandler(500)
        def handle_internal_error(error):
            return jsonify({'error': 'Internal server error'}), 500

def validate_json_request(func):
    """Validate that request contains valid JSON"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        try:
            data = request.get_json()
            if data is None:
                return jsonify({'error': 'Invalid JSON data'}), 400
        except Exception as e:
            return jsonify({'error': 'Invalid JSON format'}), 400
        
        return func(*args, **kwargs)
    return wrapper

def handle_database_errors(func):
    """Handle database-related errors"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except IntegrityError as e:
            return jsonify({'error': 'Data integrity error', 'details': str(e)}), 400
        except OperationalError as e:
            return jsonify({'error': 'Database connection error', 'details': str(e)}), 500
        except SQLAlchemyError as e:
            return jsonify({'error': 'Database error', 'details': str(e)}), 500
        except Exception as e:
            return jsonify({'error': 'Unexpected error', 'details': str(e)}), 500
    return wrapper