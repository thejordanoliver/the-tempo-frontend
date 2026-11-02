type AccessibleTeam = {
  name?: string | null;
  score?: number | null;
};

type AccessibleGame = {
  home?: AccessibleTeam;
  away?: AccessibleTeam;
  league?: { name?: string };
  isNeutralSite?: boolean;
  status?: {
    state?: string;
    description?: string;
    detail?: string;
    shortDetail?: string;
    completed?: boolean;
  };
};

/** A single, ordered announcement for backend-normalized team game cards. */
export function getGameAccessibilityLabel(
  game: AccessibleGame,
  display: { homeName?: string; awayName?: string; date: string; time: string },
) {
  const home = game.home?.name || display.homeName || "Home team";
  const away = game.away?.name || display.awayName || "Away team";
  const status = game.status;
  const description = status?.description || "";
  const hasStarted =
    !/scheduled|postponed|canceled|cancelled|TBD/i.test(description) &&
    (status?.state === "in" ||
      status?.state === "post" ||
      status?.completed ||
      /final|progress|halftime|end of period|suspended/i.test(description));
  const scores =
    hasStarted &&
    Number.isFinite(game.away?.score) &&
    Number.isFinite(game.home?.score)
      ? `Score: ${away} ${game.away?.score}, ${home} ${game.home?.score}`
      : "";
  const detail = status?.detail || status?.shortDetail || description;
  const scheduled = status?.state === "pre" || description === "Scheduled";
  const time =
    scheduled && !/TBD|postponed|canceled|cancelled|delayed/i.test(detail)
      ? display.time
      : "";

  return [
    `${away} ${game.isNeutralSite ? "versus" : "at"} ${home}`,
    game.league?.name,
    detail,
    scores,
    display.date,
    time,
  ]
    .filter(Boolean)
    .join(". ");
}
