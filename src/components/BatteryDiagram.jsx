import { useMemo, useState, useCallback } from "react";
import { interpolateColor, normalizeCapacity } from "../utils/colors";

export default function BatteryDiagram({ result }) {
  const { configuration, groups, packStats } = result;
  const { series: seriesCount, parallel: parallelCount } = configuration;

  const [tooltip, setTooltip] = useState(null);

  const cellWidth = 60;
  const cellHeight = 80;
  const terminalHeight = 8;
  const horizontalGap = 30;
  const verticalGap = 25;
  const padding = 60;

  const allCapacities = useMemo(
    () => groups.flatMap((g) => g.cells.map((c) => c.capacity)),
    [groups]
  );
  const minCap = Math.min(...allCapacities);
  const maxCap = Math.max(...allCapacities);

  const svgWidth =
    parallelCount * cellWidth +
    (parallelCount - 1) * horizontalGap +
    padding * 2;
  const svgHeight =
    seriesCount * (cellHeight + terminalHeight) +
    (seriesCount - 1) * verticalGap +
    padding * 2 +
    40;

  const layout = useMemo(() => {
    return groups.map((group, groupIndex) => {
      const groupX = padding + groupIndex * (cellWidth + horizontalGap);
      return group.cells.map((cell, cellIndex) => ({
        x: groupX,
        y: padding + cellIndex * (cellHeight + verticalGap + terminalHeight),
        cell,
        groupIndex,
        cellIndex,
      }));
    });
  }, [groups, padding, cellWidth, horizontalGap, cellHeight, verticalGap, terminalHeight]);

  const handlePointerEnter = useCallback(
    (e, cell, groupIndex) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        capacity: cell.capacity,
        originalIndex: cell.originalIndex + 1,
        group: groupIndex + 1,
      });
    },
    []
  );

  const handlePointerLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div className="diagram-container" style={{ position: "relative" }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      >
        {/* Connections */}
        <g>
          {layout.map((group, gi) =>
            group.map((pos, ci) => {
              if (ci >= group.length - 1) return null;
              const next = group[ci + 1];
              const x1 = pos.x + cellWidth / 2;
              const y1 = pos.y + cellHeight;
              const x2 = next.x + cellWidth / 2;
              const y2 = next.y - terminalHeight;
              return (
                <path
                  key={`wire-${gi}-${ci}`}
                  d={`M ${x1} ${y1} C ${x1} ${y1 + 15}, ${x2} ${y2 - 15}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#4a5568"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })
          )}

          {parallelCount > 1 && (
            <>
              {/* Top bus */}
              <line
                x1={layout[0][0].x + cellWidth / 2}
                y1={layout[0][0].y - terminalHeight - 15}
                x2={
                  layout[parallelCount - 1][0].x + cellWidth / 2
                }
                y2={layout[0][0].y - terminalHeight - 15}
                stroke="#00d4aa"
                strokeWidth={3}
                strokeLinecap="round"
              />
              {layout.map((group, gi) => (
                <line
                  key={`top-${gi}`}
                  x1={group[0].x + cellWidth / 2}
                  y1={group[0].y - terminalHeight}
                  x2={group[0].x + cellWidth / 2}
                  y2={layout[0][0].y - terminalHeight - 15}
                  stroke="#4a5568"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ))}
              {/* Bottom bus */}
              <line
                x1={layout[0][seriesCount - 1].x + cellWidth / 2}
                y1={
                  layout[0][seriesCount - 1].y + cellHeight + 15
                }
                x2={
                  layout[parallelCount - 1][seriesCount - 1].x +
                  cellWidth / 2
                }
                y2={
                  layout[0][seriesCount - 1].y + cellHeight + 15
                }
                stroke="#ff6b35"
                strokeWidth={3}
                strokeLinecap="round"
              />
              {layout.map((group, gi) => {
                const last = group[seriesCount - 1];
                return (
                  <line
                    key={`bot-${gi}`}
                    x1={last.x + cellWidth / 2}
                    y1={last.y + cellHeight}
                    x2={last.x + cellWidth / 2}
                    y2={
                      layout[0][seriesCount - 1].y +
                      cellHeight +
                      15
                    }
                    stroke="#4a5568"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Terminal labels */}
              <text
                x={layout[0][0].x - 20}
                y={layout[0][0].y - terminalHeight - 15}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#00d4aa"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={16}
                fontWeight="bold"
              >
                +
              </text>
              <text
                x={layout[0][seriesCount - 1].x - 20}
                y={
                  layout[0][seriesCount - 1].y + cellHeight + 15
                }
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ff6b35"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={16}
                fontWeight="bold"
              >
                −
              </text>
            </>
          )}
        </g>

        {/* Cells */}
        {layout.map((group, gi) =>
          group.map((pos) => {
            const norm = normalizeCapacity(pos.cell.capacity, minCap, maxCap);
            const fill = interpolateColor(norm);
            const textColor = norm > 0.7 ? "#0a0e14" : "#ffffff";
            const subColor =
              norm > 0.7 ? "rgba(10,14,20,0.6)" : "rgba(255,255,255,0.6)";
            const isHovered =
              tooltip?.originalIndex === pos.cell.originalIndex + 1;
            return (
              <g
                key={`cell-${gi}-${pos.cellIndex}`}
                style={{ cursor: "pointer" }}
                onPointerEnter={(e) =>
                  handlePointerEnter(e, pos.cell, gi)
                }
                onPointerLeave={handlePointerLeave}
              >
                {/* Terminal */}
                <rect
                  x={pos.x + (cellWidth - cellWidth * 0.3) / 2}
                  y={pos.y - terminalHeight}
                  width={cellWidth * 0.3}
                  height={terminalHeight}
                  rx={2}
                  fill={fill}
                  stroke="#21262d"
                  strokeWidth={1.5}
                />
                {/* Body */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={cellWidth}
                  height={cellHeight}
                  rx={4}
                  fill={fill}
                  stroke={isHovered ? "#00d4aa" : "#21262d"}
                  strokeWidth={isHovered ? 3 : 2}
                />
                {/* Capacity */}
                <text
                  x={pos.x + cellWidth / 2}
                  y={pos.y + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={Math.min(cellWidth * 0.25, 14)}
                  fontWeight="500"
                >
                  {pos.cell.capacity}
                </text>
                {/* Index */}
                <text
                  x={pos.x + cellWidth / 2}
                  y={pos.y + cellHeight - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={subColor}
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize={10}
                >
                  #{pos.cell.originalIndex + 1}
                </text>
              </g>
            );
          })
        )}

        {/* Group labels */}
        {layout.map((group, gi) => {
          const first = group[0];
          const last = group[seriesCount - 1];
          const boxPad = 8;
          const boxX = first.x - boxPad;
          const boxY = first.y - terminalHeight - 25 - boxPad;
          const boxW = cellWidth + boxPad * 2;
          const boxH =
            last.y +
            cellHeight -
            (first.y - terminalHeight) +
            35 +
            boxPad * 2;
          return (
            <g key={`label-${gi}`}>
              <rect
                x={boxX}
                y={boxY}
                width={boxW}
                height={boxH}
                rx={8}
                fill="none"
                stroke="rgba(139, 148, 158, 0.2)"
                strokeWidth={1}
                strokeDasharray="4 2"
              />
              <text
                x={first.x + cellWidth / 2}
                y={last.y + cellHeight + 35}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#8b949e"
                fontFamily="'Outfit', sans-serif"
                fontSize={12}
                fontWeight="500"
              >
                P{gi + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            position: "fixed",
          }}
        >
          <strong>Cell #{tooltip.originalIndex}</strong>
          <br />
          Capacity: {tooltip.capacity} mAh
          <br />
          Group: P{tooltip.group}
        </div>
      )}
    </div>
  );
}
