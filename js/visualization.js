/**
 * LionCell Battery Pack Configurator - Visualization Module
 * 
 * Renders SVG diagrams of battery pack configurations
 */

/**
 * Color interpolation for capacity visualization
 */
const CapacityColors = {
    low: { r: 255, g: 107, b: 53 },   // #ff6b35 - orange
    mid: { r: 255, g: 184, b: 0 },     // #ffb800 - yellow
    high: { r: 0, g: 212, b: 170 }     // #00d4aa - teal
};

/**
 * Interpolate between colors based on value (0-1)
 */
function interpolateColor(value) {
    let r, g, b;
    
    if (value < 0.5) {
        // Interpolate between low and mid
        const t = value * 2;
        r = Math.round(CapacityColors.low.r + (CapacityColors.mid.r - CapacityColors.low.r) * t);
        g = Math.round(CapacityColors.low.g + (CapacityColors.mid.g - CapacityColors.low.g) * t);
        b = Math.round(CapacityColors.low.b + (CapacityColors.mid.b - CapacityColors.low.b) * t);
    } else {
        // Interpolate between mid and high
        const t = (value - 0.5) * 2;
        r = Math.round(CapacityColors.mid.r + (CapacityColors.high.r - CapacityColors.mid.r) * t);
        g = Math.round(CapacityColors.mid.g + (CapacityColors.high.g - CapacityColors.mid.g) * t);
        b = Math.round(CapacityColors.mid.b + (CapacityColors.high.b - CapacityColors.mid.b) * t);
    }
    
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get normalized value for capacity within range
 */
function normalizeCapacity(capacity, min, max) {
    if (max === min) return 0.5;
    return (capacity - min) / (max - min);
}

/**
 * Create SVG element with namespace
 */
function createSVGElement(tag, attributes = {}) {
    const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) {
        elem.setAttribute(key, value);
    }
    return elem;
}

/**
 * Render a single battery cell
 */
function renderCell(x, y, width, height, cell, minCap, maxCap, groupIndex, cellIndex) {
    const group = createSVGElement('g', {
        'class': 'battery-cell',
        'data-capacity': cell.capacity,
        'data-original-index': cell.originalIndex,
        'data-group': groupIndex,
        'data-cell-index': cellIndex
    });
    
    const normalizedValue = normalizeCapacity(cell.capacity, minCap, maxCap);
    const fillColor = interpolateColor(normalizedValue);
    
    // Cell body (rounded rectangle)
    const body = createSVGElement('rect', {
        x: x,
        y: y,
        width: width,
        height: height,
        rx: 4,
        ry: 4,
        fill: fillColor,
        stroke: '#21262d',
        'stroke-width': 2
    });
    group.appendChild(body);
    
    // Positive terminal (small nub at top)
    const terminalWidth = width * 0.3;
    const terminalHeight = 6;
    const terminal = createSVGElement('rect', {
        x: x + (width - terminalWidth) / 2,
        y: y - terminalHeight,
        width: terminalWidth,
        height: terminalHeight,
        rx: 2,
        ry: 2,
        fill: fillColor,
        stroke: '#21262d',
        'stroke-width': 1.5
    });
    group.appendChild(terminal);
    
    // Capacity text
    const text = createSVGElement('text', {
        x: x + width / 2,
        y: y + height / 2,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: normalizedValue > 0.7 ? '#0a0e14' : '#ffffff',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': Math.min(width * 0.25, 14),
        'font-weight': '500'
    });
    text.textContent = cell.capacity;
    group.appendChild(text);
    
    // Cell index label
    const indexLabel = createSVGElement('text', {
        x: x + width / 2,
        y: y + height - 8,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: normalizedValue > 0.7 ? 'rgba(10,14,20,0.6)' : 'rgba(255,255,255,0.6)',
        'font-family': "'JetBrains Mono', monospace",
        'font-size': 10
    });
    indexLabel.textContent = `#${cell.originalIndex + 1}`;
    group.appendChild(indexLabel);
    
    return group;
}

/**
 * Render connection wires
 */
function renderConnections(svg, layout, cellWidth, cellHeight, terminalHeight, seriesCount, parallelCount) {
    const connections = createSVGElement('g', { 'class': 'connections' });
    const wireColor = '#4a5568';
    const wireWidth = 2;
    
    // For each parallel group, connect cells in series
    layout.forEach((group, groupIndex) => {
        group.forEach((cellPos, cellIndex) => {
            if (cellIndex < group.length - 1) {
                const nextCell = group[cellIndex + 1];
                
                // Vertical connection from bottom of current cell to top of next
                const x1 = cellPos.x + cellWidth / 2;
                const y1 = cellPos.y + cellHeight;
                const x2 = nextCell.x + cellWidth / 2;
                const y2 = nextCell.y - terminalHeight;
                
                const wire = createSVGElement('path', {
                    d: `M ${x1} ${y1} C ${x1} ${y1 + 15}, ${x2} ${y2 - 15}, ${x2} ${y2}`,
                    fill: 'none',
                    stroke: wireColor,
                    'stroke-width': wireWidth,
                    'stroke-linecap': 'round'
                });
                connections.appendChild(wire);
            }
        });
    });
    
    // Connect parallel groups at top and bottom
    if (parallelCount > 1) {
        // Top connections (positive bus)
        const topY = layout[0][0].y - terminalHeight - 15;
        const busTop = createSVGElement('line', {
            x1: layout[0][0].x + cellWidth / 2,
            y1: topY,
            x2: layout[parallelCount - 1][0].x + cellWidth / 2,
            y2: topY,
            stroke: '#00d4aa',
            'stroke-width': 3,
            'stroke-linecap': 'round'
        });
        connections.appendChild(busTop);
        
        // Connect each group's first cell to top bus
        layout.forEach((group, groupIndex) => {
            const firstCell = group[0];
            const wire = createSVGElement('line', {
                x1: firstCell.x + cellWidth / 2,
                y1: firstCell.y - terminalHeight,
                x2: firstCell.x + cellWidth / 2,
                y2: topY,
                stroke: wireColor,
                'stroke-width': wireWidth,
                'stroke-linecap': 'round'
            });
            connections.appendChild(wire);
        });
        
        // Bottom connections (negative bus)
        const bottomY = layout[0][seriesCount - 1].y + cellHeight + 15;
        const busBottom = createSVGElement('line', {
            x1: layout[0][seriesCount - 1].x + cellWidth / 2,
            y1: bottomY,
            x2: layout[parallelCount - 1][seriesCount - 1].x + cellWidth / 2,
            y2: bottomY,
            stroke: '#ff6b35',
            'stroke-width': 3,
            'stroke-linecap': 'round'
        });
        connections.appendChild(busBottom);
        
        // Connect each group's last cell to bottom bus
        layout.forEach((group, groupIndex) => {
            const lastCell = group[seriesCount - 1];
            const wire = createSVGElement('line', {
                x1: lastCell.x + cellWidth / 2,
                y1: lastCell.y + cellHeight,
                x2: lastCell.x + cellWidth / 2,
                y2: bottomY,
                stroke: wireColor,
                'stroke-width': wireWidth,
                'stroke-linecap': 'round'
            });
            connections.appendChild(wire);
        });
        
        // Terminal labels
        const plusLabel = createSVGElement('text', {
            x: layout[0][0].x - 20,
            y: topY,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#00d4aa',
            'font-family': "'JetBrains Mono', monospace",
            'font-size': 16,
            'font-weight': 'bold'
        });
        plusLabel.textContent = '+';
        connections.appendChild(plusLabel);
        
        const minusLabel = createSVGElement('text', {
            x: layout[0][seriesCount - 1].x - 20,
            y: bottomY,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#ff6b35',
            'font-family': "'JetBrains Mono', monospace",
            'font-size': 16,
            'font-weight': 'bold'
        });
        minusLabel.textContent = '−';
        connections.appendChild(minusLabel);
    }
    
    svg.insertBefore(connections, svg.firstChild);
}

/**
 * Render group labels
 */
function renderGroupLabels(svg, layout, cellWidth, cellHeight, terminalHeight, seriesCount, parallelCount) {
    const labels = createSVGElement('g', { 'class': 'group-labels' });
    
    layout.forEach((group, groupIndex) => {
        const firstCell = group[0];
        const lastCell = group[seriesCount - 1];
        
        // Group box
        const boxPadding = 8;
        const boxX = firstCell.x - boxPadding;
        const boxY = firstCell.y - terminalHeight - 25 - boxPadding;
        const boxWidth = cellWidth + boxPadding * 2;
        const boxHeight = (lastCell.y + cellHeight) - (firstCell.y - terminalHeight) + 35 + boxPadding * 2;
        
        const groupBox = createSVGElement('rect', {
            x: boxX,
            y: boxY,
            width: boxWidth,
            height: boxHeight,
            rx: 8,
            ry: 8,
            fill: 'none',
            stroke: 'rgba(139, 148, 158, 0.2)',
            'stroke-width': 1,
            'stroke-dasharray': '4 2'
        });
        labels.appendChild(groupBox);
        
        // Group label
        const labelY = lastCell.y + cellHeight + 35;
        const label = createSVGElement('text', {
            x: firstCell.x + cellWidth / 2,
            y: labelY,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            fill: '#8b949e',
            'font-family': "'Outfit', sans-serif",
            'font-size': 12,
            'font-weight': '500'
        });
        label.textContent = `P${groupIndex + 1}`;
        labels.appendChild(label);
    });
    
    svg.appendChild(labels);
}

/**
 * Main function to render the battery pack diagram
 */
function renderBatteryDiagram(container, result) {
    // Clear container
    container.innerHTML = '';
    
    const { configuration, groups, packStats } = result;
    const { series: seriesCount, parallel: parallelCount } = configuration;
    
    // Dimensions
    const cellWidth = 60;
    const cellHeight = 80;
    const terminalHeight = 8;
    const horizontalGap = 30;
    const verticalGap = 25;
    const padding = 60;
    
    // Calculate SVG size
    const svgWidth = parallelCount * cellWidth + (parallelCount - 1) * horizontalGap + padding * 2;
    const svgHeight = seriesCount * (cellHeight + terminalHeight) + (seriesCount - 1) * verticalGap + padding * 2 + 40;
    
    // Create SVG
    const svg = createSVGElement('svg', {
        width: svgWidth,
        height: svgHeight,
        viewBox: `0 0 ${svgWidth} ${svgHeight}`
    });
    
    // Find min/max capacities for coloring
    const allCapacities = groups.flatMap(g => g.cells.map(c => c.capacity));
    const minCap = Math.min(...allCapacities);
    const maxCap = Math.max(...allCapacities);
    
    // Create cell layout (store positions for connections)
    const layout = [];
    
    // Cells group
    const cellsGroup = createSVGElement('g', { 'class': 'cells' });
    
    groups.forEach((group, groupIndex) => {
        const groupLayout = [];
        const groupX = padding + groupIndex * (cellWidth + horizontalGap);
        
        group.cells.forEach((cell, cellIndex) => {
            const cellX = groupX;
            const cellY = padding + cellIndex * (cellHeight + verticalGap + terminalHeight);
            
            groupLayout.push({ x: cellX, y: cellY });
            
            const cellElement = renderCell(
                cellX, cellY, cellWidth, cellHeight,
                cell, minCap, maxCap, groupIndex, cellIndex
            );
            cellsGroup.appendChild(cellElement);
        });
        
        layout.push(groupLayout);
    });
    
    svg.appendChild(cellsGroup);
    
    // Render connections
    renderConnections(svg, layout, cellWidth, cellHeight, terminalHeight, seriesCount, parallelCount);
    
    // Render group labels
    renderGroupLabels(svg, layout, cellWidth, cellHeight, terminalHeight, seriesCount, parallelCount);
    
    // Add hover interactions
    addCellHoverInteractions(svg);
    
    container.appendChild(svg);
}

/**
 * Add hover interactions to cells
 */
function addCellHoverInteractions(svg) {
    const cells = svg.querySelectorAll('.battery-cell');
    const tooltip = document.getElementById('tooltip');
    const tooltipContent = tooltip.querySelector('.tooltip-content');
    
    cells.forEach(cell => {
        cell.style.cursor = 'pointer';
        
        cell.addEventListener('mouseenter', (e) => {
            const capacity = cell.dataset.capacity;
            const originalIndex = parseInt(cell.dataset.originalIndex) + 1;
            const groupIndex = parseInt(cell.dataset.group) + 1;
            
            tooltipContent.innerHTML = `
                <strong>Cell #${originalIndex}</strong><br>
                Capacity: ${capacity} mAh<br>
                Group: P${groupIndex}
            `;
            
            tooltip.classList.remove('hidden');
            
            // Highlight cell
            const rect = cell.querySelector('rect');
            rect.setAttribute('stroke', '#00d4aa');
            rect.setAttribute('stroke-width', '3');
        });
        
        cell.addEventListener('mousemove', (e) => {
            const tooltipRect = tooltip.getBoundingClientRect();
            let x = e.clientX + 15;
            let y = e.clientY + 15;
            
            // Keep tooltip in viewport
            if (x + tooltipRect.width > window.innerWidth) {
                x = e.clientX - tooltipRect.width - 15;
            }
            if (y + tooltipRect.height > window.innerHeight) {
                y = e.clientY - tooltipRect.height - 15;
            }
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        });
        
        cell.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
            
            // Reset cell highlight
            const rect = cell.querySelector('rect');
            rect.setAttribute('stroke', '#21262d');
            rect.setAttribute('stroke-width', '2');
        });
    });
}

/**
 * Render the detailed table view
 */
function renderTableView(container, result) {
    const { configuration, groups, packStats, balance, safety } = result;
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Group</th>
                    <th>Cells</th>
                    <th>Total mAh</th>
                    <th>Range</th>
                    <th>Variance %</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Find min/max for coloring
    const allCapacities = groups.flatMap(g => g.cells.map(c => c.capacity));
    const minCap = Math.min(...allCapacities);
    const maxCap = Math.max(...allCapacities);
    
    groups.forEach((group, idx) => {
        const cellsHtml = group.cells.map(cell => {
            const normalized = normalizeCapacity(cell.capacity, minCap, maxCap);
            const color = interpolateColor(normalized);
            return `<span class="cell-capacity">
                <span class="cell-dot" style="background: ${color}"></span>
                ${cell.capacity}
            </span>`;
        }).join(' ');
        
        const varianceClass = group.rangePercent > 10 ? 'danger' : 
                             group.rangePercent > 5 ? 'warning' : 'good';
        
        html += `
            <tr>
                <td><strong>P${idx + 1}</strong></td>
                <td>${cellsHtml}</td>
                <td class="stat-value">${group.totalCapacity.toLocaleString()}</td>
                <td>${group.range} mAh</td>
                <td class="stat-value ${varianceClass}">${group.rangePercent.toFixed(2)}%</td>
            </tr>
        `;
    });
    
    // Summary row
    html += `
            <tr class="group-header">
                <td colspan="2"><strong>Pack Summary</strong></td>
                <td class="stat-value">${packStats.totalCapacity.toLocaleString()} mAh</td>
                <td>${packStats.cellRange} mAh cell range</td>
                <td class="stat-value ${safety.level === 'excellent' || safety.level === 'good' ? 'good' : 
                    safety.level === 'warning' ? 'warning' : 'danger'}">
                    ${balance.groupBalancePercent.toFixed(2)}% imbalance
                </td>
            </tr>
        </tbody>
    </table>
    
    <div style="margin-top: 1.5rem;">
        <h4 style="color: var(--text-secondary); margin-bottom: 1rem; font-weight: 500;">Cell Assignments</h4>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Original #</th>
                    <th>Capacity</th>
                    <th>Assigned to</th>
                    <th>Position in Group</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Create a mapping of original index to assignment
    const assignments = [];
    groups.forEach((group, groupIdx) => {
        group.cells.forEach((cell, cellIdx) => {
            assignments.push({
                originalIndex: cell.originalIndex,
                capacity: cell.capacity,
                group: groupIdx,
                position: cellIdx
            });
        });
    });
    
    // Sort by original index
    assignments.sort((a, b) => a.originalIndex - b.originalIndex);
    
    assignments.forEach(assignment => {
        const normalized = normalizeCapacity(assignment.capacity, minCap, maxCap);
        const color = interpolateColor(normalized);
        
        html += `
            <tr>
                <td>#${assignment.originalIndex + 1}</td>
                <td>
                    <span class="cell-capacity">
                        <span class="cell-dot" style="background: ${color}"></span>
                        ${assignment.capacity} mAh
                    </span>
                </td>
                <td>P${assignment.group + 1}</td>
                <td>S${assignment.position + 1}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Render optimization statistics
 */
function renderOptimizationStats(container, result, optimizationBenefit) {
    const { packStats, balance, safety } = result;
    
    const html = `
        <div class="stat-card">
            <span class="stat-label">Voltage Range</span>
            <span class="stat-value">${packStats.minVoltage.toFixed(1)}<span class="stat-unit">V</span></span>
            <span style="color: var(--text-muted); font-size: 0.8rem;"> to ${packStats.maxVoltage.toFixed(1)}V</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Cell Range</span>
            <span class="stat-value">${packStats.cellRange}<span class="stat-unit">mAh</span></span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${packStats.cellMin} - ${packStats.cellMax}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Group Balance</span>
            <span class="stat-value">${balance.groupTotalRange}<span class="stat-unit">mAh</span></span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">difference between groups</span>
        </div>
        <div class="stat-card highlight">
            <span class="stat-label">Optimization Benefit</span>
            <span class="stat-value">${optimizationBenefit.improvementFactor.toFixed(1)}<span class="stat-unit">x</span></span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">better than random</span>
        </div>
    `;
    
    container.innerHTML = html;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderBatteryDiagram,
        renderTableView,
        renderOptimizationStats,
        interpolateColor,
        normalizeCapacity
    };
}
