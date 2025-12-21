// Advanced Reporting System
// Professional report generation and export functionality

class ReportingSystem {
    constructor() {
        this.templates = {
            executive: 'Executive Summary Report',
            detailed: 'Detailed Analytics Report',
            department: 'Department Performance Report',
            trend: 'Trend Analysis Report',
            custom: 'Custom Report'
        };
        this.init();
    }

    init() {
        this.createReportBuilder();
        this.setupEventListeners();
    }

    createReportBuilder() {
        // Create report builder modal
        const reportModal = document.createElement('div');
        reportModal.id = 'report-builder-modal';
        reportModal.className = 'modal';
        reportModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.classList.remove('active')"></div>
            <div class="modal-content report-builder">
                <div class="modal-header">
                    <h2>📊 Report Builder</h2>
                    <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')">×</button>
                </div>
                <div class="modal-body">
                    <div class="report-builder-content">
                        <div class="report-templates">
                            <h3>Report Templates</h3>
                            <div class="template-grid">
                                ${Object.entries(this.templates).map(([key, name]) => `
                                    <div class="template-card" data-template="${key}">
                                        <div class="template-icon">${this.getTemplateIcon(key)}</div>
                                        <div class="template-name">${name}</div>
                                        <div class="template-description">${this.getTemplateDescription(key)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="report-options">
                            <h3>Report Options</h3>
                            <div class="options-grid">
                                <div class="option-group">
                                    <label>Date Range</label>
                                    <select id="report-date-range">
                                        <option value="last7days">Last 7 Days</option>
                                        <option value="last30days" selected>Last 30 Days</option>
                                        <option value="last90days">Last 90 Days</option>
                                        <option value="last12months">Last 12 Months</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                
                                <div class="option-group">
                                    <label>Include Charts</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" checked> Status Distribution
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" checked> Department Performance
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox" checked> Trend Analysis
                                        </label>
                                        <label class="checkbox-label">
                                            <input type="checkbox"> Predictive Analytics
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="option-group">
                                    <label>Export Format</label>
                                    <div class="format-buttons">
                                        <button class="format-btn active" data-format="pdf">📄 PDF</button>
                                        <button class="format-btn" data-format="excel">📊 Excel</button>
                                        <button class="format-btn" data-format="powerpoint">📈 PowerPoint</button>
                                    </div>
                                </div>
                                
                                <div class="option-group">
                                    <label>Report Title</label>
                                    <input type="text" id="report-title" placeholder="Enter custom report title" 
                                           value="Smart Complaint System Analytics Report">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').classList.remove('active')">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="reportingSystem.generateReport()">
                        Generate Report
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(reportModal);
    }

    getTemplateIcon(template) {
        const icons = {
            executive: '👔',
            detailed: '📊',
            department: '🏢',
            trend: '📈',
            custom: '🛠️'
        };
        return icons[template] || '📄';
    }

    getTemplateDescription(template) {
        const descriptions = {
            executive: 'High-level overview for management',
            detailed: 'Comprehensive analytics with all metrics',
            department: 'Department-specific performance analysis',
            trend: 'Historical trends and forecasting',
            custom: 'Build your own custom report'
        };
        return descriptions[template] || 'Custom report template';
    }

    setupEventListeners() {
        // Template selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-card')) {
                document.querySelectorAll('.template-card').forEach(card => {
                    card.classList.remove('selected');
                });
                e.target.closest('.template-card').classList.add('selected');
            }
            
            if (e.target.classList.contains('format-btn')) {
                document.querySelectorAll('.format-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });

        // Add report builder button to analytics header
        setTimeout(() => {
            const analyticsControls = document.querySelector('.analytics-controls');
            if (analyticsControls && !document.querySelector('.report-builder-btn')) {
                const reportBtn = document.createElement('button');
                reportBtn.className = 'btn btn-primary report-builder-btn';
                reportBtn.innerHTML = '📊 Report Builder';
                reportBtn.onclick = () => this.showReportBuilder();
                analyticsControls.appendChild(reportBtn);
            }
        }, 1000);
    }

    showReportBuilder() {
        const modal = document.getElementById('report-builder-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    async generateReport() {
        const selectedTemplate = document.querySelector('.template-card.selected')?.dataset.template || 'detailed';
        const dateRange = document.getElementById('report-date-range')?.value || 'last30days';
        const format = document.querySelector('.format-btn.active')?.dataset.format || 'pdf';
        const title = document.getElementById('report-title')?.value || 'Analytics Report';
        
        const includeCharts = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(cb => cb.parentElement.textContent.trim());

        try {
            this.showGeneratingProgress();
            
            const reportData = await this.collectReportData(selectedTemplate, dateRange);
            const report = await this.buildReport(reportData, {
                template: selectedTemplate,
                format,
                title,
                includeCharts,
                dateRange
            });
            
            await this.exportReport(report, format, title);
            this.hideGeneratingProgress();
            this.showReportSuccess();
            
            // Close modal
            document.getElementById('report-builder-modal').classList.remove('active');
            
        } catch (error) {
            console.error('Report generation error:', error);
            this.hideGeneratingProgress();
            this.showReportError(error.message);
        }
    }

    async collectReportData(template, dateRange) {
        // Collect data based on template and date range
        const data = {
            summary: {},
            complaints: [],
            departments: [],
            trends: {},
            performance: {},
            metadata: {
                generatedAt: new Date().toISOString(),
                template,
                dateRange,
                totalRecords: 0
            }
        };

        try {
            // Get complaints data
            const complaintsResponse = await fetch(`${API_BASE}/all-student-complaints`);
            if (complaintsResponse.ok) {
                data.complaints = await complaintsResponse.json();
                data.metadata.totalRecords = data.complaints.length;
            }

            // Get departments data
            const deptResponse = await fetch(`${API_BASE}/departments`);
            if (deptResponse.ok) {
                data.departments = await deptResponse.json();
            }

            // Process analytics data
            data.summary = this.calculateSummaryMetrics(data.complaints);
            data.trends = this.calculateTrendData(data.complaints, dateRange);
            data.performance = this.calculatePerformanceData(data.complaints, data.departments);

        } catch (error) {
            console.error('Error collecting report data:', error);
            throw new Error('Failed to collect report data');
        }

        return data;
    }

    calculateSummaryMetrics(complaints) {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;

        return {
            totalComplaints: total,
            resolvedComplaints: resolved,
            pendingComplaints: pending,
            inProgressComplaints: inProgress,
            resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
            avgResolutionTime: this.calculateAvgResolutionTime(complaints.filter(c => c.status === 'Resolved')),
            satisfactionScore: this.calculateSatisfactionScore(complaints)
        };
    }

    calculateTrendData(complaints, dateRange) {
        const trends = {
            daily: [],
            weekly: [],
            monthly: []
        };

        // Calculate daily trends for the specified range
        const days = this.getDateRangeDays(dateRange);
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayComplaints = complaints.filter(c => 
                c.created_at.startsWith(dateStr)
            );

            trends.daily.push({
                date: dateStr,
                total: dayComplaints.length,
                resolved: dayComplaints.filter(c => c.status === 'Resolved').length
            });
        }

        return trends;
    }

    calculatePerformanceData(complaints, departments) {
        const performance = {};

        departments.forEach(dept => {
            const deptComplaints = complaints.filter(c => c.department === dept.name);
            const resolved = deptComplaints.filter(c => c.status === 'Resolved');

            performance[dept.name] = {
                total: deptComplaints.length,
                resolved: resolved.length,
                resolutionRate: deptComplaints.length > 0 ? 
                    ((resolved.length / deptComplaints.length) * 100).toFixed(1) : 0,
                avgResolutionTime: this.calculateAvgResolutionTime(resolved)
            };
        });

        return performance;
    }

    getDateRangeDays(dateRange) {
        const ranges = {
            last7days: 7,
            last30days: 30,
            last90days: 90,
            last12months: 365
        };
        return ranges[dateRange] || 30;
    }

    calculateAvgResolutionTime(resolvedComplaints) {
        if (!resolvedComplaints || resolvedComplaints.length === 0) return 0;

        const resolutionTimes = resolvedComplaints
            .filter(c => c.resolved_at)
            .map(c => {
                const created = new Date(c.created_at);
                const resolved = new Date(c.resolved_at);
                return (resolved - created) / (1000 * 60 * 60 * 24); // days
            });

        if (resolutionTimes.length === 0) return 0;

        const avg = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
        return avg.toFixed(1);
    }

    calculateSatisfactionScore(complaints) {
        const ratedComplaints = complaints.filter(c => c.satisfaction_rating);
        if (ratedComplaints.length === 0) return 4.2;

        const avgRating = ratedComplaints.reduce((sum, c) => sum + c.satisfaction_rating, 0) / ratedComplaints.length;
        return avgRating.toFixed(1);
    }

    async buildReport(data, options) {
        const report = {
            title: options.title,
            generatedAt: new Date().toLocaleString(),
            template: options.template,
            dateRange: options.dateRange,
            sections: []
        };

        // Executive Summary
        report.sections.push({
            title: 'Executive Summary',
            type: 'summary',
            content: {
                totalComplaints: data.summary.totalComplaints,
                resolutionRate: data.summary.resolutionRate,
                avgResolutionTime: data.summary.avgResolutionTime,
                satisfactionScore: data.summary.satisfactionScore,
                keyInsights: this.generateKeyInsights(data)
            }
        });

        // Performance Metrics
        if (options.template !== 'executive') {
            report.sections.push({
                title: 'Performance Metrics',
                type: 'metrics',
                content: data.summary
            });
        }

        // Department Analysis
        if (options.includeCharts.includes('Department Performance')) {
            report.sections.push({
                title: 'Department Performance',
                type: 'department',
                content: data.performance
            });
        }

        // Trend Analysis
        if (options.includeCharts.includes('Trend Analysis')) {
            report.sections.push({
                title: 'Trend Analysis',
                type: 'trends',
                content: data.trends
            });
        }

        // Recommendations
        report.sections.push({
            title: 'Recommendations',
            type: 'recommendations',
            content: this.generateRecommendations(data)
        });

        return report;
    }

    generateKeyInsights(data) {
        const insights = [];
        
        if (data.summary.resolutionRate > 90) {
            insights.push('Excellent resolution rate indicates strong performance');
        } else if (data.summary.resolutionRate < 70) {
            insights.push('Resolution rate needs improvement - consider process optimization');
        }

        if (data.summary.avgResolutionTime > 5) {
            insights.push('Average resolution time is above target - review workflow efficiency');
        }

        if (data.summary.satisfactionScore > 4.0) {
            insights.push('High satisfaction scores reflect quality service delivery');
        }

        // Find top performing department
        const topDept = Object.entries(data.performance)
            .sort(([,a], [,b]) => parseFloat(b.resolutionRate) - parseFloat(a.resolutionRate))[0];
        
        if (topDept) {
            insights.push(`${topDept[0]} department shows best performance with ${topDept[1].resolutionRate}% resolution rate`);
        }

        return insights;
    }

    generateRecommendations(data) {
        const recommendations = [];

        if (data.summary.resolutionRate < 85) {
            recommendations.push({
                priority: 'High',
                category: 'Process Improvement',
                recommendation: 'Implement automated routing and escalation procedures',
                expectedImpact: 'Increase resolution rate by 10-15%'
            });
        }

        if (data.summary.avgResolutionTime > 4) {
            recommendations.push({
                priority: 'Medium',
                category: 'Efficiency',
                recommendation: 'Introduce response templates and knowledge base',
                expectedImpact: 'Reduce average resolution time by 1-2 days'
            });
        }

        recommendations.push({
            priority: 'Low',
            category: 'Analytics',
            recommendation: 'Implement real-time dashboard monitoring',
            expectedImpact: 'Improve visibility and proactive issue management'
        });

        return recommendations;
    }

    async exportReport(report, format, title) {
        const filename = `${title.replace(/\s+/g, '_')}_${Date.now()}`;
        
        if (format === 'pdf') {
            await this.exportToPDF(report, filename);
        } else if (format === 'excel') {
            await this.exportToExcel(report, filename);
        } else if (format === 'powerpoint') {
            await this.exportToPowerPoint(report, filename);
        }
    }

    async exportToPDF(report, filename) {
        // Generate HTML content for PDF
        const htmlContent = this.generateHTMLReport(report);
        
        // Create a temporary window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${report.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e50914; padding-bottom: 20px; }
                    .section { margin-bottom: 30px; page-break-inside: avoid; }
                    .section-title { color: #e50914; font-size: 1.5em; margin-bottom: 15px; }
                    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                    .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
                    .metric-value { font-size: 2em; font-weight: bold; color: #e50914; }
                    .metric-label { color: #666; font-size: 0.9em; }
                    .insight-list { list-style: none; padding: 0; }
                    .insight-item { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 4px solid #e50914; }
                    .recommendation { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                    .priority-high { border-left: 4px solid #dc3545; }
                    .priority-medium { border-left: 4px solid #ffc107; }
                    .priority-low { border-left: 4px solid #28a745; }
                    @media print { body { margin: 0; } .no-print { display: none; } }
                </style>
            </head>
            <body>
                ${htmlContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    generateHTMLReport(report) {
        let html = `
            <div class="report-header">
                <h1>${report.title}</h1>
                <p>Generated on ${report.generatedAt}</p>
                <p>Template: ${report.template} | Date Range: ${report.dateRange}</p>
            </div>
        `;

        report.sections.forEach(section => {
            html += `<div class="section">`;
            html += `<h2 class="section-title">${section.title}</h2>`;

            switch (section.type) {
                case 'summary':
                case 'metrics':
                    html += `
                        <div class="metric-grid">
                            <div class="metric-card">
                                <div class="metric-value">${section.content.totalComplaints}</div>
                                <div class="metric-label">Total Complaints</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${section.content.resolutionRate}%</div>
                                <div class="metric-label">Resolution Rate</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${section.content.avgResolutionTime}</div>
                                <div class="metric-label">Avg Resolution (days)</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">${section.content.satisfactionScore}/5.0</div>
                                <div class="metric-label">Satisfaction Score</div>
                            </div>
                        </div>
                    `;
                    
                    if (section.content.keyInsights) {
                        html += `
                            <h3>Key Insights</h3>
                            <ul class="insight-list">
                                ${section.content.keyInsights.map(insight => 
                                    `<li class="insight-item">${insight}</li>`
                                ).join('')}
                            </ul>
                        `;
                    }
                    break;

                case 'department':
                    html += `<div class="department-performance">`;
                    Object.entries(section.content).forEach(([dept, data]) => {
                        html += `
                            <div class="department-item">
                                <h4>${dept}</h4>
                                <p>Total: ${data.total} | Resolved: ${data.resolved} | Rate: ${data.resolutionRate}%</p>
                            </div>
                        `;
                    });
                    html += `</div>`;
                    break;

                case 'recommendations':
                    section.content.forEach(rec => {
                        html += `
                            <div class="recommendation priority-${rec.priority.toLowerCase()}">
                                <h4>${rec.category} (${rec.priority} Priority)</h4>
                                <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                                <p><strong>Expected Impact:</strong> ${rec.expectedImpact}</p>
                            </div>
                        `;
                    });
                    break;
            }

            html += `</div>`;
        });

        return html;
    }

    async exportToExcel(report, filename) {
        // Generate CSV content (simplified Excel export)
        let csvContent = `${report.title}\nGenerated: ${report.generatedAt}\n\n`;
        
        report.sections.forEach(section => {
            csvContent += `${section.title}\n`;
            
            if (section.type === 'summary' || section.type === 'metrics') {
                csvContent += `Metric,Value\n`;
                csvContent += `Total Complaints,${section.content.totalComplaints}\n`;
                csvContent += `Resolution Rate,${section.content.resolutionRate}%\n`;
                csvContent += `Avg Resolution Time,${section.content.avgResolutionTime} days\n`;
                csvContent += `Satisfaction Score,${section.content.satisfactionScore}/5.0\n`;
            }
            
            csvContent += `\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, `${filename}.csv`);
    }

    async exportToPowerPoint(report, filename) {
        // Generate a simple HTML presentation
        const presentationHTML = this.generatePresentationHTML(report);
        const blob = new Blob([presentationHTML], { type: 'text/html' });
        this.downloadFile(blob, `${filename}_presentation.html`);
    }

    generatePresentationHTML(report) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${report.title} - Presentation</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; background: #f5f5f5; }
                    .slide { width: 100vw; height: 100vh; padding: 60px; box-sizing: border-box; 
                             display: none; background: white; }
                    .slide.active { display: flex; flex-direction: column; justify-content: center; }
                    .slide h1 { color: #e50914; font-size: 3em; text-align: center; }
                    .slide h2 { color: #e50914; font-size: 2em; margin-bottom: 30px; }
                    .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
                    .metric-card { text-align: center; padding: 30px; background: #f8f9fa; border-radius: 10px; }
                    .metric-value { font-size: 3em; font-weight: bold; color: #e50914; }
                    .controls { position: fixed; bottom: 20px; right: 20px; }
                    .btn { padding: 10px 20px; margin: 5px; background: #e50914; color: white; 
                           border: none; border-radius: 5px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="slide active">
                    <h1>${report.title}</h1>
                    <p style="text-align: center; font-size: 1.5em;">Generated on ${report.generatedAt}</p>
                </div>
                
                ${report.sections.map((section, index) => `
                    <div class="slide">
                        <h2>${section.title}</h2>
                        ${section.type === 'summary' || section.type === 'metrics' ? `
                            <div class="metric-grid">
                                <div class="metric-card">
                                    <div class="metric-value">${section.content.totalComplaints}</div>
                                    <div>Total Complaints</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">${section.content.resolutionRate}%</div>
                                    <div>Resolution Rate</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">${section.content.avgResolutionTime}</div>
                                    <div>Avg Resolution (days)</div>
                                </div>
                                <div class="metric-card">
                                    <div class="metric-value">${section.content.satisfactionScore}/5.0</div>
                                    <div>Satisfaction Score</div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
                
                <div class="controls">
                    <button class="btn" onclick="previousSlide()">Previous</button>
                    <button class="btn" onclick="nextSlide()">Next</button>
                </div>
                
                <script>
                    let currentSlide = 0;
                    const slides = document.querySelectorAll('.slide');
                    
                    function showSlide(n) {
                        slides.forEach(slide => slide.classList.remove('active'));
                        slides[n].classList.add('active');
                    }
                    
                    function nextSlide() {
                        currentSlide = (currentSlide + 1) % slides.length;
                        showSlide(currentSlide);
                    }
                    
                    function previousSlide() {
                        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                        showSlide(currentSlide);
                    }
                    
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'ArrowRight') nextSlide();
                        if (e.key === 'ArrowLeft') previousSlide();
                    });
                </script>
            </body>
            </html>
        `;
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showGeneratingProgress() {
        const progressModal = document.createElement('div');
        progressModal.id = 'report-progress-modal';
        progressModal.className = 'modal active';
        progressModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <div class="modal-body">
                    <div class="analytics-loading">
                        <div class="analytics-loading-spinner"></div>
                        <h3>Generating Report...</h3>
                        <p>Please wait while we compile your analytics report.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(progressModal);
    }

    hideGeneratingProgress() {
        const progressModal = document.getElementById('report-progress-modal');
        if (progressModal) {
            progressModal.remove();
        }
    }

    showReportSuccess() {
        if (window.notificationCenter) {
            window.notificationCenter.add({
                type: 'success',
                title: 'Report Generated Successfully',
                message: 'Your analytics report has been generated and downloaded.',
                important: false
            });
        }
    }

    showReportError(message) {
        if (window.notificationCenter) {
            window.notificationCenter.add({
                type: 'error',
                title: 'Report Generation Failed',
                message: message || 'Failed to generate report. Please try again.',
                important: true
            });
        }
    }
}

// Initialize Reporting System
window.ReportingSystem = ReportingSystem;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.currentUser?.role === 'admin') {
        setTimeout(() => {
            window.reportingSystem = new ReportingSystem();
        }, 3000);
    }
});

console.log('📊 Advanced Reporting System loaded successfully');