// Детекция точек смены режима (change point detection) через бинарную
// сегментацию с t-тестом Уэлча.
//
// Идея: ищем в ряду моменты, когда уровень резко сдвинулся — среднее до и
// среднее после заметно отличаются. Для каждой кандидатной точки разбиения k
// считаем t-статистику: насколько велика разница средних относительно
// разброса данных. Выбираем k с максимальным |t|. Если превышает порог —
// фиксируем точку и рекурсивно ищем внутри левого и правого подотрезков.
//
// Для маленьких рядов (7–90 точек) этот алгоритм даёт осмысленные отметки
// и легко интерпретируется: "на неделе 12 окт. средняя частота выросла на 34%".

export type ChangePoint = {
  index: number; // Индекс точки, НАЧИНАЯ с которой изменился режим
  bucketName: string; // Человекочитаемая метка
  leftMean: number;
  rightMean: number;
  deltaAbs: number;
  deltaPct: number | null; // Относительное изменение (null если слева 0)
  score: number; // |t|-статистика, чем больше — тем ярче сдвиг
  direction: "up" | "down";
};

export type DetectOptions = {
  minSegment?: number; // минимальная длина сегмента
  minScore?: number; // порог |t| для признания точки значимой
  maxPoints?: number; // ограничение количества точек
};

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[], m?: number): number {
  if (arr.length < 2) return 0;
  const mu = m ?? mean(arr);
  return (
    arr.reduce((a, v) => a + (v - mu) ** 2, 0) / (arr.length - 1)
  );
}

// t-статистика Уэлча — не требует равенства дисперсий.
function welchT(left: number[], right: number[]): number {
  const nL = left.length;
  const nR = right.length;
  if (nL < 2 || nR < 2) return 0;
  const mL = mean(left);
  const mR = mean(right);
  const vL = variance(left, mL);
  const vR = variance(right, mR);
  const se = Math.sqrt(vL / nL + vR / nR);
  if (se === 0) return 0;
  return (mR - mL) / se;
}

function findBestSplit(
  values: number[],
  start: number,
  end: number, // эксклюзивно
  minSegment: number,
): { index: number; absT: number } | null {
  let bestIdx = -1;
  let bestAbs = 0;
  for (let k = start + minSegment; k <= end - minSegment; k++) {
    const left = values.slice(start, k);
    const right = values.slice(k, end);
    const t = welchT(left, right);
    const absT = Math.abs(t);
    if (absT > bestAbs) {
      bestAbs = absT;
      bestIdx = k;
    }
  }
  if (bestIdx < 0) return null;
  return { index: bestIdx, absT: bestAbs };
}

export function detectChangePoints(
  values: number[],
  labels: string[],
  opts?: DetectOptions,
): ChangePoint[] {
  const minSegment = opts?.minSegment ?? 3;
  const minScore = opts?.minScore ?? 2.5;
  const maxPoints = opts?.maxPoints ?? 4;

  const points: ChangePoint[] = [];
  const n = values.length;
  if (n < minSegment * 2) return points;

  // Стек сегментов для рекурсивной бинарной сегментации (без реальной рекурсии)
  const queue: Array<[number, number]> = [[0, n]];

  while (queue.length && points.length < maxPoints) {
    const [s, e] = queue.shift()!;
    if (e - s < minSegment * 2) continue;

    const split = findBestSplit(values, s, e, minSegment);
    if (!split || split.absT < minScore) continue;

    const k = split.index;
    const left = values.slice(s, k);
    const right = values.slice(k, e);
    const leftMean = mean(left);
    const rightMean = mean(right);
    const deltaAbs = rightMean - leftMean;
    const deltaPct =
      leftMean !== 0 ? (deltaAbs / leftMean) * 100 : null;

    points.push({
      index: k,
      bucketName: labels[k] ?? String(k),
      leftMean,
      rightMean,
      deltaAbs,
      deltaPct,
      score: split.absT,
      direction: deltaAbs >= 0 ? "up" : "down",
    });

    queue.push([s, k]);
    queue.push([k, e]);
  }

  return points.sort((a, b) => a.index - b.index);
}
