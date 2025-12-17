import os
from dotenv import load_dotenv
from flask import Flask
from models import db, User, Department, Course, ComplaintCategory, Complaint, Comment
from flask_bcrypt import Bcrypt
from datetime import datetime

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)

def init_database():
    """Initialize database with all tables"""
    with app.app_context():
        print("🗄️ Creating database tables...")
        
        # Drop all tables and recreate (for fresh start)
        db.drop_all()
        db.create_all()
        
        print("✅ Database tables created successfully!")
        
        # Create default admin
        admin = User(
            name='System Administrator',
            email='admin@college.edu',
            password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8'),
            role='admin',
            designation='System Administrator',
            department_id=1
        )
        db.session.add(admin)
        
        # Create sample departments
        departments_data = [
            {'name': 'Computer Science & Engineering', 'code': 'CSE', 'description': 'Software development and computer systems', 'head_name': 'Dr. Rajesh Kumar', 'email': 'cse.head@college.edu', 'phone': '+91-9876543210', 'location': 'Block A - 3rd Floor'},
            {'name': 'Electronics & Communication', 'code': 'ECE', 'description': 'Electronics and communication systems', 'head_name': 'Dr. Priya Sharma', 'email': 'ece.head@college.edu', 'phone': '+91-9876543211', 'location': 'Block B - 2nd Floor'},
            {'name': 'Mechanical Engineering', 'code': 'MECH', 'description': 'Mechanical systems and manufacturing', 'head_name': 'Dr. Amit Singh', 'email': 'mech.head@college.edu', 'phone': '+91-9876543212', 'location': 'Block C - 1st Floor'},
            {'name': 'Civil Engineering', 'code': 'CIVIL', 'description': 'Construction and infrastructure', 'head_name': 'Dr. Sunita Verma', 'email': 'civil.head@college.edu', 'phone': '+91-9876543213', 'location': 'Block D - Ground Floor'},
            {'name': 'Electrical Engineering', 'code': 'EEE', 'description': 'Electrical systems and power', 'head_name': 'Dr. Vikram Gupta', 'email': 'eee.head@college.edu', 'phone': '+91-9876543214', 'location': 'Block E - 2nd Floor'},
            {'name': 'Information Technology', 'code': 'IT', 'description': 'Information systems and networks', 'head_name': 'Dr. Neha Agarwal', 'email': 'it.head@college.edu', 'phone': '+91-9876543215', 'location': 'Block A - 2nd Floor'},
            {'name': 'Hostel Management', 'code': 'HOSTEL', 'description': 'Student accommodation services', 'head_name': 'Mr. Ravi Patel', 'email': 'hostel.warden@college.edu', 'phone': '+91-9876543216', 'location': 'Hostel Block'},
            {'name': 'Mess & Catering', 'code': 'MESS', 'description': 'Food and dining services', 'head_name': 'Mrs. Kavita Joshi', 'email': 'mess.manager@college.edu', 'phone': '+91-9876543217', 'location': 'Mess Building'},
        ]
        
        for dept_data in departments_data:
            dept = Department(**dept_data)
            db.session.add(dept)
        
        db.session.flush()  # Get department IDs
        
        # Create sample courses
        courses_data = [
            {'name': 'Bachelor of Technology in Computer Science', 'code': 'B.Tech CSE', 'duration_years': 4, 'department_id': 1, 'degree_type': 'Undergraduate'},
            {'name': 'Bachelor of Technology in Electronics & Communication', 'code': 'B.Tech ECE', 'duration_years': 4, 'department_id': 2, 'degree_type': 'Undergraduate'},
            {'name': 'Bachelor of Technology in Mechanical Engineering', 'code': 'B.Tech MECH', 'duration_years': 4, 'department_id': 3, 'degree_type': 'Undergraduate'},
            {'name': 'Bachelor of Technology in Civil Engineering', 'code': 'B.Tech CIVIL', 'duration_years': 4, 'department_id': 4, 'degree_type': 'Undergraduate'},
            {'name': 'Bachelor of Technology in Electrical Engineering', 'code': 'B.Tech EEE', 'duration_years': 4, 'department_id': 5, 'degree_type': 'Undergraduate'},
            {'name': 'Bachelor of Technology in Information Technology', 'code': 'B.Tech IT', 'duration_years': 4, 'department_id': 6, 'degree_type': 'Undergraduate'},
            {'name': 'Master of Technology in Computer Science', 'code': 'M.Tech CSE', 'duration_years': 2, 'department_id': 1, 'degree_type': 'Postgraduate'},
            {'name': 'Bachelor of Computer Applications', 'code': 'BCA', 'duration_years': 3, 'department_id': 6, 'degree_type': 'Undergraduate'},
        ]
        
        for course_data in courses_data:
            course = Course(**course_data)
            db.session.add(course)
        
        db.session.flush()  # Get course IDs
        
        # Create complaint categories
        categories_data = [
            {'name': 'Academic Issues', 'description': 'Course content and teaching related complaints', 'department_id': 1, 'priority_level': 'Medium', 'typical_resolution_days': 7},
            {'name': 'Lab Equipment', 'description': 'Computer lab and equipment issues', 'department_id': 1, 'priority_level': 'High', 'typical_resolution_days': 3},
            {'name': 'Hostel Accommodation', 'description': 'Room allocation and hostel facilities', 'department_id': 7, 'priority_level': 'High', 'typical_resolution_days': 5},
            {'name': 'Mess Food Quality', 'description': 'Food quality and dining services', 'department_id': 8, 'priority_level': 'Medium', 'typical_resolution_days': 2},
            {'name': 'Network & WiFi', 'description': 'Internet connectivity and network issues', 'department_id': 6, 'priority_level': 'High', 'typical_resolution_days': 2},
            {'name': 'Infrastructure', 'description': 'Building maintenance and facility issues', 'department_id': 4, 'priority_level': 'Medium', 'typical_resolution_days': 10},
            {'name': 'Examination Issues', 'description': 'Exam scheduling and evaluation concerns', 'department_id': 1, 'priority_level': 'High', 'typical_resolution_days': 10},
            {'name': 'Fee & Payment', 'description': 'Fee structure and payment related issues', 'department_id': 1, 'priority_level': 'Medium', 'typical_resolution_days': 7},
        ]
        
        for cat_data in categories_data:
            category = ComplaintCategory(**cat_data)
            db.session.add(category)
        
        db.session.commit()
        print("✅ Sample data created successfully!")
        print("🎉 Database initialization complete!")
        
        print("\n📊 Summary:")
        print(f"   • Departments: {Department.query.count()}")
        print(f"   • Courses: {Course.query.count()}")
        print(f"   • Categories: {ComplaintCategory.query.count()}")
        print(f"   • Admin Users: 1")
        
        print("\n🔑 Admin Credentials:")
        print("   • Email: admin@college.edu")
        print("   • Password: admin123")

if __name__ == '__main__':
    init_database()