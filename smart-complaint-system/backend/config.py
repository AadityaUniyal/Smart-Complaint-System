import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Database configuration using environment variables
    DATABASE_URL = os.getenv(
        'DATABASE_URL', 
        'postgresql://postgres:password@localhost:5432/complaint_db'
    )
    
    # Fix for Neon PostgreSQL SSL issues
    if DATABASE_URL and 'neon.tech' in DATABASE_URL:
        # Ensure proper SSL configuration for Neon
        if '?sslmode=' not in DATABASE_URL:
            DATABASE_URL += '?sslmode=require'
        if 'sslcert=' not in DATABASE_URL:
            DATABASE_URL += '&sslcert=server-ca.pem'
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Connection pool settings for better stability
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 300,  # Recycle connections every 5 minutes
        'pool_pre_ping': True,  # Verify connections before use
        'pool_timeout': 30,
        'max_overflow': 20,
        'connect_args': {
            'connect_timeout': 10,
            'application_name': 'smart_complaint_system'
        }
    }
    
    # Secret key for session management
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 3600  # 1 hour
