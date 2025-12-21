// Real-time Analytics Updates
// Live data updates and notifications for admin dashboard

class RealTimeAnalytics {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.isActive = false;
        this.lastUpdate = null;
        this.indicators = {
            newComplaints: 0,
            resolvedComplaints: 0,
            systemLoad: 'Normal'
        };
        this.init();
    }

    init() {
        this.createRealTimeIndicator();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    createRealTimeIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'realtime-indicator';
        indicator.className = 'real-time-indicator';
        indicator.innerHTML = `
            <span class="indicator-icon">🔴</span>
            <span class="indicator-text">Live</span>
            <span class="indicator-status">Connecting...</span>
        `;
        document.body.appendChild(indicator);

        // Add control buttons
        const controls = document.createElement('div');
        controls.className = 'realtime-controls';
        controls.innerHTML = `
            <button class="realtime-btn" onclick="realTimeAnalytics.toggleUpdates()">
                <span id="realtime-toggle-text">Pause</span>
            </button>
            <button class="realtime-btn" onclick="realTimeAnalytics.forceUpdate()">
                Refresh
            </button>
        `;
        indicator.appendChild(controls);
    }

    setupEventListeners() {
        // Listen for visibility changes to pause/resume updates
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });

        // Listen for network status changes
        window.addEventListener('online', () => {
            this.updateConnectionStatus('online');
            this.resumeUpdates();
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus('offline');
            this.pauseUpdates();
        });
    }

    startRealTimeUpdates() {
        this.isActive = true;
        this.updateConnectionStatus('connected');
        this.scheduleNextUpdate();
    }

    scheduleNextUpdate() {
        if (!this.isActive) return;

        setTimeout(async () => {
            await this.performUpdate();
            this.scheduleNextUpdate();
        }, this.updateInterval);
    }

    async performUpdate() {
        if (!this.isActive) return;

        try {
            this.updateConnectionStatus('updating');
            
            // Fetch latest data
            const newData = await this.fetchLatestData();
            
            // Check for changes and update
            const changes = this.detectChanges(newData);
            
            if (changes.hasChanges) {
                await this.updateDashboard(newData, changes);
                this.showUpdateNotifications(changes);
            }
            
            this.lastUpdate = new Date();
            this.updateConnectionStatus('connected');
            
        } catch (error) {
            console.error('Real-time update error:', error);
            this.updateConnectionStatus('error');
        }
    }

    async fetchLatestData() {
        const [complaintsResponse, studentsResponse] = await Promise.all([
            fetch(`${API_BASE}/all-student-complaints`),
            fetch(`${API_BASE}/students`)
        ]);

        const complaints = complaintsResponse.ok ? await complaintsResponse.json() : [];
        const students = studentsResponse.ok ? await studentsResponse.json() : [];

        return {
            complaints,
            students,
            timestamp: new Date().toISOString()
        };
    }

    detectChanges(newData) {
        const changes = {
            hasChanges: false,
            newComplaints: [],
            resolvedComplaints: [],
            statusChanges: [],
            newStudents: []
        };

        if (!window.allComplaints) {
            window.allComplaints = [];
        }

        // Detect new complaints
        const existingIds = new Set(window.allComplaints.map(c => c.complaint_id || c.id));
        changes.newComplaints = newData.complaints.filter(c => 
            !existingIds.has(c.complaint_id || c.id)
        );

        // Detect newly resolved complaints
        const previouslyResolved = new Set(
            window.allComplaints
                .filter(c => c.status === 'Resolved')
                .map(c => c.complaint_id || c.id)
        );
        
        changes.resolvedComplaints = newData.complaints.filter(c => 
            c.status === 'Resolved' && !previouslyResolved.has(c.complaint_id || c.id)
        );

        // Detect status changes
        const statusMap = new Map(
            window.allComplaints.map(c => [c.complaint_id || c.id, c.status])
        );
        
        changes.statusChanges = newData.complaints.filter(c => {
            const oldStatus = statusMap.get(c.complaint_id || c.id);
            return oldStatus && oldStatus !== c.status;
        });

        // Check if there are any changes
        changes.hasChanges = 
            changes.newComplaints.length > 0 ||
            changes.resolvedComplaints.length > 0 ||
            changes.statusChanges.length > 0;

        return changes;
    }

    async updateDashboard(newData, changes) {
        // Update global data
        window.allComplaints = newData.complaints;
        
        // Update analytics if available
        if (window.advancedAnalytics) {
            window.advancedAnalytics.data.complaints = newData.complaints;
            window.advancedAnalytics.processAnalyticsData();
            
            // Update specific components
            this.updateMetricCards(newData.complaints);
            this.updateRecentComplaints(changes.newComplaints);
            
            // Refresh charts if significant changes
            if (changes.newComplaints.length > 0 || changes.resolvedComplaints.length > 2) {
                window.advancedAnalytics.updateAllCharts();
            }
        }

        // Update admin stats
        this.updateAdminStats(newData.complaints);
        
        // Update indicators
        this.indicators.newComplaints += changes.newComplaints.length;
        this.indicators.resolvedComplaints += changes.resolvedComplaints.length;
        this.updateSystemLoad(newData.complaints);
    }

    updateMetricCards(complaints) {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;

        // Update with animation
        this.animateValueChange('admin-total-complaints', total);
        this.animateValueChange('admin-resolved-complaints', resolved);
        this.animateValueChange('admin-pending-complaints', pending);
        this.animateValueChange('admin-progress-complaints', inProgress);
    }

    animateValueChange(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue === newValue) return;

        // Add pulse animation
        element.style.animation = 'pulse 0.5s ease-in-out';
        
        // Animate number change
        const duration = 500;
        const steps = 20;
        const increment = (newValue - currentValue) / steps;
        let step = 0;

        const animate = () => {
            if (step < steps) {
                const value = Math.round(currentValue + (increment * step));
                element.textContent = value;
                step++;
                setTimeout(animate, duration / steps);
            } else {
                element.textContent = newValue;
                element.style.animation = '';
            }
        };

        animate();
    }

    updateRecentComplaints(newComplaints) {
        if (newComplaints.length === 0) return;

        const recentContainer = document.getElementById('admin-recent-complaints');
        if (!recentContainer) return;

        // Add new complaints to the top with animation
        newComplaints.forEach((complaint, index) => {
            setTimeout(() => {
                const complaintElement = this.createComplaintElement(complaint);
                complaintElement.style.opacity = '0';
                complaintElement.style.transform = 'translateY(-20px)';
                
                recentContainer.insertBefore(complaintElement, recentContainer.firstChild);
                
                // Animate in
                setTimeout(() => {
                    complaintElement.style.transition = 'all 0.5s ease-out';
                    complaintElement.style.opacity = '1';
                    complaintElement.style.transform = 'translateY(0)';
                }, 100);
                
                // Remove old complaints to keep list manageable
                const complaints = recentContainer.querySelectorAll('.complaint-item');
                if (complaints.length > 5) {
                    complaints[complaints.length - 1].remove();
                }
            }, index * 200);
        });
    }

    createComplaintElement(complaint) {
        const element = document.createElement('div');
        element.className = 'complaint-item new-complaint';
        element.innerHTML = `
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span>Student: ${complaint.student_name}</span>
                <span>Department: ${complaint.department}</span>
                <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <p class="complaint-description">${complaint.description.substring(0, 100)}...</p>
        `;
        return element;
    }

    updateAdminStats(complaints) {
        // Update any admin-specific statistics
        const stats = {
            total: complaints.length,
            resolved: complaints.filter(c => c.status === 'Resolved').length,
            pending: complaints.filter(c => c.status === 'Pending').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length
        };

        // Update dashboard stats if elements exist
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.getElementById(`admin-${key}-complaints`);
            if (element) {
                this.animateValueChange(`admin-${key}-complaints`, value);
            }
        });
    }

    updateSystemLoad(complaints) {
        const pendingCount = complaints.filter(c => c.status === 'Pending').length;
        const totalCount = complaints.length;
        
        if (totalCount === 0) {
            this.indicators.systemLoad = 'Normal';
        } else {
            const pendingRatio = pendingCount / totalCount;
            if (pendingRatio > 0.7) {
                this.indicators.systemLoad = 'High';
            } else if (pendingRatio > 0.4) {
                this.indicators.systemLoad = 'Medium';
            } else {
                this.indicators.systemLoad = 'Normal';
            }
        }
    }

    showUpdateNotifications(changes) {
        if (!window.notificationCenter) return;

        // Notify about new complaints
        if (changes.newComplaints.length > 0) {
            window.notificationCenter.add({
                type: 'complaint',
                title: 'New Complaints',
                message: `${changes.newComplaints.length} new complaint${changes.newComplaints.length > 1 ? 's' : ''} received`,
                important: changes.newComplaints.length > 3
            });
        }

        // Notify about resolved complaints
        if (changes.resolvedComplaints.length > 0) {
            window.notificationCenter.add({
                type: 'success',
                title: 'Complaints Resolved',
                message: `${changes.resolvedComplaints.length} complaint${changes.resolvedComplaints.length > 1 ? 's' : ''} resolved`,
                important: false
            });
        }

        // Notify about status changes
        if (changes.statusChanges.length > 0) {
            window.notificationCenter.add({
                type: 'info',
                title: 'Status Updates',
                message: `${changes.statusChanges.length} complaint${changes.statusChanges.length > 1 ? 's' : ''} updated`,
                important: false
            });
        }
    }

    updateConnectionStatus(status) {
        const indicator = document.getElementById('realtime-indicator');
        if (!indicator) return;

        const icon = indicator.querySelector('.indicator-icon');
        const statusText = indicator.querySelector('.indicator-status');

        switch (status) {
            case 'connected':
                indicator.className = 'real-time-indicator connected';
                icon.textContent = '🟢';
                statusText.textContent = 'Live';
                break;
            case 'updating':
                indicator.className = 'real-time-indicator updating';
                icon.textContent = '🟡';
                statusText.textContent = 'Updating...';
                break;
            case 'error':
                indicator.className = 'real-time-indicator error';
                icon.textContent = '🔴';
                statusText.textContent = 'Error';
                break;
            case 'offline':
                indicator.className = 'real-time-indicator offline';
                icon.textContent = '⚫';
                statusText.textContent = 'Offline';
                break;
            case 'paused':
                indicator.className = 'real-time-indicator paused';
                icon.textContent = '⏸️';
                statusText.textContent = 'Paused';
                break;
        }
    }

    toggleUpdates() {
        if (this.isActive) {
            this.pauseUpdates();
        } else {
            this.resumeUpdates();
        }
    }

    pauseUpdates() {
        this.isActive = false;
        this.updateConnectionStatus('paused');
        
        const toggleText = document.getElementById('realtime-toggle-text');
        if (toggleText) {
            toggleText.textContent = 'Resume';
        }
    }

    resumeUpdates() {
        this.isActive = true;
        this.updateConnectionStatus('connected');
        this.scheduleNextUpdate();
        
        const toggleText = document.getElementById('realtime-toggle-text');
        if (toggleText) {
            toggleText.textContent = 'Pause';
        }
    }

    async forceUpdate() {
        if (!this.isActive) {
            this.resumeUpdates();
        }
        await this.performUpdate();
    }

    // Performance monitoring
    getPerformanceMetrics() {
        return {
            updateInterval: this.updateInterval,
            lastUpdate: this.lastUpdate,
            isActive: this.isActive,
            indicators: this.indicators,
            memoryUsage: this.getMemoryUsage()
        };
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    // Cleanup
    destroy() {
        this.isActive = false;
        const indicator = document.getElementById('realtime-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Initialize Real-time Analytics
window.RealTimeAnalytics = RealTimeAnalytics;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.currentUser?.role === 'admin') {
        setTimeout(() => {
            window.realTimeAnalytics = new RealTimeAnalytics();
        }, 4000);
    }
});

console.log('🔴 Real-time Analytics System loaded successfully');