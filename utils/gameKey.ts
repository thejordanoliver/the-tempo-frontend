// utils/gameKey.ts
export function getGameKey(
  league: string,
  homeId: string | number,
  awayId: string | number,
  date: string | Date
) {
  const dateStr =
    typeof date === "string" ? new Date(date).toISOString() : date.toISOString();
  return `${league.toLowerCase()}-${homeId}-${awayId}-${dateStr}`;
}
