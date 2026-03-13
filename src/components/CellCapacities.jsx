import { useState, useCallback } from "react";

const QUICK_COUNTS = [4, 6, 9, 12, 16];

export default function CellCapacities({
  cellCount,
  capacities,
  onCellCountChange,
  onCapacityChange,
  onBulkApply,
}) {
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const handleBulkApply = useCallback(() => {
    const values = bulkText
      .split(/[,\s\n]+/)
      .map((v) => v.trim())
      .filter((v) => v !== "")
      .map((v) => parseInt(v, 10))
      .filter((v) => !isNaN(v) && v > 0);

    if (values.length === 0) {
      alert(
        "No valid capacity values found. Please enter numbers separated by commas, spaces, or new lines."
      );
      return;
    }

    onBulkApply(values);
    setShowBulk(false);
    setBulkText("");
  }, [bulkText, onBulkApply]);

  return (
    <div className="card">
      <h2 className="card-title">
        <span className="step-number">1</span>
        Cell Capacities
      </h2>

      <div className="cell-count-control">
        <label>Number of Cells</label>
        <div className="cell-count-row">
          <div className="number-input-group">
            <button
              type="button"
              className="btn-icon"
              onClick={() => onCellCountChange(cellCount - 1)}
              aria-label="Decrease"
            >
              −
            </button>
            <input
              type="number"
              value={cellCount}
              min={2}
              max={100}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) onCellCountChange(v);
              }}
            />
            <button
              type="button"
              className="btn-icon"
              onClick={() => onCellCountChange(cellCount + 1)}
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <div className="quick-buttons">
            {QUICK_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                className={`btn-quick${cellCount === n ? " active" : ""}`}
                onClick={() => onCellCountChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cellCount > 0 && (
        <div className="capacity-inputs">
          {capacities.map((val, i) => (
            <div className="capacity-input-wrapper" key={i}>
              <label htmlFor={`cap-${i}`}>Cell {i + 1}</label>
              <input
                id={`cap-${i}`}
                type="number"
                className="capacity-input"
                placeholder="mAh"
                min={1000}
                max={5000}
                value={val}
                onChange={(e) => onCapacityChange(i, e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bulk-input-section">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowBulk(!showBulk)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
          Paste Values
        </button>

        {showBulk && (
          <div className="bulk-input-container">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={
                "Paste capacities separated by commas, spaces, or new lines\nExample: 3590, 3520, 3480, 3470, 3460"
              }
            />
            <button
              type="button"
              className="btn-primary"
              onClick={handleBulkApply}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
