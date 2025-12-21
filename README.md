# 🎓 Smart Complaint System - Enhanced Edition

A modern, real-time complaint management system for educational institutions with Netflix-inspired UI, comprehensive admin features, and enterprise-grade enhancements.

![System Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-2.0+-red)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![PWA](https://img.shields.io/badge/PWA-Enabled-purple)
![Real-time](https://img.shields.io/badge/Real--time-WebSocket-orange)

## 🆕 Latest Enhancements (v2.0)

### 🔒 **Enterprise Security**
- Advanced input validation and sanitization
- Rate limiting and IP blocking
- CSRF protection and security headers
- SQL injection prevention
- Password strength validation
- Session security enhancements

### ⚡ **Performance & Monitoring**
- Real-time performance tracking
- System resource monitoring (CPU, Memory, Disk)
- Database query optimization with caching
- Connection pool monitoring
- Automatic memory optimization
- Performance metrics dashboard

### 🔄 **Real-time Features**
- WebSocket-based live updates
- Instant complaint status notifications
- Real-time admin dashboard
- Live system metrics
- Background sync for offline actions
- Push notifications support

### 📱 **Progressive Web App (PWA)**
- Offline functionality with service worker
- App installation capability
- Background sync for offline submissions
- Push notifications
- Responsive design for all devices
- Native app-like experience

### 🎨 **Enhanced UI/UX**
- Multiple theme support (Netflix, Ocean, Forest, Sunset, Purple, Light)
- Advanced animations and transitions
- Accessibility improvements (WCAG 2.1 compliant)
- Keyboard shortcuts and navigation
- Enhanced form validation with real-time feedback
- Drag & drop file uploads

### 📊 **Advanced Analytics**
- Interactive charts and graphs (Chart.js)
- Real-time system metrics
- Complaint trend analysis
- Department performance tracking
- Resolution time analytics
- Export capabilities (CSV, PDF)

## ✨ Core Features

### 👨‍🎓 For Students
- **Smart Registration**: Comprehensive profile with validation
- **Intelligent Complaint System**: Category-based with auto-routing
- **Real-time Dashboard**: Live status updates and notifications
- **Offline Support**: Submit complaints even without internet
- **Mobile Optimized**: Perfect experience on all devices
- **Accessibility**: Screen reader support and keyboard navigation

### 👨‍💼 For Administrators
- **Advanced Dashboard**: Real-time analytics and system monitoring
- **Bulk Operations**: Mass update complaints and assignments
- **Smart Filtering**: Multi-criteria search with instant results
- **Performance Monitoring**: System health and resource usage
- **Data Export**: Comprehensive reporting and analytics
- **Real-time Alerts**: Instant notifications for critical issues
- **User Management**: Complete student and admin management

### 🔧 System Features
- **High Availability**: Automatic failover and recovery
- **Scalability**: Optimized for high concurrent users
- **Security**: Enterprise-grade security measures
- **Monitoring**: Comprehensive logging and alerting
- **Backup**: Automated data backup and recovery
- **API**: RESTful API with rate limiting

## 🚀 Tech Stack

### Backend
- **Framework**: Python Flask 2.3+ with extensions
- **Database**: PostgreSQL with connection pooling
- **ORM**: SQLAlchemy with query optimization
- **Real-time**: Socket.IO for WebSocket connections
- **Security**: Flask-Security, bcrypt, CSRF protection
- **Monitoring**: Custom performance and error tracking
- **Caching**: Redis for session and query caching

### Frontend
- **Core**: Pure HTML5, CSS3, JavaScript ES6+
- **Real-time**: Socket.IO client for live updates
- **Charts**: Chart.js for analytics visualization
- **PWA**: Service Worker with offline support
- **UI**: Netflix-inspired design with glass morphism
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Infrastructure
- **Database**: PostgreSQL (Neon Cloud compatible)
- **Deployment**: Docker with multi-stage builds
- **Reverse Proxy**: Nginx with SSL termination
- **Monitoring**: Built-in performance and health monitoring
- **Logging**: Structured logging with rotation

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL database (or Neon Cloud account)
- Redis (optional, for caching)
- Modern web browser with JavaScript enabled
- Node.js (optional, for development tools)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/AadityaUniyal/Smart-Complaint-System.git
cd Smart-Complaint-System
```

### 2. Environment Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Database Configuration
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit .env file with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/complaint_db
# SECRET_KEY=your-secret-key-here
# FLASK_ENV=development
```

### 4. Database Initialization
```bash
# Initialize database with sample data
cd backend
python init_db.py

# Or load from CSV files
python data_loader.py
```

### 5. Start the Application

#### Option A: Development Mode
```bash
# Start backend server
cd backend
python run_server.py

# Start frontend server (in another terminal)
cd frontend
python server.py
```

#### Option B: Docker (Recommended for Production)
```bash
# Build and start all services
docker-compose up --build

# For development with hot reload
docker-compose -f docker-compose.dev.yml up
```

#### Option C: Quick Start Script
```bash
# Windows
start_project.bat

# macOS/Linux
chmod +x start_project.sh
./start_project.sh
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000 (login as admin)

### 7. Default Credentials
```
Admin Login:
Email: admin@college.edu
Password: admin123

Student Registration:
Use the registration form to create student accounts
```
```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key_here
```

### 4. Initialize Database
```bash
python init_db.py
```

### 5. Start the Servers

**Backend Server:**
```bash
python run_server.py
```

**Frontend Server:**
```bash
cd ../frontend
python server.py
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔐 Default Credentials

### Admin Login
- **Email**: `admin@college.edu`
- **Password**: `admin123`

### Test Student IDs
- `21CSE001` (Rahul Kumar)
- `21CSE002` (Priya Sharma)
- `22CSE001` (Vikash Kumar)

## 📁 Project Structure

```
smart-complaint-system/
├── backend/                 # Flask backend application
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── config.py           # Configuration settings
│   ├── data_loader.py      # CSV data loader
│   ├── init_db.py          # Database initialization
│   ├── run_server.py       # Server startup script
│   └── requirements.txt    # Python dependencies
├── frontend/               # Pure HTML/CSS/JS frontend
│   ├── index.html          # Main HTML file
│   ├── script.js           # JavaScript functionality
│   ├── styles.css          # Main styles
│   ├── enhanced-styles.css # Additional styling
│   ├── enhanced-features.js# Enhanced features
│   └── server.py           # Frontend server
├── data/                   # CSV data files
│   ├── students.csv        # Student information
│   ├── student_complaints.csv # Complaint records
│   ├── departments.csv     # Department data
│   ├── courses.csv         # Course information
│   └── complaint_categories.csv # Complaint categories
├── scripts/                # Utility scripts
└── README.md              # This file
```

## 🎯 Key Features Explained

### Real-time Synchronization
- **CSV Integration**: All data is synchronized between database and CSV files
- **Live Updates**: Dashboard refreshes automatically (10s for students, 15s for admin)
- **Instant Feedback**: Changes reflect immediately across the system

### Advanced Admin Features
- **Multi-criteria Filtering**: Filter by status, priority, department, urgency, date
- **Student Profiles**: Complete view of individual student complaint history
- **Export Functionality**: Download complaint data as CSV
- **Quick Actions**: Fast access to critical and pending complaints

### User Experience
- **Netflix-style UI**: Modern, responsive design with smooth animations
- **Glass Morphism**: Contemporary visual effects and styling
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Real-time Validation**: Instant form validation with visual feedback

## 🔧 Configuration

### Database Configuration
The system supports both local PostgreSQL and cloud databases (Neon). Update the `DATABASE_URL` in your `.env` file accordingly.

### CSV Data Management
The system maintains CSV files for data persistence and easy data management. These files are automatically updated when changes are made through the web interface.

## 📊 API Endpoints

### Student Endpoints
- `POST /api/register` - Student registration
- `POST /api/login` - Student login
- `GET /api/student-complaints/{student_id}` - Get student complaints
- `POST /api/complaints` - Submit new complaint

### Admin Endpoints
- `GET /api/complaints` - Get all complaints
- `GET /api/all-student-complaints` - Get all complaints from CSV
- `PATCH /api/complaints/{id}/status` - Update complaint status
- `PATCH /api/complaints/{id}/priority` - Update complaint priority
- `POST /api/complaints/{id}/comments` - Add admin comment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Netflix for UI/UX inspiration
- Flask community for excellent documentation
- Contributors and testers

---

**Made for educational institutions**

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key-change-in-production
FLASK_ENV=production
WTF_CSRF_ENABLED=true

# Email Configuration (for alerts)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@smartcomplaint.com
ALERT_EMAIL=admin@yourschool.edu

# Performance
SQLALCHEMY_POOL_SIZE=10
SQLALCHEMY_POOL_RECYCLE=300
CACHE_TTL=300

# Features
ENABLE_REAL_TIME=true
ENABLE_PWA=true
ENABLE_NOTIFICATIONS=true
```

### Theme Configuration
The system supports multiple themes. Users can switch between:
- **Netflix** (Default): Dark theme with red accents
- **Ocean**: Blue gradient theme
- **Forest**: Green nature theme
- **Sunset**: Orange/red gradient theme
- **Purple**: Purple gradient theme
- **Light**: Light theme for accessibility

### Security Configuration
```python
# Additional security headers
SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

# Rate limiting
RATE_LIMITS = {
    'login': '5 per minute',
    'registration': '3 per minute',
    'api_calls': '100 per hour'
}
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Build Production Images**
```bash
# Build optimized production images
docker-compose -f docker-compose.yml build

# Start production services
docker-compose up -d
```

2. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

3. **Database Migration**
```bash
# Backup existing data
pg_dump complaint_db > backup.sql

# Run migrations
docker-compose exec backend python init_db.py

# Restore data if needed
psql complaint_db < backup.sql
```

### Cloud Deployment (Neon + Vercel)

1. **Database Setup (Neon)**
```bash
# Create Neon database
# Copy connection string to .env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/complaint_db?sslmode=require
```

2. **Frontend Deployment (Vercel)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

3. **Backend Deployment (Railway/Heroku)**
```bash
# Create Procfile
echo "web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app" > Procfile

# Deploy to Railway
railway login
railway init
railway up
```

### Performance Optimization

1. **Database Optimization**
```sql
-- Create indexes for better performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_users_student_id ON users(student_id);
```

2. **Caching Configuration**
```python
# Redis caching for frequent queries
CACHE_CONFIG = {
    'departments': 3600,  # 1 hour
    'courses': 3600,      # 1 hour
    'categories': 1800,   # 30 minutes
    'stats': 300          # 5 minutes
}
```

3. **CDN Setup**
```bash
# Use CDN for static assets
# Configure CloudFlare or AWS CloudFront
# Update asset URLs in templates
```

## 📊 Monitoring & Analytics

### Built-in Monitoring
The system includes comprehensive monitoring:

- **Performance Metrics**: Response times, throughput, error rates
- **System Health**: CPU, memory, disk usage
- **User Analytics**: Active users, complaint trends
- **Error Tracking**: Automatic error logging and alerting

### Health Check Endpoints
```bash
# System health
GET /api/health

# Performance metrics
GET /api/admin/performance

# Database status
GET /api/admin/db-status
```

### Log Analysis
```bash
# View application logs
docker-compose logs -f backend

# View access logs
docker-compose logs -f nginx

# Monitor real-time metrics
tail -f logs/performance.log
```

## 🔧 API Documentation

### Authentication Endpoints
```bash
# Student Registration
POST /api/register
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "course_id": 1,
  "year": 2,
  "semester": 3,
  "roll_number": "CS2021001"
}

# Admin Login
POST /api/login
Content-Type: application/json
{
  "login_type": "admin",
  "email": "admin@college.edu",
  "password": "admin123"
}

# Student Login
POST /api/login
Content-Type: application/json
{
  "login_type": "student",
  "student_id": "21CSE001"
}
```

### Complaint Management
```bash
# Submit Complaint
POST /api/complaints
Content-Type: application/json
{
  "title": "Lab Equipment Issue",
  "description": "Computer not working in lab 101",
  "category_id": 2,
  "department_id": 1,
  "urgency_level": 3
}

# Get Complaints
GET /api/complaints?user_id=123&status=Pending

# Update Complaint Status
PATCH /api/complaints/123/status
Content-Type: application/json
{
  "status": "In Progress",
  "admin_comment": "Assigned to technical team"
}
```

### Analytics Endpoints
```bash
# System Statistics
GET /api/stats

# Analytics Data
GET /api/analytics?days=30

# Export Data
GET /api/complaints/export
```

## 🧪 Testing

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run backend tests
cd backend
pytest tests/ -v --cov=.

# Run frontend tests (if using Jest)
cd frontend
npm test
```

### Load Testing
```bash
# Install locust
pip install locust

# Run load tests
locust -f tests/load_test.py --host=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write tests for new features
- Update documentation
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flask Community** for the excellent web framework
- **Chart.js** for beautiful data visualizations
- **Socket.IO** for real-time communication
- **Font Awesome** for icons
- **Google Fonts** for typography
- **Netflix** for UI/UX inspiration

## 📞 Support

For support and questions:
- 📧 Email: support@smartcomplaint.com
- 🐛 Issues: [GitHub Issues](https://github.com/AadityaUniyal/Smart-Complaint-System/issues)
- 📖 Documentation: [Wiki](https://github.com/AadityaUniyal/Smart-Complaint-System/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/AadityaUniyal/Smart-Complaint-System/discussions)

---

**Made with ❤️ for educational institutions worldwide**

*Empowering students and administrators with modern complaint management technology.*