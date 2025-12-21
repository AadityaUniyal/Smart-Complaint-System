# Simplified Performance Monitoring Module
import time
from functools import wraps
from datetime import datetime
from collections import defaultdict, deque

class PerformanceMonitor:
    def __init__(self):
        self.request_times = deque(maxlen=1000)
        self.endpoint_stats = defaultdict(lambda: {'count': 0, 'total_time': 0, 'errors': 0})
        self.start_time = datetime.now()
        
    def record_request(self, endpoint, duration, error=False):
        """Record request performance"""
        self.request_times.append({
            'endpoint': endpoint,
            'duration': duration,
            'timestamp': datetime.now(),
            'error': error
        })
        
        self.endpoint_stats[endpoint]['count'] += 1
        self.endpoint_stats[endpoint]['total_time'] += duration
        if error:
            self.endpoint_stats[endpoint]['errors'] += 1
    
    def get_performance_stats(self):
        """Get performance statistics"""
        if not self.request_times:
            return {
                'total_requests': 0,
                'avg_response_time': 0,
                'error_rate': 0,
                'uptime_seconds': (datetime.now() - self.start_time).total_seconds()
            }
        
        total_requests = len(self.request_times)
        total_time = sum(req['duration'] for req in self.request_times)
        total_errors = sum(1 for req in self.request_times if req['error'])
        
        return {
            'total_requests': total_requests,
            'avg_response_time': round(total_time / total_requests, 3) if total_requests > 0 else 0,
            'error_rate': round((total_errors / total_requests) * 100, 2) if total_requests > 0 else 0,
            'uptime_seconds': (datetime.now() - self.start_time).total_seconds(),
            'endpoints': dict(self.endpoint_stats)
        }

# Global performance monitor
perf_monitor = PerformanceMonitor()

def monitor_performance(func):
    """Decorator to monitor endpoint performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        error = False
        
        try:
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            error = True
            raise
        finally:
            duration = time.time() - start_time
            endpoint = func.__name__
            perf_monitor.record_request(endpoint, duration, error)
    
    return wrapper

def cached_query(cache_key, timeout=300):
    """Simple in-memory cache decorator"""
    cache = {}
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{cache_key}:{hash(str(args) + str(kwargs))}"
            now = time.time()
            
            # Check if cached and not expired
            if key in cache:
                cached_time, cached_result = cache[key]
                if now - cached_time < timeout:
                    return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache[key] = (now, result)
            
            # Clean old cache entries
            expired_keys = [k for k, (t, _) in cache.items() if now - t > timeout]
            for k in expired_keys:
                del cache[k]
            
            return result
        return wrapper
    return decorator