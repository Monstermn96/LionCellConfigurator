# LionCell Battery Pack Configurator

A mobile-friendly React web application for optimizing Li-ion battery pack configurations. Enter your cell capacities, select your series/parallel arrangement, and get the optimal cell grouping to minimize BMS workload and maximize safety.

## Features

- **Mobile-First Design**: Touch-friendly UI that works great on phones, tablets, and desktops
- **Dynamic Cell Input**: Enter any number of cells (2–100) with their individual mAh ratings
- **Flexible Configurations**: Support for any valid S×P configuration
- **Serpentine Optimization**: Automatically arranges cells to balance parallel group capacities
- **Visual Diagram**: SVG rendering of your battery pack with color-coded capacity indicators
- **Detailed Statistics**: Group-by-group breakdown with variance analysis
- **Safety Scoring**: Real-time safety assessment based on cell matching quality
- **Clean Start**: Loads with empty inputs so you can enter your own data immediately

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker compose up --build
```

The app will be available at [http://localhost:3085](http://localhost:3085).

## How to Use

1. **Enter Cell Capacities** — Set the number of cells, then enter each cell's capacity in mAh. You can also paste values in bulk.
2. **Select Configuration** — Choose Series (S) and Parallel (P) counts. S × P must equal your cell count.
3. **Optimize** — Click "Optimize Configuration" to run the serpentine algorithm and view results.

## Tech Stack

- **React 19** with Vite
- **CSS** with custom properties (dark theme)
- **No runtime dependencies** beyond React

## File Structure

```
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── CellCapacities.jsx
│   │   ├── Configuration.jsx
│   │   ├── Results.jsx
│   │   ├── PackSummary.jsx
│   │   ├── BatteryDiagram.jsx
│   │   ├── TableView.jsx
│   │   ├── OptimizationStats.jsx
│   │   └── Footer.jsx
│   ├── utils/
│   │   ├── algorithm.js
│   │   └── colors.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

## Safety Disclaimer

This tool helps optimize cell arrangement, but proper battery safety practices are essential. Always use an appropriate BMS, follow voltage and current limits, and ensure proper thermal management.
