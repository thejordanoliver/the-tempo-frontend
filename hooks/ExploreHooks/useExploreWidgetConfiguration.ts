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
  const currentWidgets = useMemo(() => configurationUserId === userId ? state.widgets : [], [configurationUserId, userId, state.widgets]);
  const currentReady = configurationUserId === userId && state.ready;

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const sync = userId ? new ExploreWidgetSync({
      load: () => loadExploreWidgetSettingsCache(String(userId)),
      persist: (cache) => saveExploreWidgetSettingsCache(String(userId), cache),
      get: () => getExploreWidgetSettings(controller.signal),
      put: (widgets, revision) => saveExploreWidgetSettings(widgets, revision, controller.signal),
      onChange: (next) => { if (!disposed) setState(next); },
    }) : null;
    syncRef.current = sync;
    void Promise.resolve().then(() => {
      if (disposed) return;
      setConfigurationUserId(userId);
      setState({ widgets: [], ready: !userId, pending: false, error: null, conflict: false });
      void sync?.start();
    });
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") void sync?.refresh();
    });
    return () => { disposed = true; sync?.stop(); controller.abort(); subscription.remove(); };
  }, [userId]);

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
    settingsError: configurationUserId === userId ? state.error : null,
    settingsPending: configurationUserId === userId && state.pending,
    settingsConflict: configurationUserId === userId && state.conflict,
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
