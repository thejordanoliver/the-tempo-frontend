import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { shouldShowGameChat } from "utils/dateUtils";

export function useGameChatAvailability(gameDate: Date | null): boolean {
  const [, setTick] = useState(0);
  const gameTime = gameDate?.getTime();

  useEffect(() => {
    if (gameTime === undefined || Number.isNaN(gameTime)) return;

    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      setTick((tick) => tick + 1);
      const now = Date.now();
      const opening = gameTime - 15 * 60 * 1000;
      const closing = new Date(gameTime);
      closing.setHours(0, 0, 0, 0);
      closing.setDate(closing.getDate() + 1);
      const nextBoundary = opening > now ? opening : closing.getTime();
      clearTimeout(timer);
      if (nextBoundary > now) {
        timer = setTimeout(refresh, Math.min(nextBoundary - now, 2_147_483_647));
      }
    };

    // Schedule without requiring a screen refresh to open the chat.
    refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [gameTime]);

  return shouldShowGameChat(gameDate);
}
