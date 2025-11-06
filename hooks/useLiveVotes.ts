import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PollResult } from "./useGameVotes";

export function useLiveVotes(gameId: string) {
  const [votes, setVotes] = useState<PollResult[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${process.env.EXPO_PUBLIC_API_URL}/votes`, {
      transports: ["websocket"],
    });

    socket.emit("joinGame", gameId);
    socket.on(
      "voteUpdate",
      ({ gameId: updatedGameId, votes: updatedVotes }) => {
        if (updatedGameId === gameId) {
          setVotes(updatedVotes);
        }
      }
    );

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  const emitVote = (teamId: string | number, userId: string | number) => {
    socketRef.current?.emit("castVote", { gameId, teamId, userId });
  };

  return { votes, emitVote };
}
