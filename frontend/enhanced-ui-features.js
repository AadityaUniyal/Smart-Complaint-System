class EnhancedUIFeatures {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupAdvancedTooltips();
        this.setupProgressIndicators();
        this.setupAdvancedModals();
        this.setupDataTables();
        this.setupSearchEnhancements();
        this.setupAccessibilityFeatures();
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Ctrl+/': () => this.showShortcutsHelp(),
            'Ctrl+N': () => this.quickNewComplaint(),
            'Ctrl+D': () => this.showDashboard(),
            'Ctrl+L': () => this.focusSearch(),
            'Escape': () => this.closeModals(),
            'Ctrl+R': () => this.refreshData(),
            'Ctrl+E': () => this.exportData()
        };

        document.addEventListener('keydown', (e) => {
            const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
            
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });

        console.log('✅ Keyboard shortcuts initialized');
    }

    showShortcutsHelp() {
        const modal = this.createModal('Keyboard Shortcuts', `
            <div class="shortcuts-help">
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>/</kbd>
                        <span>Show this help</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>N</kbd>
                        <span>New complaint</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>D</kbd>
                        <span>Dashboard</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>L</kbd>
                        <span>Focus search</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close modals</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>R</kbd>
                        <span>Refresh data</span>
                    </div>
                </div>
            </div>
        `);
        
        this.showModal(modal);
    }

    quickNewComplaint() {
        if (currentUser && currentUser.role === 'student') {
            showDashboardView('new-complaint');
            showToast('Quick access: New complaint form', 'info');
        }
    }

    showDashboard() {
        if (currentUser) {
            if (currentUser.role === 'admin') {
                showAdminView('dashboard');
            } else {
                showDashboardView('overview');
            }
            showToast('Quick access: Dashboard', 'info');
        }
    }

    focusSearch() {
        const searchInputs = [
            '#search-complaints',
            '#admin-search-complaints',
            '.search-input'
        ];

        for (const selector of searchInputs) {
            const input = document.querySelector(selector);
            if (input && input.offsetParent !== null) {
                input.focus();
                showToast('Search focused', 'info');
                break;
            }
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        
        const dropdowns = document.querySelectorAll('.user-dropdown.active');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    refreshData() {
        if (currentUser) {
            if (currentUser.role === 'admin') {
                refreshAdminData();
            } else {
                refreshStudentData();
            }
            showToast('Data refreshed', 'success');
        }
    }

    exportData() {
        if (currentUser && currentUser.role === 'admin') {
            exportComplaints();
        } else {
            showToast('Export feature available for administrators', 'info');
        }
    }

    // Advanced Tooltips
    setupAdvancedTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            this.createTooltip(element);
        });

        // Add tooltips to common elements
        this.addCommonTooltips();
    }

    createTooltip(element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'advanced-tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        
        element.addEventListener('mouseenter', (e) => {
            document.body.appendChild(tooltip);
            this.positionTooltip(tooltip, e.target);
            tooltip.classList.add('show');
        });

        element.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
    }

    positionTooltip(tooltip, target) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltipRect.width / 2)}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
    }

    addCommonTooltips() {
        // Add tooltips to buttons and interactive elements
        const commonTooltips = [
            { selector: '.btn-primary', text: 'Primary action button' },
            { selector: '.btn-secondary', text: 'Secondary action button' },
            { selector: '.user-avatar', text: 'User menu - Click to open' },
            { selector: '.menu-item', text: 'Navigation menu item' }
        ];

        commonTooltips.forEach(({ selector, text }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.hasAttribute('data-tooltip')) {
                    element.setAttribute('data-tooltip', text);
                    this.createTooltip(element);
                }
            });
        });
    }

    // Progress Indicators
    setupProgressIndicators() {
        this.createProgressBar();
        this.setupFormProgress();
    }

    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'page-progress';
        progressBar.className = 'page-progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        
        document.body.appendChild(progressBar);

        // Show progress during page loads
        window.addEventListener('beforeunload', () => {
            this.showProgress(0);
        });

        window.addEventListener('load', () => {
            this.hideProgress();
        });
    }

    showProgress(percentage) {
        const progressBar = document.getElementById('page-progress');
        const fill = progressBar.querySelector('.progress-fill');
        
        progressBar.classList.add('active');
        fill.style.width = `${percentage}%`;
    }

    hideProgress() {
        const progressBar = document.getElementById('page-progress');
        progressBar.classList.remove('active');
    }

    setupFormProgress() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'form-progress';
            progressIndicator.innerHTML = `
                <div class="progress-steps">
                    <div class="step active">1</div>
                    <div class="step">2</div>
                    <div class="step">3</div>
                </div>
            `;
            
            form.insertBefore(progressIndicator, form.firstChild);
            
            this.trackFormProgress(form);
        });
    }

    trackFormProgress(form) {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        const steps = form.querySelectorAll('.step');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', () => {
                this.updateFormProgress(form, inputs, steps);
            });
        });
    }

    updateFormProgress(form, inputs, steps) {
        const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
        const progress = filledInputs.length / inputs.length;
        
        steps.forEach((step, index) => {
            if (index < progress * steps.length) {
                step.classList.add('completed');
            } else {
                step.classList.remove('completed');
            }
        });
    }

    // Advanced Modals
    setupAdvancedModals() {
        this.modalStack = [];
        this.setupModalAnimations();
    }

    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal advanced-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content ${options.size || 'medium'}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${options.actions ? `<div class="modal-actions">${options.actions}</div>` : ''}
            </div>
        `;

        return modal;
    }

    showModal(modal) {
        document.body.appendChild(modal);
        this.modalStack.push(modal);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal(modal);
        });
    }

    closeModal(modal) {
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.remove();
            const index = this.modalStack.indexOf(modal);
            if (index > -1) {
                this.modalStack.splice(index, 1);
            }
        }, 300);
    }

    setupModalAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .advanced-modal {
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .advanced-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .advanced-modal .modal-content {
                transform: scale(0.9) translateY(20px);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .advanced-modal.active .modal-content {
                transform: scale(1) translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    // Data Tables Enhancement
    setupDataTables() {
        const tables = document.querySelectorAll('.data-table');
        
        tables.forEach(table => {
            this.enhanceTable(table);
        });
    }

    enhanceTable(table) {
        // Add sorting
        const headers = table.querySelectorAll('th[data-sortable]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(table, header);
            });
            header.style.cursor = 'pointer';
        });

        // Add row selection
        this.addRowSelection(table);
        
        // Add pagination if needed
        this.addPagination(table);
    }

    sortTable(table, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        const isAscending = !header.classList.contains('sort-asc');

        rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent.trim();
            const bValue = b.children[columnIndex].textContent.trim();
            
            if (isAscending) {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        // Update header classes
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

        // Reorder rows
        rows.forEach(row => tbody.appendChild(row));
    }

    addRowSelection(table) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            row.addEventListener('click', () => {
                row.classList.toggle('selected');
                this.updateSelectionCount(table);
            });
        });
    }

    updateSelectionCount(table) {
        const selectedRows = table.querySelectorAll('tr.selected');
        const count = selectedRows.length;
        
        // Update selection indicator if exists
        const indicator = table.parentNode.querySelector('.selection-indicator');
        if (indicator) {
            indicator.textContent = `${count} selected`;
            indicator.style.display = count > 0 ? 'block' : 'none';
        }
    }

    addPagination(table) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const rowsPerPage = 10;
        
        if (rows.length <= rowsPerPage) return;

        const pagination = document.createElement('div');
        pagination.className = 'table-pagination';
        
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        let currentPage = 1;

        const updatePagination = () => {
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;

            rows.forEach((row, index) => {
                row.style.display = (index >= start && index < end) ? '' : 'none';
            });

            pagination.innerHTML = `
                <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
                <span>Page ${currentPage} of ${totalPages}</span>
                <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
            `;
        };

        window.changePage = (page) => {
            currentPage = page;
            updatePagination();
        };

        table.parentNode.appendChild(pagination);
        updatePagination();
    }

    // Search Enhancements
    setupSearchEnhancements() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            this.enhanceSearch(input);
        });
    }

    enhanceSearch(input) {
        // Add search suggestions
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        input.parentNode.appendChild(suggestions);

        // Add debounced search
        let searchTimeout;
        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value, suggestions);
            }, 300);
        });

        // Add search history
        this.setupSearchHistory(input);
    }

    performSearch(query, suggestionsContainer) {
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        // Mock search suggestions
        const suggestions = [
            'WiFi connectivity issues',
            'Laboratory equipment problems',
            'Examination schedule conflicts',
            'Fee payment issues',
            'Hostel accommodation problems'
        ].filter(suggestion => 
            suggestion.toLowerCase().includes(query.toLowerCase())
        );

        suggestionsContainer.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" onclick="this.closest('.search-input').value='${suggestion}'">${suggestion}</div>`
        ).join('');
    }

    setupSearchHistory(input) {
        const historyKey = 'complaint_search_history';
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.addToSearchHistory(historyKey, input.value.trim());
            }
        });
    }

    addToSearchHistory(key, query) {
        let history = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Remove if already exists
        history = history.filter(item => item !== query);
        
        // Add to beginning
        history.unshift(query);
        
        // Keep only last 10
        history = history.slice(0, 10);
        
        localStorage.setItem(key, JSON.stringify(history));
    }

    // Accessibility Features
    setupAccessibilityFeatures() {
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupKeyboardNavigation();
    }

    setupFocusManagement() {
        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.trapFocus(e, activeModal);
                }
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    setupAriaLabels() {
        // Add ARIA labels to interactive elements
        const interactiveElements = [
            { selector: '.menu-item', label: 'Navigation menu item' },
            { selector: '.btn-primary', label: 'Primary action button' },
            { selector: '.btn-secondary', label: 'Secondary action button' },
            { selector: '.user-avatar', label: 'User menu button' }
        ];

        interactiveElements.forEach(({ selector, label }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.hasAttribute('aria-label')) {
                    element.setAttribute('aria-label', label);
                }
            });
        });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for custom elements
        const customElements = document.querySelectorAll('.menu-item, .complaint-item');
        
        customElements.forEach(element => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    }
}

// Initialize enhanced UI features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedUI = new EnhancedUIFeatures();
    console.log('✅ Enhanced UI features initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedUIFeatures;
}