import { useScreenActivity } from "../useScreenActivity";
import { usePredictionScoring } from "./usePredictionScoring";
import { useCallback, useEffect, useRef, useState } from "react";
import { castRankedPrediction } from "services/fanPredictionsApi";
import { io, Socket } from "socket.io-client";
import type { RankedPredictionContext } from "types/fanPredictions";
import { apiClient, getAccessToken } from "utils/apiClient";
import { getSocketNamespaceUrl } from "utils/apiConfig";
import { fetchVoteResults, PollResult } from "./useGameVotes";

const SOCKET_NAMESPACE = "/votes";
const SOCKET_URL = getSocketNamespaceUrl(SOCKET_NAMESPACE);

type VoteUpdatePayload = {
  gameId: string | number;
  votes: PollResult[];
};

type JoinGameAck =
  | ({ ok: true } & VoteUpdatePayload)
  | { ok: false; error: string };

type CastVotePayload = {
  gameId: number;
  teamId: string | number;
};

export type CastVoteAck = { ok: true } | { ok: false; error: string };

type VoteServerToClientEvents = {
  voteUpdate: (payload: VoteUpdatePayload) => void;
};

type VoteClientToServerEvents = {
  joinGame: (
    gameId: number,
    callback?: (response: JoinGameAck) => void,
  ) => void;
  castVote: (
    payload: CastVotePayload,
    callback?: (response: CastVoteAck) => void,
  ) => void;
};

const VOTE_ACK_TIMEOUT_MS = 8000;

function getVoteErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const responseError = error as {
      message?: unknown;
      response?: { data?: { error?: unknown } };
    };
    const apiMessage = responseError.response?.data?.error;

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    if (
      typeof responseError.message === "string" &&
      responseError.message.trim()
    ) {
      return responseError.message;
    }
  }

  return "Your vote didn't go through. Try again.";
}

export function useLiveVotes(
  gameId: number,
  predictionContext?: RankedPredictionContext,
) {
  const { active, activeRef } = useScreenActivity();
  const gameRef = useRef(gameId);
  useEffect(() => {
    gameRef.current = gameId;
  }, [gameId]);
  const { scoring, scoringError, retryScoring } = usePredictionScoring(
    gameId,
    predictionContext,
  );
  const [voteState, setVoteState] = useState<{
    gameId: number;
    votes: PollResult[];
  } | null>(null);
  const votes = voteState?.gameId === gameId ? voteState.votes : null;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<
    VoteServerToClientEvents,
    VoteClientToServerEvents
  > | null>(null);

  useEffect(() => {
    if (!active) return;
    let socket: Socket<
      VoteServerToClientEvents,
      VoteClientToServerEvents
    > | null = null;
    let mounted = true;

    const connectSocket = async () => {
      setIsConnected(false);

      const token = await getAccessToken();

      if (!mounted || !activeRef.current) return;
      if (!token) {
        console.warn("No access token found; skipping socket connection");
        return;
      }

      socket = io(SOCKET_URL, {
        transports: ["websocket"],
        auth: { token },
        autoConnect: false,
      });

      const joinGame = () => {
        socket?.emit("joinGame", gameId, (response) => {
          if (!mounted || !activeRef.current) return;

          if (response.ok && String(response.gameId) === String(gameId)) {
            setVoteState({ gameId, votes: response.votes });
            return;
          }

          if (!response.ok) {
            console.warn("Vote room join error", response.error);
          }
        });
      };

      socket.auth = async (callback: (auth: { token?: string }) => void) => {
        const latest = await getAccessToken();
        if (mounted && activeRef.current)
          callback(latest ? { token: latest } : {});
      };
      socket.on("connect", () => {
        if (!mounted || !activeRef.current) return;
        setIsConnected(true);
        joinGame();
      });

      socket.on("disconnect", () => {
        if (mounted && activeRef.current) setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        if (!mounted || !activeRef.current) return;
        setIsConnected(false);
        console.warn("Vote socket connection error", err.message);
      });

      socket.on(
        "voteUpdate",
        ({ gameId: updatedGameId, votes: updatedVotes }) => {
          if (
            mounted &&
            activeRef.current &&
            String(updatedGameId) === String(gameId)
          ) {
            setVoteState({ gameId, votes: updatedVotes });
          }
        },
      );

      socketRef.current = socket;
      socket.connect();
    };

    connectSocket();

    return () => {
      mounted = false;
      socket?.removeAllListeners();
      socket?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [gameId, active, activeRef]);

  const castVoteOverHttp = useCallback(
    async (teamId: string | number): Promise<CastVoteAck> => {
      try {
        await apiClient.post("/api/votes", { gameId, teamId });

        // Refresh totals after the compatibility fallback succeeds. A failed
        // refresh should not turn a successfully persisted vote into an error.
        try {
          const state = await fetchVoteResults(gameId);
          if (activeRef.current && gameRef.current === gameId)
            setVoteState({ gameId, votes: state.votes });
        } catch (error) {
          console.warn("Vote result refresh error", error);
        }

        return { ok: true };
      } catch (error) {
        return { ok: false, error: getVoteErrorMessage(error) };
      }
    },
    [gameId, activeRef],
  );

  const sport = predictionContext?.sport;
  const league = predictionContext?.league;
  const date = predictionContext?.date;
  const state = predictionContext?.state;

  const castVote = useCallback(
    async (teamId: string | number): Promise<CastVoteAck> => {
      if (sport && league && state === "pre") {
        if (!scoring)
          return {
            ok: false,
            error: "Wait for prediction points to load before picking.",
          };
        try {
          await castRankedPrediction(gameId, teamId, { sport, league, date });
          try {
            const next = await fetchVoteResults(gameId);
            if (activeRef.current && gameRef.current === gameId)
              setVoteState({ gameId, votes: next.votes });
          } catch (error) {
            console.warn("Vote result refresh error", error);
          }
          return { ok: true };
        } catch (error) {
          return { ok: false, error: getVoteErrorMessage(error) };
        }
      }
      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        return castVoteOverHttp(teamId);
      }

      const response = await new Promise<CastVoteAck>((resolve) => {
        let settled = false;
        const timeout = setTimeout(() => {
          if (settled) return;
          settled = true;
          resolve({ ok: false, error: "Vote timed out. Try again." });
        }, VOTE_ACK_TIMEOUT_MS);

        socket.emit("castVote", { gameId, teamId }, (acknowledgement) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          resolve(acknowledgement);
        });
      });

      // The vote write is idempotent for a user/game pair, so an HTTP retry is
      // safe when the socket acknowledgement is lost in transit.
      if (!response.ok && response.error === "Vote timed out. Try again.") {
        return castVoteOverHttp(teamId);
      }

      return response;
    },
    [castVoteOverHttp, gameId, sport, league, date, state, scoring, activeRef],
  );

  return { votes, castVote, isConnected, scoring, scoringError, retryScoring };
}
