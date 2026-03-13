export default function OptimizationStats({ result, benefit }) {
  const { packStats, balance } = result;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Voltage Range</span>
        <span className="stat-value">
          {packStats.minVoltage.toFixed(1)}
          <span className="stat-unit">V</span>
        </span>
        <span className="stat-sub">to {packStats.maxVoltage.toFixed(1)}V</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Cell Range</span>
        <span className="stat-value">
          {packStats.cellRange}
          <span className="stat-unit">mAh</span>
        </span>
        <span className="stat-sub">
          {packStats.cellMin} – {packStats.cellMax}
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Group Balance</span>
        <span className="stat-value">
          {balance.groupTotalRange}
          <span className="stat-unit">mAh</span>
        </span>
        <span className="stat-sub">difference between groups</span>
      </div>
      <div className="stat-card highlight">
        <span className="stat-label">Optimization Benefit</span>
        <span className="stat-value">
          {benefit ? benefit.improvementFactor.toFixed(1) : "—"}
          <span className="stat-unit">x</span>
        </span>
        <span className="stat-sub">better than random</span>
      </div>
    </div>
  );
}
