import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLeagueLayout, saveLeagueLayout } from "services/leagueLayoutApi";
import type { LeagueLayout } from "types/preferences";
import { getAccessToken, subscribeAuthSession } from "utils/apiClient";

export function useLeagueLayoutPreference() {
  const [leagueLayout, setLayout] = useState<LeagueLayout>("carousel");
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
        setLayout("carousel");
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
          setLayout("carousel");
        }
        const response = await getLeagueLayout(request.signal);
        if (!active || version !== generation.current) return;
        owner.current = response.userId;
        setLayout(response.leagueLayout);
      } catch {
        if (active && version === generation.current && !request.signal.aborted) {
          setError("Couldn't load your league layout. Try again when connected.");
        }
      } finally {
        if (active && version === generation.current) setLoading(false);
      }
    };
    const unsubscribe = subscribeAuthSession(({ accessToken }) => {
      // A token refresh during PATCH must not discard the in-flight save result.
      if (accessToken && busy.current) return;
      void load(accessToken);
    });
    const initialVersion = generation.current;
    void getAccessToken().then(token => {
      if (active && generation.current === initialVersion) void load(token);
    });
    return () => {
      active = false;
      generation.current++;
      controller.current?.abort();
      unsubscribe();
    };
  }, []);

  const setLeagueLayout = useCallback(async (next: LeagueLayout) => {
    if (loading || busy.current || owner.current == null) return;
    const previous = leagueLayout;
    const version = generation.current;
    busy.current = true;
    setLayout(next);
    setSaving(true);
    setError(null);
    try {
      const response = await saveLeagueLayout(next);
      if (version === generation.current && response.userId === owner.current) {
        setLayout(response.leagueLayout);
      }
    } catch {
      if (version === generation.current) {
        setLayout(previous);
        setError("Couldn't save your league layout. Please try again.");
      }
    } finally {
      if (version === generation.current) {
        busy.current = false;
        setSaving(false);
      }
    }
  }, [leagueLayout, loading]);

  return { leagueLayout, setLeagueLayout, leagueLayoutLoading: loading, leagueLayoutSaving: saving, leagueLayoutError: error };
}
