// Enhanced Features for Smart Complaint System
// Advanced UI components and interactions

// Enhanced Theme System
class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                name: 'Dark Mode',
                icon: '🌙',
                colors: {
                    primary: '#e50914',
                    background: '#0f0f0f',
                    surface: '#1a1a1a',
                    text: '#ffffff'
                }
            },
            light: {
                name: 'Light Mode',
                icon: '☀️',
                colors: {
                    primary: '#e50914',
                    background: '#ffffff',
                    surface: '#f8f9fa',
                    text: '#000000'
                }
            },
            blue: {
                name: 'Ocean Blue',
                icon: '🌊',
                colors: {
                    primary: '#0066cc',
                    background: '#0a1929',
                    surface: '#1e293b',
                    text: '#ffffff'
                }
            },
            green: {
                name: 'Forest Green',
                icon: '🌲',
                colors: {
                    primary: '#059669',
                    background: '#064e3b',
                    surface: '#065f46',
                    text: '#ffffff'
                }
            }
        };
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeSelector();
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}-color`, value);
        });

        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
        
        // Update theme button
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.textContent = theme.icon;
            themeBtn.title = theme.name;
        }
    }

    createThemeSelector() {
        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <div class="theme-options">
                ${Object.entries(this.themes).map(([key, theme]) => `
                    <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" 
                            data-theme="${key}" title="${theme.name}">
                        ${theme.icon}
                    </button>
                `).join('')}
            </div>
        `;

        selector.addEventListener('click', (e) => {
            if (e.target.classList.contains('theme-option')) {
                const themeName = e.target.dataset.theme;
                this.applyTheme(themeName);
                
                // Update active state
                selector.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.toggle('active', opt.dataset.theme === themeName);
                });
            }
        });

        return selector;
    }

    toggle() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }
}

// Loading Skeleton Component
class SkeletonLoader {
    static create(type = 'card', count = 1) {
        const skeletons = [];
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            
            switch (type) {
                case 'card':
                    skeleton.innerHTML = `
                        <div class="skeleton-header">
                            <div class="skeleton-line skeleton-title"></div>
                            <div class="skeleton-badge"></div>
                        </div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    `;
                    break;
                case 'list':
                    skeleton.innerHTML = `
                        <div class="skeleton-line skeleton-title"></div>
                        <div class="skeleton-line"></div>
                    `;
                    break;
                case 'stats':
                    skeleton.innerHTML = `
                        <div class="skeleton-icon"></div>
                        <div class="skeleton-number"></div>
                        <div class="skeleton-label"></div>
                    `;
                    break;
            }
            
            skeletons.push(skeleton);
        }
        
        return count === 1 ? skeletons[0] : skeletons;
    }

    static show(container, type = 'card', count = 3) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (!container) return;

        const skeletons = this.create(type, count);
        container.innerHTML = '';
        
        if (Array.isArray(skeletons)) {
            skeletons.forEach(skeleton => container.appendChild(skeleton));
        } else {
            container.appendChild(skeletons);
        }
    }

    static hide(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (!container) return;

        const skeletons = container.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }
}

// Advanced Search Component
class AdvancedSearch {
    constructor(containerId, onSearch) {
        this.container = document.getElementById(containerId);
        this.onSearch = onSearch;
        this.filters = {};
        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="advanced-search">
                <div class="search-header">
                    <h3>🔍 Advanced Search</h3>
                    <button class="btn btn-small" onclick="this.parentElement.parentElement.classList.toggle('expanded')">
                        Toggle Filters
                    </button>
                </div>
                
                <div class="search-basic">
                    <input type="text" class="search-input" placeholder="Search complaints..." 
                           id="global-search" oninput="this.dispatchEvent(new Event('search'))">
                    <button class="btn btn-primary" onclick="this.previousElementSibling.dispatchEvent(new Event('search'))">
                        Search
                    </button>
                </div>

                <div class="search-filters">
                    <div class="filter-row">
                        <select id="status-filter" onchange="this.dispatchEvent(new Event('filter'))">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        
                        <select id="priority-filter" onchange="this.dispatchEvent(new Event('filter'))">
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        
                        <select id="department-filter" onchange="this.dispatchEvent(new Event('filter'))">
                            <option value="">All Departments</option>
                        </select>
                    </div>
                    
                    <div class="filter-row">
                        <input type="date" id="date-from" onchange="this.dispatchEvent(new Event('filter'))" 
                               placeholder="From Date">
                        <input type="date" id="date-to" onchange="this.dispatchEvent(new Event('filter'))" 
                               placeholder="To Date">
                        <button class="btn btn-secondary" onclick="this.clearFilters()">Clear All</button>
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.container.addEventListener('search', (e) => {
            this.filters.search = e.target.value;
            this.performSearch();
        });

        this.container.addEventListener('filter', (e) => {
            this.filters[e.target.id.replace('-filter', '')] = e.target.value;
            this.performSearch();
        });
    }

    performSearch() {
        if (this.onSearch) {
            this.onSearch(this.filters);
        }
    }

    clearFilters() {
        this.filters = {};
        this.container.querySelectorAll('input, select').forEach(input => {
            input.value = '';
        });
        this.performSearch();
    }
}

// Progress Bar Component
class ProgressBar {
    static create(percentage, label = '', color = 'primary') {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar-container';
        progressBar.innerHTML = `
            <div class="progress-label">
                <span>${label}</span>
                <span class="progress-percentage">${percentage}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill progress-${color}" style="width: ${percentage}%"></div>
            </div>
        `;
        return progressBar;
    }

    static animate(element, targetPercentage, duration = 1000) {
        const fill = element.querySelector('.progress-fill');
        const percentageSpan = element.querySelector('.progress-percentage');
        
        let start = 0;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentPercentage = start + (targetPercentage - start) * progress;
            fill.style.width = `${currentPercentage}%`;
            percentageSpan.textContent = `${Math.round(currentPercentage)}%`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }
}

// Chart Component (Simple)
class SimpleChart {
    static createBarChart(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxValue = Math.max(...data.map(d => d.value));
        
        container.innerHTML = `
            <div class="simple-chart bar-chart">
                ${data.map(item => `
                    <div class="chart-item">
                        <div class="chart-bar" style="height: ${(item.value / maxValue) * 100}%">
                            <span class="chart-value">${item.value}</span>
                        </div>
                        <div class="chart-label">${item.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static createPieChart(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        const segments = data.map(item => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const segment = {
                ...item,
                percentage,
                startAngle: currentAngle,
                endAngle: currentAngle + angle
            };
            currentAngle += angle;
            return segment;
        });

        container.innerHTML = `
            <div class="simple-chart pie-chart">
                <svg viewBox="0 0 100 100" class="pie-svg">
                    ${segments.map((segment, index) => {
                        const x1 = 50 + 40 * Math.cos((segment.startAngle - 90) * Math.PI / 180);
                        const y1 = 50 + 40 * Math.sin((segment.startAngle - 90) * Math.PI / 180);
                        const x2 = 50 + 40 * Math.cos((segment.endAngle - 90) * Math.PI / 180);
                        const y2 = 50 + 40 * Math.sin((segment.endAngle - 90) * Math.PI / 180);
                        const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                        
                        return `
                            <path d="M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z"
                                  fill="var(--chart-color-${index})" 
                                  class="pie-segment"
                                  data-label="${segment.label}"
                                  data-value="${segment.value}">
                            </path>
                        `;
                    }).join('')}
                </svg>
                <div class="pie-legend">
                    ${segments.map((segment, index) => `
                        <div class="legend-item">
                            <div class="legend-color" style="background: var(--chart-color-${index})"></div>
                            <span>${segment.label}: ${segment.percentage.toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Notification System
class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.container = this.createContainer();
        this.init();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-center';
        container.className = 'notification-center';
        container.innerHTML = `
            <div class="notification-header">
                <h3>🔔 Notifications</h3>
                <button class="btn btn-small" onclick="this.clearAll()">Clear All</button>
            </div>
            <div class="notification-list" id="notification-list"></div>
        `;
        document.body.appendChild(container);
        return container;
    }

    init() {
        // Load saved notifications
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
            this.render();
        }
    }

    add(notification) {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date(),
            read: false,
            ...notification
        };

        this.notifications.unshift(newNotification);
        this.save();
        this.render();
        this.updateBadge();

        // Auto-remove after 5 minutes if not important
        if (!notification.important) {
            setTimeout(() => {
                this.remove(newNotification.id);
            }, 5 * 60 * 1000);
        }
    }

    remove(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.save();
        this.render();
        this.updateBadge();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.save();
            this.render();
            this.updateBadge();
        }
    }

    clearAll() {
        this.notifications = [];
        this.save();
        this.render();
        this.updateBadge();
    }

    render() {
        const list = document.getElementById('notification-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="empty-state">No notifications</div>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                 data-id="${notification.id}">
                <div class="notification-icon">${this.getIcon(notification.type)}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `<button onclick="notificationCenter.markAsRead(${notification.id})">Mark Read</button>` : ''}
                    <button onclick="notificationCenter.remove(${notification.id})">×</button>
                </div>
            </div>
        `).join('');
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            complaint: '📝',
            update: '🔄'
        };
        return icons[type] || icons.info;
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return time.toLocaleDateString();
    }

    save() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    updateBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    toggle() {
        this.container.classList.toggle('active');
    }
}

// Auto-save Draft System
class DraftManager {
    constructor() {
        this.drafts = new Map();
        this.autoSaveInterval = 30000; // 30 seconds
        this.init();
    }

    init() {
        // Load saved drafts
        const saved = localStorage.getItem('drafts');
        if (saved) {
            const draftsArray = JSON.parse(saved);
            this.drafts = new Map(draftsArray);
        }

        // Setup auto-save for forms
        this.setupAutoSave();
    }

    setupAutoSave() {
        // Auto-save complaint form
        const complaintForm = document.getElementById('complaint-form');
        if (complaintForm) {
            this.setupFormAutoSave(complaintForm, 'complaint-draft');
        }

        // Auto-save profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            this.setupFormAutoSave(profileForm, 'profile-draft');
        }
    }

    setupFormAutoSave(form, draftKey) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveDraft(draftKey, this.getFormData(form));
            });
        });

        // Load existing draft
        this.loadDraft(draftKey, form);

        // Auto-save interval
        setInterval(() => {
            if (this.hasFormData(form)) {
                this.saveDraft(draftKey, this.getFormData(form));
            }
        }, this.autoSaveInterval);
    }

    getFormData(form) {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    hasFormData(form) {
        const data = this.getFormData(form);
        return Object.values(data).some(value => value.trim() !== '');
    }

    saveDraft(key, data) {
        this.drafts.set(key, {
            data,
            timestamp: new Date(),
            id: key
        });
        
        localStorage.setItem('drafts', JSON.stringify([...this.drafts]));
        this.showDraftIndicator(key);
    }

    loadDraft(key, form) {
        const draft = this.drafts.get(key);
        if (!draft) return;

        Object.entries(draft.data).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                input.value = value;
            }
        });

        this.showDraftIndicator(key);
    }

    clearDraft(key) {
        this.drafts.delete(key);
        localStorage.setItem('drafts', JSON.stringify([...this.drafts]));
        this.hideDraftIndicator(key);
    }

    showDraftIndicator(key) {
        let indicator = document.getElementById(`draft-indicator-${key}`);
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = `draft-indicator-${key}`;
            indicator.className = 'draft-indicator';
            indicator.innerHTML = '💾 Draft saved';
            document.body.appendChild(indicator);
        }
        
        indicator.classList.add('show');
        setTimeout(() => indicator.classList.remove('show'), 2000);
    }

    hideDraftIndicator(key) {
        const indicator = document.getElementById(`draft-indicator-${key}`);
        if (indicator) {
            indicator.remove();
        }
    }
}

// Keyboard Shortcuts
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyString(e);
            const action = this.shortcuts.get(key);
            
            if (action) {
                e.preventDefault();
                action();
            }
        });

        this.registerDefaultShortcuts();
    }

    getKeyString(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }

    register(keyString, action, description) {
        this.shortcuts.set(keyString, action);
        
        // Add to help menu if it exists
        this.updateHelpMenu(keyString, description);
    }

    registerDefaultShortcuts() {
        // Global shortcuts
        this.register('ctrl+/', () => this.showHelp(), 'Show keyboard shortcuts');
        this.register('escape', () => this.closeModals(), 'Close modals');
        this.register('ctrl+k', () => this.focusSearch(), 'Focus search');
        
        // Navigation shortcuts
        this.register('ctrl+1', () => showDashboardView('overview'), 'Go to overview');
        this.register('ctrl+2', () => showDashboardView('new-complaint'), 'New complaint');
        this.register('ctrl+3', () => showDashboardView('my-complaints'), 'My complaints');
        this.register('ctrl+4', () => showDashboardView('profile'), 'Profile');
        
        // Theme shortcuts
        this.register('ctrl+shift+t', () => themeManager.toggle(), 'Toggle theme');
        
        // Quick actions
        this.register('ctrl+enter', () => this.submitActiveForm(), 'Submit form');
        this.register('ctrl+s', () => this.saveActiveForm(), 'Save form');
    }

    closeModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    focusSearch() {
        const searchInput = document.querySelector('.search-input, #global-search');
        if (searchInput) {
            searchInput.focus();
        }
    }

    submitActiveForm() {
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }

    saveActiveForm() {
        // Trigger auto-save for active form
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm && draftManager) {
            const formId = activeForm.id;
            if (formId) {
                draftManager.saveDraft(`${formId}-draft`, draftManager.getFormData(activeForm));
            }
        }
    }

    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'modal active';
        helpModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-list">
                        ${[...this.shortcuts.entries()].map(([key, action]) => `
                            <div class="shortcut-item">
                                <kbd>${key.replace(/\+/g, ' + ')}</kbd>
                                <span>${action.description || 'Custom action'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(helpModal);
    }

    updateHelpMenu(keyString, description) {
        // Store description for help display
        const action = this.shortcuts.get(keyString);
        if (action) {
            action.description = description;
        }
    }
}

// Initialize enhanced features
let themeManager, notificationCenter, draftManager, keyboardShortcuts;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced features
    themeManager = new ThemeManager();
    notificationCenter = new NotificationCenter();
    draftManager = new DraftManager();
    keyboardShortcuts = new KeyboardShortcuts();
    
    console.log('🎨 Enhanced features initialized');
});

// Export for global access
window.EnhancedFeatures = {
    ThemeManager,
    SkeletonLoader,
    AdvancedSearch,
    ProgressBar,
    SimpleChart,
    NotificationCenter,
    DraftManager,
    KeyboardShortcuts
};