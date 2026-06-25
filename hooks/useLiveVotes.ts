// hooks/useLiveVotes.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BASE_URL, getAccessToken } from "utils/apiClient";
import { PollResult } from "./useGameVotes";

export function useLiveVotes(gameId: string) {
  const [votes, setVotes] = useState<PollResult[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;
    let mounted = true;

    const connectSocket = async () => {
      const token = await getAccessToken();

      if (!mounted) return;
      if (!token) {
        console.warn("No access token found — skipping socket connection");
        return;
      }

      socket = io(`${BASE_URL}/votes`, {
        transports: ["websocket"],
        auth: { token },
      });

      socket.emit("joinGame", gameId);

      socket.on(
        "voteUpdate",
        ({ gameId: updatedGameId, votes: updatedVotes }) => {
          if (updatedGameId === gameId) {
            setVotes(updatedVotes);
          }
        },
      );

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      mounted = false;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [gameId]);

  const emitVote = (teamId: string | number, userId: string | number) => {
    socketRef.current?.emit("castVote", { gameId, teamId, userId });
  };

  return { votes, emitVote };
}
