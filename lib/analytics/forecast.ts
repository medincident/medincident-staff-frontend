// Holt (двойное экспоненциальное сглаживание) для прогноза временных рядов
// с линейным трендом. ДИ строится по σ остатков, расширяется с горизонтом.

export type ForecastPoint = {
  mean: number;
  lower: number;
  upper: number;
};

export type ForecastResult = {
  points: ForecastPoint[];
  level: number;
  trend: number;
  residualStd: number;
  // Средний исторический уровень (для сравнения "прогноз vs сейчас")
  historicalMean: number;
};

export function forecastHolt(
  values: number[],
  horizon: number,
  opts?: { alpha?: number; beta?: number; zScore?: number },
): ForecastResult {
  const alpha = opts?.alpha ?? 0.4;
  const beta = opts?.beta ?? 0.1;
  const z = opts?.zScore ?? 1.96; // 95% ДИ

  const n = values.length;

  if (n === 0) {
    return {
      points: Array.from({ length: horizon }, () => ({ mean: 0, lower: 0, upper: 0 })),
      level: 0,
      trend: 0,
      residualStd: 0,
      historicalMean: 0,
    };
  }

  const historicalMean = values.reduce((a, b) => a + b, 0) / n;

  if (n < 2) {
    const v = values[0];
    return {
      points: Array.from({ length: horizon }, () => ({ mean: v, lower: v, upper: v })),
      level: v,
      trend: 0,
      residualStd: 0,
      historicalMean,
    };
  }

  let level = values[0];
  let trend = values[1] - values[0];
  const residuals: number[] = [];

  for (let i = 1; i < n; i++) {
    const prevLevel = level;
    const fitted = level + trend;
    residuals.push(values[i] - fitted);
    level = alpha * values[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const meanRes = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const variance =
    residuals.reduce((a, r) => a + (r - meanRes) ** 2, 0) / residuals.length;
  const residualStd = Math.sqrt(variance);

  const points: ForecastPoint[] = [];
  for (let h = 1; h <= horizon; h++) {
    const mean = Math.max(0, level + h * trend);
    // Расширение ДИ: sqrt(h) — классическая оценка для IID-остатков
    const band = z * residualStd * Math.sqrt(h);
    points.push({
      mean,
      lower: Math.max(0, mean - band),
      upper: mean + band,
    });
  }

  return { points, level, trend, residualStd, historicalMean };
}
