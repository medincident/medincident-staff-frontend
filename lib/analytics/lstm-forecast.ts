// LSTM-прогноз временного ряда, обучается прямо в браузере.
//
// Архитектура: компактная LSTM (16 hidden) → Dense(1).
// Подход: модель предсказывает СЛЕДУЮЩЕЕ значение на основе скользящего окна
// из WINDOW последних точек. Для многошагового прогноза применяется
// авторегрессивный режим: предсказали точку → добавили в окно → предсказали
// следующую.

import * as tf from "@tensorflow/tfjs";
import type { ForecastPoint, ForecastResult } from "./forecast";

export type LstmOptions = {
  window?: number;
  hiddenUnits?: number;
  epochs?: number;
  learningRate?: number;
  zScore?: number;
};

export async function forecastLstm(
  values: number[],
  horizon: number,
  opts?: LstmOptions,
): Promise<ForecastResult> {
  const window = opts?.window ?? 5;
  const hiddenUnits = opts?.hiddenUnits ?? 16;
  const epochs = opts?.epochs ?? 60;
  const learningRate = opts?.learningRate ?? 0.02;
  const z = opts?.zScore ?? 1.96;

  const n = values.length;
  const historicalMean = n > 0 ? values.reduce((a, b) => a + b, 0) / n : 0;

  if (n < window + 2) {
    const last = n > 0 ? values[n - 1] : 0;
    return {
      points: Array.from({ length: horizon }, () => ({
        mean: last,
        lower: last,
        upper: last,
      })),
      level: last,
      trend: 0,
      residualStd: 0,
      historicalMean,
    };
  }

  // Нормализация min-max
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const normalized = values.map((v) => (v - minV) / range);

  // Скользящие окна: X[i] = последние WINDOW точек, y[i] = следующая
  const xs: number[][][] = [];
  const ys: number[] = [];
  for (let i = 0; i + window < normalized.length; i++) {
    const w = normalized.slice(i, i + window).map((v) => [v]);
    xs.push(w);
    ys.push(normalized[i + window]);
  }

  const xsTensor = tf.tensor3d(xs, [xs.length, window, 1]);
  const ysTensor = tf.tensor2d(
    ys.map((v) => [v]),
    [ys.length, 1],
  );

  // Модель: LSTM → Dense(1)
  const model = tf.sequential();
  model.add(
    tf.layers.lstm({
      units: hiddenUnits,
      inputShape: [window, 1],
      returnSequences: false,
    }),
  );
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: "meanSquaredError",
  });

  await model.fit(xsTensor, ysTensor, {
    epochs,
    batchSize: Math.max(4, Math.floor(xs.length / 4)),
    shuffle: true,
    verbose: 0,
  });

  // Остатки на обучающей выборке → std для доверительного интервала.
  const predOnTrain = model.predict(xsTensor) as tf.Tensor;
  const predArr = (await predOnTrain.array()) as number[][];
  const residuals: number[] = [];
  for (let i = 0; i < ys.length; i++) {
    const predNorm = predArr[i][0];
    const actualNorm = ys[i];
    residuals.push((actualNorm - predNorm) * range);
  }
  predOnTrain.dispose();

  const resMean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const resVar =
    residuals.reduce((a, r) => a + (r - resMean) ** 2, 0) / residuals.length;
  const residualStd = Math.sqrt(resVar);

  // Авторегрессивный прогноз: шаг за шагом в нормализованном пространстве.
  let currentWindow = normalized.slice(n - window);
  const points: ForecastPoint[] = [];

  for (let h = 1; h <= horizon; h++) {
    const input = tf.tensor3d([currentWindow.map((v) => [v])], [1, window, 1]);
    const predTensor = model.predict(input) as tf.Tensor;
    const predVal = (await predTensor.data())[0];
    input.dispose();
    predTensor.dispose();

    const predNorm = Math.max(0, Math.min(1, predVal));
    const mean = predNorm * range + minV;
    const band = z * residualStd * Math.sqrt(h);

    points.push({
      mean: Math.max(0, mean),
      lower: Math.max(0, mean - band),
      upper: mean + band,
    });

    currentWindow = [...currentWindow.slice(1), predNorm];
  }

  xsTensor.dispose();
  ysTensor.dispose();
  model.dispose();

  // level ≈ последнее предсказанное значение
  const level = points[0]?.mean ?? historicalMean;
  const trend = points.length >= 2 ? points[1].mean - points[0].mean : 0;

  return {
    points,
    level,
    trend,
    residualStd,
    historicalMean,
  };
}
