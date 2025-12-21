// Advanced Components for Smart Complaint System
// Real-time features, advanced animations, and interactive elements

// Real-time Data Manager
class RealTimeManager {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.isActive = false;
        this.lastUpdate = null;
        this.init();
    }

    init() {
        this.startRealTimeUpdates();
        this.setupVisibilityHandling();
    }

    startRealTimeUpdates() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.updateLoop();
        
        console.log('🔄 Real-time updates started');
    }

    stopRealTimeUpdates() {
        this.isActive = false;
        console.log('⏸️ Real-time updates stopped');
    }

    async updateLoop() {
        while (this.isActive) {
            try {
                await this.performUpdate();
                await this.sleep(this.updateInterval);
            } catch (error) {
                console.error('Real-time update error:', error);
                await this.sleep(this.updateInterval * 2); // Back off on error
            }
        }
    }

    async performUpdate() {
        if (!currentUser) return;

        const now = new Date();
        this.lastUpdate = now;

        // Update status indicator
        this.updateStatusIndicator('updating');

        if (currentUser.role === 'admin') {
            await this.updateAdminData();
        } else {
            await this.updateStudentData();
        }

        // Update status indicator
        this.updateStatusIndicator('updated');
        
        // Show subtle notification
        this.showUpdateNotification();
    }

    async updateStudentData() {
        if (!currentUser.student_id) return;

        try {
            const response = await fetch(`${API_BASE}/student-complaints/${currentUser.student_id}`);
            if (response.ok) {
                const newComplaints = await response.json();
                
                // Check for changes
                const hasChanges = this.detectChanges(complaints, newComplaints);
                
                if (hasChanges) {
                    complaints = newComplaints;
                    updateStudentStats();
                    updateRecentComplaints();
                    updateComplaintsList();
                    
                    // Notify about changes
                    this.notifyDataChanges('complaints');
                }
            }
        } catch (error) {
            console.error('Error updating student data:', error);
        }
    }

    async updateAdminData() {
        try {
            const response = await fetch(`${API_BASE}/all-student-complaints`);
            if (response.ok) {
                const newComplaints = await response.json();
                
                // Check for changes
                const hasChanges = this.detectChanges(allComplaints, newComplaints);
                
                if (hasChanges) {
                    allComplaints = newComplaints;
                    updateAdminStats();
                    updateAdminRecentComplaints();
                    updateAdminComplaintsList();
                    
                    // Update charts
                    if (typeof createAnalyticsCharts === 'function') {
                        createAnalyticsCharts();
                    }
                    
                    // Notify about changes
                    this.notifyDataChanges('admin-complaints');
                }
            }
        } catch (error) {
            console.error('Error updating admin data:', error);
        }
    }

    detectChanges(oldData, newData) {
        if (!oldData || !newData) return true;
        if (oldData.length !== newData.length) return true;
        
        // Check for status changes in recent items
        const recentOld = oldData.slice(0, 5);
        const recentNew = newData.slice(0, 5);
        
        return recentOld.some((oldItem, index) => {
            const newItem = recentNew[index];
            return !newItem || oldItem.status !== newItem.status || 
                   oldItem.updated_at !== newItem.updated_at;
        });
    }

    notifyDataChanges(type) {
        if (window.notificationCenter) {
            window.notificationCenter.add({
                type: 'update',
                title: 'Data Updated',
                message: 'New information is available',
                important: false
            });
        }
    }

    updateStatusIndicator(status) {
        const indicator = document.querySelector('.real-time-indicator');
        if (!indicator) return;

        indicator.className = `real-time-indicator ${status}`;
        indicator.textContent = status === 'updating' ? '🔄 Updating...' : 
                               status === 'updated' ? '✅ Updated' : '⏸️ Paused';
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.textContent = `Last updated: ${this.lastUpdate.toLocaleTimeString()}`;
        
        // Remove existing notification
        const existing = document.querySelector('.update-notification');
        if (existing) existing.remove();
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => notification.remove(), 3000);
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopRealTimeUpdates();
            } else {
                this.startRealTimeUpdates();
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Advanced Animation Manager
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Observe elements with animation classes
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        this.observers.set('scroll', observer);
    }

    animateElement(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        
        element.style.opacity = '0';
        element.style.transform = this.getInitialTransform(animationType);
        
        // Trigger animation
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    }

    getInitialTransform(type) {
        const transforms = {
            fadeInUp: 'translateY(30px)',
            fadeInDown: 'translateY(-30px)',
            fadeInLeft: 'translateX(-30px)',
            fadeInRight: 'translateX(30px)',
            scaleIn: 'scale(0.8)',
            rotateIn: 'rotate(-10deg) scale(0.8)'
        };
        return transforms[type] || transforms.fadeInUp;
    }

    setupScrollAnimations() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateScrollAnimations() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero background
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
        
        // Update navbar transparency
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const opacity = Math.min(scrolled / 100, 0.95);
            navbar.style.background = `rgba(15, 15, 15, ${opacity})`;
        }
    }

    // Animate number counting
    animateNumber(element, target, duration = 2000) {
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Animate progress bars
    animateProgressBar(element, percentage, duration = 1000) {
        const fill = element.querySelector('.progress-fill');
        if (!fill) return;

        fill.style.width = '0%';
        
        setTimeout(() => {
            fill.style.transition = `width ${duration}ms ease-out`;
            fill.style.width = `${percentage}%`;
        }, 100);
    }

    // Stagger animations for lists
    staggerAnimation(elements, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.animateElement(element);
            }, index * delay);
        });
    }
}

// Advanced Search and Filter System
class AdvancedFilterSystem {
    constructor(containerId, data, onFilter) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.onFilter = onFilter;
        this.filters = {};
        this.sortBy = 'created_at';
        this.sortOrder = 'desc';
        this.init();
    }

    init() {
        if (!this.container) return;
        this.createFilterUI();
        this.setupEventListeners();
    }

    createFilterUI() {
        this.container.innerHTML = `
            <div class="advanced-filter-system">
                <div class="filter-header">
                    <h3>🔍 Advanced Filters</h3>
                    <div class="filter-actions">
                        <button class="btn btn-small" onclick="this.saveFilter()">Save Filter</button>
                        <button class="btn btn-small btn-secondary" onclick="this.clearAllFilters()">Clear All</button>
                    </div>
                </div>
                
                <div class="filter-tabs">
                    <button class="filter-tab active" data-tab="search">Search</button>
                    <button class="filter-tab" data-tab="filters">Filters</button>
                    <button class="filter-tab" data-tab="sort">Sort</button>
                </div>
                
                <div class="filter-content">
                    <div class="filter-panel active" id="search-panel">
                        <div class="search-group">
                            <input type="text" class="search-input" placeholder="Search in title, description..." 
                                   id="text-search">
                            <div class="search-options">
                                <label>
                                    <input type="checkbox" id="search-title"> Search in titles
                                </label>
                                <label>
                                    <input type="checkbox" id="search-description"> Search in descriptions
                                </label>
                                <label>
                                    <input type="checkbox" id="search-student"> Search student names
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-panel" id="filters-panel">
                        <div class="filter-grid">
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="status-filter" multiple>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>Priority</label>
                                <select id="priority-filter" multiple>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>Date Range</label>
                                <div class="date-range">
                                    <input type="date" id="date-from" placeholder="From">
                                    <input type="date" id="date-to" placeholder="To">
                                </div>
                            </div>
                            
                            <div class="filter-group">
                                <label>Department</label>
                                <select id="department-filter" multiple>
                                    <!-- Options will be populated dynamically -->
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-panel" id="sort-panel">
                        <div class="sort-options">
                            <div class="sort-group">
                                <label>Sort by</label>
                                <select id="sort-by">
                                    <option value="created_at">Date Created</option>
                                    <option value="updated_at">Last Updated</option>
                                    <option value="title">Title</option>
                                    <option value="status">Status</option>
                                    <option value="priority">Priority</option>
                                    <option value="student_name">Student Name</option>
                                </select>
                            </div>
                            
                            <div class="sort-group">
                                <label>Order</label>
                                <select id="sort-order">
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="filter-summary" id="filter-summary">
                    <span class="results-count">Showing all results</span>
                    <div class="active-filters" id="active-filters"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Filter inputs
        this.container.addEventListener('input', (e) => {
            this.handleFilterChange(e);
        });

        this.container.addEventListener('change', (e) => {
            this.handleFilterChange(e);
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        this.container.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        this.container.querySelectorAll('.filter-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    handleFilterChange(event) {
        const { id, value, type, checked } = event.target;
        
        if (type === 'checkbox') {
            this.filters[id] = checked;
        } else if (event.target.multiple) {
            const selected = Array.from(event.target.selectedOptions).map(opt => opt.value);
            this.filters[id.replace('-filter', '')] = selected;
        } else {
            this.filters[id.replace('-filter', '')] = value;
        }

        this.applyFilters();
    }

    applyFilters() {
        let filteredData = [...this.data];

        // Apply text search
        const searchText = this.filters['text-search'];
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filteredData = filteredData.filter(item => {
                const searchInTitle = this.filters['search-title'] !== false;
                const searchInDesc = this.filters['search-description'] !== false;
                const searchInStudent = this.filters['search-student'] !== false;

                return (searchInTitle && item.title?.toLowerCase().includes(searchLower)) ||
                       (searchInDesc && item.description?.toLowerCase().includes(searchLower)) ||
                       (searchInStudent && item.student_name?.toLowerCase().includes(searchLower));
            });
        }

        // Apply status filter
        if (this.filters.status && this.filters.status.length > 0) {
            filteredData = filteredData.filter(item => 
                this.filters.status.includes(item.status)
            );
        }

        // Apply priority filter
        if (this.filters.priority && this.filters.priority.length > 0) {
            filteredData = filteredData.filter(item => 
                this.filters.priority.includes(item.priority)
            );
        }

        // Apply date range filter
        if (this.filters['date-from'] || this.filters['date-to']) {
            const fromDate = this.filters['date-from'] ? new Date(this.filters['date-from']) : null;
            const toDate = this.filters['date-to'] ? new Date(this.filters['date-to']) : null;

            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.created_at);
                return (!fromDate || itemDate >= fromDate) && 
                       (!toDate || itemDate <= toDate);
            });
        }

        // Apply sorting
        const sortBy = this.filters['sort-by'] || this.sortBy;
        const sortOrder = this.filters['sort-order'] || this.sortOrder;

        filteredData.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Handle different data types
            if (sortBy.includes('date') || sortBy.includes('_at')) {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        // Update summary
        this.updateFilterSummary(filteredData.length);

        // Call the filter callback
        if (this.onFilter) {
            this.onFilter(filteredData);
        }
    }

    updateFilterSummary(count) {
        const summary = this.container.querySelector('#filter-summary .results-count');
        if (summary) {
            summary.textContent = `Showing ${count} of ${this.data.length} results`;
        }

        // Update active filters display
        const activeFiltersContainer = this.container.querySelector('#active-filters');
        if (activeFiltersContainer) {
            const activeFilters = Object.entries(this.filters)
                .filter(([key, value]) => value && value !== '' && 
                        (Array.isArray(value) ? value.length > 0 : true))
                .map(([key, value]) => {
                    const displayValue = Array.isArray(value) ? value.join(', ') : value;
                    return `<span class="filter-tag">${key}: ${displayValue}</span>`;
                });

            activeFiltersContainer.innerHTML = activeFilters.join('');
        }
    }

    clearAllFilters() {
        this.filters = {};
        
        // Reset all inputs
        this.container.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
                if (input.multiple) {
                    Array.from(input.options).forEach(option => option.selected = false);
                }
            }
        });

        this.applyFilters();
    }

    saveFilter() {
        const filterName = prompt('Enter a name for this filter:');
        if (filterName) {
            const savedFilters = JSON.parse(localStorage.getItem('saved-filters') || '{}');
            savedFilters[filterName] = { ...this.filters };
            localStorage.setItem('saved-filters', JSON.stringify(savedFilters));
            
            showToast(`Filter "${filterName}" saved successfully!`, 'success');
        }
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: 0,
            apiCalls: [],
            renderTimes: [],
            memoryUsage: []
        };
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.setupPerformanceObserver();
        this.startMemoryMonitoring();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = navigation.loadEventEnd - navigation.fetchStart;
            
            console.log(`📊 Page load time: ${this.metrics.pageLoad}ms`);
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'measure') {
                        this.metrics.renderTimes.push({
                            name: entry.name,
                            duration: entry.duration,
                            timestamp: entry.startTime
                        });
                    }
                });
            });

            observer.observe({ entryTypes: ['measure'] });
        }
    }

    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage.push({
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });

                // Keep only last 100 measurements
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
            }, 10000); // Every 10 seconds
        }
    }

    measureApiCall(url, startTime, endTime) {
        this.metrics.apiCalls.push({
            url,
            duration: endTime - startTime,
            timestamp: startTime
        });

        // Keep only last 50 API calls
        if (this.metrics.apiCalls.length > 50) {
            this.metrics.apiCalls.shift();
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            averageApiTime: this.metrics.apiCalls.length > 0 
                ? this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / this.metrics.apiCalls.length 
                : 0,
            averageRenderTime: this.metrics.renderTimes.length > 0
                ? this.metrics.renderTimes.reduce((sum, render) => sum + render.duration, 0) / this.metrics.renderTimes.length
                : 0
        };
    }

    showPerformanceReport() {
        const metrics = this.getMetrics();
        const report = `
            📊 Performance Report
            ==================
            Page Load: ${metrics.pageLoad}ms
            Average API Call: ${metrics.averageApiTime.toFixed(2)}ms
            Average Render: ${metrics.averageRenderTime.toFixed(2)}ms
            API Calls Made: ${metrics.apiCalls.length}
            Memory Usage: ${this.formatBytes(metrics.memoryUsage[metrics.memoryUsage.length - 1]?.used || 0)}
        `;
        
        console.log(report);
        
        if (window.notificationCenter) {
            window.notificationCenter.add({
                type: 'info',
                title: 'Performance Report',
                message: `Page load: ${metrics.pageLoad}ms, API avg: ${metrics.averageApiTime.toFixed(2)}ms`,
                important: false
            });
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize advanced components
let realTimeManager, animationManager, performanceMonitor;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize advanced components
    realTimeManager = new RealTimeManager();
    animationManager = new AnimationManager();
    performanceMonitor = new PerformanceMonitor();
    
    // Add real-time indicator to navbar
    const navbar = document.querySelector('.navbar .nav-container');
    if (navbar) {
        const indicator = document.createElement('div');
        indicator.className = 'real-time-indicator';
        indicator.textContent = '🔄 Live';
        navbar.appendChild(indicator);
    }
    
    console.log('🚀 Advanced components initialized');
});

// Export for global access
window.AdvancedComponents = {
    RealTimeManager,
    AnimationManager,
    AdvancedFilterSystem,
    PerformanceMonitor
};