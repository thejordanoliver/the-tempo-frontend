import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchVoteResults, type PollResult } from "hooks/useGameVotes";
import type { CastVoteAck } from "hooks/useLiveVotes";
import type { FanPredictionScoring, FanPredictionTeamId as TeamId } from "types/fanPredictions";
import {
  getErrorMessage,
  getVoteCount,
  isCanceledRequest,
  isSameTeamId,
} from "utils/fanPredictionVotes";

type OptimisticVote = {
  teamId: TeamId;
  baselineCount: number;
};

export type FanPredictionInput = {
  scoring?: FanPredictionScoring | null;
  scoringError?: boolean;
  retryScoring?: () => void;
  votes: PollResult[] | null;
  castVote: (teamId: TeamId) => Promise<CastVoteAck>;
  gameId: number;
  awayId: TeamId;
  awayCode: string;
  homeId: TeamId;
  homeCode: string;
  onVoteCast?: (teamId: TeamId) => void;
  state?: string | null;
};

export function useFanPrediction({
  votes: liveVotes,
  castVote: castLiveVote,
  gameId,
  awayId,
  awayCode = "AWY",
  homeId,
  homeCode = "HME",
  onVoteCast,
  state,
}: FanPredictionInput) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<TeamId | null>(null);
  const [results, setResults] = useState<PollResult[]>([]);
  const [resultsRevealed, setResultsRevealed] = useState(false);
  const [submittingTeamId, setSubmittingTeamId] = useState<TeamId | null>(null);
  const [optimisticVote, setOptimisticVote] = useState<OptimisticVote | null>(
    null,
  );

  const submittingRef = useRef(false);
  const canVote = state === "pre";

  // Restore the saved pick and totals when the game or voting availability changes.
  useEffect(() => {
    let active = true;

    const controller = new AbortController();

    const loadPredictionState = async () => {
      try {
        setPhase("loading");
        setErrorMessage(null);
        setResults([]);
        setUserVote(null);
        setResultsRevealed(false);
        setOptimisticVote(null);

        const data = await fetchVoteResults(gameId, {
          signal: controller.signal,
        });

        if (!active) {
          return;
        }

        const fetchedVotes = Array.isArray(data.votes) ? data.votes : [];

        const fetchedUserVote = data.userVote ?? null;

        setResults(fetchedVotes);
        setUserVote(fetchedUserVote);

        // Reveal results to everyone once pregame voting closes.
        setResultsRevealed(fetchedUserVote != null || !canVote);

        setPhase("ready");
      } catch (error: unknown) {
        if (!active || isCanceledRequest(error)) {
          return;
        }

        console.warn("Vote fetch error", error);

        setErrorMessage(getErrorMessage(error, "We couldn't load this poll."));

        setPhase("error");
      }
    };

    void loadPredictionState();

    return () => {
      active = false;
      controller.abort();
    };
  }, [gameId, canVote, state]);

  // Keep REST totals until the socket supplies results, avoiding a temporary 0–0.
  const activeVotes = useMemo(() => {
    if (liveVotes && liveVotes.length > 0) {
      return liveVotes;
    }

    return results;
  }, [liveVotes, results]);

  const serverVotesAway = useMemo(
    () => getVoteCount(activeVotes, awayId),
    [activeVotes, awayId],
  );

  const serverVotesHome = useMemo(
    () => getVoteCount(activeVotes, homeId),
    [activeVotes, homeId],
  );

  const optimisticVoteIsPending =
    optimisticVote != null &&
    getVoteCount(activeVotes, optimisticVote.teamId) <=
      optimisticVote.baselineCount;

  const votesAway =
    serverVotesAway +
    (optimisticVoteIsPending && isSameTeamId(optimisticVote?.teamId, awayId)
      ? 1
      : 0);

  const votesHome =
    serverVotesHome +
    (optimisticVoteIsPending && isSameTeamId(optimisticVote?.teamId, homeId)
      ? 1
      : 0);

  const totalVotes = votesAway + votesHome;

  const rawPctAway = totalVotes > 0 ? votesAway / totalVotes : 0;

  const rawPctHome = totalVotes > 0 ? votesHome / totalVotes : 0;

  const handleVote = useCallback(
    async (teamId: TeamId) => {
      if (!canVote || submittingRef.current || userVote != null) {
        return;
      }

      const previousVote = userVote;
      const previousResultsRevealed = resultsRevealed;

      submittingRef.current = true;

      setSubmittingTeamId(teamId);
      setErrorMessage(null);
      setOptimisticVote({
        teamId,
        baselineCount: getVoteCount(activeVotes, teamId),
      });

      try {
        // Show the pick immediately; failed requests roll back to the saved state.
        setUserVote(teamId);
        setResultsRevealed(true);

        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => {},
        );

        const response = await castLiveVote(teamId);

        if (!response.ok) {
          setUserVote(previousVote);
          setResultsRevealed(previousResultsRevealed);
          setOptimisticVote(null);

          setErrorMessage(
            response.error || "Your vote didn't go through. Try again.",
          );

          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          ).catch(() => {});

          return;
        }

        onVoteCast?.(teamId);

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      } catch (error: unknown) {
        console.warn("Vote error", error);

        setUserVote(previousVote);
        setResultsRevealed(previousResultsRevealed);
        setOptimisticVote(null);

        setErrorMessage(
          getErrorMessage(error, "Your vote didn't go through. Try again."),
        );

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        ).catch(() => {});
      } finally {
        submittingRef.current = false;
        setSubmittingTeamId(null);
      }
    },
    [activeVotes, canVote, castLiveVote, onVoteCast, resultsRevealed, userVote],
  );

  const handleAwayVote = useCallback(() => {
    void handleVote(awayId);
  }, [awayId, handleVote]);

  const handleHomeVote = useCallback(() => {
    void handleVote(homeId);
  }, [handleVote, homeId]);

  const pickedName = useMemo(() => {
    if (isSameTeamId(userVote, awayId)) {
      return awayCode ?? "Away";
    }

    if (isSameTeamId(userVote, homeId)) {
      return homeCode ?? "Home";
    }

    return null;
  }, [userVote, awayId, awayCode, homeId, homeCode]);

  const subtitle = useMemo(() => {
    if (state === "in") {
      return userVote != null && pickedName ? `You picked ${pickedName}` : "";
    }

    if (!canVote) {
      if (userVote != null && pickedName) {
        return `Final results — you picked ${pickedName}`;
      }

      return "Final results";
    }

    if (userVote != null && pickedName) {
      return `You picked ${pickedName}`;
    }

    return "Tap a team to cast your prediction";
  }, [canVote, userVote, pickedName, state]);

  return {
    phase,
    errorMessage,
    userVote,
    resultsRevealed,
    submittingTeamId,
    canVote,
    totalVotes,
    rawPctAway,
    rawPctHome,
    subtitle,
    handleAwayVote,
    handleHomeVote,
  };
}
