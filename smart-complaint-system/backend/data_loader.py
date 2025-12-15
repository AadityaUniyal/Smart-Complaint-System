import csv
import os
from datetime import datetime
from models import db, Department, Course, ComplaintCategory, User
from app import app

def load_departments():
    """Load departments from CSV file"""
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'departments.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Check if department already exists
            existing = Department.query.filter_by(code=row['code']).first()
            if not existing:
                department = Department(
                    name=row['name'],
                    code=row['code'],
                    description=row['description'],
                    head_name=row['head_name'],
                    email=row['email'],
                    phone=row['phone'],
                    location=row['location']
                )
                db.session.add(department)
    
    db.session.commit()
    print("✅ Departments loaded successfully!")

def load_courses():
    """Load courses from CSV file"""
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'courses.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Check if course already exists
            existing = Course.query.filter_by(code=row['code']).first()
            if not existing:
                course = Course(
                    name=row['name'],
                    code=row['code'],
                    duration_years=int(row['duration_years']),
                    department_id=int(row['department_id']),
                    degree_type=row['degree_type']
                )
                db.session.add(course)
    
    db.session.commit()
    print("✅ Courses loaded successfully!")

def load_complaint_categories():
    """Load complaint categories from CSV file"""
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'complaint_categories.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Check if category already exists
            existing = ComplaintCategory.query.filter_by(name=row['name']).first()
            if not existing:
                category = ComplaintCategory(
                    name=row['name'],
                    description=row['description'],
                    department_id=int(row['department_id']),
                    priority_level=row['priority_level'],
                    typical_resolution_days=int(row['typical_resolution_days'])
                )
                db.session.add(category)
    
    db.session.commit()
    print("✅ Complaint categories loaded successfully!")

def load_students():
    """Load students from CSV file"""
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'students.csv')
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Check if student already exists
            existing = User.query.filter_by(student_id=row['student_id']).first()
            if not existing:
                # Parse date of birth
                dob = None
                if row['date_of_birth']:
                    try:
                        dob = datetime.strptime(row['date_of_birth'], '%Y-%m-%d').date()
                    except:
                        pass
                
                student = User(
                    student_id=row['student_id'],
                    name=row['name'],
                    email=row['email'],
                    phone=row['phone'],
                    role='student',
                    course_id=int(row['course_id']) if row['course_id'] else None,
                    course_name=row['course_name'],
                    department_id=int(row['department_id']) if row['department_id'] else None,
                    department_name=row['department_name'],
                    year=int(row['year']) if row['year'] else None,
                    semester=int(row['semester']) if row['semester'] else None,
                    roll_number=row['roll_number'],
                    admission_year=int(row['admission_year']) if row['admission_year'] else None,
                    address=row['address'],
                    parent_name=row['parent_name'],
                    parent_phone=row['parent_phone'],
                    hostel_room=row['hostel_room'],
                    blood_group=row['blood_group'],
                    date_of_birth=dob,
                    gender=row['gender'],
                    category=row['category']
                )
                db.session.add(student)
    
    db.session.commit()
    print("✅ Students loaded successfully!")

def load_all_data():
    """Load all data from CSV files"""
    with app.app_context():
        print("🚀 Loading data from CSV files...")
        
        # Load in order due to foreign key dependencies
        load_departments()
        load_courses()
        load_complaint_categories()
        load_students()
        
        print("🎉 All data loaded successfully!")

if __name__ == '__main__':
    load_all_data()