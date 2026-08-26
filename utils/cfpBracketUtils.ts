import type { FootballGame } from "@/types/football/football";

import type {
  CFPBracketData,
  CFPRoundDates,
  FootballTeam,
} from "../types/football/cfpBracketTypes";

/*
|--------------------------------------------------------------------------
| Game Helpers
|--------------------------------------------------------------------------
*/

function getHeadline(game: FootballGame) {
  return String(game.headline ?? "")
    .trim()
    .toLowerCase();
}

export function isFirstRoundGame(game: FootballGame) {
  return getHeadline(game).includes("first round");
}

export function isQuarterfinalGame(game: FootballGame) {
  return getHeadline(game).includes("quarterfinal");
}

export function isSemifinalGame(game: FootballGame) {
  return getHeadline(game).includes("semifinal");
}

export function isChampionshipGame(game: FootballGame) {
  const headline = getHeadline(game);

  return (
    headline.includes("national championship") &&
    !headline.includes("semifinal")
  );
}

/*
|--------------------------------------------------------------------------
| Timestamp
|--------------------------------------------------------------------------
*/

function getGameTimestamp(game: FootballGame) {
  if (typeof game.timestamp === "number" && Number.isFinite(game.timestamp)) {
    return game.timestamp;
  }

  const dateValue = game.startDate ?? game.date;

  if (!dateValue) {
    return 0;
  }

  const timestamp = new Date(dateValue).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortGamesNewestFirst(games: FootballGame[]) {
  return [...games].sort((a, b) => getGameTimestamp(b) - getGameTimestamp(a));
}

function uniqueGamesById(games: FootballGame[]): FootballGame[] {
  const seen = new Set<string>();

  return games.filter((game) => {
    const id = String(game.id);

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

/*
|--------------------------------------------------------------------------
| Team Helpers
|--------------------------------------------------------------------------
*/

function getGameTeams(game: FootballGame): FootballTeam[] {
  const teams: (FootballTeam | null | undefined)[] = [game.away, game.home];

  return teams.filter((team) => team != null) as FootballTeam[];
}

function getGameTeamIds(game: FootballGame): string[] {
  return getGameTeams(game).map((team) => String(team.id));
}

function gamesShareTeam(firstGame: FootballGame, secondGame: FootballGame) {
  const firstTeamIds = new Set(getGameTeamIds(firstGame));

  return getGameTeamIds(secondGame).some((id) => firstTeamIds.has(id));
}

/*
|--------------------------------------------------------------------------
| Quarterfinal Path
|--------------------------------------------------------------------------
*/

type QuarterfinalPath = {
  firstRound: FootballGame | null;

  byeTeam: FootballTeam | null;

  quarterfinal: FootballGame;
};

const CFP_BYE_SLOT_COUNT = 4;

/*
|--------------------------------------------------------------------------
| Find First Round Feeding Quarterfinal
|--------------------------------------------------------------------------
*/

function findFirstRoundForQuarterfinal(
  quarterfinal: FootballGame,
  firstRoundGames: FootballGame[],
) {
  return (
    firstRoundGames.find((firstRound) =>
      gamesShareTeam(firstRound, quarterfinal),
    ) ?? null
  );
}

/*
|--------------------------------------------------------------------------
| Find Bye Team
|--------------------------------------------------------------------------
|
| Example:
|
| First Round
| JMU @ Oregon
|
| Quarterfinal
| Oregon vs Texas Tech
|
| Oregon played first round.
| Texas Tech did not.
|
| Texas Tech = bye team.
|--------------------------------------------------------------------------
*/

function findByeTeam(
  quarterfinal: FootballGame,
  firstRound: FootballGame | null,
): FootballTeam | null {
  if (!firstRound) {
    return null;
  }

  const firstRoundIds = new Set(getGameTeamIds(firstRound));

  const byeTeam = getGameTeams(quarterfinal).find(
    (team) => !firstRoundIds.has(String(team.id)),
  );

  return byeTeam ?? null;
}

/*
|--------------------------------------------------------------------------
| Build Quarterfinal Paths
|--------------------------------------------------------------------------
*/

function buildQuarterfinalPaths(
  firstRoundGames: FootballGame[],
  quarterfinalGames: FootballGame[],
): QuarterfinalPath[] {
  return quarterfinalGames.map((quarterfinal) => {
    const firstRound = findFirstRoundForQuarterfinal(
      quarterfinal,
      firstRoundGames,
    );

    return {
      firstRound,

      byeTeam: findByeTeam(quarterfinal, firstRound),

      quarterfinal,
    };
  });
}

/*
|--------------------------------------------------------------------------
| Sort Paths
|--------------------------------------------------------------------------
*/

function sortQuarterfinalPaths(paths: QuarterfinalPath[]) {
  return [...paths].sort((a, b) => {
    const aTime = a.firstRound
      ? getGameTimestamp(a.firstRound)
      : getGameTimestamp(a.quarterfinal);

    const bTime = b.firstRound
      ? getGameTimestamp(b.firstRound)
      : getGameTimestamp(b.quarterfinal);

    return bTime - aTime;
  });
}

/*
|--------------------------------------------------------------------------
| Order Quarterfinals By Semifinal Branch
|--------------------------------------------------------------------------
|
| QF 1 + QF 2 -> SF 1
|
| QF 3 + QF 4 -> SF 2
|--------------------------------------------------------------------------
*/

function orderQuarterfinalPathsBySemifinal(
  paths: QuarterfinalPath[],
  semifinals: FootballGame[],
) {
  const ordered: QuarterfinalPath[] = [];

  const used = new Set<string>();

  const orderedSemifinals = sortGamesNewestFirst(semifinals);

  for (const semifinal of orderedSemifinals) {
    const matching = paths.filter((path) => {
      const id = String(path.quarterfinal.id);

      if (used.has(id)) {
        return false;
      }

      return gamesShareTeam(path.quarterfinal, semifinal);
    });

    const sortedMatching = sortQuarterfinalPaths(matching);

    for (const path of sortedMatching) {
      used.add(String(path.quarterfinal.id));

      ordered.push(path);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Fallback
  |--------------------------------------------------------------------------
  |
  | If future semifinal participants are not populated yet,
  | append paths that could not be linked.
  |--------------------------------------------------------------------------
  */

  const unused = paths.filter(
    (path) => !used.has(String(path.quarterfinal.id)),
  );

  ordered.push(...sortQuarterfinalPaths(unused));

  return ordered;
}

/*
|--------------------------------------------------------------------------
| Build Bracket
|--------------------------------------------------------------------------
*/

export function buildCFPBracketData(
  games: FootballGame[],
): CFPBracketData | null {
  if (!games.length) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Remove Duplicate API Games
  |--------------------------------------------------------------------------
  */

  const uniqueGames = uniqueGamesById(games);

  const firstRoundGames = uniqueGames.filter(isFirstRoundGame);

  const quarterfinalGames = uniqueGames.filter(isQuarterfinalGame);

  const semifinalGames = sortGamesNewestFirst(
    uniqueGames.filter(isSemifinalGame),
  );

  const championshipGame = uniqueGames.find(isChampionshipGame) ?? null;

  if (
    !firstRoundGames.length &&
    !quarterfinalGames.length &&
    !semifinalGames.length &&
    !championshipGame
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Build Relationships
  |--------------------------------------------------------------------------
  */

  const paths = buildQuarterfinalPaths(firstRoundGames, quarterfinalGames);

  const orderedPaths = orderQuarterfinalPathsBySemifinal(paths, semifinalGames);

  /*
  |--------------------------------------------------------------------------
  | First Round
  |--------------------------------------------------------------------------
  */

  const firstRound = orderedPaths.length
    ? [
        ...orderedPaths
          .map((path) => path.firstRound)
          .filter((game): game is FootballGame => game !== null),
        ...sortGamesNewestFirst(firstRoundGames),
      ]
    : sortGamesNewestFirst(firstRoundGames);

  /*
  |--------------------------------------------------------------------------
  | Bye Teams
  |--------------------------------------------------------------------------
  */

  const byeTeams = Array.from(
    { length: CFP_BYE_SLOT_COUNT },
    (_, index) => orderedPaths[index]?.byeTeam ?? null,
  );

  /*
  |--------------------------------------------------------------------------
  | Quarterfinals
  |--------------------------------------------------------------------------
  */

  const quarterfinals = orderedPaths.length
    ? orderedPaths.map((path) => path.quarterfinal)
    : sortGamesNewestFirst(quarterfinalGames);

  return {
    firstRound: uniqueGamesById(firstRound),

    byeTeams,

    quarterfinals: uniqueGamesById(quarterfinals),

    semifinals: uniqueGamesById(semifinalGames),

    championship: championshipGame,
  };
}

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

function getGameDate(game: FootballGame) {
  const value = game.startDate ?? game.date;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getETDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",

    day: "numeric",

    year: "numeric",

    timeZone: "America/New_York",
  });

  const parts = formatter.formatToParts(date);

  const month = parts.find((part) => part.type === "month")?.value ?? "";

  const day = Number(parts.find((part) => part.type === "day")?.value);

  const year = Number(parts.find((part) => part.type === "year")?.value);

  return {
    month,
    day,
    year,
  };
}

function formatRoundDateRange(games: FootballGame[]) {
  const dates = games
    .map(getGameDate)
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (!dates.length) {
    return "TBD";
  }

  const first = getETDateParts(dates[0]);

  const last = getETDateParts(dates[dates.length - 1]);

  if (
    first.year === last.year &&
    first.month === last.month &&
    first.day === last.day
  ) {
    return `${first.month} ${first.day}`;
  }

  if (first.year === last.year && first.month === last.month) {
    return `${first.month} ${first.day} – ${last.day}`;
  }

  return `${first.month} ${first.day} – ${last.month} ${last.day}`;
}

export function buildRoundDates(games: FootballGame[]): CFPRoundDates {
  return {
    firstRound: formatRoundDateRange(games.filter(isFirstRoundGame)),

    quarterfinals: formatRoundDateRange(games.filter(isQuarterfinalGame)),

    semifinals: formatRoundDateRange(games.filter(isSemifinalGame)),

    championship: formatRoundDateRange(games.filter(isChampionshipGame)),
  };
}
