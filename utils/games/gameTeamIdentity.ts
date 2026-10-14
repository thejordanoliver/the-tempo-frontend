export type GameTeamId = string | number | null | undefined;

export function gameTeamIdsMatch(first: GameTeamId, second: GameTeamId): boolean {
  const firstId = String(first ?? "").trim();
  const secondId = String(second ?? "").trim();
  return firstId !== "" && secondId !== "" && firstId === secondId;
}

/** Match normalized backend team IDs without consulting provider aliases or array order. */
export function resolveGameTeamGroups<T extends { team: { id?: GameTeamId } }>(
  groups: readonly T[],
  awayId: GameTeamId,
  homeId: GameTeamId,
): { away: T | undefined; home: T | undefined } {
  const away = groups.find((group) => gameTeamIdsMatch(group.team.id, awayId));
  const home = groups.find((group) => group !== away && gameTeamIdsMatch(group.team.id, homeId));
  return { away, home };
}
