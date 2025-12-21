class UIComponents {
    // Toast Component
    static createToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to toast container
        const container = document.getElementById('toast-container') || this.createToastContainer();
        container.appendChild(toast);
        
        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }
    
    // Create toast container if it doesn't exist
    static createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    // Modal Component
    static createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        const {
            closable = true,
            size = 'medium',
            onClose = null,
            buttons = []
        } = options;
        
        modal.innerHTML = `
            <div class="modal-overlay" ${closable ? 'onclick="this.parentElement.remove()"' : ''}></div>
            <div class="modal-content modal-${size}">
                <div class="modal-header">
                    <h2>${title}</h2>
                    ${closable ? '<button class="modal-close" onclick="this.closest(\'.modal\').remove()">×</button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="btn ${btn.class || 'btn-secondary'}" 
                                    onclick="${btn.onclick || 'this.closest(\'.modal\').remove()'}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle close callback
        if (onClose) {
            modal.addEventListener('remove', onClose);
        }
        
        return modal;
    }
    
    // Loading Spinner Component
    static createLoadingSpinner(size = 'medium') {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner loading-${size}`;
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
            <div class="spinner-text">Loading...</div>
        `;
        return spinner;
    }
    
    // Progress Bar Component
    static createProgressBar(value = 0, max = 100, options = {}) {
        const {
            showLabel = true,
            animated = true,
            color = 'primary'
        } = options;
        
        const progressBar = document.createElement('div');
        progressBar.className = `progress-bar ${animated ? 'animated' : ''}`;
        
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
        
        progressBar.innerHTML = `
            ${showLabel ? `<div class="progress-label">${Math.round(percentage)}%</div>` : ''}
            <div class="progress-track">
                <div class="progress-fill progress-${color}" style="width: ${percentage}%"></div>
            </div>
        `;
        
        return progressBar;
    }
    
    // Card Component
    static createCard(title, content, options = {}) {
        const {
            footer = '',
            image = '',
            clickable = false,
            onClick = null
        } = options;
        
        const card = document.createElement('div');
        card.className = `card ${clickable ? 'card-clickable' : ''}`;
        
        if (clickable && onClick) {
            card.addEventListener('click', onClick);
        }
        
        card.innerHTML = `
            ${image ? `<div class="card-image"><img src="${image}" alt="${title}"></div>` : ''}
            <div class="card-header">
                <h3 class="card-title">${title}</h3>
            </div>
            <div class="card-body">
                ${content}
            </div>
            ${footer ? `<div class="card-footer">${footer}</div>` : ''}
        `;
        
        return card;
    }
    
    // Badge Component
    static createBadge(text, type = 'default') {
        const badge = document.createElement('span');
        badge.className = `badge badge-${type}`;
        badge.textContent = text;
        return badge;
    }
    
    // Alert Component
    static createAlert(message, type = 'info', dismissible = true) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} ${dismissible ? 'alert-dismissible' : ''}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        alert.innerHTML = `
            <div class="alert-icon">${icons[type] || icons.info}</div>
            <div class="alert-content">${message}</div>
            ${dismissible ? '<button class="alert-close" onclick="this.parentElement.remove()">×</button>' : ''}
        `;
        
        return alert;
    }
    
    // Dropdown Component
    static createDropdown(trigger, items, options = {}) {
        const {
            position = 'bottom-left',
            closeOnClick = true
        } = options;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        
        const menu = document.createElement('div');
        menu.className = `dropdown-menu dropdown-${position}`;
        
        items.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'dropdown-divider';
                menu.appendChild(divider);
            } else {
                const menuItem = document.createElement('a');
                menuItem.className = 'dropdown-item';
                menuItem.href = item.href || '#';
                menuItem.textContent = item.text;
                
                if (item.onClick) {
                    menuItem.addEventListener('click', (e) => {
                        e.preventDefault();
                        item.onClick();
                        if (closeOnClick) {
                            dropdown.classList.remove('active');
                        }
                    });
                }
                
                menu.appendChild(menuItem);
            }
        });
        
        dropdown.appendChild(trigger);
        dropdown.appendChild(menu);
        
        // Toggle dropdown on trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
        
        return dropdown;
    }
    
    // Tabs Component
    static createTabs(tabs, options = {}) {
        const {
            activeTab = 0,
            onTabChange = null
        } = options;
        
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'tabs-container';
        
        const tabsNav = document.createElement('div');
        tabsNav.className = 'tabs-nav';
        
        const tabsContent = document.createElement('div');
        tabsContent.className = 'tabs-content';
        
        tabs.forEach((tab, index) => {
            // Create tab button
            const tabButton = document.createElement('button');
            tabButton.className = `tab-button ${index === activeTab ? 'active' : ''}`;
            tabButton.textContent = tab.title;
            tabButton.addEventListener('click', () => {
                this.switchTab(tabsContainer, index);
                if (onTabChange) onTabChange(index, tab);
            });
            tabsNav.appendChild(tabButton);
            
            // Create tab panel
            const tabPanel = document.createElement('div');
            tabPanel.className = `tab-panel ${index === activeTab ? 'active' : ''}`;
            tabPanel.innerHTML = tab.content;
            tabsContent.appendChild(tabPanel);
        });
        
        tabsContainer.appendChild(tabsNav);
        tabsContainer.appendChild(tabsContent);
        
        return tabsContainer;
    }
    
    // Switch tab helper method
    static switchTab(tabsContainer, activeIndex) {
        const buttons = tabsContainer.querySelectorAll('.tab-button');
        const panels = tabsContainer.querySelectorAll('.tab-panel');
        
        buttons.forEach((button, index) => {
            button.classList.toggle('active', index === activeIndex);
        });
        
        panels.forEach((panel, index) => {
            panel.classList.toggle('active', index === activeIndex);
        });
    }
    
    // Accordion Component
    static createAccordion(items, options = {}) {
        const {
            allowMultiple = false,
            defaultOpen = []
        } = options;
        
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        
        items.forEach((item, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            
            const isOpen = defaultOpen.includes(index);
            
            accordionItem.innerHTML = `
                <div class="accordion-header" data-index="${index}">
                    <h3>${item.title}</h3>
                    <span class="accordion-icon">${isOpen ? '−' : '+'}</span>
                </div>
                <div class="accordion-content ${isOpen ? 'active' : ''}">
                    <div class="accordion-body">
                        ${item.content}
                    </div>
                </div>
            `;
            
            const header = accordionItem.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                this.toggleAccordionItem(accordion, index, allowMultiple);
            });
            
            accordion.appendChild(accordionItem);
        });
        
        return accordion;
    }
    
    // Toggle accordion item helper method
    static toggleAccordionItem(accordion, index, allowMultiple) {
        const items = accordion.querySelectorAll('.accordion-item');
        const targetItem = items[index];
        const targetContent = targetItem.querySelector('.accordion-content');
        const targetIcon = targetItem.querySelector('.accordion-icon');
        
        const isOpen = targetContent.classList.contains('active');
        
        if (!allowMultiple) {
            // Close all other items
            items.forEach((item, i) => {
                if (i !== index) {
                    const content = item.querySelector('.accordion-content');
                    const icon = item.querySelector('.accordion-icon');
                    content.classList.remove('active');
                    icon.textContent = '+';
                }
            });
        }
        
        // Toggle target item
        if (isOpen) {
            targetContent.classList.remove('active');
            targetIcon.textContent = '+';
        } else {
            targetContent.classList.add('active');
            targetIcon.textContent = '−';
        }
    }
    
    // Tooltip Component
    static createTooltip(element, text, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        
        element.style.position = 'relative';
        element.appendChild(tooltip);
        
        element.addEventListener('mouseenter', () => {
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
        
        return tooltip;
    }
    
    // Skeleton Loader Component
    static createSkeletonLoader(type = 'text', count = 1) {
        const container = document.createElement('div');
        container.className = 'skeleton-container';
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            container.appendChild(skeleton);
        }
        
        return container;
    }
    
    // Pagination Component
    static createPagination(currentPage, totalPages, onPageChange) {
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.textContent = '‹';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) onPageChange(currentPage - 1);
        });
        pagination.appendChild(prevButton);
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            const firstPage = this.createPageButton(1, currentPage, onPageChange);
            pagination.appendChild(firstPage);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = this.createPageButton(i, currentPage, onPageChange);
            pagination.appendChild(pageButton);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
            
            const lastPage = this.createPageButton(totalPages, currentPage, onPageChange);
            pagination.appendChild(lastPage);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.textContent = '›';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) onPageChange(currentPage + 1);
        });
        pagination.appendChild(nextButton);
        
        return pagination;
    }
    
    // Create page button helper method
    static createPageButton(pageNumber, currentPage, onPageChange) {
        const button = document.createElement('button');
        button.className = `pagination-btn ${pageNumber === currentPage ? 'active' : ''}`;
        button.textContent = pageNumber;
        button.addEventListener('click', () => onPageChange(pageNumber));
        return button;
    }
}

// Export for global access
window.UIComponents = UIComponents;

// Initialize component styles
document.addEventListener('DOMContentLoaded', () => {
    // Add component styles if not already present
    if (!document.getElementById('ui-components-styles')) {
        const style = document.createElement('style');
        style.id = 'ui-components-styles';
        style.textContent = `
            /* Toast Styles */
            .toast {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: var(--bg-card);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid var(--primary-color);
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                min-width: 300px;
                max-width: 500px;
            }
            
            .toast.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .toast.success { border-left-color: #10b981; }
            .toast.error { border-left-color: #ef4444; }
            .toast.warning { border-left-color: #f59e0b; }
            .toast.info { border-left-color: #3b82f6; }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: var(--text-secondary);
                margin-left: auto;
            }
            
            /* Modal Styles */
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background: var(--bg-card);
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .modal.active .modal-content {
                transform: scale(1);
            }
            
            .modal-small { width: 400px; }
            .modal-medium { width: 600px; }
            .modal-large { width: 800px; }
            
            /* Loading Spinner Styles */
            .loading-spinner {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            
            .spinner-circle {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .loading-small .spinner-circle { width: 24px; height: 24px; border-width: 2px; }
            .loading-large .spinner-circle { width: 60px; height: 60px; border-width: 6px; }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Progress Bar Styles */
            .progress-bar {
                width: 100%;
            }
            
            .progress-track {
                width: 100%;
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            .progress-primary { background: var(--primary-color); }
            .progress-success { background: #10b981; }
            .progress-warning { background: #f59e0b; }
            .progress-error { background: #ef4444; }
            
            /* Skeleton Loader Styles */
            .skeleton {
                background: linear-gradient(90deg, var(--border-color) 25%, var(--bg-tertiary) 50%, var(--border-color) 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
                margin-bottom: 8px;
            }
            
            .skeleton-text { height: 16px; }
            .skeleton-title { height: 24px; width: 60%; }
            .skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; }
            .skeleton-card { height: 120px; }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
});

console.log('🧩 UI Components loaded successfully');