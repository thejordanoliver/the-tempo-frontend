import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createExploreWidgetId,
  cleanupLegacyExploreWidgetsKey,
  loadExploreWidgetsForUser,
  saveExploreWidgetsForUser,
  withSequentialOrder,
} from "utils/exploreWidgetStorage";
import {
  getWidgetTitle,
  widgetAllowsDuplicates,
} from "constants/exploreWidgets";
import type {
  ExploreWidgetConfig,
  ExploreWidgetSize,
  ExploreWidgetType,
} from "types/widgets";

export function useExploreWidgets() {
  const [widgets, setWidgets] = useState<ExploreWidgetConfig[]>([]);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const [widgetUserId, setWidgetUserId] = useState<string | null>(null);
  const widgetLoadRequestId = useRef(0);

  const loadWidgets = useCallback(async () => {
    const requestId = ++widgetLoadRequestId.current;
    setWidgetsReady(false);

    try {
      const userId = await AsyncStorage.getItem("userId");

      if (requestId !== widgetLoadRequestId.current) return;

      if (!userId) {
        setWidgetUserId(null);
        setWidgets([]);
        return;
      }

      setWidgetUserId(userId);
      cleanupLegacyExploreWidgetsKey().catch(() => {});

      const storedWidgets = await loadExploreWidgetsForUser(userId);

      if (requestId !== widgetLoadRequestId.current) return;

      setWidgets(storedWidgets);
    } catch (err) {
      if (requestId !== widgetLoadRequestId.current) return;
      console.error("Failed to load Explore widgets", err);
      setWidgets([]);
    } finally {
      if (requestId === widgetLoadRequestId.current) {
        setWidgetsReady(true);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWidgets();
    }, [loadWidgets]),
  );

  useEffect(() => {
    if (!widgetsReady || !widgetUserId) return;

    saveExploreWidgetsForUser(widgetUserId, widgets).catch((err) =>
      console.error("Failed to save Explore widgets", err),
    );
  }, [widgetUserId, widgets, widgetsReady]);

  const addWidget = useCallback(
    (
      type: ExploreWidgetType,
      title: string,
      size: ExploreWidgetSize,
    ) => {
      setWidgets((prev) => {
        if (
          !widgetAllowsDuplicates(type) &&
          prev.some((widget) => widget.type === type)
        ) {
          return prev;
        }

        const ordered = withSequentialOrder(prev);

        return [
          ...ordered,
          {
            id: createExploreWidgetId(type),
            type,
            title: title || getWidgetTitle(type),
            createdAt: Date.now(),
            size,
            order: ordered.length,
          },
        ];
      });
    },
    [],
  );

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets((prev) =>
      withSequentialOrder(prev.filter((widget) => widget.id !== widgetId)),
    );
  }, []);

  const resizeWidget = useCallback(
    (widgetId: string, size: ExploreWidgetSize) => {
      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId ? { ...widget, size } : widget,
        ),
      );
    },
    [],
  );

  const moveWidget = useCallback((widgetId: string, direction: -1 | 1) => {
    setWidgets((prev) => {
      const ordered = withSequentialOrder(prev);
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

      return withSequentialOrder(next);
    });
  }, []);

  return {
    widgets,
    widgetsReady,
    widgetUserId,
    addWidget,
    removeWidget,
    resizeWidget,
    moveWidget,
    reloadWidgets: loadWidgets,
  };
}
