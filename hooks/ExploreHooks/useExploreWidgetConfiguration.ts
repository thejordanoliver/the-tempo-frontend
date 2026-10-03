import AsyncStorage from "@react-native-async-storage/async-storage";
import { subscribeAuthSession } from "utils/apiClient";
import { AppState } from "react-native";
import { getExploreWidgetSettings, saveExploreWidgetSettings } from "services/exploreWidgetsApi";
import { ExploreWidgetSync, type WidgetSyncState } from "utils/exploreWidgetSync";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getWidgetTitle,
  widgetAllowsDuplicates,
} from "constants/exploreWidgets";
import type {
  ExploreCollegePollLeague,
  ExploreCollegePollType,
  ExploreWidgetConfig,
  ExploreWidgetLeague,
  ExploreStandingsLeague,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";
import { EXPLORE_WIDGET_LEAGUES } from "types/widgets";
import { normalizeCollegePollType } from "utils/collegePollWidget";
import {
  createExploreWidgetId,
  loadExploreWidgetSettingsCache,
  saveExploreWidgetSettingsCache,
  withSequentialOrder,
} from "utils/exploreWidgetStorage";

const applyVisibleOrder = (widgets: ExploreWidgetConfig[]) =>
  widgets.map((widget, index) => ({ ...widget, order: index }));

export function useExploreWidgetConfiguration(userId: number | null) {
  const [state, setState] = useState<WidgetSyncState>({ widgets: [], ready: false, pending: false, error: null, conflict: false });
  const [configurationUserId, setConfigurationUserId] = useState<number | null>(null);
  const syncRef = useRef<ExploreWidgetSync | null>(null);
  const stopSyncRef = useRef<(() => void) | null>(null);
  const [sessionIdentity, setSessionIdentity] = useState<{
    userId: number | null;
    ready: boolean;
    generation: number;
  }>({ userId: null, ready: false, generation: 0 });
  const activeUserId = sessionIdentity.ready && sessionIdentity.userId === userId
    ? userId
    : null;
  const identityMatches = sessionIdentity.ready && sessionIdentity.userId === userId;

  useEffect(() => {
    let generation = 0;
    let disposed = false;
    const readIdentity = async (signedOut = false) => {
      const request = ++generation;
      // Tokens change before FavoriteTeamsContext finishes reading the new ID.
      // Stop all work immediately, rather than waiting for its next render.
      stopSyncRef.current?.();
      setSessionIdentity({ userId: null, ready: false, generation: request });
      try {
        const storedUserId = signedOut ? null : await AsyncStorage.getItem("userId");
        if (disposed || request !== generation) return;
        const parsedUserId = storedUserId === null ? null : Number(storedUserId);
        const nextUserId = parsedUserId !== null && Number.isSafeInteger(parsedUserId) && parsedUserId > 0
          ? parsedUserId
          : null;
        setSessionIdentity({ userId: nextUserId, ready: true, generation: request });
      } catch {
        if (!disposed && request === generation) {
          setState({ widgets: [], ready: false, pending: false, conflict: false,
            error: "Unable to read the signed-in account. Please sign in again." });
        }
      }
    };
    const unsubscribe = subscribeAuthSession(({ accessToken }) => {
      void readIdentity(!accessToken);
    });
    void readIdentity();
    return () => { disposed = true; generation += 1; unsubscribe(); };
  }, []);
  const currentWidgets = useMemo(() => identityMatches && configurationUserId === activeUserId ? state.widgets : [], [configurationUserId, activeUserId, identityMatches, state.widgets]);
  const currentReady = identityMatches && configurationUserId === activeUserId && state.ready;

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const sync = activeUserId ? new ExploreWidgetSync({
      load: () => loadExploreWidgetSettingsCache(String(activeUserId)),
      persist: (cache) => saveExploreWidgetSettingsCache(String(activeUserId), cache),
      get: () => getExploreWidgetSettings(activeUserId, controller.signal),
      put: (widgets, revision) => saveExploreWidgetSettings(activeUserId, widgets, revision, controller.signal),
      onChange: (next) => { if (!disposed) setState(next); },
    }) : null;
    const stop = () => { disposed = true; sync?.stop(); controller.abort(); };
    stopSyncRef.current = stop;
    syncRef.current = sync;
    void Promise.resolve().then(() => {
      if (disposed) return;
      setConfigurationUserId(activeUserId);
      setState({ widgets: [], ready: !activeUserId, pending: false, error: null, conflict: false });
      void sync?.start();
    });
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") void sync?.refresh();
    });
    return () => {
      stop();
      subscription.remove();
      if (stopSyncRef.current === stop) stopSyncRef.current = null;
    };
  }, [activeUserId, sessionIdentity.generation]);

  const setWidgets = useCallback((update: (previous: ExploreWidgetConfig[]) => ExploreWidgetConfig[]) => {
    syncRef.current?.edit(update);
  }, []);
  const refreshSettings = useCallback(async () => { await syncRef.current?.refresh(); }, []);
  const reloadAccountSettings = useCallback(async () => { await syncRef.current?.reloadAccountSettings(); }, []);

  const addWidget = useCallback(
    (
      type: ExploreWidgetType,
      title: string,
      size: ExploreWidgetSize,
    ) => {
      setWidgets((previous) => {
        if (
          !widgetAllowsDuplicates(type) &&
          previous.some((widget) => widget.type === type)
        ) {
          return previous;
        }

        const ordered = withSequentialOrder(previous);
        return [
          ...ordered,
          {
            id: createExploreWidgetId(type),
            type,
            title: title || getWidgetTitle(type),
            createdAt: Date.now(),
            size,
            order: ordered.length,
            standingsLeague: type === "standings" ? "nba" : undefined,
            collegePollLeague: type === "college_polls" ? "cfb" : undefined,
            collegePollType: type === "college_polls" ? "ap" : undefined,
            collegePollAutoPlay: type === "college_polls" ? true : undefined,
            favoriteGameLeagues:
              type === "favorite_games" ? [...EXPLORE_WIDGET_LEAGUES] : undefined,
            favoriteGamesAutoPlay:
              type === "favorite_games" ? true : undefined,
          },
        ];
      });
    },
    [setWidgets],
  );

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((previous) =>
      withSequentialOrder(previous.filter((widget) => widget.id !== widgetId)),
    );
  }, [setWidgets]);

  const resizeWidget = useCallback(
    (widgetId: string, size: ExploreWidgetSize) => {
      setWidgets((previous) =>
        previous.map((widget) =>
          widget.id === widgetId ? { ...widget, size } : widget,
        ),
      );
    },
    [setWidgets],
  );

  const setStandingsLeague = useCallback(
    (widgetId: string, league: ExploreStandingsLeague) => {
      setWidgets((previous) =>
        previous.map((widget) =>
          widget.id === widgetId && widget.type === "standings"
            ? { ...widget, standingsLeague: league }
            : widget,
        ),
      );
    },
    [setWidgets],
  );

  const setCollegePollSelection = useCallback(
    (
      widgetId: string,
      league: ExploreCollegePollLeague,
      pollType: ExploreCollegePollType,
    ) => {
      const normalizedPollType = normalizeCollegePollType(league, pollType);

      setWidgets((previous) =>
        previous.map((widget) =>
          widget.id === widgetId && widget.type === "college_polls"
            ? {
              ...widget,
              collegePollLeague: league,
              collegePollType: normalizedPollType,
            }
            : widget,
        ),
      );
    },
    [setWidgets],
  );

  const setCollegePollAutoPlay = useCallback(
    (widgetId: string, autoPlay: boolean) => {
      setWidgets((previous) =>
        previous.map((widget) =>
          widget.id === widgetId && widget.type === "college_polls"
            ? { ...widget, collegePollAutoPlay: autoPlay }
            : widget,
        ),
      );
    },
    [setWidgets],
  );

  const setFavoriteGameLeagues = useCallback(
    (widgetId: string, leagues: ExploreWidgetLeague[]) => {
      setWidgets((previous) => {
        const widget = previous.find(
          (candidate) =>
            candidate.id === widgetId && candidate.type === "favorite_games",
        );
        if (!widget) return previous;

        const currentLeagues =
          widget.favoriteGameLeagues ?? EXPLORE_WIDGET_LEAGUES;
        const nextLeagues = EXPLORE_WIDGET_LEAGUES.filter((league) =>
          leagues.includes(league),
        );

        if (nextLeagues.length === 0) return previous;
        if (
          currentLeagues.length === nextLeagues.length &&
          currentLeagues.every((league, index) => league === nextLeagues[index])
        ) {
          return previous;
        }

        return previous.map((candidate) =>
          candidate.id === widgetId && candidate.type === "favorite_games"
            ? { ...candidate, favoriteGameLeagues: nextLeagues }
            : candidate,
        );
      });
    },
    [setWidgets],
  );

  const setFavoriteGamesAutoPlay = useCallback(
    (widgetId: string, autoPlay: boolean) => {
      setWidgets((previous) =>
        previous.map((widget) =>
          widget.id === widgetId && widget.type === "favorite_games"
            ? { ...widget, favoriteGamesAutoPlay: autoPlay }
            : widget,
        ),
      );
    },
    [setWidgets],
  );

  const moveWidget = useCallback((widgetId: string, direction: -1 | 1) => {
    setWidgets((previous) => {
      const ordered = withSequentialOrder(previous);
      const currentIndex = ordered.findIndex((widget) => widget.id === widgetId);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) {
        return ordered;
      }

      const next = ordered.slice();
      [next[currentIndex], next[nextIndex]] = [
        next[nextIndex],
        next[currentIndex],
      ];

      return applyVisibleOrder(next);
    });
  }, [setWidgets]);

  const reorderWidgets = useCallback((nextWidgets: ExploreWidgetConfig[]) => {
    setWidgets((previous) => {
      const orderedPrevious = withSequentialOrder(previous);
      const widgetsById = new Map(
        orderedPrevious.map((widget) => [widget.id, widget]),
      );
      const seenIds = new Set<string>();
      const nextOrderedWidgets = nextWidgets.flatMap((widget) => {
        if (seenIds.has(widget.id)) return [];

        const existing = widgetsById.get(widget.id);
        if (!existing) return [];

        seenIds.add(widget.id);
        return [existing];
      });
      const missingWidgets = orderedPrevious.filter(
        (widget) => !seenIds.has(widget.id),
      );

      return applyVisibleOrder([...nextOrderedWidgets, ...missingWidgets]);
    });
  }, [setWidgets]);

  return {
    widgets: currentWidgets,
    ready: currentReady,
    settingsError: identityMatches && configurationUserId === activeUserId ? state.error : null,
    settingsPending: identityMatches && configurationUserId === activeUserId && state.pending,
    settingsConflict: identityMatches && configurationUserId === activeUserId && state.conflict,
    refreshSettings,
    reloadAccountSettings,
    addWidget,
    removeWidget,
    resizeWidget,
    setStandingsLeague,
    setCollegePollSelection,
    setCollegePollAutoPlay,
    setFavoriteGameLeagues,
    setFavoriteGamesAutoPlay,
    moveWidget,
    reorderWidgets,
  };
}
