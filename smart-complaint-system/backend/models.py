from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import uuid

db = SQLAlchemy()

class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(500))
    head_name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    location = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    courses = db.relationship('Course', backref='department', lazy=True)
    complaints = db.relationship('Complaint', backref='department', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'description': self.description,
            'head_name': self.head_name,
            'email': self.email,
            'phone': self.phone,
            'location': self.location
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    duration_years = db.Column(db.Integer, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    degree_type = db.Column(db.String(50), nullable=False)  # Undergraduate, Postgraduate, Diploma
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    students = db.relationship('User', backref='course_info', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'duration_years': self.duration_years,
            'department_id': self.department_id,
            'degree_type': self.degree_type,
            'department_name': self.department.name if self.department else None
        }

class ComplaintCategory(db.Model):
    __tablename__ = 'complaint_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    priority_level = db.Column(db.String(20), default='Medium')  # Low, Medium, High, Critical
    typical_resolution_days = db.Column(db.Integer, default=7)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    complaints = db.relationship('Complaint', backref='complaint_category', lazy=True)
    department = db.relationship('Department', backref='complaint_categories', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'priority_level': self.priority_level,
            'typical_resolution_days': self.typical_resolution_days
        }

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    unique_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Basic info
    student_id = db.Column(db.String(50), unique=True, nullable=True)  # Primary identifier for students
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'student' or 'admin'
    
    # Academic info (for students)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=True)
    course_name = db.Column(db.String(200), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    department_name = db.Column(db.String(100), nullable=True)
    year = db.Column(db.Integer, nullable=True)
    semester = db.Column(db.Integer, nullable=True)
    roll_number = db.Column(db.String(50), nullable=True)
    admission_year = db.Column(db.Integer, nullable=True)
    
    # Personal info
    address = db.Column(db.Text, nullable=True)
    parent_name = db.Column(db.String(100), nullable=True)
    parent_phone = db.Column(db.String(20), nullable=True)
    hostel_room = db.Column(db.String(20), nullable=True)
    blood_group = db.Column(db.String(10), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    category = db.Column(db.String(20), nullable=True)  # General, OBC, SC, ST
    
    # Admin-specific fields
    designation = db.Column(db.String(100), nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Only for admins
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    complaints = db.relationship('Complaint', backref='student', lazy=True, foreign_keys='Complaint.student_id')
    comments = db.relationship('Comment', backref='admin', lazy=True)

    @classmethod
    def find_by_student_id(cls, student_id):
        return cls.query.filter_by(student_id=student_id).first()

    def to_dict(self):
        return {
            'id': self.id,
            'unique_id': self.unique_id,
            'student_id': self.student_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'course_id': self.course_id,
            'course_name': self.course_name,
            'department_id': self.department_id,
            'department_name': self.department_name,
            'year': self.year,
            'semester': self.semester,
            'roll_number': self.roll_number,
            'admission_year': self.admission_year,
            'address': self.address,
            'parent_name': self.parent_name,
            'parent_phone': self.parent_phone,
            'hostel_room': self.hostel_room,
            'blood_group': self.blood_group,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'category': self.category,
            'designation': self.designation,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Complaint(db.Model):
    __tablename__ = 'complaints'
    
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(20), unique=True, nullable=False)  # Auto-generated complaint ID
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('complaint_categories.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')  # 'Pending', 'In Progress', 'Resolved', 'Rejected'
    priority = db.Column(db.String(20), nullable=False, default='Medium')  # 'Low', 'Medium', 'High', 'Critical'
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Additional fields
    urgency_level = db.Column(db.Integer, default=1)  # 1-5 scale
    expected_resolution_date = db.Column(db.DateTime)
    actual_resolution_date = db.Column(db.DateTime)
    satisfaction_rating = db.Column(db.Integer)  # 1-5 rating after resolution
    feedback = db.Column(db.Text)  # Student feedback after resolution
    
    # Tracking fields
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Admin assigned
    escalated = db.Column(db.Boolean, default=False)
    escalation_reason = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    comments = db.relationship('Comment', backref='complaint', lazy=True, cascade='all, delete-orphan')
    assigned_admin = db.relationship('User', foreign_keys=[assigned_to], backref='assigned_complaints')

    def generate_complaint_id(self):
        year = datetime.now().year
        month = datetime.now().month
        
        # Count complaints this month
        count = Complaint.query.filter(
            db.extract('year', Complaint.created_at) == year,
            db.extract('month', Complaint.created_at) == month
        ).count()
        
        return f"CMP{year}{month:02d}{count+1:04d}"

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'title': self.title,
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.complaint_category.name if self.complaint_category else None,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'status': self.status,
            'priority': self.priority,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'student_unique_id': self.student.student_id if self.student else None,
            'urgency_level': self.urgency_level,
            'expected_resolution_date': self.expected_resolution_date.isoformat() if self.expected_resolution_date else None,
            'actual_resolution_date': self.actual_resolution_date.isoformat() if self.actual_resolution_date else None,
            'satisfaction_rating': self.satisfaction_rating,
            'feedback': self.feedback,
            'assigned_to': self.assigned_to,
            'assigned_admin_name': self.assigned_admin.name if self.assigned_admin else None,
            'escalated': self.escalated,
            'escalation_reason': self.escalation_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    admin_name = db.Column(db.String(100), nullable=False)  # Denormalized for display
    text = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'admin_id': self.admin_id,
            'admin_name': self.admin_name,
            'text': self.text,
            'created_at': self.created_at.isoformat()
        }
