
class AdvancedFeatures {
    constructor() {
        this.notifications = [];
        this.shortcuts = {};
        this.theme = 'dark';
        this.autoSaveTimer = null;
        this.init();
    }

    init() {
        this.createParticleBackground();
        this.createThemeToggle();
        this.createNotificationCenter();
        this.createQuickActions();
        this.setupKeyboardShortcuts();
        this.setupAutoSave();
        this.setupAdvancedSearch();
        this.createProgressIndicators();
        this.setupSoundEffects();
    }

    // Background particles
    createParticleBackground() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-bg';
        document.body.appendChild(particlesContainer);

        // Add particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createParticle(particlesContainer);
            }, i * 100);
        }

        // Keep adding particles
        setInterval(() => {
            this.createParticle(particlesContainer);
        }, 2000);
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        // Color options
        const colors = ['rgba(229, 9, 20, 0.3)', 'rgba(0, 168, 225, 0.3)', 'rgba(255, 107, 107, 0.3)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(particle);

        // Clean up particle
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 6000);
    }

    // Theme switcher
    createThemeToggle() {
        const themeToggle = document.createElement('div');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = `
            <span class="theme-icon">🌙</span>
            <span style="font-size: 0.8rem;">Dark</span>
        `;
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        document.body.appendChild(themeToggle);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        const themeToggle = document.querySelector('.theme-toggle');
        
        if (this.theme === 'light') {
            document.body.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
            document.body.style.color = '#212529';
            themeToggle.innerHTML = `
                <span class="theme-icon">☀️</span>
                <span style="font-size: 0.8rem;">Light</span>
            `;
        } else {
            document.body.style.background = 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)';
            document.body.style.color = '#ffffff';
            themeToggle.innerHTML = `
                <span class="theme-icon">🌙</span>
                <span style="font-size: 0.8rem;">Dark</span>
            `;
        }
        
        this.showNotification('Theme changed to ' + this.theme + ' mode', 'info');
    }

    // Notification center
    createNotificationCenter() {
        const notificationCenter = document.createElement('div');
        notificationCenter.className = 'notification-center';
        notificationCenter.id = 'notification-center';
        
        notificationCenter.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: #e50914;">Notifications</h3>
                <button onclick="advancedFeatures.clearNotifications()" style="background: none; border: none; color: #666; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div id="notifications-list"></div>
        `;
        
        document.body.appendChild(notificationCenter);
    }

    showNotification(message, type = 'info', persistent = false) {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
            read: false,
            persistent
        };
        
        this.notifications.unshift(notification);
        this.updateNotificationCenter();
        
        // Show toast notification
        this.showToast(message, type);
        
        // Auto remove notifications
        if (!persistent) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, 5000);
        }
    }

    updateNotificationCenter() {
        const notificationsList = document.getElementById('notifications-list');
        if (!notificationsList) return;
        
        notificationsList.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${!notification.read ? 'unread' : ''}" 
                 onclick="advancedFeatures.markAsRead(${notification.id})">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <span style="font-weight: 500; color: ${this.getTypeColor(notification.type)};">
                        ${this.getTypeIcon(notification.type)} ${notification.type.toUpperCase()}
                    </span>
                    <span style="font-size: 0.7rem; color: #666;">
                        ${this.formatTime(notification.timestamp)}
                    </span>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #b3b3b3;">${notification.message}</p>
            </div>
        `).join('');
    }

    // Quick actions
    createQuickActions() {
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        
        quickActions.innerHTML = `
            <div class="quick-actions-menu" id="quick-actions-menu">
                <button class="quick-action-btn" onclick="advancedFeatures.quickNewComplaint()" title="New Complaint">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="quick-action-btn" onclick="advancedFeatures.quickSearch()" title="Search">
                    <i class="fas fa-search"></i>
                </button>
                <button class="quick-action-btn" onclick="advancedFeatures.toggleNotifications()" title="Notifications">
                    <i class="fas fa-bell"></i>
                </button>
                <button class="quick-action-btn" onclick="advancedFeatures.showShortcuts()" title="Shortcuts">
                    <i class="fas fa-keyboard"></i>
                </button>
            </div>
            <button class="quick-action-btn main" onclick="advancedFeatures.toggleQuickActions()" title="Quick Actions">
                <i class="fas fa-bolt"></i>
            </button>
        `;
        
        document.body.appendChild(quickActions);
    }

    toggleQuickActions() {
        const menu = document.getElementById('quick-actions-menu');
        menu.classList.toggle('show');
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        this.shortcuts = {
            'ctrl+n': () => this.quickNewComplaint(),
            'ctrl+k': () => this.quickSearch(),
            'ctrl+/': () => this.showShortcuts(),
            'esc': () => this.closeModals(),
            'ctrl+s': (e) => { e.preventDefault(); this.saveForm(); }
        };

        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (this.shortcuts[key]) {
                this.shortcuts[key](e);
            }
        });
    }

    getKeyCombo(e) {
        const keys = [];
        if (e.ctrlKey) keys.push('ctrl');
        if (e.shiftKey) keys.push('shift');
        if (e.altKey) keys.push('alt');
        keys.push(e.key.toLowerCase());
        return keys.join('+');
    }

    showShortcuts() {
        const shortcutsHelp = document.createElement('div');
        shortcutsHelp.className = 'shortcuts-help show';
        shortcutsHelp.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: #e50914;">Keyboard Shortcuts</h4>
            <div class="shortcut-item">
                <span>New Complaint</span>
                <span class="shortcut-key">Ctrl + N</span>
            </div>
            <div class="shortcut-item">
                <span>Search</span>
                <span class="shortcut-key">Ctrl + K</span>
            </div>
            <div class="shortcut-item">
                <span>Save Form</span>
                <span class="shortcut-key">Ctrl + S</span>
            </div>
            <div class="shortcut-item">
                <span>Close Modal</span>
                <span class="shortcut-key">Esc</span>
            </div>
            <div class="shortcut-item">
                <span>Show Shortcuts</span>
                <span class="shortcut-key">Ctrl + /</span>
            </div>
        `;
        
        document.body.appendChild(shortcutsHelp);
        
        setTimeout(() => {
            if (shortcutsHelp.parentNode) {
                shortcutsHelp.classList.remove('show');
                setTimeout(() => {
                    shortcutsHelp.parentNode.removeChild(shortcutsHelp);
                }, 300);
            }
        }, 5000);
    }

    // Auto save forms
    setupAutoSave() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.scheduleAutoSave(form);
                });
            });
        });
    }

    scheduleAutoSave(form) {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.showAutoSaveIndicator('saving');
        
        this.autoSaveTimer = setTimeout(() => {
            this.performAutoSave(form);
        }, 2000);
    }

    performAutoSave(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Save locally
        localStorage.setItem('autosave_' + form.id, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        
        this.showAutoSaveIndicator('saved');
        
        setTimeout(() => {
            this.hideAutoSaveIndicator();
        }, 2000);
    }

    showAutoSaveIndicator(status) {
        let indicator = document.getElementById('auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'auto-save-indicator';
            indicator.className = 'auto-save-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.className = `auto-save-indicator show ${status}`;
        
        switch(status) {
            case 'saving':
                indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                break;
            case 'saved':
                indicator.innerHTML = '<i class="fas fa-check"></i> Saved';
                break;
            case 'error':
                indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Save Error';
                break;
        }
    }

    hideAutoSaveIndicator() {
        const indicator = document.getElementById('auto-save-indicator');
        if (indicator) {
            indicator.classList.remove('show');
        }
    }

    // Search suggestions
    setupAdvancedSearch() {
        const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="search" i]');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.showSearchSuggestions(e.target);
            });
            
            input.addEventListener('focus', (e) => {
                this.showSearchSuggestions(e.target);
            });
        });
    }

    showSearchSuggestions(input) {
        const query = input.value.toLowerCase();
        if (query.length < 2) return;
        
        // Sample suggestions
        const suggestions = [
            'WiFi issues', 'Mess food quality', 'Lab equipment', 'Library books',
            'Hostel maintenance', 'Fee payment', 'Exam schedule', 'Transport'
        ].filter(item => item.toLowerCase().includes(query));
        
        this.displaySuggestions(input, suggestions);
    }

    displaySuggestions(input, suggestions) {
        let suggestionsContainer = input.parentNode.querySelector('.search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(suggestionsContainer);
        }
        
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="advancedFeatures.selectSuggestion('${suggestion}', this)">
                <i class="fas fa-search" style="margin-right: 0.5rem; color: #666;"></i>
                ${suggestion}
            </div>
        `).join('');
    }

    selectSuggestion(suggestion, element) {
        const input = element.closest('.form-group').querySelector('input');
        input.value = suggestion;
        element.parentNode.style.display = 'none';
        
        // Run search
        if (typeof searchAdminComplaints === 'function') {
            searchAdminComplaints();
        }
    }

    // Progress rings
    createProgressIndicators() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.addProgressRing(form);
        });
    }

    addProgressRing(form) {
        const progressContainer = document.createElement('div');
        progressContainer.innerHTML = `
            <svg class="progress-ring" width="60" height="60">
                <circle class="progress-ring-circle" cx="30" cy="30" r="26"></circle>
                <circle class="progress-ring-progress" cx="30" cy="30" r="26" 
                        stroke-dasharray="163.36" stroke-dashoffset="163.36"></circle>
            </svg>
        `;
        
        form.addEventListener('input', () => {
            this.updateProgress(form);
        });
    }

    updateProgress(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        const filled = Array.from(inputs).filter(input => input.value.trim() !== '').length;
        const progress = (filled / inputs.length) * 100;
        
        const progressRing = form.querySelector('.progress-ring-progress');
        if (progressRing) {
            const circumference = 163.36;
            const offset = circumference - (progress / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
    }

    // Audio feedback
    setupSoundEffects() {
        this.sounds = {
            click: this.createSound(800, 0.1, 'sine'),
            success: this.createSound(600, 0.2, 'sine'),
            error: this.createSound(300, 0.3, 'sawtooth'),
            notification: this.createSound(1000, 0.15, 'triangle')
        };
    }

    createSound(frequency, duration, type = 'sine') {
        return () => {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Helper functions
    showToast(message, type) {
        // Toast with sound
        this.playSound(type === 'error' ? 'error' : type === 'success' ? 'success' : 'notification');
        
        if (typeof showToast === 'function') {
            showToast(message, type);
        }
    }

    getTypeColor(type) {
        const colors = {
            success: '#4ade80',
            error: '#ef4444',
            warning: '#fbbf24',
            info: '#3b82f6'
        };
        return colors[type] || '#b3b3b3';
    }

    getTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || '📢';
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
        return timestamp.toLocaleDateString();
    }

    // Quick action handlers
    quickNewComplaint() {
        this.playSound('click');
        if (typeof setDashboardView === 'function') {
            setDashboardView('new-complaint');
        }
        this.showNotification('Opening new complaint form', 'info');
    }

    quickSearch() {
        this.playSound('click');
        const searchInput = document.querySelector('input[placeholder*="search" i]');
        if (searchInput) {
            searchInput.focus();
            this.showNotification('Search activated', 'info');
        }
    }

    toggleNotifications() {
        const notificationCenter = document.getElementById('notification-center');
        notificationCenter.classList.toggle('show');
        this.playSound('click');
    }

    clearNotifications() {
        this.notifications = [];
        this.updateNotificationCenter();
        this.showNotification('Notifications cleared', 'info');
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.updateNotificationCenter();
        }
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateNotificationCenter();
    }

    closeModals() {
        // Close modals
        const modals = document.querySelectorAll('.modal, .notification-center.show, .quick-actions-menu.show');
        modals.forEach(modal => {
            modal.classList.remove('show', 'active');
        });
    }

    saveForm() {
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
            this.performAutoSave(activeForm);
            this.showNotification('Form saved', 'success');
        }
    }
}

// Start features
let advancedFeatures;
document.addEventListener('DOMContentLoaded', () => {
    advancedFeatures = new AdvancedFeatures();
    
    // Welcome message
    setTimeout(() => {
        advancedFeatures.showNotification('Welcome to Smart Complaint System! 🎉', 'success', true);
        advancedFeatures.showNotification('Press Ctrl+/ to see keyboard shortcuts', 'info');
    }, 2000);
});

// Global access
window.advancedFeatures = advancedFeatures;
