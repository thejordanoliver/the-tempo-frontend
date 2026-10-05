import type {
  BoxScorePlayerTeam,
  BoxScoreStatCategory,
} from "@/hooks/FootballHooks/useFootballGameDetails";

const identifier = (value: unknown) => String(value ?? "").trim().toLowerCase();

export function resolveFootballBoxScoreTeams(
  blocks: BoxScorePlayerTeam[],
  awayId: number | string,
  homeId: number | string,
  awayName: string,
  homeName: string,
) {
  const find = (id: number | string, name: string, side: string) =>
    blocks.find((block) =>
      [block.team.id, block.team.espnId].some(
        (value) => identifier(value) !== "" && identifier(value) === identifier(id),
      ),
    ) ?? blocks.find((block) => block.team.homeAway === side) ??
    blocks.find((block) =>
      [block.team.name, block.team.shortName, block.team.code].some(
        (value) => identifier(name) !== "" && identifier(value) === identifier(name),
      ),
    );
  let away = find(awayId, awayName, "away");
  let home = find(homeId, homeName, "home");
  if (away === home) home = undefined;
  // Positional fallback is safe only when both teams are present.
  if (blocks.length === 2) {
    away ??= blocks.find((block) => block !== home);
    home ??= blocks.find((block) => block !== away);
  }
  return { away: away ?? null, home: home ?? null };
}

export function getFootballBoxScoreLabels(category: BoxScoreStatCategory) {
  const count = Math.max(
    category.labels?.length ?? 0,
    category.keys?.length ?? 0,
    category.totals?.length ?? 0,
    ...(category.athletes ?? []).map((row) => row.stats?.length ?? 0),
  );
  return Array.from({ length: count }, (_, index) =>
    category.labels?.[index]?.trim() || category.keys?.[index]?.trim() || `Stat ${index + 1}`,
  );
}

export function hasFootballBoxScoreData(category: BoxScoreStatCategory) {
  return Boolean(category.athletes?.length || category.totals?.length);
}
