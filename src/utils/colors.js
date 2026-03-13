const CapacityColors = {
  low: { r: 255, g: 107, b: 53 },
  mid: { r: 255, g: 184, b: 0 },
  high: { r: 0, g: 212, b: 170 },
};

export function interpolateColor(value) {
  let r, g, b;
  if (value < 0.5) {
    const t = value * 2;
    r = Math.round(CapacityColors.low.r + (CapacityColors.mid.r - CapacityColors.low.r) * t);
    g = Math.round(CapacityColors.low.g + (CapacityColors.mid.g - CapacityColors.low.g) * t);
    b = Math.round(CapacityColors.low.b + (CapacityColors.mid.b - CapacityColors.low.b) * t);
  } else {
    const t = (value - 0.5) * 2;
    r = Math.round(CapacityColors.mid.r + (CapacityColors.high.r - CapacityColors.mid.r) * t);
    g = Math.round(CapacityColors.mid.g + (CapacityColors.high.g - CapacityColors.mid.g) * t);
    b = Math.round(CapacityColors.mid.b + (CapacityColors.high.b - CapacityColors.mid.b) * t);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export function normalizeCapacity(capacity, min, max) {
  if (max === min) return 0.5;
  return (capacity - min) / (max - min);
}
