import type { GameLogOption, PlayerGameLog } from "../types/playerGameLog";

export function isRegularGameLogSection(label: string) {
  return /(?:regular\s*season|\bseason)$/i.test(label) && !/post|preseason|play[\s-]*in/i.test(label);
}

export function getPlayerGameLogFilters(
  data: PlayerGameLog | null,
  fallback: PlayerGameLog | null,
  league: string,
  selectedSeason?: string | null,
) {
  const seasons = new Map<string, GameLogOption>();
  for (const log of [fallback, data]) {
    if (!log) continue;
    for (const option of log.seasons) seasons.set(option.value, option);
    if (!seasons.has(String(log.season))) {
      seasons.set(String(log.season), { value: String(log.season), label: log.displaySeason });
    }
  }
  if (selectedSeason && !seasons.has(selectedSeason)) {
    seasons.set(selectedSeason, { value: selectedSeason, label: selectedSeason });
  }
  const sections = (data?.sections ?? []).map(section => ({
    value: section.key,
    label: data && section.label.startsWith(`${data.displaySeason} `)
      ? section.label.slice(data.displaySeason.length + 1) : section.label,
  }));
  // Empty sections remain selectable without representing them as real appearances.
  if (!sections.some(section => isRegularGameLogSection(section.label))) {
    sections.unshift({ value: "empty-regular", label: "Regular Season" });
  }
  if (!sections.some(section => /post\s*season|playoffs/i.test(section.label) && !/play[\s-]*in/i.test(section.label))) {
    sections.push({ value: "empty-postseason", label: "Postseason" });
  }
  const categories = data?.categories.length ? data.categories : fallback?.categories.length ? fallback.categories
    : league === "mlb" ? [{ value: "batting", label: "Batting" }, { value: "pitching", label: "Pitching" }] : [];
  return {
    seasons: [...seasons.values()].sort((a, b) => Number(b.value) - Number(a.value)),
    sections,
    categories,
  };
}
