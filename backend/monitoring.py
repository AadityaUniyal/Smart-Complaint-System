# Real-time Monitoring and Analytics Module
import json
import time
from datetime import datetime, timedelta
from collections import defaultdict, deque
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room
import threading
import psutil
from models import db, Complaint, User, Department

class RealTimeMonitor:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.active_users = {}
        self.complaint_stats = {
            'total': 0,
            'pending': 0,
            'in_progress': 0,
            'resolved': 0,
            'today': 0
        }
        self.system_metrics = {
            'cpu': deque(maxlen=60),  # Last 60 minutes
            'memory': deque(maxlen=60),
            'active_users': deque(maxlen=60),
            'requests_per_minute': deque(maxlen=60)
        }
        self.department_stats = defaultdict(int)
        self.recent_activities = deque(maxlen=50)
        self.alerts = deque(maxlen=100)
        
        # Start background monitoring
        self.start_monitoring()
    
    def start_monitoring(self):
        """Start background monitoring threads"""
        # System metrics monitoring
        def monitor_system():
            while True:
                try:
                    now = datetime.now()
                    
                    # CPU and Memory
                    cpu_percent = psutil.cpu_percent(interval=1)
                    memory_percent = psutil.virtual_memory().percent
                    
                    self.system_metrics['cpu'].append({
                        'timestamp': now.isoformat(),
                        'value': cpu_percent
                    })
                    
                    self.system_metrics['memory'].append({
                        'timestamp': now.isoformat(),
                        'value': memory_percent
                    })
                    
                    self.system_metrics['active_users'].append({
                        'timestamp': now.isoformat(),
                        'value': len(self.active_users)
                    })
                    
                    # Emit system metrics to admin dashboard
                    if self.socketio:
                        self.socketio.emit('system_metrics', {
                            'cpu': cpu_percent,
                            'memory': memory_percent,
                            'active_users': len(self.active_users),
                            'timestamp': now.isoformat()
                        }, room='admin_dashboard')
                    
                    # Check for alerts
                    self.check_system_alerts(cpu_percent, memory_percent)
                    
                    time.sleep(60)  # Update every minute
                    
                except Exception as e:
                    print(f"System monitoring error: {e}")
                    time.sleep(60)
        
        # Complaint statistics monitoring
        def monitor_complaints():
            while True:
                try:
                    self.update_complaint_stats()
                    time.sleep(30)  # Update every 30 seconds
                except Exception as e:
                    print(f"Complaint monitoring error: {e}")
                    time.sleep(30)
        
        # Start threads
        system_thread = threading.Thread(target=monitor_system, daemon=True)
        complaint_thread = threading.Thread(target=monitor_complaints, daemon=True)
        
        system_thread.start()
        complaint_thread.start()
    
    def update_complaint_stats(self):
        """Update complaint statistics"""
        try:
            with db.session() as session:
                # Total complaints
                total = session.query(Complaint).count()
                
                # Status-wise counts
                pending = session.query(Complaint).filter_by(status='Pending').count()
                in_progress = session.query(Complaint).filter_by(status='In Progress').count()
                resolved = session.query(Complaint).filter_by(status='Resolved').count()
                
                # Today's complaints
                today = datetime.now().date()
                today_count = session.query(Complaint).filter(
                    db.func.date(Complaint.created_at) == today
                ).count()
                
                # Department-wise stats
                dept_stats = session.query(
                    Department.name,
                    db.func.count(Complaint.id)
                ).join(Complaint).group_by(Department.name).all()
                
                self.complaint_stats = {
                    'total': total,
                    'pending': pending,
                    'in_progress': in_progress,
                    'resolved': resolved,
                    'today': today_count,
                    'departments': dict(dept_stats)
                }
                
                # Emit to admin dashboard
                if self.socketio:
                    self.socketio.emit('complaint_stats', self.complaint_stats, room='admin_dashboard')
                
        except Exception as e:
            print(f"Error updating complaint stats: {e}")
    
    def check_system_alerts(self, cpu_percent, memory_percent):
        """Check for system alerts"""
        alerts = []
        
        # CPU alert
        if cpu_percent > 80:
            alerts.append({
                'type': 'warning',
                'message': f'High CPU usage: {cpu_percent:.1f}%',
                'timestamp': datetime.now().isoformat()
            })
        
        # Memory alert
        if memory_percent > 85:
            alerts.append({
                'type': 'warning',
                'message': f'High memory usage: {memory_percent:.1f}%',
                'timestamp': datetime.now().isoformat()
            })
        
        # Pending complaints alert
        if self.complaint_stats['pending'] > 50:
            alerts.append({
                'type': 'info',
                'message': f'High number of pending complaints: {self.complaint_stats["pending"]}',
                'timestamp': datetime.now().isoformat()
            })
        
        # Add alerts and emit
        for alert in alerts:
            self.alerts.append(alert)
            if self.socketio:
                self.socketio.emit('system_alert', alert, room='admin_dashboard')
    
    def add_user_activity(self, user_id, activity_type, details):
        """Add user activity to recent activities"""
        activity = {
            'user_id': user_id,
            'type': activity_type,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        
        self.recent_activities.append(activity)
        
        # Emit to admin dashboard
        if self.socketio:
            self.socketio.emit('user_activity', activity, room='admin_dashboard')
    
    def user_connected(self, user_id, user_type):
        """Handle user connection"""
        self.active_users[user_id] = {
            'type': user_type,
            'connected_at': datetime.now(),
            'last_activity': datetime.now()
        }
        
        self.add_user_activity(user_id, 'connected', f'{user_type} connected')
    
    def user_disconnected(self, user_id):
        """Handle user disconnection"""
        if user_id in self.active_users:
            user_type = self.active_users[user_id]['type']
            del self.active_users[user_id]
            self.add_user_activity(user_id, 'disconnected', f'{user_type} disconnected')
    
    def complaint_created(self, complaint_data):
        """Handle new complaint creation"""
        # Update stats
        self.complaint_stats['total'] += 1
        self.complaint_stats['pending'] += 1
        self.complaint_stats['today'] += 1
        
        # Add activity
        self.add_user_activity(
            complaint_data.get('student_id'),
            'complaint_created',
            f'New complaint: {complaint_data.get("title", "")}'
        )
        
        # Emit real-time notification
        if self.socketio:
            self.socketio.emit('new_complaint', {
                'id': complaint_data.get('id'),
                'title': complaint_data.get('title'),
                'department': complaint_data.get('department_name'),
                'priority': complaint_data.get('priority'),
                'timestamp': datetime.now().isoformat()
            }, room='admin_dashboard')
    
    def complaint_updated(self, complaint_data, old_status, new_status):
        """Handle complaint status update"""
        # Update stats
        if old_status == 'Pending':
            self.complaint_stats['pending'] -= 1
        elif old_status == 'In Progress':
            self.complaint_stats['in_progress'] -= 1
        elif old_status == 'Resolved':
            self.complaint_stats['resolved'] -= 1
        
        if new_status == 'Pending':
            self.complaint_stats['pending'] += 1
        elif new_status == 'In Progress':
            self.complaint_stats['in_progress'] += 1
        elif new_status == 'Resolved':
            self.complaint_stats['resolved'] += 1
        
        # Add activity
        self.add_user_activity(
            complaint_data.get('student_id'),
            'complaint_updated',
            f'Status changed from {old_status} to {new_status}'
        )
        
        # Emit real-time notification to student
        if self.socketio:
            self.socketio.emit('complaint_status_update', {
                'complaint_id': complaint_data.get('complaint_id'),
                'old_status': old_status,
                'new_status': new_status,
                'timestamp': datetime.now().isoformat()
            }, room=f"student_{complaint_data.get('student_id')}")
    
    def get_dashboard_data(self):
        """Get comprehensive dashboard data"""
        return {
            'complaint_stats': self.complaint_stats,
            'system_metrics': {
                'cpu': list(self.system_metrics['cpu'])[-10:],  # Last 10 minutes
                'memory': list(self.system_metrics['memory'])[-10:],
                'active_users': list(self.system_metrics['active_users'])[-10:]
            },
            'active_users': len(self.active_users),
            'recent_activities': list(self.recent_activities)[-20:],  # Last 20 activities
            'alerts': list(self.alerts)[-10:],  # Last 10 alerts
            'timestamp': datetime.now().isoformat()
        }
    
    def get_analytics_data(self, days=7):
        """Get analytics data for specified number of days"""
        try:
            with db.session() as session:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=days)
                
                # Daily complaint counts
                daily_complaints = session.query(
                    db.func.date(Complaint.created_at).label('date'),
                    db.func.count(Complaint.id).label('count')
                ).filter(
                    Complaint.created_at >= start_date
                ).group_by(
                    db.func.date(Complaint.created_at)
                ).all()
                
                # Status distribution
                status_distribution = session.query(
                    Complaint.status,
                    db.func.count(Complaint.id)
                ).group_by(Complaint.status).all()
                
                # Department distribution
                dept_distribution = session.query(
                    Department.name,
                    db.func.count(Complaint.id)
                ).join(Complaint).group_by(Department.name).all()
                
                # Priority distribution
                priority_distribution = session.query(
                    Complaint.priority,
                    db.func.count(Complaint.id)
                ).group_by(Complaint.priority).all()
                
                # Resolution time analysis
                resolved_complaints = session.query(
                    Complaint.created_at,
                    Complaint.resolved_at
                ).filter(
                    Complaint.status == 'Resolved',
                    Complaint.resolved_at.isnot(None)
                ).all()
                
                avg_resolution_time = 0
                if resolved_complaints:
                    total_time = sum([
                        (complaint.resolved_at - complaint.created_at).total_seconds()
                        for complaint in resolved_complaints
                    ])
                    avg_resolution_time = total_time / len(resolved_complaints) / 3600  # Convert to hours
                
                return {
                    'daily_complaints': [
                        {'date': str(item.date), 'count': item.count}
                        for item in daily_complaints
                    ],
                    'status_distribution': dict(status_distribution),
                    'department_distribution': dict(dept_distribution),
                    'priority_distribution': dict(priority_distribution),
                    'avg_resolution_time_hours': round(avg_resolution_time, 2),
                    'total_resolved': len(resolved_complaints),
                    'period_days': days
                }
                
        except Exception as e:
            print(f"Error getting analytics data: {e}")
            return {}

# Global monitor instance
monitor = RealTimeMonitor()

# WebSocket event handlers
def setup_socketio_events(socketio):
    """Setup WebSocket event handlers"""
    monitor.socketio = socketio
    
    @socketio.on('connect')
    def handle_connect():
        print(f'Client connected: {request.sid}')
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print(f'Client disconnected: {request.sid}')
    
    @socketio.on('join_admin_dashboard')
    def handle_join_admin(data):
        user_id = data.get('user_id')
        join_room('admin_dashboard')
        monitor.user_connected(user_id, 'admin')
        
        # Send initial dashboard data
        emit('dashboard_data', monitor.get_dashboard_data())
    
    @socketio.on('join_student_room')
    def handle_join_student(data):
        user_id = data.get('user_id')
        room = f"student_{user_id}"
        join_room(room)
        monitor.user_connected(user_id, 'student')
    
    @socketio.on('leave_admin_dashboard')
    def handle_leave_admin(data):
        user_id = data.get('user_id')
        leave_room('admin_dashboard')
        monitor.user_disconnected(user_id)
    
    @socketio.on('leave_student_room')
    def handle_leave_student(data):
        user_id = data.get('user_id')
        room = f"student_{user_id}"
        leave_room(room)
        monitor.user_disconnected(user_id)
    
    @socketio.on('request_analytics')
    def handle_analytics_request(data):
        days = data.get('days', 7)
        analytics_data = monitor.get_analytics_data(days)
        emit('analytics_data', analytics_data)
    
    @socketio.on('request_system_health')
    def handle_health_request():
        from error_handler import check_system_health
        health_data = check_system_health()
        emit('system_health', health_data)

# Notification system
class NotificationManager:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.notification_queue = deque(maxlen=1000)
    
    def send_notification(self, user_id, notification_type, title, message, data=None):
        """Send notification to specific user"""
        notification = {
            'id': f"{int(time.time())}_{user_id}",
            'type': notification_type,
            'title': title,
            'message': message,
            'data': data or {},
            'timestamp': datetime.now().isoformat(),
            'read': False
        }
        
        self.notification_queue.append(notification)
        
        if self.socketio:
            self.socketio.emit('notification', notification, room=f"student_{user_id}")
    
    def send_broadcast_notification(self, notification_type, title, message, room='admin_dashboard'):
        """Send broadcast notification to all users in room"""
        notification = {
            'id': f"broadcast_{int(time.time())}",
            'type': notification_type,
            'title': title,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        
        if self.socketio:
            self.socketio.emit('broadcast_notification', notification, room=room)
    
    def get_user_notifications(self, user_id, limit=20):
        """Get notifications for specific user"""
        user_notifications = [
            notif for notif in self.notification_queue
            if str(user_id) in notif['id']
        ]
        return user_notifications[-limit:]

# Global notification manager
notification_manager = NotificationManager()

# Performance tracking
class PerformanceTracker:
    def __init__(self):
        self.request_times = deque(maxlen=1000)
        self.endpoint_performance = defaultdict(list)
    
    def track_request(self, endpoint, duration, status_code):
        """Track request performance"""
        self.request_times.append({
            'endpoint': endpoint,
            'duration': duration,
            'status_code': status_code,
            'timestamp': datetime.now()
        })
        
        self.endpoint_performance[endpoint].append(duration)
        
        # Keep only last 100 requests per endpoint
        if len(self.endpoint_performance[endpoint]) > 100:
            self.endpoint_performance[endpoint] = self.endpoint_performance[endpoint][-100:]
    
    def get_performance_summary(self):
        """Get performance summary"""
        if not self.request_times:
            return {}
        
        recent_requests = [
            req for req in self.request_times
            if req['timestamp'] > datetime.now() - timedelta(minutes=5)
        ]
        
        if not recent_requests:
            return {}
        
        avg_response_time = sum(req['duration'] for req in recent_requests) / len(recent_requests)
        error_rate = sum(1 for req in recent_requests if req['status_code'] >= 400) / len(recent_requests)
        
        # Slowest endpoints
        slowest_endpoints = {}
        for endpoint, times in self.endpoint_performance.items():
            if times:
                slowest_endpoints[endpoint] = {
                    'avg_time': sum(times) / len(times),
                    'max_time': max(times),
                    'request_count': len(times)
                }
        
        return {
            'avg_response_time': round(avg_response_time, 3),
            'error_rate': round(error_rate * 100, 2),
            'requests_per_minute': len(recent_requests) * 12,  # Scale to per minute
            'slowest_endpoints': dict(sorted(
                slowest_endpoints.items(),
                key=lambda x: x[1]['avg_time'],
                reverse=True
            )[:5])
        }

# Global performance tracker
performance_tracker = PerformanceTracker()