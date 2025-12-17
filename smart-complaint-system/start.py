
import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def run_backend():
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    print("🚀 Starting Backend Server...")
    try:
        subprocess.run([sys.executable, "run_server.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Backend server error: {e}")

def run_frontend():
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(frontend_dir)
    
    print("🌐 Starting Frontend Server...")
    time.sleep(2)  # Wait for backend to start
    try:
        subprocess.run([sys.executable, "server.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
    except Exception as e:
        print(f"❌ Frontend server error: {e}")

def main():
    print("🎓 Smart Complaint System")
    print("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Start frontend in main thread
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down servers...")
        print("✅ Smart Complaint System stopped")

if __name__ == "__main__":
    main()