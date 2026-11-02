import { useEffect, useRef } from "react";
import { usePreferences } from "contexts/PreferencesContext";
import {
  deviceGameWidgetsSupported,
  updateDeviceGameWidgets,
} from "services/deviceGameWidgets";
import type { ExploreWidgetDataCache } from "types/widgets";
import { subscribeAuthSession } from "utils/apiClient";
import { buildDeviceGameWidgetSnapshot } from "utils/widgets/deviceGameWidget";

const MIN_UPDATE_INTERVAL_MS = 15_000;

type Options = {
  cache: ExploreWidgetDataCache | null;
  dataKey: string;
  userId: number | null;
  favoriteKeys: ReadonlySet<string>;
  ready: boolean;
  foreground: boolean;
  error: string | null;
};

/** Share the Explore cache with WidgetKit without copying tokens or making requests. */
export function useDeviceGameWidgets({
  cache,
  dataKey,
  userId,
  favoriteKeys,
  ready,
  foreground,
  error,
}: Options) {
  const { colorScheme } = usePreferences();
  const lastPublished = useRef({ scope: "", at: 0 });
  const blockedUserId = useRef<number | null>(null);
  const session = useRef({ userId, colorScheme });
  useEffect(() => {
    session.current = { userId, colorScheme };
  }, [userId, colorScheme]);

  useEffect(() => {
    if (!deviceGameWidgetsSupported) return;
    return subscribeAuthSession(({ accessToken }) => {
      if (accessToken) return;
      blockedUserId.current = session.current.userId;
      // Clear synchronously on sign-out, before favorite/context hydration completes.
      try {
        updateDeviceGameWidgets(
          buildDeviceGameWidgetSnapshot({
            games: [],
            userId: null,
            hasFavorites: false,
            loading: false,
            error: null,
            colorScheme: session.current.colorScheme,
          }),
        );
        lastPublished.current = { scope: "signed-out", at: Date.now() };
      } catch (updateError) {
        console.warn("Unable to clear Home Screen games:", updateError);
      }
    });
  }, []);

  useEffect(() => {
    if (!deviceGameWidgetsSupported || !ready) return;
    if (userId !== null && userId === blockedUserId.current) return;
    blockedUserId.current = null;

    const scope = `${dataKey}:${colorScheme}`;
    const hasCache = cache?.key === dataKey;
    const publish = () => {
      // A logout may arrive while a throttled socket update is queued.
      if (userId !== null && userId === blockedUserId.current) return;
      try {
        updateDeviceGameWidgets(
          buildDeviceGameWidgetSnapshot({
            games: hasCache
              ? cache.response.games.filter((game) =>
                  game.favoriteTeamKeys.some((key) => favoriteKeys.has(key)),
                )
              : [],
            userId,
            hasFavorites: favoriteKeys.size > 0,
            loading: !hasCache && !error,
            error,
            colorScheme,
            now: hasCache ? (cache.updatedAt ?? cache.fetchedAt) : undefined,
          }),
        );
        lastPublished.current = { scope, at: Date.now() };
      } catch (updateError) {
        console.warn("Unable to update Home Screen games:", updateError);
      }
    };
    const delay =
      lastPublished.current.scope !== scope || !foreground || !hasCache
        ? 0
        : Math.max(
            0,
            MIN_UPDATE_INTERVAL_MS - (Date.now() - lastPublished.current.at),
          );
    if (delay === 0) {
      publish();
      return;
    }
    const timer = setTimeout(publish, delay);
    return () => clearTimeout(timer);
  }, [
    cache,
    colorScheme,
    dataKey,
    error,
    favoriteKeys,
    foreground,
    ready,
    userId,
  ]);
}
