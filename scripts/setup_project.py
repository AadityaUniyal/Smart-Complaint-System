#!/usr/bin/env python3
"""
Smart Complaint System - Project Setup Script
Automates the initial setup process for the project
"""

import os
import sys
import subprocess
import shutil
import platform
from pathlib import Path
import urllib.request
import json

class ProjectSetup:
    def __init__(self):
        self.project_root = Path.cwd()
        self.python_cmd = self.get_python_command()
        self.system = platform.system().lower()
        
    def get_python_command(self):
        """Determine the correct Python command"""
        for cmd in ['python3', 'python']:
            try:
                result = subprocess.run([cmd, '--version'], 
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    version = result.stdout.strip()
                    print(f"✅ Found Python: {version}")
                    return cmd
            except FileNotFoundError:
                continue
        
        print("❌ Python not found. Please install Python 3.11 or higher.")
        sys.exit(1)
    
    def check_system_requirements(self):
        """Check if system requirements are met"""
        print("🔍 Checking system requirements...")
        
        # Check Python version
        result = subprocess.run([self.python_cmd, '--version'], 
                              capture_output=True, text=True)
        version_str = result.stdout.strip().split()[1]
        version_parts = [int(x) for x in version_str.split('.')]
        
        if version_parts[0] < 3 or (version_parts[0] == 3 and version_parts[1] < 11):
            print(f"❌ Python {version_str} found. Python 3.11+ required.")
            return False
        
        print(f"✅ Python {version_str} meets requirements")
        
        # Check pip
        try:
            subprocess.run([self.python_cmd, '-m', 'pip', '--version'], 
                          check=True, capture_output=True)
            print("✅ pip is available")
        except subprocess.CalledProcessError:
            print("❌ pip not found. Please install pip.")
            return False
        
        # Check Git (optional but recommended)
        try:
            subprocess.run(['git', '--version'], 
                          check=True, capture_output=True)
            print("✅ Git is available")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️ Git not found. Version control features will be limited.")
        
        return True
    
    def create_virtual_environment(self):
        """Create Python virtual environment"""
        venv_path = self.project_root / '.venv'
        
        if venv_path.exists():
            print("✅ Virtual environment already exists")
            return True
        
        print("🔧 Creating virtual environment...")
        
        try:
            subprocess.run([self.python_cmd, '-m', 'venv', '.venv'], 
                          check=True, cwd=self.project_root)
            print("✅ Virtual environment created successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False
    
    def get_venv_python(self):
        """Get the Python executable from virtual environment"""
        if self.system == 'windows':
            return self.project_root / '.venv' / 'Scripts' / 'python.exe'
        else:
            return self.project_root / '.venv' / 'bin' / 'python'
    
    def install_dependencies(self):
        """Install Python dependencies"""
        requirements_file = self.project_root / 'backend' / 'requirements.txt'
        
        if not requirements_file.exists():
            print("❌ requirements.txt not found in backend directory")
            return False
        
        print("📦 Installing Python dependencies...")
        
        venv_python = self.get_venv_python()
        
        try:
            # Upgrade pip first
            subprocess.run([str(venv_python), '-m', 'pip', 'install', '--upgrade', 'pip'], 
                          check=True)
            
            # Install requirements
            subprocess.run([str(venv_python), '-m', 'pip', 'install', '-r', str(requirements_file)], 
                          check=True)
            
            print("✅ Dependencies installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return False
    
    def setup_environment_file(self):
        """Set up environment configuration file"""
        env_file = self.project_root / 'backend' / '.env'
        env_example = self.project_root / 'backend' / '.env.example'
        
        if env_file.exists():
            print("✅ Environment file already exists")
            return True
        
        if env_example.exists():
            print("🔧 Creating .env file from .env.example...")
            shutil.copy(env_example, env_file)
            print("✅ Environment file created")
            print("⚠️ Please update DATABASE_URL and SECRET_KEY in backend/.env")
            return True
        else:
            print("⚠️ .env.example not found. Creating basic .env file...")
            self.create_basic_env_file(env_file)
            return True
    
    def create_basic_env_file(self, env_file):
        """Create a basic .env file with default values"""
        content = """# Smart Complaint System Environment Configuration

# Database Configuration (UPDATE THIS!)
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartcomplaint

# Application Configuration (UPDATE THIS!)
SECRET_KEY=change-this-secret-key-in-production
FLASK_ENV=development
FLASK_DEBUG=1

# Security Configuration
JWT_SECRET_KEY=change-this-jwt-secret-key-too
BCRYPT_LOG_ROUNDS=12

# Optional: Email Configuration
# MAIL_SERVER=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USE_TLS=true
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
"""
        
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("✅ Basic .env file created")
    
    def create_directories(self):
        """Create necessary directories"""
        directories = [
            'logs',
            'uploads',
            'backups',
            'ssl'
        ]
        
        print("📁 Creating project directories...")
        
        for directory in directories:
            dir_path = self.project_root / directory
            dir_path.mkdir(exist_ok=True)
            
            # Create .gitkeep file to ensure directory is tracked by git
            gitkeep_file = dir_path / '.gitkeep'
            if not gitkeep_file.exists():
                gitkeep_file.touch()
        
        print("✅ Project directories created")
    
    def check_database_connection(self):
        """Check if database connection can be established"""
        print("🔍 Checking database connection...")
        
        venv_python = self.get_venv_python()
        
        # Create a simple test script
        test_script = """
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path.cwd() / 'backend'))

try:
    from dotenv import load_dotenv
    load_dotenv('backend/.env')
    
    from sqlalchemy import create_engine
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in .env file")
        sys.exit(1)
    
    engine = create_engine(database_url)
    with engine.connect() as conn:
        result = conn.execute('SELECT 1')
        print("✅ Database connection successful")
        
except ImportError as e:
    print(f"⚠️ Missing dependency: {e}")
    print("This is normal if you haven't set up the database yet")
except Exception as e:
    print(f"⚠️ Database connection failed: {e}")
    print("Please check your DATABASE_URL in backend/.env")
"""
        
        try:
            result = subprocess.run([str(venv_python), '-c', test_script], 
                                  capture_output=True, text=True, 
                                  cwd=self.project_root)
            print(result.stdout.strip())
            if result.stderr:
                print(result.stderr.strip())
        except Exception as e:
            print(f"⚠️ Could not test database connection: {e}")
    
    def initialize_database(self):
        """Initialize the database with sample data"""
        print("🗄️ Initializing database...")
        
        venv_python = self.get_venv_python()
        init_script = self.project_root / 'backend' / 'init_db.py'
        
        if not init_script.exists():
            print("⚠️ Database initialization script not found")
            return False
        
        try:
            subprocess.run([str(venv_python), str(init_script)], 
                          check=True, cwd=self.project_root)
            print("✅ Database initialized successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Database initialization failed: {e}")
            print("You may need to set up your database manually")
            return False
    
    def create_startup_scripts(self):
        """Ensure startup scripts are executable"""
        if self.system != 'windows':
            startup_script = self.project_root / 'start_project.sh'
            if startup_script.exists():
                os.chmod(startup_script, 0o755)
                print("✅ Startup script made executable")
    
    def display_next_steps(self):
        """Display next steps for the user"""
        print("\n" + "="*60)
        print("🎉 PROJECT SETUP COMPLETED!")
        print("="*60)
        
        print("\n📋 NEXT STEPS:")
        print("\n1. 🗄️ Database Setup:")
        print("   - Install PostgreSQL if not already installed")
        print("   - Create a database named 'smartcomplaint'")
        print("   - Update DATABASE_URL in backend/.env")
        
        print("\n2. 🔐 Security Setup:")
        print("   - Update SECRET_KEY in backend/.env")
        print("   - Update JWT_SECRET_KEY in backend/.env")
        print("   - Change default admin password after first login")
        
        print("\n3. 🚀 Start the Application:")
        if self.system == 'windows':
            print("   - Run: start_project.bat")
        else:
            print("   - Run: ./start_project.sh")
        print("   - Or use Docker: docker-compose up -d")
        
        print("\n4. 🌐 Access the Application:")
        print("   - Frontend: http://localhost:5173")
        print("   - Backend API: http://localhost:5000")
        print("   - Admin Login: admin@college.edu / admin123")
        
        print("\n5. 📚 Additional Resources:")
        print("   - Read README.md for detailed documentation")
        print("   - Check DOCKER.md for Docker deployment")
        print("   - Run tests: python -m pytest tests/")
        
        print("\n" + "="*60)
        print("Happy coding! 🚀")
        print("="*60)
    
    def run_setup(self):
        """Run the complete setup process"""
        print("🎓 Smart Complaint System - Project Setup")
        print("="*50)
        
        steps = [
            ("Checking system requirements", self.check_system_requirements),
            ("Creating virtual environment", self.create_virtual_environment),
            ("Installing dependencies", self.install_dependencies),
            ("Setting up environment file", self.setup_environment_file),
            ("Creating directories", self.create_directories),
            ("Creating startup scripts", self.create_startup_scripts),
            ("Checking database connection", self.check_database_connection),
        ]
        
        for step_name, step_func in steps:
            print(f"\n🔄 {step_name}...")
            try:
                result = step_func()
                if result is False:
                    print(f"⚠️ {step_name} completed with warnings")
            except Exception as e:
                print(f"❌ {step_name} failed: {e}")
                print("Setup will continue, but you may need to fix this manually")
        
        # Optional database initialization
        print(f"\n🔄 Database initialization (optional)...")
        try:
            self.initialize_database()
        except Exception as e:
            print(f"⚠️ Database initialization skipped: {e}")
        
        self.display_next_steps()

def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h']:
        print("Smart Complaint System - Project Setup Script")
        print("\nUsage: python setup_project.py")
        print("\nThis script will:")
        print("- Check system requirements")
        print("- Create virtual environment")
        print("- Install dependencies")
        print("- Set up configuration files")
        print("- Create necessary directories")
        print("- Initialize database (if possible)")
        return
    
    setup = ProjectSetup()
    setup.run_setup()

if __name__ == '__main__':
    main()