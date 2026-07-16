type GameWithDate = {
  date?: string | null;
};

type GameWithSeason = GameWithDate & {
  season?: {
    year?: number | string | null;
  } | null;
};

function getValidDateTime(dateValue: string | Date | null | undefined) {
  if (!dateValue) return null;

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const time = date.getTime();

  return Number.isNaN(time) ? null : time;
}

export function getFirstSeasonGame<T extends GameWithDate>(
  games: readonly T[] | null | undefined,
): T | null {
  return (
    games?.reduce<{ game: T | null; time: number | null }>(
      (earliest, game) => {
        const time = getValidDateTime(game.date);

        if (time === null) return earliest;

        if (earliest.time === null || time < earliest.time) {
          return { game, time };
        }

        return earliest;
      },
      { game: null, time: null },
    ).game ?? null
  );
}

export function filterGamesBySeasonYear<T extends GameWithSeason>(
  games: readonly T[],
  seasonYear: number | string | null | undefined,
): T[] {
  const parsedSeasonYear = Number(seasonYear);

  if (!Number.isFinite(parsedSeasonYear)) {
    return [...games];
  }

  return games.filter((game) => Number(game.season?.year) === parsedSeasonYear);
}

export function isSameCalendarMonth(
  firstDate: string | Date | null | undefined,
  selectedDate: Date | null,
): boolean {
  if (!selectedDate) return false;

  const firstTime = getValidDateTime(firstDate);

  if (firstTime === null) return false;

  const parsedFirstDate = new Date(firstTime);

  return (
    parsedFirstDate.getUTCFullYear() === selectedDate.getFullYear() &&
    parsedFirstDate.getUTCMonth() === selectedDate.getMonth()
  );
}
