import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { getGameCardLayout, saveGameCardLayout } from "services/gameCardLayoutApi";
import type { GameCardLayout } from "types/preferences";
import { getAccessToken, subscribeAuthSession } from "utils/apiClient";

export function useGameCardLayoutPreference() {
  const [gameCardLayout, setLayout] = useState<GameCardLayout>("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const owner = useRef<number | null>(null);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (token: string | null) => {
      const version = ++generation.current;
      controller.current?.abort();
      busy.current = false;
      setSaving(false);
      setError(null);
      if (!token) {
        owner.current = null;
        setLayout("list");
        setLoading(false);
        return;
      }
      setLoading(true);
      const request = new AbortController();
      controller.current = request;
      try {
        const storedId = Number(await AsyncStorage.getItem("userId"));
        if (!active || version !== generation.current) return;
        if (storedId !== owner.current) {
          owner.current = Number.isSafeInteger(storedId) && storedId > 0 ? storedId : null;
          setLayout("list");
        }
        const response = await getGameCardLayout(request.signal);
        if (!active || version !== generation.current) return;
        owner.current = response.userId;
        setLayout(response.gameCardLayout);
      } catch {
        if (active && version === generation.current && !request.signal.aborted) {
          setError("Couldn't load your game card layout. Try again when connected.");
        }
      } finally {
        if (active && version === generation.current) setLoading(false);
      }
    };
    const unsubscribe = subscribeAuthSession(({ accessToken }) => {
      // A token refresh during PATCH must not discard the in-flight save result.
      if (accessToken && busy.current) {
        void AsyncStorage.getItem("userId").then(storedId => {
          if (active && Number(storedId) !== owner.current) void load(accessToken);
        });
        return;
      }
      void load(accessToken);
    });
    const initialVersion = generation.current;
    void getAccessToken().then(token => {
      if (active && generation.current === initialVersion) void load(token);
    });
    return () => {
      active = false;
      // This is a request counter, not a rendered node ref; invalidate pending saves.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      controller.current?.abort();
      unsubscribe();
    };
  }, []);

  const setGameCardLayout = useCallback(async (next: GameCardLayout) => {
    if (loading || busy.current || owner.current == null) return;
    const previous = gameCardLayout;
    const version = generation.current;
    busy.current = true;
    setLayout(next);
    setSaving(true);
    setError(null);
    try {
      const response = await saveGameCardLayout(next);
      if (version === generation.current && response.userId === owner.current) {
        setLayout(response.gameCardLayout);
      }
    } catch {
      if (version === generation.current) {
        setLayout(previous);
        setError("Couldn't save your game card layout. Please try again.");
      }
    } finally {
      if (version === generation.current) {
        busy.current = false;
        setSaving(false);
      }
    }
  }, [gameCardLayout, loading]);

  return { gameCardLayout, setGameCardLayout, gameCardLayoutLoading: loading, gameCardLayoutSaving: saving, gameCardLayoutError: error };
}
