// 정답률 기반 난이도 자동조정
// 90% 이상 -> 난이도 상향 / 50% 미만 -> 난이도 하향 / 그 외 -> 유지
const ORDER = ["하", "중", "상"];

export function nextLevel(currentLevel, percent) {
  const idx = ORDER.indexOf(currentLevel);
  if (idx === -1) return currentLevel;

  if (percent >= 90 && idx < ORDER.length - 1) {
    return ORDER[idx + 1];
  }
  if (percent < 50 && idx > 0) {
    return ORDER[idx - 1];
  }
  return currentLevel;
}
