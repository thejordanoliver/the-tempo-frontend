import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PollResult } from "./useGameVotes";

export function useLiveVotes(gameId: string) {
  const [votes, setVotes] = useState<PollResult[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    let socket: Socket | null = null;
    let mounted = true;

    const connectSocket = async () => {
      let token = await AsyncStorage.getItem("accessToken");

      // Wait up to 3 seconds for token if not yet stored
      let retries = 0;
      while (!token && retries < 6) {
        await new Promise((r) => setTimeout(r, 500));
        token = await AsyncStorage.getItem("accessToken");
        retries++;
      }

      if (!mounted || !token)
        return console.warn("⚠️ No token found for socket connection");

      socket = io(`${API_URL}/votes`, {
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
        }
      );

      socketRef.current = socket;
    };

    connectSocket();

    return () => {
      mounted = false;
      socket?.disconnect();
    };
  }, [gameId]);

  const emitVote = (teamId: string | number, userId: string | number) => {
    socketRef.current?.emit("castVote", { gameId, teamId, userId });
  };

  return { votes, emitVote };
}
