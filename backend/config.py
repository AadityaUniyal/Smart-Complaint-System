import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Use SQLite for easier setup - no PostgreSQL required
    DATABASE_URL = os.getenv(
        'DATABASE_URL', 
        'sqlite:///complaint_system.db'
    )
    
    # If PostgreSQL URL is provided, use it
    if os.getenv('DATABASE_URL') and 'postgresql' in os.getenv('DATABASE_URL', ''):
        DATABASE_URL = os.getenv('DATABASE_URL')
        
        # Fix for Neon PostgreSQL SSL issues
        if 'neon.tech' in DATABASE_URL:
            # Ensure proper SSL configuration for Neon
            if '?sslmode=' not in DATABASE_URL:
                DATABASE_URL += '?sslmode=require'
            if 'sslcert=' not in DATABASE_URL:
                DATABASE_URL += '&sslcert=server-ca.pem'
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Connection pool settings for better stability
    if 'postgresql' in DATABASE_URL:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_size': 5,
            'pool_recycle': 300,  # Recycle connections every 5 minutes
            'pool_pre_ping': True,  # Verify connections before use
            'pool_timeout': 20,
            'max_overflow': 10,
            'connect_args': {
                'connect_timeout': 10,
                'application_name': 'smart_complaint_system'
            }
        }
    else:
        # SQLite settings
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_pre_ping': True,
            'connect_args': {
                'check_same_thread': False,
                'timeout': 20
            }
        }
    
    # Security settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 3600  # 1 hour
    SESSION_COOKIE_SECURE = os.getenv('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = 'memory://'
    RATELIMIT_DEFAULT = "100 per hour"
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')