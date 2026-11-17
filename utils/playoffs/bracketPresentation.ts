import type { PlayoffMatchup, PlayoffTeam } from "types/playoffs";

/** Bye cards have no score; single-game brackets show points, series show wins. */
export function getBracketTeamScore(
  team: PlayoffTeam | null,
  matchup?: PlayoffMatchup,
): number | string | null {
  if (!matchup) return null;
  if (!team) return "–";
  if (matchup.bestOf !== 1) return team.wins;

  const game = matchup.games[0];
  if (!game || team.alt_id == null) return "–";

  const side = [game.home, game.away].find(
    (side) =>
      side.teamAltId != null && String(side.teamAltId) === String(team.alt_id),
  );
  return side?.score ?? "–";
}

export function getBracketTeamLabel(team: PlayoffTeam | null) {
  return team?.code ?? "TBD";
}

export function isBracketWinner(
  team: PlayoffTeam | null,
  matchup?: PlayoffMatchup,
) {
  return Boolean(team?.isWinner && matchup?.status === "complete");
}

export function getBracketTeamAccessibilityLabel(
  team: PlayoffTeam | null,
  matchup?: PlayoffMatchup,
) {
  const parts = [team?.fullName ?? getBracketTeamLabel(team)];
  const score = getBracketTeamScore(team, matchup);

  if (team?.seed) parts.push(`seed ${team.seed}`);
  if (score !== null) {
    const units = matchup?.bestOf === 1 ? "points" : "series wins";
    parts.push(`${score} ${units}`);
  }
  if (isBracketWinner(team, matchup)) parts.push("winner");

  return parts.join(", ");
}

const STATUS_LABELS: Record<PlayoffMatchup["status"], string> = {
  complete: "Final",
  in_progress: "In progress",
  scheduled: "Upcoming",
};

export function getBracketMatchupFooter(matchup?: PlayoffMatchup) {
  if (!matchup) return "First-round bye";

  const labels = [matchup.league];
  if (matchup.bestOf > 1) labels.push(`Best of ${matchup.bestOf}`);
  labels.push(STATUS_LABELS[matchup.status]);
  return labels.filter(Boolean).join(" · ");
}
