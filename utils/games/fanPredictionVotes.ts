import type { PollResult } from "hooks/useGameVotes";
import type { FanPredictionTeamId as TeamId } from "types/fanPredictions";

export function isSameTeamId(
  first: TeamId | null | undefined,
  second: TeamId | null | undefined,
): boolean {
  if (first == null || second == null) {
    return false;
  }

  return String(first) === String(second);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export function isCanceledRequest(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const requestError = error as {
    code?: unknown;
    name?: unknown;
  };

  return (
    requestError.code === "ERR_CANCELED" ||
    requestError.name === "CanceledError" ||
    requestError.name === "AbortError"
  );
}

export function getVoteCount(votes: PollResult[], teamId: TeamId): number {
  const result = votes.find((vote) => isSameTeamId(vote.team_id, teamId));
  const count = Number(result?.votes ?? 0);
  return Number.isFinite(count) ? count : 0;
}

export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage * 100)}%`;
}

