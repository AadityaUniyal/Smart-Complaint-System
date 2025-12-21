// Real-time Updates System for Smart Complaint System
// Provides live updates for complaint status changes and new submissions

class RealTimeUpdates {
    constructor() {
        this.isActive = false;
        this.pollInterval = null;
        this.lastUpdateTime = new Date();
        this.updateCallbacks = new Map();
        this.notificationQueue = [];
        this.maxNotifications = 5;
        
        this.init();
    }
    
    init() {
        console.log('🔄 Initializing real-time updates system...');
        this.setupUpdateIndicator();
        this.setupNotificationSystem();
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.showUpdateIndicator('updating');
        
        // Start polling every 30 seconds
        this.pollInterval = setInterval(() => {
            this.checkForUpdates();
        }, 30000);
        
        console.log('✅ Real-time updates started');
        this.showNotification('🔄 Live updates enabled', 'info');
    }
    
    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.hideUpdateIndicator();
        
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        
        console.log('⏹️ Real-time updates stopped');
    }
    
    async checkForUpdates() {
        if (!this.isActive) return;
        
        try {
            this.showUpdateIndicator('updating');
            
            // Check for new complaints
            const response = await fetch(`${API_BASE}/all-student-complaints`);
            if (response.ok) {
                const complaints = await response.json();
                this.processUpdates(complaints);
                this.showUpdateIndicator('updated');
                
                // Hide indicator after 2 seconds
                setTimeout(() => {
                    if (this.isActive) {
                        this.hideUpdateIndicator();
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Update check failed:', error);
            this.showUpdateIndicator('paused');
        }
    }
    
    processUpdates(newComplaints) {
        // Compare with cached data to find changes
        const cachedComplaints = this.getCachedComplaints();
        
        if (cachedComplaints.length === 0) {
            // First load, just cache the data
            this.setCachedComplaints(newComplaints);
            return;
        }
        
        // Find new complaints
        const newComplaintIds = new Set(newComplaints.map(c => c.complaint_id));
        const cachedComplaintIds = new Set(cachedComplaints.map(c => c.complaint_id));
        
        const addedComplaints = newComplaints.filter(c => !cachedComplaintIds.has(c.complaint_id));
        
        // Find status changes
        const statusChanges = [];
        newComplaints.forEach(newComplaint => {
            const cachedComplaint = cachedComplaints.find(c => c.complaint_id === newComplaint.complaint_id);
            if (cachedComplaint && cachedComplaint.status !== newComplaint.status) {
                statusChanges.push({
                    complaint_id: newComplaint.complaint_id,
                    title: newComplaint.title,
                    oldStatus: cachedComplaint.status,
                    newStatus: newComplaint.status,
                    student_name: newComplaint.student_name
                });
            }
        });
        
        // Show notifications for changes
        if (addedComplaints.length > 0) {
            this.showNotification(
                `📝 ${addedComplaints.length} new complaint${addedComplaints.length > 1 ? 's' : ''} submitted`,
                'info'
            );
        }
        
        statusChanges.forEach(change => {
            const statusEmoji = this.getStatusEmoji(change.newStatus);
            this.showNotification(
                `${statusEmoji} ${change.title} - Status: ${change.newStatus}`,
                'success'
            );
        });
        
        // Update cached data
        this.setCachedComplaints(newComplaints);
        
        // Trigger callbacks for UI updates
        this.triggerUpdateCallbacks({
            newComplaints: addedComplaints,
            statusChanges: statusChanges,
            totalComplaints: newComplaints.length
        });
    }
    
    getStatusEmoji(status) {
        const emojis = {
            'Pending': '⏳',
            'In Progress': '🔄',
            'Resolved': '✅',
            'Closed': '🔒'
        };
        return emojis[status] || '📋';
    }
    
    getCachedComplaints() {
        const cached = localStorage.getItem('cached_complaints');
        return cached ? JSON.parse(cached) : [];
    }
    
    setCachedComplaints(complaints) {
        localStorage.setItem('cached_complaints', JSON.stringify(complaints));
    }
    
    setupUpdateIndicator() {
        // Create real-time indicator
        const indicator = document.createElement('div');
        indicator.id = 'realtime-indicator';
        indicator.className = 'real-time-indicator';
        indicator.innerHTML = '🔄 Live';
        document.body.appendChild(indicator);
    }
    
    showUpdateIndicator(state) {
        const indicator = document.getElementById('realtime-indicator');
        if (!indicator) return;
        
        indicator.className = `real-time-indicator ${state}`;
        
        const states = {
            'updating': '🔄 Updating...',
            'updated': '✅ Updated',
            'paused': '⏸️ Paused'
        };
        
        indicator.textContent = states[state] || '🔄 Live';
        indicator.style.display = 'block';
    }
    
    hideUpdateIndicator() {
        const indicator = document.getElementById('realtime-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('live-notifications')) {
            const container = document.createElement('div');
            container.id = 'live-notifications';
            container.className = 'live-notifications-container';
            document.body.appendChild(container);
        }
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('live-notifications');
        if (!container) return;
        
        // Remove oldest notification if queue is full
        if (this.notificationQueue.length >= this.maxNotifications) {
            const oldest = this.notificationQueue.shift();
            if (oldest && oldest.element && oldest.element.parentNode) {
                oldest.element.remove();
            }
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `live-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Add to queue
        const notificationObj = {
            element: notification,
            timestamp: new Date()
        };
        this.notificationQueue.push(notificationObj);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
            
            // Remove from queue
            const index = this.notificationQueue.indexOf(notificationObj);
            if (index > -1) {
                this.notificationQueue.splice(index, 1);
            }
        }, duration);
    }
    
    // Callback system for UI updates
    onUpdate(callback) {
        const id = Date.now() + Math.random();
        this.updateCallbacks.set(id, callback);
        return id;
    }
    
    offUpdate(id) {
        this.updateCallbacks.delete(id);
    }
    
    triggerUpdateCallbacks(data) {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('❌ Update callback error:', error);
            }
        });
    }
    
    // Manual refresh trigger
    async forceUpdate() {
        this.showNotification('🔄 Refreshing data...', 'info', 2000);
        await this.checkForUpdates();
    }
}

// Global instance
window.realTimeUpdates = new RealTimeUpdates();

// Auto-start when user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Start real-time updates when dashboard is visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const dashboard = document.getElementById('student-dashboard') || document.getElementById('admin-dashboard');
                if (dashboard && !dashboard.classList.contains('hidden')) {
                    if (!window.realTimeUpdates.isActive) {
                        setTimeout(() => {
                            window.realTimeUpdates.start();
                        }, 2000); // Start after 2 seconds
                    }
                }
            }
        });
    });
    
    // Observe dashboard visibility changes
    const dashboards = document.querySelectorAll('#student-dashboard, #admin-dashboard');
    dashboards.forEach(dashboard => {
        observer.observe(dashboard, { attributes: true });
    });
});

// Stop updates when page is hidden (battery optimization)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        window.realTimeUpdates.stop();
    } else if (currentUser) {
        // Restart when page becomes visible again
        setTimeout(() => {
            window.realTimeUpdates.start();
        }, 1000);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealTimeUpdates;
}