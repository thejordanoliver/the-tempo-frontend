const CHAMPIONSHIP_KEYWORDS = [
  "college football playoff national championship",
  "super bowl",
  "nba finals",
  "world series",
  "college basketball national championship",
];

export function isChampionshipGame(headline?: string | null): boolean {
  if (!headline) return false;

  const normalized = headline.toLowerCase();

  return CHAMPIONSHIP_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
}
