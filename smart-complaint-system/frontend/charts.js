class SimpleCharts {
    static createBarChart(container, data, options = {}) {
        const { width = 400, height = 300, colors = ['#e50914', '#ff6b6b', '#00a8e1'] } = options;
        
        container.innerHTML = `
            <div style="display: flex; align-items: end; justify-content: space-around; height: ${height}px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                ${data.map((item, index) => `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <div style="
                            width: 40px;
                            height: ${(item.value / Math.max(...data.map(d => d.value))) * (height - 60)}px;
                            background: linear-gradient(to top, ${colors[index % colors.length]}, ${colors[index % colors.length]}aa);
                            border-radius: 4px 4px 0 0;
                            animation: growUp 1s ease-out ${index * 0.1}s both;
                            position: relative;
                        ">
                            <div style="
                                position: absolute;
                                top: -25px;
                                left: 50%;
                                transform: translateX(-50%);
                                color: white;
                                font-size: 12px;
                                font-weight: bold;
                            ">${item.value}</div>
                        </div>
                        <div style="color: #b3b3b3; font-size: 12px; text-align: center; max-width: 60px; word-wrap: break-word;">
                            ${item.label}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static createPieChart(container, data, options = {}) {
        const { size = 200, colors = ['#e50914', '#ff6b6b', '#00a8e1', '#4ade80', '#fbbf24'] } = options;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;
        
        const segments = data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            return { ...item, percentage, angle, startAngle, color: colors[index % colors.length] };
        });

        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 2rem;">
                <div style="position: relative; width: ${size}px; height: ${size}px;">
                    <svg width="${size}" height="${size}" style="transform: rotate(-90deg);">
                        ${segments.map(segment => {
                            const radius = size / 2 - 10;
                            const centerX = size / 2;
                            const centerY = size / 2;
                            const startAngleRad = (segment.startAngle * Math.PI) / 180;
                            const endAngleRad = ((segment.startAngle + segment.angle) * Math.PI) / 180;
                            
                            const x1 = centerX + radius * Math.cos(startAngleRad);
                            const y1 = centerY + radius * Math.sin(startAngleRad);
                            const x2 = centerX + radius * Math.cos(endAngleRad);
                            const y2 = centerY + radius * Math.sin(endAngleRad);
                            
                            const largeArcFlag = segment.angle > 180 ? 1 : 0;
                            
                            return `
                                <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                                      fill="${segment.color}" 
                                      stroke="rgba(255,255,255,0.1)" 
                                      stroke-width="2"
                                      style="animation: fadeIn 1s ease-out ${segments.indexOf(segment) * 0.2}s both;">
                                </path>
                            `;
                        }).join('')}
                    </svg>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${segments.map(segment => `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 12px; height: 12px; background: ${segment.color}; border-radius: 2px;"></div>
                            <span style="color: #b3b3b3; font-size: 0.9rem;">${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

window.SimpleCharts = SimpleCharts;
