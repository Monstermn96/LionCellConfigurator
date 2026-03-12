/**
 * LionCell Battery Pack Configurator - Main Application
 * 
 * Handles user interaction, form validation, and orchestrates
 * the algorithm and visualization modules.
 */

// ==================== Application State ====================
const AppState = {
    cellCount: 9,
    capacities: [],
    series: 3,
    parallel: 3,
    result: null
};

// ==================== DOM Elements ====================
const elements = {
    // Cell count controls
    cellCountInput: null,
    decreaseBtn: null,
    increaseBtn: null,
    quickButtons: null,
    
    // Capacity inputs
    capacityInputsContainer: null,
    toggleBulkBtn: null,
    bulkInputContainer: null,
    bulkInput: null,
    applyBulkBtn: null,
    
    // Configuration
    seriesSelect: null,
    parallelSelect: null,
    configResult: null,
    configValidation: null,
    optimizeBtn: null,
    
    // Output
    outputSection: null,
    summaryConfig: null,
    summaryVoltage: null,
    summaryCapacity: null,
    summaryScore: null,
    summaryLevel: null,
    safetyScoreContainer: null,
    safetyMessage: null,
    
    // Views
    viewToggleBtns: null,
    visualView: null,
    tableView: null,
    diagramContainer: null,
    tableContainer: null,
    statsGrid: null
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    initializeApp();
});

function initElements() {
    elements.cellCountInput = document.getElementById('cellCount');
    elements.decreaseBtn = document.getElementById('decreaseCount');
    elements.increaseBtn = document.getElementById('increaseCount');
    elements.quickButtons = document.querySelectorAll('.btn-quick');
    
    elements.capacityInputsContainer = document.getElementById('capacityInputs');
    elements.toggleBulkBtn = document.getElementById('toggleBulkInput');
    elements.bulkInputContainer = document.getElementById('bulkInputContainer');
    elements.bulkInput = document.getElementById('bulkInput');
    elements.applyBulkBtn = document.getElementById('applyBulkInput');
    
    elements.seriesSelect = document.getElementById('seriesCount');
    elements.parallelSelect = document.getElementById('parallelCount');
    elements.configResult = document.getElementById('configResult');
    elements.configValidation = document.getElementById('configValidation');
    elements.optimizeBtn = document.getElementById('optimizeBtn');
    
    elements.outputSection = document.getElementById('outputSection');
    elements.summaryConfig = document.getElementById('summaryConfig');
    elements.summaryVoltage = document.getElementById('summaryVoltage');
    elements.summaryCapacity = document.getElementById('summaryCapacity');
    elements.summaryScore = document.getElementById('summaryScore');
    elements.summaryLevel = document.getElementById('summaryLevel');
    elements.safetyScoreContainer = document.getElementById('safetyScoreContainer');
    elements.safetyMessage = document.getElementById('safetyMessage');
    
    elements.viewToggleBtns = document.querySelectorAll('.toggle-btn');
    elements.visualView = document.getElementById('visualView');
    elements.tableView = document.getElementById('tableView');
    elements.diagramContainer = document.getElementById('diagramContainer');
    elements.tableContainer = document.getElementById('tableContainer');
    elements.statsGrid = document.getElementById('statsGrid');
}

function initEventListeners() {
    // Cell count controls
    elements.cellCountInput.addEventListener('change', handleCellCountChange);
    elements.cellCountInput.addEventListener('input', handleCellCountChange);
    elements.decreaseBtn.addEventListener('click', () => adjustCellCount(-1));
    elements.increaseBtn.addEventListener('click', () => adjustCellCount(1));
    
    elements.quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.count);
            setCellCount(count);
        });
    });
    
    // Bulk input
    elements.toggleBulkBtn.addEventListener('click', toggleBulkInput);
    elements.applyBulkBtn.addEventListener('click', applyBulkInput);
    
    // Configuration selects
    elements.seriesSelect.addEventListener('change', handleConfigChange);
    elements.parallelSelect.addEventListener('change', handleConfigChange);
    
    // Optimize button
    elements.optimizeBtn.addEventListener('click', handleOptimize);
    
    // View toggle
    elements.viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
}

function initializeApp() {
    // Set initial cell count
    setCellCount(AppState.cellCount);
    
    // Generate initial capacity inputs
    generateCapacityInputs();
    
    // Pre-fill with example data
    prefillExampleData();
    
    // Update configuration options
    updateConfigOptions();
}

// ==================== Cell Count Management ====================
function handleCellCountChange(e) {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 2) value = 2;
    if (value > 100) value = 100;
    setCellCount(value);
}

function adjustCellCount(delta) {
    const newCount = Math.max(2, Math.min(100, AppState.cellCount + delta));
    setCellCount(newCount);
}

function setCellCount(count) {
    AppState.cellCount = count;
    elements.cellCountInput.value = count;
    
    // Update quick button active state
    elements.quickButtons.forEach(btn => {
        const btnCount = parseInt(btn.dataset.count);
        btn.classList.toggle('active', btnCount === count);
    });
    
    // Regenerate inputs and config
    generateCapacityInputs();
    updateConfigOptions();
}

// ==================== Capacity Input Management ====================
function generateCapacityInputs() {
    const container = elements.capacityInputsContainer;
    container.innerHTML = '';
    
    // Preserve existing values where possible
    const existingCapacities = [...AppState.capacities];
    AppState.capacities = [];
    
    for (let i = 0; i < AppState.cellCount; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'capacity-input-wrapper';
        
        const label = document.createElement('label');
        label.textContent = `Cell ${i + 1}`;
        label.setAttribute('for', `capacity-${i}`);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `capacity-${i}`;
        input.className = 'capacity-input';
        input.placeholder = 'mAh';
        input.min = '1000';
        input.max = '5000';
        input.dataset.index = i;
        
        // Restore existing value or default
        const value = existingCapacities[i] || '';
        input.value = value;
        AppState.capacities[i] = value ? parseInt(value) : null;
        
        input.addEventListener('input', handleCapacityInput);
        input.addEventListener('focus', (e) => e.target.select());
        
        wrapper.appendChild(label);
        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}

function handleCapacityInput(e) {
    const index = parseInt(e.target.dataset.index);
    const value = parseInt(e.target.value);
    AppState.capacities[index] = isNaN(value) ? null : value;
}

function toggleBulkInput() {
    elements.bulkInputContainer.classList.toggle('hidden');
}

function applyBulkInput() {
    const text = elements.bulkInput.value;
    
    // Parse values (comma, space, or newline separated)
    const values = text
        .split(/[,\s\n]+/)
        .map(v => v.trim())
        .filter(v => v !== '')
        .map(v => parseInt(v))
        .filter(v => !isNaN(v) && v > 0);
    
    if (values.length === 0) {
        alert('No valid capacity values found. Please enter numbers separated by commas, spaces, or new lines.');
        return;
    }
    
    // Update cell count to match
    setCellCount(values.length);
    
    // Apply values to inputs
    values.forEach((value, index) => {
        const input = document.getElementById(`capacity-${index}`);
        if (input) {
            input.value = value;
            AppState.capacities[index] = value;
        }
    });
    
    // Hide bulk input
    elements.bulkInputContainer.classList.add('hidden');
    elements.bulkInput.value = '';
}

function prefillExampleData() {
    // Example data: 9 cells with values from 3420-3590
    const exampleData = [3590, 3520, 3480, 3470, 3460, 3450, 3440, 3430, 3420];
    
    exampleData.forEach((value, index) => {
        const input = document.getElementById(`capacity-${index}`);
        if (input) {
            input.value = value;
            AppState.capacities[index] = value;
        }
    });
}

// ==================== Configuration Management ====================
function updateConfigOptions() {
    const count = AppState.cellCount;
    const suggestions = suggestConfigurations(count);
    
    // Store current selections
    const currentSeries = AppState.series;
    const currentParallel = AppState.parallel;
    
    // Get unique series and parallel values
    const seriesValues = [...new Set(suggestions.map(s => s.series))].sort((a, b) => a - b);
    const parallelValues = [...new Set(suggestions.map(s => s.parallel))].sort((a, b) => a - b);
    
    // Populate series select
    elements.seriesSelect.innerHTML = seriesValues.map(s => 
        `<option value="${s}">${s}S</option>`
    ).join('');
    
    // Populate parallel select
    elements.parallelSelect.innerHTML = parallelValues.map(p => 
        `<option value="${p}">${p}P</option>`
    ).join('');
    
    // Try to restore selections, or find best match
    let newSeries = seriesValues.includes(currentSeries) ? currentSeries : seriesValues[0];
    let newParallel = count / newSeries;
    
    // If not a valid combo, find a valid one
    if (!Number.isInteger(newParallel) || !parallelValues.includes(newParallel)) {
        // Find the first valid configuration
        const validConfig = suggestions[0];
        newSeries = validConfig.series;
        newParallel = validConfig.parallel;
    }
    
    elements.seriesSelect.value = newSeries;
    elements.parallelSelect.value = newParallel;
    
    AppState.series = newSeries;
    AppState.parallel = newParallel;
    
    updateConfigDisplay();
}

function handleConfigChange() {
    AppState.series = parseInt(elements.seriesSelect.value);
    AppState.parallel = parseInt(elements.parallelSelect.value);
    updateConfigDisplay();
}

function updateConfigDisplay() {
    const requiredCells = AppState.series * AppState.parallel;
    const resultElement = elements.configResult.querySelector('.result-value');
    resultElement.textContent = requiredCells;
    
    const validation = validateConfiguration(AppState.cellCount, AppState.series, AppState.parallel);
    const validationElement = elements.configValidation;
    const iconElement = validationElement.querySelector('.validation-icon');
    const messageElement = validationElement.querySelector('.validation-message');
    
    if (validation.isValid) {
        validationElement.className = 'config-validation valid';
        iconElement.textContent = '✓';
        messageElement.textContent = `Valid ${AppState.series}S${AppState.parallel}P configuration`;
        elements.optimizeBtn.disabled = false;
    } else {
        validationElement.className = 'config-validation invalid';
        iconElement.textContent = '✗';
        messageElement.textContent = validation.message;
        elements.optimizeBtn.disabled = true;
    }
}

// ==================== Optimization ====================
function handleOptimize() {
    // Validate all capacities are filled
    const filledCapacities = AppState.capacities.filter(c => c !== null && c > 0);
    
    if (filledCapacities.length !== AppState.cellCount) {
        alert(`Please enter capacity values for all ${AppState.cellCount} cells.`);
        return;
    }
    
    // Validate configuration
    const validation = validateConfiguration(AppState.cellCount, AppState.series, AppState.parallel);
    if (!validation.isValid) {
        alert(validation.message);
        return;
    }
    
    try {
        // Run optimization
        AppState.result = optimizeCellConfiguration(
            filledCapacities,
            AppState.series,
            AppState.parallel
        );
        
        // Calculate optimization benefit
        const benefit = calculateOptimizationBenefit(
            filledCapacities,
            AppState.series,
            AppState.parallel
        );
        
        // Show results
        displayResults(AppState.result, benefit);
        
        // Show output section
        elements.outputSection.classList.remove('hidden');
        
        // Scroll to results
        elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        alert('Error during optimization: ' + error.message);
        console.error(error);
    }
}

// ==================== Results Display ====================
function displayResults(result, benefit) {
    // Update summary
    elements.summaryConfig.textContent = `${result.configuration.series}S${result.configuration.parallel}P`;
    elements.summaryVoltage.textContent = `${result.packStats.nominalVoltage.toFixed(1)}V`;
    elements.summaryCapacity.textContent = `${result.packStats.totalCapacity.toLocaleString()} mAh`;
    elements.summaryScore.textContent = `${result.safety.score}%`;
    
    // Update safety level
    const levelElement = elements.summaryLevel;
    levelElement.textContent = capitalizeFirst(result.safety.level);
    levelElement.className = `score-level ${result.safety.level}`;
    elements.safetyScoreContainer.className = `summary-item safety-score ${result.safety.level}`;
    elements.safetyMessage.textContent = result.safety.message;
    
    // Render diagram
    renderBatteryDiagram(elements.diagramContainer, result);
    
    // Render table
    renderTableView(elements.tableContainer, result);
    
    // Render stats
    renderOptimizationStats(elements.statsGrid, result, benefit);
}

// ==================== View Toggle ====================
function switchView(view) {
    // Update button states
    elements.viewToggleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Show/hide views
    if (view === 'visual') {
        elements.visualView.classList.remove('hidden');
        elements.tableView.classList.add('hidden');
    } else {
        elements.visualView.classList.add('hidden');
        elements.tableView.classList.remove('hidden');
    }
}

// ==================== Utility Functions ====================
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== Keyboard Shortcuts ====================
document.addEventListener('keydown', (e) => {
    // Enter key triggers optimization if valid
    if (e.key === 'Enter' && !elements.optimizeBtn.disabled) {
        // Don't trigger if in textarea
        if (e.target.tagName !== 'TEXTAREA') {
            handleOptimize();
        }
    }
});
