export function optimizeCellConfiguration(capacities, seriesCount, parallelCount) {
  const totalCells = seriesCount * parallelCount;

  if (capacities.length !== totalCells) {
    throw new Error(
      `Cell count mismatch: have ${capacities.length} cells, need ${totalCells} for ${seriesCount}S${parallelCount}P`
    );
  }

  const indexedCells = capacities.map((capacity, index) => ({
    originalIndex: index,
    capacity,
  }));

  const sortedCells = [...indexedCells].sort((a, b) => b.capacity - a.capacity);

  const groups = Array.from({ length: parallelCount }, () => []);

  let direction = 1;
  let groupIndex = 0;

  for (let i = 0; i < sortedCells.length; i++) {
    groups[groupIndex].push(sortedCells[i]);
    const nextIndex = groupIndex + direction;
    if (nextIndex >= parallelCount || nextIndex < 0) {
      direction *= -1;
    } else {
      groupIndex = nextIndex;
    }
  }

  const groupStats = groups.map((group, idx) => {
    const caps = group.map((c) => c.capacity);
    const total = caps.reduce((sum, c) => sum + c, 0);
    const min = Math.min(...caps);
    const max = Math.max(...caps);
    const avg = total / caps.length;
    const variance =
      caps.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / caps.length;
    const stdDev = Math.sqrt(variance);
    const range = max - min;
    const rangePercent = (range / avg) * 100;

    return {
      groupIndex: idx,
      cells: group,
      totalCapacity: total,
      minCapacity: min,
      maxCapacity: max,
      avgCapacity: avg,
      variance,
      stdDev,
      range,
      rangePercent,
    };
  });

  const packTotal = capacities.reduce((sum, c) => sum + c, 0);
  const packMin = Math.min(...capacities);
  const packMax = Math.max(...capacities);
  const packAvg = packTotal / capacities.length;

  const groupTotals = groupStats.map((g) => g.totalCapacity);
  const groupTotalMin = Math.min(...groupTotals);
  const groupTotalMax = Math.max(...groupTotals);
  const groupTotalRange = groupTotalMax - groupTotalMin;
  const groupTotalAvg =
    groupTotals.reduce((sum, t) => sum + t, 0) / groupTotals.length;
  const groupBalancePercent = (groupTotalRange / groupTotalAvg) * 100;

  const safetyScore = Math.max(
    0,
    Math.min(100, 100 - groupBalancePercent * 10)
  );

  let safetyLevel, safetyMessage;
  if (groupBalancePercent <= 1) {
    safetyLevel = "excellent";
    safetyMessage = "Excellent match! Minimal BMS workload expected.";
  } else if (groupBalancePercent <= 3) {
    safetyLevel = "good";
    safetyMessage = "Good configuration. BMS will handle balancing easily.";
  } else if (groupBalancePercent <= 5) {
    safetyLevel = "acceptable";
    safetyMessage = "Acceptable variance. BMS will need moderate balancing.";
  } else if (groupBalancePercent <= 10) {
    safetyLevel = "warning";
    safetyMessage = "High variance detected. Consider better cell matching.";
  } else {
    safetyLevel = "danger";
    safetyMessage = "Critical variance! These cells may not be safe together.";
  }

  const nominalVoltage = seriesCount * 3.7;
  const minVoltage = seriesCount * 2.5;
  const maxVoltage = seriesCount * 4.2;
  const packCapacity = groupTotalMin;

  return {
    configuration: {
      series: seriesCount,
      parallel: parallelCount,
      totalCells,
    },
    groups: groupStats,
    packStats: {
      nominalVoltage,
      minVoltage,
      maxVoltage,
      totalCapacity: packCapacity,
      theoreticalCapacity: packTotal / seriesCount,
      cellMin: packMin,
      cellMax: packMax,
      cellAvg: packAvg,
      cellRange: packMax - packMin,
    },
    balance: {
      groupTotals,
      groupTotalMin,
      groupTotalMax,
      groupTotalRange,
      groupBalancePercent,
    },
    safety: {
      score: Math.round(safetyScore),
      level: safetyLevel,
      message: safetyMessage,
    },
  };
}

export function validateConfiguration(cellCount, series, parallel) {
  const required = series * parallel;
  const isValid = cellCount === required;
  return {
    isValid,
    cellCount,
    required,
    series,
    parallel,
    message: isValid
      ? `Valid ${series}S${parallel}P configuration`
      : `Need ${required} cells for ${series}S${parallel}P, but have ${cellCount}`,
  };
}

export function suggestConfigurations(cellCount) {
  const suggestions = [];
  for (let s = 1; s <= cellCount; s++) {
    if (cellCount % s === 0) {
      const p = cellCount / s;
      const voltage = s * 3.7;
      suggestions.push({
        series: s,
        parallel: p,
        label: `${s}S${p}P`,
        nominalVoltage: voltage,
        description: `${voltage.toFixed(1)}V nominal`,
      });
    }
  }
  return suggestions;
}

export function calculateOptimizationBenefit(capacities, series, parallel) {
  const optimized = optimizeCellConfiguration(capacities, series, parallel);

  const randomGroups = Array.from({ length: parallel }, () => []);
  capacities.forEach((cap, idx) => {
    randomGroups[idx % parallel].push(cap);
  });

  const randomTotals = randomGroups.map((g) =>
    g.reduce((sum, c) => sum + c, 0)
  );
  const randomRange = Math.max(...randomTotals) - Math.min(...randomTotals);
  const randomAvg =
    randomTotals.reduce((sum, t) => sum + t, 0) / randomTotals.length;
  const randomBalancePercent = (randomRange / randomAvg) * 100;

  const improvement =
    randomBalancePercent - optimized.balance.groupBalancePercent;

  return {
    optimizedBalance: optimized.balance.groupBalancePercent,
    randomBalance: randomBalancePercent,
    improvementPercent: improvement,
    improvementFactor:
      randomBalancePercent > 0
        ? randomBalancePercent /
          Math.max(0.01, optimized.balance.groupBalancePercent)
        : 1,
  };
}
