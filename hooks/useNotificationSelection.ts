import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { useNotifications } from "contexts/NotificationContext";

type NotificationSelectionOptions = Pick<
  ReturnType<typeof useNotifications>,
  | "centerNotifications"
  | "removeCenterNotification"
  | "removeAllCenterNotifications"
>;

export function useNotificationSelection({
  centerNotifications,
  removeCenterNotification,
  removeAllCenterNotifications,
}: NotificationSelectionOptions) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [suppressEmptyState, setSuppressEmptyState] = useState(false);
  const emptyStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleNotifications = useMemo(
    () =>
      centerNotifications.filter(
        (notification) => !hiddenIds.has(notification.id),
      ),
    [centerNotifications, hiddenIds],
  );

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((current) => {
      if (current) {
        setSelectedIds(new Set());
        setIsAllSelected(false);
      }
      return !current;
    });
  }, []);

  useEffect(
    () => () => {
      if (emptyStateTimerRef.current) {
        clearTimeout(emptyStateTimerRef.current);
      }
    },
    [],
  );

  const handleToggleSelection = useCallback(
    (id: string) => {
      setIsAllSelected(false);
      setSelectedIds((current) => {
        if (isAllSelected) {
          return new Set(
            visibleNotifications
              .filter((notification) => notification.id !== id)
              .map((notification) => notification.id),
          );
        }
        const next = new Set(current);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [isAllSelected, visibleNotifications],
  );

  const idsToDelete = useMemo(
    () =>
      visibleNotifications
        .filter((notification) => isAllSelected || selectedIds.has(notification.id))
        .map((notification) => notification.id),
    [isAllSelected, selectedIds, visibleNotifications],
  );
  const selectedCount = idsToDelete.length;

  const handleToggleSelectAll = useCallback(() => {
    setIsAllSelected((current) => !current);
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (idsToDelete.length === 0) {
      return;
    }

    const deletingEntireList =
      idsToDelete.length === visibleNotifications.length;

    setHiddenIds((current) => new Set([...current, ...idsToDelete]));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setIsAllSelected(false);

    if (deletingEntireList) {
      setSuppressEmptyState(true);
      if (emptyStateTimerRef.current) {
        clearTimeout(emptyStateTimerRef.current);
      }
      emptyStateTimerRef.current = setTimeout(() => {
        setSuppressEmptyState(false);
      }, 240);
    }

    void (async () => {
      if (isAllSelected) {
        await removeAllCenterNotifications();
      } else {
        for (const id of idsToDelete) {
          await removeCenterNotification(id);
        }
      }

      setHiddenIds((current) => {
        const next = new Set(current);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });
    })();
  }, [
    isAllSelected,
    removeAllCenterNotifications,
    removeCenterNotification,
    idsToDelete,
    visibleNotifications.length,
  ]);

  return {
    visibleNotifications,
    isSelectionMode,
    isAllSelected,
    selectedIds,
    selectedCount,
    suppressEmptyState,
    toggleSelectionMode,
    handleToggleSelection,
    handleToggleSelectAll,
    handleDeleteSelected,
  };
}
