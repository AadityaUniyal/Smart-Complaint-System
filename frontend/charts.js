// Professional Chart Library for Smart Complaint System
// Advanced data visualization for admin dashboard

class ProfessionalCharts {
    constructor() {
        this.colors = [
            '#e50914', '#ff6b6b', '#4ecdc4', '#45b7d1', 
            '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff',
            '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84'
        ];
        this.gradients = [
            'linear-gradient(135deg, #e50914, #ff6b6b)',
            'linear-gradient(135deg, #4ecdc4, #45b7d1)',
            'linear-gradient(135deg, #96ceb4, #10ac84)',
            'linear-gradient(135deg, #feca57, #ff9f43)',
            'linear-gradient(135deg, #ff9ff3, #5f27cd)',
            'linear-gradient(135deg, #54a0ff, #2e86de)'
        ];
    }

    // Create animated donut chart
    createDonutChart(data, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            width = 300,
            height = 300,
            innerRadius = 60,
            outerRadius = 120,
            showLabels = true,
            showLegend = true,
            animate = true
        } = options;

        // Calculate total and percentages
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -90; // Start from top

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.cssText = 'max-width: 100%; height: auto;';

        // Create defs for gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);

        // Center coordinates
        const centerX = width / 2;
        const centerY = height / 2;

        // Create segments
        data.forEach((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            
            // Create gradient
            const gradientId = `gradient-${containerId}-${index}`;
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', this.colors[index % this.colors.length]);
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', this.colors[(index + 1) % this.colors.length]);
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);

            // Calculate path
            const startAngleRad = (currentAngle * Math.PI) / 180;
            const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;
            
            const x1 = centerX + outerRadius * Math.cos(startAngleRad);
            const y1 = centerY + outerRadius * Math.sin(startAngleRad);
            const x2 = centerX + outerRadius * Math.cos(endAngleRad);
            const y2 = centerY + outerRadius * Math.sin(endAngleRad);
            
            const x3 = centerX + innerRadius * Math.cos(endAngleRad);
            const y3 = centerY + innerRadius * Math.sin(endAngleRad);
            const x4 = centerX + innerRadius * Math.cos(startAngleRad);
            const y4 = centerY + innerRadius * Math.sin(startAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                'Z'
            ].join(' ');

            // Create path element
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', `url(#${gradientId})`);
            path.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
            path.setAttribute('stroke-width', '2');
            path.style.cssText = `
                cursor: pointer;
                transition: all 0.3s ease;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
            `;

            // Add hover effects
            path.addEventListener('mouseenter', () => {
                path.style.transform = 'scale(1.05)';
                path.style.transformOrigin = `${centerX}px ${centerY}px`;
                path.style.filter = 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2))';
            });

            path.addEventListener('mouseleave', () => {
                path.style.transform = 'scale(1)';
                path.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))';
            });

            svg.appendChild(path);

            // Add labels if enabled
            if (showLabels && percentage > 5) {
                const labelAngle = currentAngle + angle / 2;
                const labelRadius = (outerRadius + innerRadius) / 2;
                const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
                const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', labelX);
                text.setAttribute('y', labelY);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('fill', 'white');
                text.setAttribute('font-size', '12');
                text.setAttribute('font-weight', 'bold');
                text.textContent = `${percentage.toFixed(1)}%`;
                text.style.cssText = 'pointer-events: none; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);';
                
                svg.appendChild(text);
            }

            currentAngle += angle;
        });

        // Add center text
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', centerX);
        centerText.setAttribute('y', centerY - 10);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('dominant-baseline', 'middle');
        centerText.setAttribute('fill', 'var(--text-primary)');
        centerText.setAttribute('font-size', '24');
        centerText.setAttribute('font-weight', 'bold');
        centerText.textContent = total;
        
        const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerLabel.setAttribute('x', centerX);
        centerLabel.setAttribute('y', centerY + 10);
        centerLabel.setAttribute('text-anchor', 'middle');
        centerLabel.setAttribute('dominant-baseline', 'middle');
        centerLabel.setAttribute('fill', 'var(--text-secondary)');
        centerLabel.setAttribute('font-size', '12');
        centerLabel.textContent = 'Total';
        
        svg.appendChild(centerText);
        svg.appendChild(centerLabel);

        // Clear container and add chart
        container.innerHTML = '';
        const chartContainer = document.createElement('div');
        chartContainer.style.cssText = 'display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;';
        
        const svgContainer = document.createElement('div');
        svgContainer.appendChild(svg);
        chartContainer.appendChild(svgContainer);

        // Add legend if enabled
        if (showLegend) {
            const legend = this.createLegend(data);
            chartContainer.appendChild(legend);
        }

        container.appendChild(chartContainer);

        // Animate if enabled
        if (animate) {
            this.animateDonutChart(svg);
        }
    }

    // Create animated bar chart
    createBarChart(data, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            width = 400,
            height = 300,
            showValues = true,
            showGrid = true,
            animate = true,
            horizontal = false
        } = options;

        const margin = { top: 20, right: 20, bottom: 60, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.value));
        const scale = chartHeight / maxValue;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.cssText = 'max-width: 100%; height: auto;';

        // Create defs for gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);

        // Create chart group
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(chartGroup);

        // Add grid if enabled
        if (showGrid) {
            this.addGrid(chartGroup, chartWidth, chartHeight, maxValue);
        }

        // Calculate bar dimensions
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;

        // Create bars
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const y = chartHeight - barHeight;

            // Create gradient for bar
            const gradientId = `bar-gradient-${containerId}-${index}`;
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', gradientId);
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '100%');
            gradient.setAttribute('x2', '0%');
            gradient.setAttribute('y2', '0%');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', this.colors[index % this.colors.length]);
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', this.colors[(index + 2) % this.colors.length]);
            
            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);

            // Create bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', `url(#${gradientId})`);
            rect.setAttribute('rx', '4');
            rect.setAttribute('ry', '4');
            rect.style.cssText = `
                cursor: pointer;
                transition: all 0.3s ease;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            `;

            // Add hover effects
            rect.addEventListener('mouseenter', () => {
                rect.style.transform = 'scaleY(1.05)';
                rect.style.transformOrigin = 'bottom';
                rect.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))';
            });

            rect.addEventListener('mouseleave', () => {
                rect.style.transform = 'scaleY(1)';
                rect.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
            });

            chartGroup.appendChild(rect);

            // Add value labels if enabled
            if (showValues) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', y - 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', 'var(--text-primary)');
                text.setAttribute('font-size', '12');
                text.setAttribute('font-weight', 'bold');
                text.textContent = item.value;
                chartGroup.appendChild(text);
            }

            // Add x-axis labels
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x + barWidth / 2);
            label.setAttribute('y', chartHeight + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', 'var(--text-secondary)');
            label.setAttribute('font-size', '11');
            label.textContent = item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label;
            chartGroup.appendChild(label);

            // Animate bars if enabled
            if (animate) {
                rect.style.transformOrigin = 'bottom';
                rect.style.transform = 'scaleY(0)';
                setTimeout(() => {
                    rect.style.transition = 'transform 0.8s ease-out';
                    rect.style.transform = 'scaleY(1)';
                }, index * 100);
            }
        });

        // Add y-axis
        this.addYAxis(chartGroup, chartHeight, maxValue);

        container.innerHTML = '';
        container.appendChild(svg);
    }

    // Create line chart with smooth curves
    createLineChart(data, containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            width = 500,
            height = 300,
            showPoints = true,
            showArea = true,
            animate = true,
            smooth = true
        } = options;

        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Find max value for scaling
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.cssText = 'max-width: 100%; height: auto;';

        // Create defs for gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.appendChild(defs);

        // Create area gradient
        const areaGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        areaGradient.setAttribute('id', `area-gradient-${containerId}`);
        areaGradient.setAttribute('x1', '0%');
        areaGradient.setAttribute('y1', '0%');
        areaGradient.setAttribute('x2', '0%');
        areaGradient.setAttribute('y2', '100%');
        
        const areaStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        areaStop1.setAttribute('offset', '0%');
        areaStop1.setAttribute('stop-color', this.colors[0]);
        areaStop1.setAttribute('stop-opacity', '0.3');
        
        const areaStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        areaStop2.setAttribute('offset', '100%');
        areaStop2.setAttribute('stop-color', this.colors[0]);
        areaStop2.setAttribute('stop-opacity', '0');
        
        areaGradient.appendChild(areaStop1);
        areaGradient.appendChild(areaStop2);
        defs.appendChild(areaGradient);

        // Create chart group
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(chartGroup);

        // Calculate points
        const points = data.map((item, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
            return { x, y, value: item.value, label: item.label };
        });

        // Create path for line
        let pathData = '';
        if (smooth) {
            // Create smooth curve using quadratic bezier curves
            pathData = `M ${points[0].x} ${points[0].y}`;
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const cpx = (prev.x + curr.x) / 2;
                pathData += ` Q ${cpx} ${prev.y} ${curr.x} ${curr.y}`;
            }
        } else {
            pathData = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
        }

        // Create area path if enabled
        if (showArea) {
            const areaPath = pathData + ` L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
            const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            area.setAttribute('d', areaPath);
            area.setAttribute('fill', `url(#area-gradient-${containerId})`);
            chartGroup.appendChild(area);
        }

        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', pathData);
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke', this.colors[0]);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-linejoin', 'round');
        line.style.cssText = 'filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));';
        chartGroup.appendChild(line);

        // Add points if enabled
        if (showPoints) {
            points.forEach((point, index) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', point.x);
                circle.setAttribute('cy', point.y);
                circle.setAttribute('r', '4');
                circle.setAttribute('fill', 'white');
                circle.setAttribute('stroke', this.colors[0]);
                circle.setAttribute('stroke-width', '3');
                circle.style.cssText = `
                    cursor: pointer;
                    transition: all 0.3s ease;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                `;

                // Add hover effects
                circle.addEventListener('mouseenter', () => {
                    circle.setAttribute('r', '6');
                    circle.style.filter = 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))';
                    
                    // Show tooltip
                    this.showTooltip(point.x + margin.left, point.y + margin.top, `${point.label}: ${point.value}`);
                });

                circle.addEventListener('mouseleave', () => {
                    circle.setAttribute('r', '4');
                    circle.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))';
                    this.hideTooltip();
                });

                chartGroup.appendChild(circle);
            });
        }

        // Animate line if enabled
        if (animate) {
            const pathLength = line.getTotalLength();
            line.style.strokeDasharray = pathLength;
            line.style.strokeDashoffset = pathLength;
            line.style.transition = 'stroke-dashoffset 2s ease-out';
            setTimeout(() => {
                line.style.strokeDashoffset = '0';
            }, 100);
        }

        container.innerHTML = '';
        container.appendChild(svg);
    }

    // Helper methods
    createLegend(data) {
        const legend = document.createElement('div');
        legend.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.875rem;
        `;

        data.forEach((item, index) => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                cursor: pointer;
            `;

            const colorBox = document.createElement('div');
            colorBox.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 2px;
                background: ${this.colors[index % this.colors.length]};
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            `;

            const label = document.createElement('span');
            label.textContent = `${item.label} (${item.value})`;
            label.style.color = 'var(--text-primary)';

            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);

            // Add hover effect
            legendItem.addEventListener('mouseenter', () => {
                legendItem.style.backgroundColor = 'var(--bg-tertiary)';
            });

            legendItem.addEventListener('mouseleave', () => {
                legendItem.style.backgroundColor = 'transparent';
            });
        });

        return legend;
    }

    addGrid(chartGroup, width, height, maxValue) {
        const gridLines = 5;
        const step = height / gridLines;
        const valueStep = maxValue / gridLines;

        for (let i = 0; i <= gridLines; i++) {
            const y = height - (i * step);
            
            // Horizontal grid line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'var(--border-color)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('opacity', '0.3');
            chartGroup.appendChild(line);

            // Y-axis label
            if (i > 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', '-10');
                text.setAttribute('y', y + 4);
                text.setAttribute('text-anchor', 'end');
                text.setAttribute('fill', 'var(--text-secondary)');
                text.setAttribute('font-size', '10');
                text.textContent = Math.round(i * valueStep);
                chartGroup.appendChild(text);
            }
        }
    }

    addYAxis(chartGroup, height, maxValue) {
        // Y-axis line
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', '0');
        yAxis.setAttribute('y1', '0');
        yAxis.setAttribute('x2', '0');
        yAxis.setAttribute('y2', height);
        yAxis.setAttribute('stroke', 'var(--border-color)');
        yAxis.setAttribute('stroke-width', '2');
        chartGroup.appendChild(yAxis);
    }

    animateDonutChart(svg) {
        const paths = svg.querySelectorAll('path');
        paths.forEach((path, index) => {
            path.style.transformOrigin = 'center';
            path.style.transform = 'scale(0)';
            setTimeout(() => {
                path.style.transition = 'transform 0.6s ease-out';
                path.style.transform = 'scale(1)';
            }, index * 150);
        });
    }

    showTooltip(x, y, text) {
        this.hideTooltip(); // Remove existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y - 40}px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border: 1px solid var(--border-color);
            z-index: 1000;
            pointer-events: none;
            transform: translateX(-50%);
        `;
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
    }

    hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// Initialize charts when DOM is loaded
window.ProfessionalCharts = new ProfessionalCharts();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalCharts;
}