function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function PackSummary({ result }) {
  const { configuration, packStats, safety } = result;

  return (
    <div className="card pack-summary">
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">Configuration</span>
          <span className="summary-value">
            {configuration.series}S{configuration.parallel}P
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Nominal Voltage</span>
          <span className="summary-value">
            {packStats.nominalVoltage.toFixed(1)}V
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Pack Capacity</span>
          <span className="summary-value">
            {packStats.totalCapacity.toLocaleString()} mAh
          </span>
        </div>
        <div className={`summary-item safety-score ${safety.level}`}>
          <span className="summary-label">Safety Score</span>
          <div className="score-display">
            <span className="summary-value">{safety.score}%</span>
            <span className={`score-level ${safety.level}`}>
              {capitalizeFirst(safety.level)}
            </span>
          </div>
        </div>
      </div>
      <p className="safety-message">{safety.message}</p>
    </div>
  );
}
