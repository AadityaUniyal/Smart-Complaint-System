from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from models import db, User, Complaint, Comment, Department, Course, ComplaintCategory
from config import Config
import joblib
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import uuid
import time
from sqlalchemy.exc import OperationalError, DisconnectionError
from functools import wraps
import csv
import pandas as pd

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, supports_credentials=True)
db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Database retry decorator
def retry_db_operation(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except (OperationalError, DisconnectionError) as e:
                    if attempt == max_retries - 1:
                        print(f"Database operation failed after {max_retries} attempts: {e}")
                        # Try to reconnect
                        try:
                            db.session.remove()
                            db.engine.dispose()
                        except:
                            pass
                        raise e
                    print(f"Database connection lost, retrying in {delay} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    delay *= 2  # Exponential backoff
            return func(*args, **kwargs)
        return wrapper
    return decorator

# CSV Helper Functions
def save_student_to_csv(user):
    """Save new student registration to students.csv"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../data/students.csv')
        
        # Prepare student data
        student_data = {
            'student_id': user.student_id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'course_id': user.course_id,
            'course_name': user.course_name,
            'department_id': user.department_id,
            'department_name': user.department_name,
            'year': user.year,
            'semester': user.semester,
            'roll_number': user.roll_number,
            'admission_year': user.admission_year,
            'address': user.address,
            'parent_name': user.parent_name,
            'parent_phone': user.parent_phone,
            'hostel_room': user.hostel_room or '',
            'blood_group': user.blood_group or '',
            'date_of_birth': user.date_of_birth.strftime('%Y-%m-%d') if user.date_of_birth else '',
            'gender': user.gender,
            'category': user.category
        }
        
        # Check if file exists and has data
        file_exists = os.path.exists(csv_path)
        
        with open(csv_path, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = list(student_data.keys())
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header if file is new or empty
            if not file_exists or os.path.getsize(csv_path) == 0:
                writer.writeheader()
            
            writer.writerow(student_data)
        
        print(f"✅ Student {user.name} ({user.student_id}) saved to CSV")
        
    except Exception as e:
        print(f"❌ Error saving student to CSV: {e}")

def save_complaint_to_csv(complaint, student_name):
    """Save new complaint to student_complaints.csv"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../data/student_complaints.csv')
        
        # Prepare complaint data
        complaint_data = {
            'complaint_id': complaint.complaint_id,
            'student_id': complaint.student.student_id if complaint.student else '',
            'student_name': student_name,
            'title': complaint.title,
            'description': complaint.description,
            'category': complaint.category.name if complaint.category else '',
            'department': complaint.department.name if complaint.department else '',
            'status': complaint.status,
            'priority': complaint.priority,
            'urgency_level': complaint.urgency_level,
            'created_at': complaint.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': complaint.updated_at.strftime('%Y-%m-%d %H:%M:%S') if complaint.updated_at else '',
            'resolved_at': complaint.resolved_at.strftime('%Y-%m-%d %H:%M:%S') if complaint.resolved_at else '',
            'admin_comments': ''
        }
        
        # Check if file exists and has data
        file_exists = os.path.exists(csv_path)
        
        with open(csv_path, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = list(complaint_data.keys())
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header if file is new or empty
            if not file_exists or os.path.getsize(csv_path) == 0:
                writer.writeheader()
            
            writer.writerow(complaint_data)
        
        print(f"✅ Complaint {complaint.complaint_id} saved to CSV")
        
    except Exception as e:
        print(f"❌ Error saving complaint to CSV: {e}")

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Load ML model
try:
    # Adjust path to point to ml folder relative to backend
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml/complaint_classifier.pkl'))
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print(f"ML Model loaded successfully from {model_path}")
    else:
        print(f"Model file not found at {model_path}")
        model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@retry_db_operation(max_retries=5, delay=2)
def init_db():
    """Initialize database and create all tables with retry logic"""
    with app.app_context():
        try:
            # Test connection first
            with db.engine.connect() as conn:
                conn.execute(db.text('SELECT 1'))
            db.create_all()
            print("✅ Database tables created successfully.")
            return True
        except Exception as e:
            print(f"❌ Error creating database tables: {e}")
            # Try to dispose and recreate engine
            try:
                db.session.remove()
                db.engine.dispose()
            except:
                pass
            raise e

# Initialize database on startup
init_db()

# Create default admin user and load data
def create_default_admin():
    with app.app_context():
        # Check if admin exists
        admin = User.query.filter_by(email='admin@college.edu').first()
        if not admin:
            admin = User(
                name='System Administrator',
                email='admin@college.edu',
                password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
                role='admin',
                designation='System Administrator',
                department_id=1  # CSE department
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Default admin created")

def load_initial_data():
    """Load initial data from CSV files"""
    try:
        from data_loader import load_all_data
        load_all_data()
    except Exception as e:
        print(f"⚠️ Could not load CSV data: {e}")
        print("📝 Make sure CSV files exist in the data/ directory")

create_default_admin()
load_initial_data()

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if user exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Parse date of birth
    dob = None
    if data.get('date_of_birth'):
        try:
            dob = datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date()
        except:
            pass
    
    # Generate unique student ID
    course = Course.query.get(data.get('course_id'))
    if course:
        year_suffix = str(data.get('admission_year', datetime.now().year))[-2:]
        course_code = course.code.replace(' ', '').replace('.', '').upper()
        
        # Count existing students in same course and year
        count = User.query.filter_by(
            course_id=data.get('course_id'),
            admission_year=data.get('admission_year'),
            role='student'
        ).count()
        
        student_id = f"{year_suffix}{course_code}{count+1:03d}"
    else:
        student_id = f"STU{datetime.now().year}{User.query.filter_by(role='student').count()+1:04d}"
    
    # Create new student
    user = User(
        student_id=student_id,
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        role='student',
        course_id=data.get('course_id'),
        course_name=course.name if course else None,
        department_id=data.get('department_id'),
        department_name=course.department.name if course and course.department else None,
        year=data.get('year'),
        semester=data.get('semester'),
        roll_number=data.get('roll_number'),
        admission_year=data.get('admission_year'),
        address=data.get('address'),
        parent_name=data.get('parent_name'),
        parent_phone=data.get('parent_phone'),
        hostel_room=data.get('hostel_room'),
        blood_group=data.get('blood_group'),
        date_of_birth=dob,
        gender=data.get('gender'),
        category=data.get('category')
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Also save to CSV file
    save_student_to_csv(user)
    
    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    login_type = data.get('login_type', 'student')  # 'student' or 'admin'
    
    if login_type == 'student':
        # Student login with student ID
        student_id = data.get('student_id')
        if not student_id:
            return jsonify({'error': 'Student ID is required'}), 400
        
        user = User.find_by_student_id(student_id)
        if not user:
            return jsonify({'error': 'Student ID not found. Please contact administration.'}), 404
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        login_user(user)
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
    
    else:
        # Admin login with email and password
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email, role='admin').first()
        
        if user and user.password_hash and bcrypt.check_password_hash(user.password_hash, password):
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            login_user(user)
            return jsonify({
                'message': 'Login successful',
                'user': user.to_dict()
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify(current_user.to_dict())

# Complaint Routes
@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    category_id = data.get('category_id')
    department_id = data.get('department_id')
    user_id = data.get('user_id')
    urgency_level = data.get('urgency_level', 1)
    
    if not title or not description:
        return jsonify({'error': 'Title and description are required'}), 400
    
    if not category_id or not department_id:
        return jsonify({'error': 'Category and department are required'}), 400
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    
    # Get user info
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get category info for priority
    category = ComplaintCategory.query.get(category_id)
    priority = category.priority_level if category else 'Medium'
    
    # Calculate expected resolution date
    resolution_days = category.typical_resolution_days if category else 7
    expected_date = datetime.utcnow() + timedelta(days=resolution_days)

    # Create complaint
    complaint = Complaint(
        title=title,
        description=description,
        category_id=category_id,
        department_id=department_id,
        student_id=user_id,
        priority=priority,
        urgency_level=urgency_level,
        expected_resolution_date=expected_date
    )
    
    # Generate complaint ID
    complaint.complaint_id = complaint.generate_complaint_id()
    
    db.session.add(complaint)
    db.session.commit()
    
    # Also save to CSV file
    save_complaint_to_csv(complaint, user.name)
    
    return jsonify(complaint.to_dict()), 201

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    user_id = request.args.get('user_id')
    if user_id:
        complaints = Complaint.query.filter_by(student_id=user_id).order_by(Complaint.created_at.desc()).all()
    else:
        complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    return jsonify([c.to_dict() for c in complaints])

@app.route('/api/complaints/<int:id>/status', methods=['PATCH'])
def update_status(id):
    data = request.json
    status = data.get('status')
    complaint = Complaint.query.get_or_404(id)
    complaint.status = status
    
    if status == 'Resolved':
        complaint.resolved_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(complaint.to_dict())

@app.route('/api/complaints/<int:id>/priority', methods=['PATCH'])
def update_priority(id):
    data = request.json
    priority = data.get('priority')
    complaint = Complaint.query.get_or_404(id)
    complaint.priority = priority
    db.session.commit()
    return jsonify(complaint.to_dict())

# Comment Routes
@app.route('/api/complaints/<int:complaint_id>/comments', methods=['POST'])
def add_comment(complaint_id):
    data = request.json
    admin_id = data.get('admin_id')
    text = data.get('text')
    
    if not admin_id or not text:
        return jsonify({'error': 'Admin ID and text required'}), 400
    
    admin = User.query.get(admin_id)
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Invalid admin'}), 403
    
    comment = Comment(
        complaint_id=complaint_id,
        admin_id=admin_id,
        admin_name=admin.name,
        text=text
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@app.route('/api/complaints/<int:complaint_id>/comments', methods=['GET'])
def get_comments(complaint_id):
    comments = Comment.query.filter_by(complaint_id=complaint_id).order_by(Comment.created_at.asc()).all()
    return jsonify([c.to_dict() for c in comments])

# Department Routes
@app.route('/api/departments', methods=['GET'])
@retry_db_operation(max_retries=3, delay=1)
def get_departments():
    try:
        departments = Department.query.all()
        return jsonify([dept.to_dict() for dept in departments])
    except Exception as e:
        print(f"Error fetching departments: {e}")
        return jsonify({'error': 'Failed to fetch departments', 'details': str(e)}), 500

@app.route('/api/departments/<int:dept_id>/categories', methods=['GET'])
def get_department_categories(dept_id):
    categories = ComplaintCategory.query.filter_by(department_id=dept_id).all()
    return jsonify([cat.to_dict() for cat in categories])

# Course Routes
@app.route('/api/courses', methods=['GET'])
@retry_db_operation(max_retries=3, delay=1)
def get_courses():
    try:
        courses = Course.query.all()
        return jsonify([course.to_dict() for course in courses])
    except Exception as e:
        print(f"Error fetching courses: {e}")
        return jsonify({'error': 'Failed to fetch courses', 'details': str(e)}), 500

@app.route('/api/courses/<int:dept_id>', methods=['GET'])
def get_courses_by_department(dept_id):
    courses = Course.query.filter_by(department_id=dept_id).all()
    return jsonify([course.to_dict() for course in courses])

# Complaint Category Routes
@app.route('/api/complaint-categories', methods=['GET'])
@retry_db_operation(max_retries=3, delay=1)
def get_complaint_categories():
    try:
        categories = ComplaintCategory.query.all()
        return jsonify([cat.to_dict() for cat in categories])
    except Exception as e:
        print(f"Error fetching complaint categories: {e}")
        return jsonify({'error': 'Failed to fetch complaint categories', 'details': str(e)}), 500

# Student Routes
@app.route('/api/student/<student_id>', methods=['GET'])
def get_student_info(student_id):
    student = User.find_by_student_id(student_id)
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    return jsonify(student.to_dict())

# Student Complaints CSV Routes
@app.route('/api/student-complaints/<student_id>', methods=['GET'])
@retry_db_operation(max_retries=3, delay=1)
def get_student_complaints_from_csv(student_id):
    """Get student complaints from CSV file"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../data/student_complaints.csv')
        
        if not os.path.exists(csv_path):
            return jsonify([]), 200
        
        # Read CSV file
        df = pd.read_csv(csv_path)
        
        # Filter by student ID
        student_complaints = df[df['student_id'] == student_id]
        
        # Convert to list of dictionaries
        complaints_list = student_complaints.to_dict('records')
        
        return jsonify(complaints_list), 200
        
    except Exception as e:
        print(f"Error reading student complaints CSV: {e}")
        return jsonify({'error': 'Failed to fetch student complaints', 'details': str(e)}), 500

@app.route('/api/all-student-complaints', methods=['GET'])
@retry_db_operation(max_retries=3, delay=1)
def get_all_student_complaints_from_csv():
    """Get all student complaints from CSV file for admin dashboard"""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../data/student_complaints.csv')
        
        if not os.path.exists(csv_path):
            return jsonify([]), 200
        
        # Read CSV file
        df = pd.read_csv(csv_path)
        
        # Convert to list of dictionaries
        complaints_list = df.to_dict('records')
        
        return jsonify(complaints_list), 200
        
    except Exception as e:
        print(f"Error reading all student complaints CSV: {e}")
        return jsonify({'error': 'Failed to fetch all student complaints', 'details': str(e)}), 500

# Statistics Routes
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_complaints = Complaint.query.count()
    pending = Complaint.query.filter_by(status='Pending').count()
    resolved = Complaint.query.filter_by(status='Resolved').count()
    in_progress = Complaint.query.filter_by(status='In Progress').count()
    
    # Department-wise breakdown
    dept_stats = db.session.query(
        Department.name, 
        db.func.count(Complaint.id)
    ).join(Complaint).group_by(Department.name).all()
    
    # Category breakdown
    category_stats = db.session.query(
        ComplaintCategory.name, 
        db.func.count(Complaint.id)
    ).join(Complaint).group_by(ComplaintCategory.name).all()
    
    return jsonify({
        'total': total_complaints,
        'pending': pending,
        'resolved': resolved,
        'in_progress': in_progress,
        'departments': dict(dept_stats),
        'categories': dict(category_stats)
    })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        db.session.execute(db.text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
