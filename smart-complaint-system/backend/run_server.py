#!/usr/bin/env python3
"""
Simple server runner that ensures environment variables are loaded properly
"""
import os
from dotenv import load_dotenv
import subprocess
import sys

# Load environment variables first
load_dotenv()

print("Environment variables loaded:")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')[:50]}...")
print(f"SECRET_KEY: {os.getenv('SECRET_KEY')}")

# Import and run the app after loading env vars
from app import app


def maybe_run_docker_check():
    """If `CHECK_DOCKER_ON_START` is set, run the docker check script and abort on failure."""
    if os.getenv("CHECK_DOCKER_ON_START") not in ("1", "true", "True"):
        return

    script = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scripts", "check_docker.py")
    if not os.path.exists(script):
        print("Docker check requested, but scripts/check_docker.py not found.")
        return

    print("Running Docker pre-check...")
    res = subprocess.run([sys.executable, script])
    if res.returncode != 0:
        print("Docker pre-check failed. Aborting server start.")
        sys.exit(res.returncode)

if __name__ == '__main__':
    print("\n🚀 Starting Smart Complaint System Backend...")
    maybe_run_docker_check()
    print("📊 Dashboard URLs:")
    print("   Student: http://localhost:3000/student")
    print("   Admin:   http://localhost:3000/admin")
    print("🔗 API Base: http://localhost:5000/api")
    print("\n" + "="*50)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False  # Disable reloader to avoid env var issues
    )