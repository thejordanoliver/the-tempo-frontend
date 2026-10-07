export type LeagueLayout = "carousel" | "list";
export function isLeagueLayout(value: unknown): value is LeagueLayout {
  return value === "carousel" || value === "list";
}

export type GameCardLayout = "list" | "grid" | "stacked";
export function isGameCardLayout(value: unknown): value is GameCardLayout {
  return value === "list" || value === "grid" || value === "stacked";
}
