// Advanced Search & Filtering System
// Provides powerful search capabilities with fuzzy matching and advanced filters

class AdvancedSearch {
    constructor() {
        this.searchIndex = new Map();
        this.filters = {
            status: '',
            department: '',
            priority: '',
            dateRange: { start: '', end: '' },
            category: ''
        };
        this.searchHistory = this.loadSearchHistory();
        this.savedSearches = this.loadSavedSearches();
        
        this.init();
    }
    
    init() {
        console.log('🔍 Initializing advanced search system...');
        this.setupSearchInterface();
        this.setupKeyboardShortcuts();
    }
    
    setupSearchInterface() {
        // Create advanced search modal
        const searchModal = document.createElement('div');
        searchModal.id = 'advanced-search-modal';
        searchModal.className = 'modal';
        searchModal.innerHTML = `
            <div class="modal-overlay" onclick="advancedSearch.closeSearchModal()"></div>
            <div class="modal-content advanced-search-content">
                <div class="modal-header">
                    <h2 class="modal-title">🔍 Advanced Search</h2>
                    <button class="modal-close" onclick="advancedSearch.closeSearchModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="search-main">
                        <div class="search-input-container">
                            <input type="text" id="advanced-search-input" placeholder="Search complaints, students, or content..." class="search-input-main">
                            <button class="search-btn" onclick="advancedSearch.performSearch()">
                                🔍 Search
                            </button>
                        </div>
                        
                        <div class="search-suggestions" id="search-suggestions"></div>
                    </div>
                    
                    <div class="search-filters">
                        <h3>🎛️ Filters</h3>
                        
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Status</label>
                                <select id="filter-status">
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>Priority</label>
                                <select id="filter-priority">
                                    <option value="">All Priorities</option>
                                    <option value="Low">🟢 Low</option>
                                    <option value="Medium">🟡 Medium</option>
                                    <option value="High">🟠 High</option>
                                    <option value="Critical">🔴 Critical</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Department</label>
                                <select id="filter-department">
                                    <option value="">All Departments</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>Category</label>
                                <select id="filter-category">
                                    <option value="">All Categories</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-row">
                            <div class="filter-group">
                                <label>Date Range</label>
                                <div class="date-range">
                                    <input type="date" id="filter-date-start" placeholder="Start Date">
                                    <span>to</span>
                                    <input type="date" id="filter-date-end" placeholder="End Date">
                                </div>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button class="btn btn-secondary" onclick="advancedSearch.clearFilters()">
                                🗑️ Clear Filters
                            </button>
                            <button class="btn btn-primary" onclick="advancedSearch.saveCurrentSearch()">
                                💾 Save Search
                            </button>
                        </div>
                    </div>
                    
                    <div class="search-history">
                        <h3>📚 Recent Searches</h3>
                        <div id="recent-searches" class="search-history-list"></div>
                    </div>
                    
                    <div class="saved-searches">
                        <h3>⭐ Saved Searches</h3>
                        <div id="saved-searches" class="saved-searches-list"></div>
                    </div>
                </div>
                
                <div class="search-results">
                    <div class="results-header">
                        <h3 id="results-title">Search Results</h3>
                        <div class="results-actions">
                            <button class="btn btn-secondary" onclick="advancedSearch.exportResults()">
                                📊 Export Results
                            </button>
                        </div>
                    </div>
                    <div id="search-results-container" class="results-container">
                        <div class="no-results">
                            <div class="no-results-icon">🔍</div>
                            <p>Enter search terms or apply filters to find complaints</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchModal);
        
        // Setup search input with real-time suggestions
        const searchInput = document.getElementById('advanced-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.showSuggestions(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        // Setup filter change listeners
        const filterElements = ['filter-status', 'filter-priority', 'filter-department', 'filter-category', 'filter-date-start', 'filter-date-end'];
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateFilters();
                    this.performSearch();
                });
            }
        });
        
        this.loadDepartmentsAndCategories();
        this.updateSearchHistory();
        this.updateSavedSearches();
    }
    
    setupKeyboardShortcuts() {
        // Ctrl+K or Cmd+K to open search
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }
            
            // Escape to close search
            if (e.key === 'Escape') {
                this.closeSearchModal();
            }
        });
    }
    
    openSearchModal() {
        const modal = document.getElementById('advanced-search-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Focus search input
            setTimeout(() => {
                const searchInput = document.getElementById('advanced-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        }
    }
    
    closeSearchModal() {
        const modal = document.getElementById('advanced-search-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    async loadDepartmentsAndCategories() {
        try {
            // Load departments
            const deptResponse = await fetch(`${API_BASE}/departments`);
            if (deptResponse.ok) {
                const departments = await deptResponse.json();
                const deptSelect = document.getElementById('filter-department');
                if (deptSelect) {
                    departments.forEach(dept => {
                        const option = document.createElement('option');
                        option.value = dept.id;
                        option.textContent = dept.name;
                        deptSelect.appendChild(option);
                    });
                }
            }
            
            // Load categories
            const catResponse = await fetch(`${API_BASE}/complaint-categories`);
            if (catResponse.ok) {
                const categories = await catResponse.json();
                const catSelect = document.getElementById('filter-category');
                if (catSelect) {
                    categories.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.name;
                        catSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Failed to load departments/categories:', error);
        }
    }
    
    showSuggestions(query) {
        if (!query || query.length < 2) {
            this.hideSuggestions();
            return;
        }
        
        const suggestions = this.generateSuggestions(query);
        const container = document.getElementById('search-suggestions');
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="search-suggestion" onclick="advancedSearch.applySuggestion('${suggestion.text}')">
                <span class="suggestion-icon">${suggestion.icon}</span>
                <span class="suggestion-text">${suggestion.text}</span>
                <span class="suggestion-type">${suggestion.type}</span>
            </div>
        `).join('');
        
        container.style.display = 'block';
    }
    
    hideSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    generateSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();
        
        // Common search terms
        const commonTerms = [
            { text: 'wifi issues', icon: '📶', type: 'Common' },
            { text: 'hostel problems', icon: '🏠', type: 'Common' },
            { text: 'academic issues', icon: '📚', type: 'Common' },
            { text: 'library complaints', icon: '📖', type: 'Common' },
            { text: 'canteen food', icon: '🍽️', type: 'Common' },
            { text: 'transport issues', icon: '🚌', type: 'Common' }
        ];
        
        // Filter common terms
        commonTerms.forEach(term => {
            if (term.text.toLowerCase().includes(lowerQuery)) {
                suggestions.push(term);
            }
        });
        
        // Add status suggestions
        const statuses = ['Pending', 'In Progress', 'Resolved'];
        statuses.forEach(status => {
            if (status.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    text: `status:${status}`,
                    icon: '📊',
                    type: 'Filter'
                });
            }
        });
        
        // Add priority suggestions
        const priorities = ['Low', 'Medium', 'High', 'Critical'];
        priorities.forEach(priority => {
            if (priority.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    text: `priority:${priority}`,
                    icon: '⚡',
                    type: 'Filter'
                });
            }
        });
        
        return suggestions.slice(0, 6); // Limit to 6 suggestions
    }
    
    applySuggestion(suggestionText) {
        const searchInput = document.getElementById('advanced-search-input');
        if (searchInput) {
            searchInput.value = suggestionText;
            this.hideSuggestions();
            this.performSearch();
        }
    }
    
    updateFilters() {
        this.filters = {
            status: document.getElementById('filter-status')?.value || '',
            department: document.getElementById('filter-department')?.value || '',
            priority: document.getElementById('filter-priority')?.value || '',
            category: document.getElementById('filter-category')?.value || '',
            dateRange: {
                start: document.getElementById('filter-date-start')?.value || '',
                end: document.getElementById('filter-date-end')?.value || ''
            }
        };
    }
    
    async performSearch() {
        const query = document.getElementById('advanced-search-input')?.value || '';
        this.updateFilters();
        
        // Add to search history
        if (query.trim()) {
            this.addToSearchHistory(query);
        }
        
        try {
            // Show loading
            this.showSearchLoading();
            
            // Get all complaints
            const response = await fetch(`${API_BASE}/all-student-complaints`);
            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }
            
            const allComplaints = await response.json();
            
            // Apply search and filters
            const results = this.filterComplaints(allComplaints, query);
            
            // Display results
            this.displaySearchResults(results, query);
            
        } catch (error) {
            console.error('❌ Search failed:', error);
            this.showSearchError(error.message);
        }
    }
    
    filterComplaints(complaints, query) {
        let results = [...complaints];
        
        // Text search with fuzzy matching
        if (query.trim()) {
            const searchTerms = query.toLowerCase().split(' ');
            results = results.filter(complaint => {
                const searchableText = [
                    complaint.title,
                    complaint.description,
                    complaint.student_name,
                    complaint.department,
                    complaint.category,
                    complaint.status,
                    complaint.priority
                ].join(' ').toLowerCase();
                
                return searchTerms.every(term => {
                    // Handle special filters like "status:Pending"
                    if (term.includes(':')) {
                        const [filterType, filterValue] = term.split(':');
                        switch (filterType) {
                            case 'status':
                                return complaint.status.toLowerCase().includes(filterValue.toLowerCase());
                            case 'priority':
                                return complaint.priority.toLowerCase().includes(filterValue.toLowerCase());
                            case 'department':
                                return complaint.department.toLowerCase().includes(filterValue.toLowerCase());
                            default:
                                return searchableText.includes(term);
                        }
                    }
                    
                    return searchableText.includes(term) || this.fuzzyMatch(searchableText, term);
                });
            });
        }
        
        // Apply filters
        if (this.filters.status) {
            results = results.filter(c => c.status === this.filters.status);
        }
        
        if (this.filters.priority) {
            results = results.filter(c => c.priority === this.filters.priority);
        }
        
        if (this.filters.department) {
            results = results.filter(c => c.department_id == this.filters.department);
        }
        
        if (this.filters.category) {
            results = results.filter(c => c.category_id == this.filters.category);
        }
        
        // Date range filter
        if (this.filters.dateRange.start || this.filters.dateRange.end) {
            results = results.filter(c => {
                const complaintDate = new Date(c.created_at);
                const startDate = this.filters.dateRange.start ? new Date(this.filters.dateRange.start) : null;
                const endDate = this.filters.dateRange.end ? new Date(this.filters.dateRange.end) : null;
                
                if (startDate && complaintDate < startDate) return false;
                if (endDate && complaintDate > endDate) return false;
                
                return true;
            });
        }
        
        // Sort by relevance (most recent first for now)
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return results;
    }
    
    fuzzyMatch(text, term) {
        // Simple fuzzy matching - allows for 1 character difference
        if (term.length < 3) return false;
        
        for (let i = 0; i <= text.length - term.length; i++) {
            let differences = 0;
            for (let j = 0; j < term.length; j++) {
                if (text[i + j] !== term[j]) {
                    differences++;
                    if (differences > 1) break;
                }
            }
            if (differences <= 1) return true;
        }
        return false;
    }
    
    showSearchLoading() {
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <p>Searching complaints...</p>
                </div>
            `;
        }
    }
    
    showSearchError(message) {
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="search-error">
                    <div class="error-icon">❌</div>
                    <p>Search failed: ${message}</p>
                    <button class="btn btn-primary" onclick="advancedSearch.performSearch()">
                        🔄 Try Again
                    </button>
                </div>
            `;
        }
    }
    
    displaySearchResults(results, query) {
        const container = document.getElementById('search-results-container');
        const title = document.getElementById('results-title');
        
        if (!container || !title) return;
        
        title.textContent = `Search Results (${results.length} found)`;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>No complaints found matching your search criteria</p>
                    <button class="btn btn-secondary" onclick="advancedSearch.clearFilters()">
                        Clear Filters
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = results.map(complaint => `
            <div class="search-result-item">
                <div class="result-header">
                    <h4 class="result-title">${this.highlightSearchTerms(complaint.title, query)}</h4>
                    <span class="result-status status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
                </div>
                <div class="result-meta">
                    <span class="result-student">👤 ${complaint.student_name}</span>
                    <span class="result-department">🏢 ${complaint.department}</span>
                    <span class="result-priority priority-${complaint.priority.toLowerCase()}">⚡ ${complaint.priority}</span>
                    <span class="result-date">📅 ${new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
                <p class="result-description">${this.highlightSearchTerms(this.truncateText(complaint.description, 150), query)}</p>
                <div class="result-actions">
                    <button class="btn btn-small" onclick="advancedSearch.viewComplaint('${complaint.complaint_id}')">
                        👁️ View Details
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    highlightSearchTerms(text, query) {
        if (!query.trim()) return text;
        
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 2 && !term.includes(':'));
        let highlightedText = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    viewComplaint(complaintId) {
        // Close search modal and show complaint details
        this.closeSearchModal();
        
        // Trigger complaint view (this would integrate with existing complaint viewing functionality)
        if (typeof showComplaintDetails === 'function') {
            showComplaintDetails(complaintId);
        } else {
            showToast(`Viewing complaint: ${complaintId}`, 'info');
        }
    }
    
    clearFilters() {
        // Reset all filter inputs
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-priority').value = '';
        document.getElementById('filter-department').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-date-start').value = '';
        document.getElementById('filter-date-end').value = '';
        document.getElementById('advanced-search-input').value = '';
        
        // Reset filters object
        this.filters = {
            status: '',
            department: '',
            priority: '',
            dateRange: { start: '', end: '' },
            category: ''
        };
        
        // Clear results
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p>Enter search terms or apply filters to find complaints</p>
                </div>
            `;
        }
        
        showToast('Filters cleared', 'info');
    }
    
    // Search history management
    addToSearchHistory(query) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add to beginning
        this.searchHistory.unshift({
            query: query,
            timestamp: new Date(),
            filters: { ...this.filters }
        });
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        this.saveSearchHistory();
        this.updateSearchHistory();
    }
    
    loadSearchHistory() {
        const saved = localStorage.getItem('search_history');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveSearchHistory() {
        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
    
    updateSearchHistory() {
        const container = document.getElementById('recent-searches');
        if (!container) return;
        
        if (this.searchHistory.length === 0) {
            container.innerHTML = '<p class="no-history">No recent searches</p>';
            return;
        }
        
        container.innerHTML = this.searchHistory.map(item => `
            <div class="history-item" onclick="advancedSearch.applyHistorySearch('${item.query}')">
                <span class="history-query">${item.query}</span>
                <span class="history-time">${this.formatRelativeTime(item.timestamp)}</span>
            </div>
        `).join('');
    }
    
    applyHistorySearch(query) {
        const searchInput = document.getElementById('advanced-search-input');
        if (searchInput) {
            searchInput.value = query;
            this.performSearch();
        }
    }
    
    // Saved searches management
    saveCurrentSearch() {
        const query = document.getElementById('advanced-search-input')?.value || '';
        if (!query.trim()) {
            showToast('Enter a search query first', 'warning');
            return;
        }
        
        const name = prompt('Enter a name for this saved search:');
        if (!name) return;
        
        const savedSearch = {
            id: Date.now(),
            name: name,
            query: query,
            filters: { ...this.filters },
            created: new Date()
        };
        
        this.savedSearches.push(savedSearch);
        this.saveSavedSearches();
        this.updateSavedSearches();
        
        showToast(`Search saved as "${name}"`, 'success');
    }
    
    loadSavedSearches() {
        const saved = localStorage.getItem('saved_searches');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveSavedSearches() {
        localStorage.setItem('saved_searches', JSON.stringify(this.savedSearches));
    }
    
    updateSavedSearches() {
        const container = document.getElementById('saved-searches');
        if (!container) return;
        
        if (this.savedSearches.length === 0) {
            container.innerHTML = '<p class="no-saved">No saved searches</p>';
            return;
        }
        
        container.innerHTML = this.savedSearches.map(search => `
            <div class="saved-search-item">
                <div class="saved-search-info" onclick="advancedSearch.applySavedSearch(${search.id})">
                    <span class="saved-search-name">${search.name}</span>
                    <span class="saved-search-query">${search.query}</span>
                </div>
                <button class="saved-search-delete" onclick="advancedSearch.deleteSavedSearch(${search.id})">×</button>
            </div>
        `).join('');
    }
    
    applySavedSearch(searchId) {
        const search = this.savedSearches.find(s => s.id === searchId);
        if (!search) return;
        
        // Apply query
        const searchInput = document.getElementById('advanced-search-input');
        if (searchInput) {
            searchInput.value = search.query;
        }
        
        // Apply filters
        Object.keys(search.filters).forEach(key => {
            if (key === 'dateRange') {
                document.getElementById('filter-date-start').value = search.filters[key].start;
                document.getElementById('filter-date-end').value = search.filters[key].end;
            } else {
                const element = document.getElementById(`filter-${key}`);
                if (element) {
                    element.value = search.filters[key];
                }
            }
        });
        
        this.performSearch();
    }
    
    deleteSavedSearch(searchId) {
        if (confirm('Delete this saved search?')) {
            this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
            this.saveSavedSearches();
            this.updateSavedSearches();
            showToast('Saved search deleted', 'info');
        }
    }
    
    // Export results
    exportResults() {
        const results = this.getLastSearchResults();
        if (!results || results.length === 0) {
            showToast('No results to export', 'warning');
            return;
        }
        
        // Create CSV content
        const headers = ['Complaint ID', 'Title', 'Student', 'Department', 'Status', 'Priority', 'Created Date'];
        const csvContent = [
            headers.join(','),
            ...results.map(complaint => [
                complaint.complaint_id,
                `"${complaint.title.replace(/"/g, '""')}"`,
                complaint.student_name,
                complaint.department,
                complaint.status,
                complaint.priority,
                new Date(complaint.created_at).toLocaleDateString()
            ].join(','))
        ].join('\\n');
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search-results-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Results exported to CSV', 'success');
    }
    
    getLastSearchResults() {
        // This would store the last search results
        // For now, return empty array
        return [];
    }
    
    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return time.toLocaleDateString();
    }
}

// Global instance
window.advancedSearch = new AdvancedSearch();

// Add search button to existing interface
document.addEventListener('DOMContentLoaded', function() {
    // Add search button to dashboard header
    setTimeout(() => {
        const dashboardHeaders = document.querySelectorAll('.dashboard-header .nav-actions');
        dashboardHeaders.forEach(header => {
            if (!header.querySelector('.search-btn-global')) {
                const searchBtn = document.createElement('button');
                searchBtn.className = 'btn btn-icon search-btn-global';
                searchBtn.title = 'Advanced Search (Ctrl+K)';
                searchBtn.innerHTML = '🔍';
                searchBtn.onclick = () => window.advancedSearch.openSearchModal();
                header.insertBefore(searchBtn, header.firstChild);
            }
        });
    }, 2000);
});