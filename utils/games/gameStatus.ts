type GameStatusLike = {
  state?: unknown;
  completed?: unknown;
  name?: unknown;
  gameStatusDescription?: unknown;
  gameStatusDetail?: unknown;
  shortDetail?: unknown;
};

export function isGameFinalStatus(status?: GameStatusLike | null) {
  if (!status) return false;

  const state = String(status.state ?? "").trim().toLowerCase();
  const name = String(status.name ?? "").trim().toLowerCase();
  const statusLabels = [
    status.gameStatusDescription,
    status.gameStatusDetail,
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
