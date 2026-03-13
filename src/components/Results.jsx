import { useState } from "react";
import PackSummary from "./PackSummary";
import BatteryDiagram from "./BatteryDiagram";
import TableView from "./TableView";
import OptimizationStats from "./OptimizationStats";

export default function Results({ result, benefit }) {
  const [view, setView] = useState("visual");

  return (
    <section className="output-section">
      <PackSummary result={result} />

      <div className="view-toggle">
        <button
          type="button"
          className={`toggle-btn${view === "visual" ? " active" : ""}`}
          onClick={() => setView("visual")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          Visual
        </button>
        <button
          type="button"
          className={`toggle-btn${view === "table" ? " active" : ""}`}
          onClick={() => setView("table")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
          Table
        </button>
      </div>

      {view === "visual" ? (
        <div className="card">
          <h3 className="view-title">Battery Pack Layout</h3>
          <BatteryDiagram result={result} />
          <div className="diagram-legend">
            <div className="legend-item">
              <span className="legend-color low" />
              <span>Lower</span>
            </div>
            <div className="legend-item">
              <span className="legend-color mid" />
              <span>Medium</span>
            </div>
            <div className="legend-item">
              <span className="legend-color high" />
              <span>Higher</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="view-title">Detailed Configuration</h3>
          <TableView result={result} />
        </div>
      )}

      <div className="card">
        <h3 className="view-title">Optimization Results</h3>
        <OptimizationStats result={result} benefit={benefit} />
      </div>
    </section>
  );
}
