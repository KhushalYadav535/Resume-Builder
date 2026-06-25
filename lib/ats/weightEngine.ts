export function calculateWeightedScore(
  achievedScore: number,
  totalPossibleScore: number,
  confidence: number
): number {
  // Base percentage: achieved / total * 100
  const rawPercent = totalPossibleScore > 0
    ? (achievedScore / totalPossibleScore) * 100
    : 0;

  // Apply a confidence adjustment:
  // If role detection confidence is high (90), score is taken as-is
  // If confidence is low (40), blend 70% role-specific + 30% general score
  // This prevents unfairly penalizing someone whose role wasn't detected clearly
  const confidenceMultiplier = 0.7 + (confidence / 100) * 0.3;

  return Math.min(100, Math.round(rawPercent * confidenceMultiplier));
}
