/** Search newest first; request failures must surface rather than look like empty seasons. */
export async function resolvePlayoffSeason<T>(
  season: number,
  fetchSeason: (year: number) => Promise<T>,
  hasPlayoffs: (data: T) => boolean,
  earliestSeason = 1947,
): Promise<{ data: T; season: number }> {
  let year = season;
  let data = await fetchSeason(year);

  while (Number.isInteger(year) && year > earliestSeason && !hasPlayoffs(data)) {
    year -= 1;
    data = await fetchSeason(year);
  }

  return { data, season: year };
}
