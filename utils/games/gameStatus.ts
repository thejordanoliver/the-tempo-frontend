type GameStatusLike = {
  state?: unknown;
  completed?: unknown;
  name?: unknown;
  gameStatusDescription?: unknown;
  gameStatusDetail?: unknown;
  description?: unknown;
  detail?: unknown;
  shortDetail?: unknown;
};

export function isGameFinalStatus(status?: GameStatusLike | null) {
  if (!status) return false;

  const state = String(status.state ?? "").trim().toLowerCase();
  const name = String(status.name ?? "").trim().toLowerCase();
  const statusLabels = [
    status.gameStatusDescription,
    status.gameStatusDetail,
    status.description,
    status.detail,
    status.shortDetail,
  ].map((value) => String(value ?? "").trim().toLowerCase());

  return (
    status.completed === true ||
    state === "post" ||
    state === "final" ||
    name === "status_final" ||
    statusLabels.some((label) => /^final(?:\b|\/)/.test(label))
  );
}

// Scheduled games need updates too, so an open screen can observe kickoff.
export function shouldTrackGameUpdates(
  game?: { status?: GameStatusLike | null } | null,
) {
  const status = game?.status;
  if (!status || isGameFinalStatus(status)) return false;

  const state = String(status.state ?? "").trim().toLowerCase();
  if (["pre", "in", "half", "live", "in_play", "in_progress"].includes(state)) {
    return true;
  }

  const text = [status.description, status.detail, status.shortDetail]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
  return /\b(live|in progress|underway|ongoing)\b/.test(text);
}
