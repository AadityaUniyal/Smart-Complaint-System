import http.server
import socketserver
import os
import sys

# Configuration
PORT = 5173
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Add security headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()
    
    def guess_type(self, path):
        # Enhanced MIME type detection
        result = super().guess_type(path)
        if isinstance(result, tuple):
            mimetype, encoding = result
        else:
            mimetype, encoding = result, None
            
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.json'):
            return 'application/json'
        return mimetype
    
    def log_message(self, format, *args):
        # Enhanced logging with timestamp
        if os.getenv('DEBUG'):
            import datetime
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"[{timestamp}] {format % args}")
        return

def main():
    try:
        with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
            print(f"🎬 Netflix-Style SmartComplaint Frontend")
            print(f"{'='*50}")
            print(f"🚀 Server running at:")
            print(f"   📱 Local:    http://localhost:{PORT}")
            print(f"   🌐 Network:  http://0.0.0.0:{PORT}")
            print(f"")
            print(f"📁 Serving: {DIRECTORY}")
            print(f"🔗 Backend:  http://localhost:5000 (must be running)")
            print(f"")
            print(f"✨ Features:")
            print(f"   • Pure HTML/CSS/JS (No React/Vite)")
            print(f"   • Netflix-style animations")
            print(f"   • Optimized performance")
            print(f"   • Mobile responsive")
            print(f"")
            print(f"Press Ctrl+C to stop")
            print(f"{'='*50}")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:
            print(f"❌ Port {PORT} is already in use!")
            print(f"   Stop the existing server first")
        else:
            print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()