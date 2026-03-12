# LionCell Battery Pack Configurator

A standalone web application for optimizing Li-ion battery pack configurations. Enter your cell capacities, select your series/parallel arrangement, and get the optimal cell grouping to minimize BMS workload and maximize safety.

## Features

- **Dynamic Cell Input**: Enter any number of cells with their individual mAh ratings
- **Flexible Configurations**: Support for any valid SxP configuration
- **Serpentine Optimization**: Automatically arranges cells to balance parallel group capacities
- **Visual Diagram**: SVG rendering of your battery pack with color-coded capacity indicators
- **Detailed Statistics**: Group-by-group breakdown with variance analysis
- **Safety Scoring**: Real-time safety assessment based on cell matching quality

## How to Use

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No installation or server required

2. **Enter Cell Capacities**
   - Set the number of cells using +/- buttons or quick-select presets
   - Enter each cell's capacity in mAh
   - Optionally use "Paste Values" for bulk entry

3. **Select Configuration**
   - Choose Series (S) count - determines voltage
   - Choose Parallel (P) count - determines capacity
   - The product S × P must equal your cell count

4. **Optimize**
   - Click "Optimize Configuration" to run the algorithm
   - View results in Visual Diagram or Detailed Table mode

## The Science

### Why Cell Matching Matters

When cells are connected in parallel, they share current. If cells have different capacities:
- Higher capacity cells deliver more current
- Lower capacity cells may be stressed
- The BMS must work harder to keep cells balanced
- Pack lifespan is reduced

### The Algorithm

This app uses a **serpentine distribution** strategy:

1. Sort all cells by capacity (highest to lowest)
2. Assign to groups in a snake pattern: 1→2→3→3→2→1→1→2→3...
3. This ensures each group gets a mix of high, medium, and low capacity cells
4. Result: Parallel groups with nearly equal total capacities

### Safety Levels

- **Excellent** (< 1% imbalance): Minimal BMS workload
- **Good** (1-3%): Easy balancing
- **Acceptable** (3-5%): Moderate balancing needed
- **Warning** (5-10%): Consider better matching
- **Danger** (> 10%): Cells may not be safe together

## Example

For 9 cells with capacities: 3590, 3520, 3480, 3470, 3460, 3450, 3440, 3430, 3420 mAh

In a 3S3P configuration, the optimizer arranges:
- **P1**: 3590 + 3450 + 3440 = 10,480 mAh
- **P2**: 3520 + 3460 + 3430 = 10,410 mAh
- **P3**: 3480 + 3470 + 3420 = 10,370 mAh

Maximum difference between groups: 110 mAh (≈1% imbalance)

## Technical Details

- Pure HTML, CSS, and JavaScript - no dependencies
- Works offline once loaded
- Responsive design for desktop and tablet
- No data sent to any server - all processing is local

## Browser Support

Works in all modern browsers:
- Chrome, Edge (Chromium-based)
- Firefox
- Safari

## File Structure

```
LionCellConfigurator/
├── index.html          # Main application
├── css/
│   └── styles.css      # Styling
├── js/
│   ├── algorithm.js    # Cell matching algorithm
│   ├── app.js          # Application logic
│   └── visualization.js # SVG diagram rendering
└── README.md           # This file
```

## Safety Disclaimer

This tool helps optimize cell arrangement, but proper battery safety practices are essential:

- Always use an appropriate BMS for your configuration
- Never exceed cell voltage or current limits
- Ensure proper thermal management
- Use appropriate fusing and protection
- Follow all applicable safety standards

## License

Free to use for personal and educational purposes.
