import {
  BracketMatchup,
  PlayoffBracket,
  PlayoffSeries,
  PlayoffTeam,
} from "types/nba";

export const getSeriesWinner = (
  series: PlayoffSeries,
): PlayoffTeam | undefined => {
  const winsTop = series.wins[series.teams.top.id] || 0;
  const winsBottom = series.wins[series.teams.bottom.id] || 0;

  if (winsTop < 4 && winsBottom < 4) return undefined;
  if (winsTop === winsBottom) return undefined;

  return winsTop > winsBottom ? series.teams.top : series.teams.bottom;
};

const FIRST_ROUND_SEEDS = new Set(["1-8", "2-7", "3-6", "4-5"]);
const FIRST_ROUND_ORDER = [1, 4, 3, 2];

const getSeriesSeedKey = (series: PlayoffSeries) => {
  const seeds = [series.teams.top.seed ?? 0, series.teams.bottom.seed ?? 0].sort(
    (a, b) => a - b,
  );
  return `${seeds[0]}-${seeds[1]}`;
};

const createMatchupFromSeries = (
  series: PlayoffSeries,
  conference: "east" | "west" | "finals",
  round: number,
  id: string,
): BracketMatchup => ({
  id,
  round,
  conference,
  topTeam: series.teams.top,
  bottomTeam: series.teams.bottom,
  winner: getSeriesWinner(series),
  wins: series.wins ?? {},
  leader: series.leader,
  status: series.status,
  games: series.games ?? [],
});

const createPlaceholderMatchup = (
  conference: "east" | "west" | "finals",
  round: number,
  id: string,
  topTeam?: PlayoffTeam,
  bottomTeam?: PlayoffTeam,
): BracketMatchup => ({
  id,
  round,
  conference,
  topTeam,
  bottomTeam,
  winner: undefined,
  wins: {},
  leader: undefined,
  status: undefined,
  games: [],
});

export const buildConferenceBracket = (
  seriesList: PlayoffSeries[],
  conference: "east" | "west",
): BracketMatchup[][] => {
  const firstRoundSeries = seriesList
    .filter((series) => FIRST_ROUND_SEEDS.has(getSeriesSeedKey(series)))
    .sort((a, b) => {
      const aSeed = a.teams.top.seed ?? 99;
      const bSeed = b.teams.top.seed ?? 99;
      return FIRST_ROUND_ORDER.indexOf(aSeed) - FIRST_ROUND_ORDER.indexOf(bSeed);
    });

  const remainingSeries = seriesList.filter(
    (series) => !firstRoundSeries.includes(series),
  );

  /* ---------------- FIRST ROUND ---------------- */
  const round1: BracketMatchup[] = FIRST_ROUND_ORDER.map((seed, index) => {
    const series = firstRoundSeries.find((item) => (item.teams.top.seed ?? 0) === seed);

    if (series) {
      return createMatchupFromSeries(series, conference, 1, `${conference}-r1-${index}`);
    }

    return createPlaceholderMatchup(conference, 1, `${conference}-r1-${index}`);
  });

  const upperHalfIds = new Set(
    [round1[0], round1[1]]
      .flatMap((matchup) => [matchup.topTeam?.id, matchup.bottomTeam?.id])
      .filter((id): id is number => typeof id === "number"),
  );
  const lowerHalfIds = new Set(
    [round1[2], round1[3]]
      .flatMap((matchup) => [matchup.topTeam?.id, matchup.bottomTeam?.id])
      .filter((id): id is number => typeof id === "number"),
  );

  /* ---------------- SEMIFINALS ---------------- */
  const round2: BracketMatchup[] = [
    createPlaceholderMatchup(
      conference,
      2,
      `${conference}-r2-0`,
      round1[0]?.winner,
      round1[1]?.winner,
    ),
    createPlaceholderMatchup(
      conference,
      2,
      `${conference}-r2-1`,
      round1[2]?.winner,
      round1[3]?.winner,
    ),
  ];

  remainingSeries.forEach((series) => {
    const teamIds = [series.teams.top.id, series.teams.bottom.id];
    const matchup = createMatchupFromSeries(
      series,
      conference,
      2,
      `${conference}-r2-pending`,
    );

    if (teamIds.every((id) => upperHalfIds.has(id))) {
      round2[0] = { ...matchup, id: `${conference}-r2-0` };
      return;
    }

    if (teamIds.every((id) => lowerHalfIds.has(id))) {
      round2[1] = { ...matchup, id: `${conference}-r2-1` };
    }
  });

  const round3Series = remainingSeries.find((series) => {
    const teamIds = [series.teams.top.id, series.teams.bottom.id];
    const isUpperSeries = teamIds.every((id) => upperHalfIds.has(id));
    const isLowerSeries = teamIds.every((id) => lowerHalfIds.has(id));
    return !isUpperSeries && !isLowerSeries;
  });

  /* ---------------- CONFERENCE FINALS ---------------- */
  const round3: BracketMatchup[] = [
    round3Series
      ? createMatchupFromSeries(round3Series, conference, 3, `${conference}-r3-0`)
      : createPlaceholderMatchup(
          conference,
          3,
          `${conference}-r3-0`,
          round2[0]?.winner,
          round2[1]?.winner,
        ),
  ];

  return [round1, round2, round3];
};

export const buildPlayoffTree = (
  eastSeries: PlayoffSeries[],
  westSeries: PlayoffSeries[],
): PlayoffBracket => {
  const east = buildConferenceBracket(eastSeries, "east");
  const west = buildConferenceBracket(westSeries, "west");

  const eastChampion = east[2][0]?.winner;
  const westChampion = west[2][0]?.winner;

  const finals: BracketMatchup = {
    id: "finals",
    round: 4,
    conference: "finals",
    topTeam: eastChampion,
    bottomTeam: westChampion,
    winner: undefined,
    wins: {},
    leader: undefined,
    status: undefined,
    games: [],
  };

  return {
    east,
    west,
    finals,
  };
};
