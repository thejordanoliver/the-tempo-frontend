import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  getBlockedUsers,
  unblockUser,
  type BlockedUser,
} from "services/usersApi";

export function useBlockedAccounts() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionErrorUserId, setActionErrorUserId] = useState<number | null>(
    null,
  );
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const readRequest = useRef<AbortController | null>(null);
  const actionPending = useRef(false);

  const load = useCallback(async (refresh = false) => {
    if (actionPending.current) return;
    readRequest.current?.abort();
    const controller = new AbortController();
    readRequest.current = controller;
    setLoading(!refresh);
    setRefreshing(refresh);
    setLoadError(null);

    try {
      const result = await getBlockedUsers(controller.signal);
      if (!controller.signal.aborted) setUsers(result);
    } catch {
      if (!controller.signal.aborted)
        setLoadError("Couldn’t load blocked accounts.");
    } finally {
      if (!controller.signal.aborted) {
        readRequest.current = null;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return () => readRequest.current?.abort();
    }, [load]),
  );

  const unblock = async (id: number) => {
    if (actionPending.current) return;
    actionPending.current = true;
    readRequest.current?.abort();
    readRequest.current = null;
    setLoading(false);
    setRefreshing(false);
    setActionErrorUserId(null);
    setPendingUserId(id);

    try {
      await unblockUser(id);
      setUsers((current) => current.filter((user) => user.id !== id));
    } catch {
      setActionErrorUserId(id);
    } finally {
      actionPending.current = false;
      setPendingUserId(null);
    }
  };

  return {
    users,
    loading,
    refreshing,
    loadError,
    actionErrorUserId,
    pendingUserId,
    load,
    unblock,
  };
}
