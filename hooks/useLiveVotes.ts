// hooks/useLiveVotes.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
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

export function useLiveVotes(gameId: number) {
  const [votes, setVotes] = useState<PollResult[] | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<
    VoteServerToClientEvents,
    VoteClientToServerEvents
  > | null>(null);

  useEffect(() => {
    let socket: Socket<
      VoteServerToClientEvents,
      VoteClientToServerEvents
    > | null = null;
    let mounted = true;

    const connectSocket = async () => {
      setVotes(null);
      setIsConnected(false);

      const token = await getAccessToken();

      if (!mounted) return;
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
          if (!mounted) return;

          if (response.ok && String(response.gameId) === String(gameId)) {
            setVotes(response.votes);
            return;
          }

          if (!response.ok) {
            console.warn("Vote room join error", response.error);
          }
        });
      };

      socket.on("connect", () => {
        setIsConnected(true);
        joinGame();
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (err) => {
        setIsConnected(false);
        console.warn("Vote socket connection error", err.message);
      });

      socket.on(
        "voteUpdate",
        ({ gameId: updatedGameId, votes: updatedVotes }) => {
          if (String(updatedGameId) === String(gameId)) {
            setVotes(updatedVotes);
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
  }, [gameId]);

  const castVoteOverHttp = useCallback(
    async (teamId: string | number): Promise<CastVoteAck> => {
      try {
        await apiClient.post("/api/votes", { gameId, teamId });

        // Refresh totals after the compatibility fallback succeeds. A failed
        // refresh should not turn a successfully persisted vote into an error.
        try {
          const state = await fetchVoteResults(gameId);
          setVotes(state.votes);
        } catch (error) {
          console.warn("Vote result refresh error", error);
        }

        return { ok: true };
      } catch (error) {
        return { ok: false, error: getVoteErrorMessage(error) };
      }
    },
    [gameId],
  );

  const castVote = useCallback(
    async (teamId: string | number): Promise<CastVoteAck> => {
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
    [castVoteOverHttp, gameId],
  );

  return { votes, castVote, isConnected };
}
