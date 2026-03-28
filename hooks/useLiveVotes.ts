// hooks/useLiveVotes.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PollResult } from "./useGameVotes";
import { BASE_URL } from "utils/apiClient";
// Use apiClient's token helper to stay consistent with the rest of the app
import { getAccessToken } from "utils/apiClient";
export function useLiveVotes(gameId: string) {
  const [votes, setVotes] = useState<PollResult[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;
    let mounted = true;

    const connectSocket = async () => {
      // FIX: use accessToken, not refreshToken — the socket server should
      //      verify the short-lived access token, not the rotation token.
      // FIX: removed the polling retry loop. If the token isn't in storage
      //      the user isn't logged in and the connection should not proceed.
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