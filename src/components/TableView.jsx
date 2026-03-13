import { useMemo } from "react";
import { interpolateColor, normalizeCapacity } from "../utils/colors";

export default function TableView({ result }) {
  const { groups, packStats, balance, safety } = result;

  const allCapacities = useMemo(
    () => groups.flatMap((g) => g.cells.map((c) => c.capacity)),
    [groups]
  );
  const minCap = Math.min(...allCapacities);
  const maxCap = Math.max(...allCapacities);

  const assignments = useMemo(() => {
    const list = [];
    groups.forEach((group, groupIdx) => {
      group.cells.forEach((cell, cellIdx) => {
        list.push({
          originalIndex: cell.originalIndex,
          capacity: cell.capacity,
          group: groupIdx,
          position: cellIdx,
        });
      });
    });
    return list.sort((a, b) => a.originalIndex - b.originalIndex);
  }, [groups]);

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Group</th>
            <th>Cells</th>
            <th>Total</th>
            <th>Range</th>
            <th>Var %</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, idx) => {
            const varianceClass =
              group.rangePercent > 10
                ? "danger"
                : group.rangePercent > 5
                  ? "warning"
                  : "good";
            return (
              <tr key={idx}>
                <td>
                  <strong>P{idx + 1}</strong>
                </td>
                <td>
                  {group.cells.map((cell, ci) => {
                    const norm = normalizeCapacity(
                      cell.capacity,
                      minCap,
                      maxCap
                    );
                    const color = interpolateColor(norm);
                    return (
                      <span className="cell-capacity" key={ci}>
                        <span
                          className="cell-dot"
                          style={{ background: color }}
                        />
                        {cell.capacity}
                      </span>
                    );
                  })}
                </td>
                <td className="stat-value">
                  {group.totalCapacity.toLocaleString()}
                </td>
                <td>{group.range} mAh</td>
                <td className={`stat-value ${varianceClass}`}>
                  {group.rangePercent.toFixed(2)}%
                </td>
              </tr>
            );
          })}
          <tr className="group-header">
            <td colSpan={2}>
              <strong>Pack Summary</strong>
            </td>
            <td className="stat-value">
              {packStats.totalCapacity.toLocaleString()} mAh
            </td>
            <td>{packStats.cellRange} mAh</td>
            <td
              className={`stat-value ${
                safety.level === "excellent" || safety.level === "good"
                  ? "good"
                  : safety.level === "warning"
                    ? "warning"
                    : "danger"
              }`}
            >
              {balance.groupBalancePercent.toFixed(2)}%
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "1.5rem" }}>
        <h4
          style={{
            color: "var(--text-secondary)",
            marginBottom: "1rem",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          Cell Assignments
        </h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Capacity</th>
              <th>Group</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => {
              const norm = normalizeCapacity(a.capacity, minCap, maxCap);
              const color = interpolateColor(norm);
              return (
                <tr key={a.originalIndex}>
                  <td>#{a.originalIndex + 1}</td>
                  <td>
                    <span className="cell-capacity">
                      <span
                        className="cell-dot"
                        style={{ background: color }}
                      />
                      {a.capacity} mAh
                    </span>
                  </td>
                  <td>P{a.group + 1}</td>
                  <td>S{a.position + 1}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
