export function capProgressPosition(
  lastPositionSeconds: number,
  durationSeconds: number | null,
  isCompleted: boolean
) {
  const normalized = Math.max(0, lastPositionSeconds);

  if (durationSeconds === null) {
    return normalized;
  }

  if (isCompleted) {
    return durationSeconds;
  }

  return Math.min(normalized, durationSeconds);
}

