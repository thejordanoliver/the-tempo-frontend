import type { BracketApiResponse } from "types/football/football";
import type {
  Conference,
  PlayoffGame,
  PlayoffTeam,
} from "../types/football/nflBracketTypes";

const sortGamesByDate = (games: PlayoffGame[]): PlayoffGame[] => {
  return [...games].sort((first, second) => {
    const firstTime = first.timestamp ?? new Date(first.date).getTime();

    const secondTime = second.timestamp ?? new Date(second.date).getTime();

    if (firstTime !== secondTime) {
      return firstTime - secondTime;
    }

    return Number(first.id) - Number(second.id);
  });
};

export const getGamesByWeek = (
  playoffData: BracketApiResponse | null,
  weekNumber: number,
): PlayoffGame[] => {
  if (!playoffData) {
    return [];
  }

  const matchingGroup = playoffData.groups?.find(
    (group) => group.week?.number === weekNumber,
  );

  if (matchingGroup?.games?.length) {
    return matchingGroup.games;
  }

  return (
    playoffData.games?.filter((game) => game.week?.number === weekNumber) ?? []
  );
};

export const getConference = (game: PlayoffGame): Conference | null => {
  const headline = game.headline?.trim().toUpperCase() ?? "";

  if (headline.includes("AFC")) {
    return "AFC";
  }

  if (headline.includes("NFC")) {
    return "NFC";
  }

  return null;
};

export const getRoundConferenceGames = (
  games: PlayoffGame[],
  conference: Conference,
  gamesPerConference: number,
): PlayoffGame[] => {
  const sortedGames = sortGamesByDate(games);

  const explicitlyTaggedGames = sortedGames.filter(
    (game) => getConference(game) === conference,
  );

  /*
   * Completed playoff games normally contain AFC or NFC
   * in the headline.
   */
  if (explicitlyTaggedGames.length > 0) {
    return explicitlyTaggedGames.slice(0, gamesPerConference);
  }

  /*
   * Future Wild Card and Divisional games may not identify
   * their conferences yet. Split them evenly so that all
   * TBD games still appear.
   */
  const startingIndex = conference === "AFC" ? 0 : gamesPerConference;

  return sortedGames.slice(startingIndex, startingIndex + gamesPerConference);
};

export const isTbdTeam = (team: PlayoffTeam | null | undefined): boolean => {
  if (!team) {
    return true;
  }

  const id = Number(team.id);
  const espnId = Number(team.espnId);

  const code = team.code?.trim().toUpperCase() ?? "";

  const name = team.name?.trim().toUpperCase() ?? "";

  return (
    !Number.isFinite(id) ||
    id <= 0 ||
    !Number.isFinite(espnId) ||
    espnId <= 0 ||
    code === "TBD" ||
    name === "TBD"
  );
};

const getWinnerId = (game?: PlayoffGame): number | null => {
  if (!game) {
    return null;
  }

  if (game.home?.winner === true && !isTbdTeam(game.home)) {
    return Number(game.home.id);
  }

  if (game.away?.winner === true && !isTbdTeam(game.away)) {
    return Number(game.away.id);
  }

  return null;
};

export const gameContainsTeam = (
  game: PlayoffGame,
  teamId: number,
): boolean => {
  if (!Number.isFinite(teamId) || teamId <= 0) {
    return false;
  }

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);

  return homeId === teamId || awayId === teamId;
};

export const findNextRoundIndex = (
  sourceGame: PlayoffGame,
  nextRoundGames: PlayoffGame[],
): number | null => {
  const winnerId = getWinnerId(sourceGame);

  if (winnerId !== null) {
    const winnerIndex = nextRoundGames.findIndex((game) =>
      gameContainsTeam(game, winnerId),
    );

    if (winnerIndex >= 0) {
      return winnerIndex;
    }
  }

  /*
   * Fallback for games that have real teams but have not
   * been completed. Placeholder IDs are excluded.
   */
  const sourceTeamIds = [
    Number(sourceGame.home?.id),
    Number(sourceGame.away?.id),
  ].filter((id) => Number.isFinite(id) && id > 0);

  const matchingIndex = nextRoundGames.findIndex((game) =>
    sourceTeamIds.some((teamId) => gameContainsTeam(game, teamId)),
  );

  return matchingIndex >= 0 ? matchingIndex : null;
};

/*
 * Orders Wild Card cards according to the Divisional game
 * they feed into.
 *
 * This prevents lines from crossing when the chronological
 * game order does not match the visual bracket order.
 */
export const orderWildCardGamesForBracket = (
  wildCardGames: PlayoffGame[],
  divisionalGames: PlayoffGame[],
): PlayoffGame[] => {
  const gamesWithTargets = wildCardGames.map((game, originalIndex) => ({
    game,
    originalIndex,
    targetIndex: findNextRoundIndex(game, divisionalGames),
  }));

  const matchedGames = gamesWithTargets
    .filter(
      (
        item,
      ): item is typeof item & {
        targetIndex: number;
      } => item.targetIndex !== null,
    )
    .sort((first, second) => {
      if (first.targetIndex !== second.targetIndex) {
        return first.targetIndex - second.targetIndex;
      }

      return first.originalIndex - second.originalIndex;
    });

  const unmatchedGames = gamesWithTargets
    .filter((item) => item.targetIndex === null)
    .sort((first, second) => first.originalIndex - second.originalIndex);

  return [...matchedGames, ...unmatchedGames].map((item) => item.game);
};
