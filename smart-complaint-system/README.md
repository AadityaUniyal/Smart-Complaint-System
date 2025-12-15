# 🎓 Smart Complaint System

A modern, real-time complaint management system for educational institutions with Netflix-inspired UI and comprehensive admin features.

![System Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-2.0+-red)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

### 👨‍🎓 For Students
- **Easy Registration**: Comprehensive student profile creation
- **Smart Complaint Submission**: Category-based complaint system with real-time validation
- **Personal Dashboard**: Track complaint status with live updates
- **Real-time Updates**: Auto-refresh every 10 seconds
- **Status Filtering**: Filter complaints by status (Pending, In Progress, Resolved)

### 👨‍💼 For Administrators
- **System Overview**: Complete dashboard with statistics and analytics
- **Advanced Search & Filtering**: Multi-criteria filtering and search functionality
- **Student Management**: View individual student profiles and complaint history
- **Quick Actions**: One-click access to pending, critical, and today's complaints
- **Data Export**: Export complaint data to CSV format
- **Real-time Management**: Update complaint status and priority with live sync
- **Administrative Comments**: Add notes and comments to complaints

## 🚀 Tech Stack

- **Backend**: Python Flask, SQLAlchemy, PostgreSQL (Neon Cloud)
- **Frontend**: Pure HTML5, CSS3, JavaScript (No frameworks)
- **Database**: PostgreSQL with CSV synchronization
- **UI/UX**: Netflix-inspired design with glass morphism effects
- **Real-time**: Auto-refresh and live data synchronization

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL database (or Neon Cloud account)
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-complaint-system
```

### 2. Backend Setup
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