export type MMACardGame = any;

export function getMMAGameId(game: MMACardGame) {
  return (
    game?.gameId ??
    game?.eventId ??
    game?.id ??
    game?.uid ??
    game?.mainEvent?.id ??
    null
  );
}

function getMainEvent(game: MMACardGame) {
  if (game?.mainEvent) return game.mainEvent;
  if (Array.isArray(game?.fights)) return game.fights[0] ?? null;
  return null;
}

function getDisplayName(fighter: any) {
  return (
    fighter?.displayName ??
    fighter?.name ??
    fighter?.full_name ??
    fighter?.fullName ??
    fighter?.shortName ??
    fighter?.abbreviation ??
    "TBD"
  );
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
  const lastName = parts.length > 1 ? parts[parts.length - 1] : name;

  return { firstName, lastName };
}

function getFighterImage(fighter: any) {
  return (
    fighter?.headshot ??
    fighter?.logo ??
    fighter?.image ??
    fighter?.imageUrl ??
    fighter?.images?.[0]?.href ??
    fighter?.athlete?.headshot?.href ??
    null
  );
}

function toFighterWrapper(fighter: any, fallbackId: number) {
  const rawId =
    fighter?.id ??
    fighter?.espn_id ??
    fighter?.espnId ??
    fighter?.uid ??
    fighter?.athlete?.id ??
    fallbackId;
  const numericId = Number(rawId);
  const name = getDisplayName(fighter);
  const { firstName, lastName } = splitName(name);
  const image = getFighterImage(fighter);

  return {
    id: Number.isFinite(numericId) ? numericId : fallbackId,
    name,
    logo: image,
    winner: fighter?.winner ?? null,
    info: {
      id: Number.isFinite(numericId) ? numericId : fallbackId,
      espn_id: rawId === null || rawId === undefined ? null : String(rawId),
      first_name: firstName,
      last_name: lastName,
      full_name: name,
      short_name: fighter?.shortName ?? fighter?.abbreviation ?? lastName,
      flag_url: fighter?.flag ?? fighter?.flag_url ?? null,
      record: fighter?.record ?? "0-0",
      color: fighter?.color ?? null,
      alternate_color: fighter?.alternateColor ?? fighter?.alternate_color ?? null,
      images: image
        ? [
            {
              rel: ["player", "default"],
              href: image,
            },
          ]
        : [],
    },
  };
}

function getCompetitors(game: MMACardGame) {
  const mainEvent = getMainEvent(game);
  const mainCompetitors = Array.isArray(mainEvent?.competitors)
    ? mainEvent.competitors
    : [];
  const eventCompetitors = Array.isArray(game?.competitors)
    ? game.competitors
    : [];

  const competitors =
    mainCompetitors.length >= 2 ? mainCompetitors : eventCompetitors;

  const first =
    game?.home ??
    competitors.find(
      (fighter: any) =>
        String(fighter?.homeAway ?? "").toLowerCase() === "home",
    ) ??
    competitors[0] ??
    null;

  const second =
    game?.away ??
    competitors.find(
      (fighter: any) =>
        String(fighter?.homeAway ?? "").toLowerCase() === "away",
    ) ??
    competitors[1] ??
    null;

  return { first, second };
}

export function getMMAFighters(game: MMACardGame) {
  if (game?.fighters?.first || game?.fighters?.second) {
    return {
      first: game?.fighters?.first ?? toFighterWrapper(null, 1),
      second: game?.fighters?.second ?? toFighterWrapper(null, 2),
    };
  }

  const { first, second } = getCompetitors(game);

  return {
    first: toFighterWrapper(first, 1),
    second: toFighterWrapper(second, 2),
  };
}

export function getMMAEventDate(game: MMACardGame) {
  return game?.date ?? game?.startDate ?? game?.mainEvent?.date ?? null;
}

export function getMMAStatusDescription(game: MMACardGame, score?: any) {
  const status = game?.status ?? {};
  const description =
    score?.gameStatusDescription ??
    status?.description ??
    status?.long ??
    status?.detail ??
    status?.shortDetail;

  if (description) return description;

  const state = String(status?.state ?? score?.status ?? "").toLowerCase();

  if (state === "in" || state === "in_play") return "In Progress";
  if (state === "post" || state === "final" || status?.completed) return "Final";
  if (state.includes("cancel")) return "Canceled";

  return "Scheduled";
}

export function getMMAStatusDetail(game: MMACardGame, score?: any) {
  return (
    score?.gameStatusDetail ??
    score?.statusText ??
    game?.status?.detail ??
    game?.status?.shortDetail ??
    null
  );
}

export function getMMABroadcasts(game: MMACardGame, details?: any) {
  if (Array.isArray(details?.broadcasts)) return details.broadcasts;
  if (Array.isArray(game?.broadcasts)) return game.broadcasts;
  if (game?.broadcast) return [game.broadcast];
  return [];
}

export function getMMAPeriod(game: MMACardGame, score?: any) {
  return (
    score?.period ??
    game?.status?.period ??
    game?.mainEvent?.status?.period ??
    game?.result?.round ??
    null
  );
}

export function getMMADisplayClock(game: MMACardGame, score?: any) {
  return (
    score?.displayClock ??
    game?.status?.displayClock ??
    game?.mainEvent?.status?.displayClock ??
    game?.result?.minute ??
    ""
  );
}

export function getMMAEventHeadline(
  game: MMACardGame,
  details?: any,
  score?: any,
) {
  return (
    details?.headline ??
    score?.headline ??
    score?.eventName ??
    game?.headline ??
    game?.shortName ??
    game?.name ??
    game?.event?.shortName ??
    game?.mainEvent?.headline ??
    ""
  );
}

export function getMMARouteParams(game: MMACardGame) {
  const gameId = getMMAGameId(game);

  return {
    game: gameId ? String(gameId) : JSON.stringify(game),
    data: JSON.stringify(game),
    league: "ufc",
    gameId: gameId ? String(gameId) : "",
  };
}
