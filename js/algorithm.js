/**
 * LionCell Battery Pack Configurator - Cell Matching Algorithm
 * 
 * This module implements the serpentine distribution algorithm for optimal
 * cell matching in lithium-ion battery packs.
 * 
 * Key Principle: Cells in parallel should have similar capacities to minimize
 * BMS workload and ensure even charging/discharging.
 */

/**
 * Sorts cells and distributes them using serpentine (snake) pattern
 * to equalize total capacity across parallel groups.
 * 
 * @param {number[]} capacities - Array of cell capacities in mAh
 * @param {number} seriesCount - Number of cells in series (S)
 * @param {number} parallelCount - Number of cells in parallel (P)
 * @returns {Object} Configuration result with groups and statistics
 */
function optimizeCellConfiguration(capacities, seriesCount, parallelCount) {
    const totalCells = seriesCount * parallelCount;
    
    // Validate input
    if (capacities.length !== totalCells) {
        throw new Error(`Cell count mismatch: have ${capacities.length} cells, need ${totalCells} for ${seriesCount}S${parallelCount}P`);
    }
    
    // Create indexed cells for tracking original positions
    const indexedCells = capacities.map((capacity, index) => ({
        originalIndex: index,
        capacity: capacity
    }));
    
    // Sort cells by capacity (descending)
    const sortedCells = [...indexedCells].sort((a, b) => b.capacity - a.capacity);
    
    // Initialize parallel groups (each group will have 'seriesCount' cells)
    // In a SxP config, we have P parallel groups, each containing S cells in series
    const groups = Array.from({ length: parallelCount }, () => []);
    
    // Serpentine distribution
    // For a 3S3P: we need 3 groups of 3 cells each
    // Snake order: 0,1,2,2,1,0,0,1,2...
    let direction = 1; // 1 = forward, -1 = backward
    let groupIndex = 0;
    
    for (let i = 0; i < sortedCells.length; i++) {
        groups[groupIndex].push(sortedCells[i]);
        
        // Move to next group in snake pattern
        const nextIndex = groupIndex + direction;
        
        if (nextIndex >= parallelCount || nextIndex < 0) {
            // Reverse direction at boundaries
            direction *= -1;
        } else {
            groupIndex = nextIndex;
        }
    }
    
    // Calculate statistics for each group
    const groupStats = groups.map((group, idx) => {
        const caps = group.map(c => c.capacity);
        const total = caps.reduce((sum, c) => sum + c, 0);
        const min = Math.min(...caps);
        const max = Math.max(...caps);
        const avg = total / caps.length;
        const variance = caps.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / caps.length;
        const stdDev = Math.sqrt(variance);
        const range = max - min;
        const rangePercent = (range / avg) * 100;
        
        return {
            groupIndex: idx,
            cells: group,
            totalCapacity: total,
            minCapacity: min,
            maxCapacity: max,
            avgCapacity: avg,
            variance: variance,
            stdDev: stdDev,
            range: range,
            rangePercent: rangePercent
        };
    });
    
    // Calculate overall pack statistics
    const allCapacities = capacities;
    const packTotal = allCapacities.reduce((sum, c) => sum + c, 0);
    const packMin = Math.min(...allCapacities);
    const packMax = Math.max(...allCapacities);
    const packAvg = packTotal / allCapacities.length;
    
    // Group totals for balance check
    const groupTotals = groupStats.map(g => g.totalCapacity);
    const groupTotalMin = Math.min(...groupTotals);
    const groupTotalMax = Math.max(...groupTotals);
    const groupTotalRange = groupTotalMax - groupTotalMin;
    const groupTotalAvg = groupTotals.reduce((sum, t) => sum + t, 0) / groupTotals.length;
    const groupBalancePercent = (groupTotalRange / groupTotalAvg) * 100;
    
    // Calculate safety score (0-100)
    // Based on how well-balanced the groups are
    const maxSafeVariance = 5; // 5% variance is considered safe
    const safetyScore = Math.max(0, Math.min(100, 100 - (groupBalancePercent * 10)));
    
    // Determine safety level
    let safetyLevel, safetyMessage;
    if (groupBalancePercent <= 1) {
        safetyLevel = 'excellent';
        safetyMessage = 'Excellent match! Minimal BMS workload expected.';
    } else if (groupBalancePercent <= 3) {
        safetyLevel = 'good';
        safetyMessage = 'Good configuration. BMS will handle balancing easily.';
    } else if (groupBalancePercent <= 5) {
        safetyLevel = 'acceptable';
        safetyMessage = 'Acceptable variance. BMS will need moderate balancing.';
    } else if (groupBalancePercent <= 10) {
        safetyLevel = 'warning';
        safetyMessage = 'High variance detected. Consider better cell matching.';
    } else {
        safetyLevel = 'danger';
        safetyMessage = 'Critical variance! These cells may not be safe together.';
    }
    
    // Calculate nominal voltage (assuming 3.7V nominal per cell)
    const nominalVoltage = seriesCount * 3.7;
    const minVoltage = seriesCount * 2.5; // Typical Li-ion min
    const maxVoltage = seriesCount * 4.2; // Typical Li-ion max
    
    // Pack capacity is determined by the smallest parallel group
    const packCapacity = groupTotalMin;
    
    return {
        configuration: {
            series: seriesCount,
            parallel: parallelCount,
            totalCells: totalCells
        },
        groups: groupStats,
        packStats: {
            nominalVoltage: nominalVoltage,
            minVoltage: minVoltage,
            maxVoltage: maxVoltage,
            totalCapacity: packCapacity,
            theoreticalCapacity: packTotal / seriesCount, // If all groups were equal
            cellMin: packMin,
            cellMax: packMax,
            cellAvg: packAvg,
            cellRange: packMax - packMin
        },
        balance: {
            groupTotals: groupTotals,
            groupTotalMin: groupTotalMin,
            groupTotalMax: groupTotalMax,
            groupTotalRange: groupTotalRange,
            groupBalancePercent: groupBalancePercent
        },
        safety: {
            score: Math.round(safetyScore),
            level: safetyLevel,
            message: safetyMessage
        }
    };
}

/**
 * Validates if a configuration is possible with given cell count
 * @param {number} cellCount - Total number of cells
 * @param {number} series - Desired series count
 * @param {number} parallel - Desired parallel count
 * @returns {Object} Validation result
 */
function validateConfiguration(cellCount, series, parallel) {
    const required = series * parallel;
    const isValid = cellCount === required;
    
    return {
        isValid: isValid,
        cellCount: cellCount,
        required: required,
        series: series,
        parallel: parallel,
        message: isValid 
            ? `Valid ${series}S${parallel}P configuration` 
            : `Need ${required} cells for ${series}S${parallel}P, but have ${cellCount}`
    };
}

/**
 * Suggests possible configurations for a given cell count
 * @param {number} cellCount - Total number of cells
 * @returns {Array} Array of possible configurations
 */
function suggestConfigurations(cellCount) {
    const suggestions = [];
    
    for (let s = 1; s <= cellCount; s++) {
        if (cellCount % s === 0) {
            const p = cellCount / s;
            const voltage = s * 3.7;
            suggestions.push({
                series: s,
                parallel: p,
                label: `${s}S${p}P`,
                nominalVoltage: voltage,
                description: `${voltage.toFixed(1)}V nominal`
            });
        }
    }
    
    return suggestions;
}

/**
 * Calculates the improvement from optimization vs random assignment
 * @param {number[]} capacities - Cell capacities
 * @param {number} series - Series count
 * @param {number} parallel - Parallel count
 * @returns {Object} Comparison data
 */
function calculateOptimizationBenefit(capacities, series, parallel) {
    // Get optimized result
    const optimized = optimizeCellConfiguration(capacities, series, parallel);
    
    // Simulate random assignment (original order)
    const randomGroups = Array.from({ length: parallel }, () => []);
    capacities.forEach((cap, idx) => {
        randomGroups[idx % parallel].push(cap);
    });
    
    const randomTotals = randomGroups.map(g => g.reduce((sum, c) => sum + c, 0));
    const randomRange = Math.max(...randomTotals) - Math.min(...randomTotals);
    const randomAvg = randomTotals.reduce((sum, t) => sum + t, 0) / randomTotals.length;
    const randomBalancePercent = (randomRange / randomAvg) * 100;
    
    const improvement = randomBalancePercent - optimized.balance.groupBalancePercent;
    
    return {
        optimizedBalance: optimized.balance.groupBalancePercent,
        randomBalance: randomBalancePercent,
        improvementPercent: improvement,
        improvementFactor: randomBalancePercent > 0 ? randomBalancePercent / Math.max(0.01, optimized.balance.groupBalancePercent) : 1
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        optimizeCellConfiguration,
        validateConfiguration,
        suggestConfigurations,
        calculateOptimizationBenefit
    };
}
