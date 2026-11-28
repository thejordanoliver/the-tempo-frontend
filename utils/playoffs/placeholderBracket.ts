import { getDefaultPlayoffSeason } from "./playoffConfig";
import type {
  PlayoffBracketData,
  PlayoffByeTeam,
  PlayoffLeague,
  PlayoffMatchup,
  PlayoffRound,
} from "types/playoffs";

type RoundDefinition = {
  id: string;
  name: string;
  bestOf: number;
  count: number;
};
const ROUNDS: Record<PlayoffLeague, RoundDefinition[]> = {
  mlb: [
    { id: "F", name: "Wild Card", bestOf: 3, count: 4 },
    { id: "D", name: "Division Series", bestOf: 5, count: 4 },
    { id: "L", name: "Championship Series", bestOf: 7, count: 2 },
    { id: "W", name: "World Series", bestOf: 7, count: 1 },
  ],
  nba: [
    { id: "1", name: "First Round", bestOf: 7, count: 8 },
    { id: "2", name: "Conference Semifinals", bestOf: 7, count: 4 },
    { id: "3", name: "Conference Finals", bestOf: 7, count: 2 },
    { id: "4", name: "NBA Finals", bestOf: 7, count: 1 },
  ],
  wnba: [
    { id: "1", name: "First Round", bestOf: 3, count: 4 },
    { id: "2", name: "Semifinals", bestOf: 5, count: 2 },
    { id: "3", name: "WNBA Finals", bestOf: 7, count: 1 },
  ],
  nfl: [
    { id: "WC", name: "Wild Card", bestOf: 1, count: 6 },
    { id: "DIV", name: "Divisional Round", bestOf: 1, count: 4 },
    { id: "CONF", name: "Conference Championships", bestOf: 1, count: 2 },
    { id: "SB", name: "Super Bowl", bestOf: 1, count: 1 },
  ],
  nhl: [
    { id: "1", name: "First Round", bestOf: 7, count: 8 },
    { id: "2", name: "Second Round", bestOf: 7, count: 4 },
    { id: "3", name: "Conference Finals", bestOf: 7, count: 2 },
    { id: "4", name: "Stanley Cup Final", bestOf: 7, count: 1 },
  ],
};

function createBye(seed: number, nextSeriesId: string): PlayoffByeTeam {
  return {
    id: null,
    alt_id: null,
    name: "TBD",
    fullName: "TBD",
    shortName: "TBD",
    code: "TBD",
    logo: null,
    logoDark: null,
    wins: 0,
    isWinner: false,
    seed,
    nextSeriesId,
  };
}

/** Schematic slots only. Real provider results always replace this template. */
export function createPlaceholderRounds(league: PlayoffLeague): PlayoffRound[] {
  const definitions = ROUNDS[league];
  const idFor = (round: number, slot: number) =>
    `tbd-${league}-${round}-${slot}`;
  const conferences =
    league === "mlb"
      ? ["AL", "NL"]
      : league === "nfl"
        ? ["AFC", "NFC"]
        : ["East", "West"];
  const rounds: PlayoffRound[] = definitions.map((definition, roundIndex) => {
    const next = definitions[roundIndex + 1];
    const matchups = Array.from(
      { length: definition.count },
      (_, slot): PlayoffMatchup => {
        let nextSlot = Math.floor(slot / 2);
        if (league === "mlb" && roundIndex === 0) nextSlot = slot;
        if (league === "nfl" && roundIndex === 0) {
          // First-round byes join two wildcard slots per conference in round two.
          const conference = Math.floor(slot / 3);
          nextSlot = conference * 2 + (slot % 3 === 0 ? 0 : 1);
        }
        return {
          id: idFor(roundIndex, slot),
          name: definition.name,
          league:
            roundIndex === definitions.length - 1 || league === "wnba"
              ? null
              : conferences[Math.floor(slot / (definition.count / 2))],
          bestOf: definition.bestOf,
          status: "scheduled",
          winnerId: null,
          winnerAltId: null,
          nextSeriesId: next ? idFor(roundIndex + 1, nextSlot) : null,
          teams: [null, null],
          games: [],
        };
      },
    );
    return {
      id: definition.id,
      name: definition.name,
      order: roundIndex + 1,
      matchups,
    };
  });

  if (league === "mlb") {
    rounds[0].byeTeams = [0, 1, 2, 3].map((slot) =>
      createBye((slot % 2) + 1, idFor(1, slot)),
    );
  }
  if (league === "nfl") {
    rounds[0].byeTeams = [createBye(1, idFor(1, 0)), createBye(1, idFor(1, 2))];
  }
  return rounds;
}

export function createPlaceholderBracket(
  league: PlayoffLeague,
  season: number,
): PlayoffBracketData {
  return { season, rounds: createPlaceholderRounds(league) };
}

export function withPlaceholderBracket(
  league: PlayoffLeague,
  data: PlayoffBracketData,
  date = new Date(),
) {
  const hasMatchups = data.rounds.some(
    (round) => round.matchups.length > 0 || round.byeTeams?.some(Boolean),
  );
  const isCurrentOrUpcoming =
    data.season >= getDefaultPlayoffSeason(league, date);
  return hasMatchups || !isCurrentOrUpcoming
    ? data
    : createPlaceholderBracket(league, data.season);
}
