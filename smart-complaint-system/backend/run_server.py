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
    try:
        print("\n🚀 Starting Smart Complaint System Backend...")
        print("="*60)
        
        # Run optional Docker check
        maybe_run_docker_check()
        
        # Display connection info
        print("🌐 Server Information:")
        print(f"   📡 Backend API: http://localhost:5000")
        print(f"   📊 Health Check: http://localhost:5000/api/health")
        print(f"   🔗 Frontend: http://localhost:5173 (run separately)")
        print("")
        print("🎯 API Endpoints:")
        print("   • /api/register - Student registration")
        print("   • /api/login - User authentication")
        print("   • /api/complaints - Complaint management")
        print("   • /api/stats - System statistics")
        print("")
        print("🔐 Default Admin:")
        print("   📧 Email: admin@college.edu")
        print("   🔑 Password: admin123")
        print("")
        print("💡 Tips:")
        print("   • Use Ctrl+C to stop the server")
        print("   • Check logs for any database connection issues")
        print("   • Ensure frontend server is running on port 5173")
        print("="*60)
        print("🟢 Server starting...")
        
        # Start the Flask app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=os.getenv('FLASK_ENV') != 'production',
            use_reloader=False,  # Disable reloader to avoid env var issues
            threaded=True
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        print("💡 Check your database connection and environment variables")
        sys.exit(1)