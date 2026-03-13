import { useMemo, useEffect } from "react";
import {
  suggestConfigurations,
  validateConfiguration,
} from "../utils/algorithm";

export default function Configuration({
  cellCount,
  series,
  parallel,
  onConfigChange,
  onOptimize,
}) {
  const suggestions = useMemo(
    () => suggestConfigurations(cellCount),
    [cellCount]
  );

  const seriesValues = useMemo(
    () => [...new Set(suggestions.map((s) => s.series))].sort((a, b) => a - b),
    [suggestions]
  );

  const parallelValues = useMemo(
    () =>
      [...new Set(suggestions.map((s) => s.parallel))].sort((a, b) => a - b),
    [suggestions]
  );

  useEffect(() => {
    if (seriesValues.length === 0) return;
    let newS = seriesValues.includes(series) ? series : seriesValues[0];
    let newP = cellCount / newS;
    if (!Number.isInteger(newP) || !parallelValues.includes(newP)) {
      const valid = suggestions[0];
      newS = valid.series;
      newP = valid.parallel;
    }
    if (newS !== series || newP !== parallel) {
      onConfigChange(newS, newP);
    }
  }, [cellCount, seriesValues, parallelValues, suggestions]);

  const validation = useMemo(
    () => validateConfiguration(cellCount, series, parallel),
    [cellCount, series, parallel]
  );

  const requiredCells = series * parallel;

  return (
    <div className="card">
      <h2 className="card-title">
        <span className="step-number">2</span>
        Configuration
      </h2>

      <div className="config-selectors">
        <div className="config-group">
          <label htmlFor="seriesCount">Series (S)</label>
          <select
            id="seriesCount"
            value={series}
            onChange={(e) =>
              onConfigChange(parseInt(e.target.value, 10), parallel)
            }
          >
            {seriesValues.map((s) => (
              <option key={s} value={s}>
                {s}S
              </option>
            ))}
          </select>
          <span className="config-hint">Voltage multiplier</span>
        </div>

        <span className="config-operator">×</span>

        <div className="config-group">
          <label htmlFor="parallelCount">Parallel (P)</label>
          <select
            id="parallelCount"
            value={parallel}
            onChange={(e) =>
              onConfigChange(series, parseInt(e.target.value, 10))
            }
          >
            {parallelValues.map((p) => (
              <option key={p} value={p}>
                {p}P
              </option>
            ))}
          </select>
          <span className="config-hint">Capacity multiplier</span>
        </div>

        <span className="config-operator">=</span>

        <div className="config-result">
          <span className="result-value">{requiredCells}</span>
          <span className="result-label">cells</span>
        </div>
      </div>

      <div
        className={`config-validation ${validation.isValid ? "valid" : "invalid"}`}
      >
        <span>{validation.isValid ? "✓" : "✗"}</span>
        <span>{validation.message}</span>
      </div>

      <button
        type="button"
        className="btn-primary btn-large"
        disabled={!validation.isValid}
        onClick={onOptimize}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Optimize Configuration
      </button>
    </div>
  );
}
