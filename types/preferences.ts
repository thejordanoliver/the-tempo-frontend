export type LeagueLayout = "carousel" | "list";
export function isLeagueLayout(value: unknown): value is LeagueLayout {
  return value === "carousel" || value === "list";
}
