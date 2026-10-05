import type { BracketApiResponse, NFLPlayoffGame } from "../types/football/football";

const isSuperBowl = (text: string) => /\bsuper[\s-]*bowl\b/i.test(text);
const isProBowl = (text: string) => /\bpro[\s-]*bowl\b/i.test(text);
const gameLabel = (game: NFLPlayoffGame) =>
  [game.headline, game.name, game.shortName, game.season?.slug].join(" ");

/** A bye team appears in the divisional round without playing a wild card game. */
export function selectNFLByeTeam(
  wildCardGames: NFLPlayoffGame[],
  divisionalGames: NFLPlayoffGame[],
): NFLPlayoffGame["home"] | undefined {
  const knownTeam = (team: NFLPlayoffGame["home"]) =>
    Number(team?.id) > 0 && team?.code?.toUpperCase() !== "TBD";
  const wildCardTeams = wildCardGames.flatMap((game) => [game.home, game.away]);
  // Incomplete wild card participants cannot reliably identify the bye team.
  if (wildCardGames.length !== 3 || !wildCardTeams.every(knownTeam)) return undefined;
  const participants = new Set(wildCardTeams.map((team) => String(team.id)));
  const candidates = new Map(
    divisionalGames.flatMap((game) => [game.home, game.away])
      .filter((team) => knownTeam(team) && !participants.has(String(team.id)))
      .map((team) => [String(team.id), team]),
  );
  return candidates.size === 1 ? candidates.values().next().value : undefined;
}

export function selectNFLSuperBowl(
  bracket: BracketApiResponse | null,
): NFLPlayoffGame | null {
  if (!bracket) return null;

  const groups = bracket.groups ?? [];
  const games = [...(bracket.games ?? []), ...groups.flatMap((group) => group.games ?? [])];
  const eligibleGames = games.filter((game) => !isProBowl(gameLabel(game)));

  // Round labels identify the final even when its postseason week varies.
  const labeledGame = eligibleGames.find((game) => isSuperBowl(gameLabel(game)));
  if (labeledGame) return labeledGame;

  const finalGroup = groups.find((group) => isSuperBowl(`${group.label} ${group.key}`));
  const groupedGame = finalGroup?.games?.find((game) => !isProBowl(gameLabel(game)));
  if (groupedGame) return groupedGame;

  for (const week of [5, 4]) {
    const game = eligibleGames.find((game) => game.week?.number === week);
    if (game) return game;

    const group = groups.find(
      (candidate) => candidate.week?.number === week &&
        !isProBowl(`${candidate.label} ${candidate.key}`),
    );
    const groupedGame = group?.games?.find((game) => !isProBowl(gameLabel(game)));
    if (groupedGame) return groupedGame;
  }

  return null;
}
