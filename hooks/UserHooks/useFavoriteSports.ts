import type { FavoriteSportId } from "constants/leagues";
import {
  getFavoriteSports,
  updateFavoriteSports as updateFavoriteSportsRequest,
} from "services/usersApi";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  executeFavoriteSportToggle,
  restoreFavoriteSportMembership,
} from "utils/favoriteSports";

function getFavoriteSportsErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as {
      response?: { data?: { error?: unknown } };
    }).response;
    const apiError = response?.data?.error;

    if (typeof apiError === "string" && apiError.trim()) {
      return apiError;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to load favorite sports";
}

type PendingLoad = {
  userId: number;
  promise: Promise<boolean>;
};

export function useFavoriteSports(userId: number | null) {
  const [favoriteSports, setFavoriteSports] = useState<FavoriteSportId[]>([]);
  const [favoriteSportsLoading, setFavoriteSportsLoading] = useState(false);
  const [favoriteSportsSaving, setFavoriteSportsSaving] = useState(false);
  const [favoriteSportsReady, setFavoriteSportsReady] = useState(false);
  const [favoriteSportsError, setFavoriteSportsError] = useState<string | null>(
    null,
  );
  const currentUserIdRef = useRef<number | null>(userId);
  const loadedUserIdRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const pendingLoadRef = useRef<PendingLoad | null>(null);
  const savingRef = useRef(false);
  const favoriteSportsRef = useRef<FavoriteSportId[]>([]);

  useEffect(() => {
    currentUserIdRef.current = userId;
  }, [userId]);

  const clearFavoriteSports = useCallback(() => {
    requestIdRef.current += 1;
    loadedUserIdRef.current = null;
    pendingLoadRef.current = null;
    savingRef.current = false;
    favoriteSportsRef.current = [];
    setFavoriteSports([]);
    setFavoriteSportsLoading(false);
    setFavoriteSportsSaving(false);
    setFavoriteSportsReady(false);
    setFavoriteSportsError(null);
  }, []);

  const loadFavoriteSports = useCallback(
    (force = false): Promise<boolean> => {
      if (!userId) {
        return Promise.resolve(false);
      }

      if (!force && loadedUserIdRef.current === userId) {
        return Promise.resolve(true);
      }

      if (!force && pendingLoadRef.current?.userId === userId) {
        return pendingLoadRef.current.promise;
      }

      const requestId = ++requestIdRef.current;
      setFavoriteSportsLoading(true);
      setFavoriteSportsError(null);

      const promise = getFavoriteSports()
        .then((favorites) => {
          if (
            requestId !== requestIdRef.current ||
            currentUserIdRef.current !== userId
          ) {
            return false;
          }

          favoriteSportsRef.current = favorites;
          setFavoriteSports(favorites);
          setFavoriteSportsReady(true);
          loadedUserIdRef.current = userId;

          return true;
        })
        .catch((error: unknown) => {
          if (
            requestId !== requestIdRef.current ||
            currentUserIdRef.current !== userId
          ) {
            return false;
          }

          setFavoriteSportsError(getFavoriteSportsErrorMessage(error));

          if (loadedUserIdRef.current !== userId) {
            setFavoriteSportsReady(false);
          }

          return false;
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            pendingLoadRef.current = null;
            setFavoriteSportsLoading(false);
          }
        });

      pendingLoadRef.current = { userId, promise };

      return promise;
    },
    [userId],
  );

  useEffect(() => {
    clearFavoriteSports();

    if (userId) {
      void loadFavoriteSports();
    }
  }, [clearFavoriteSports, loadFavoriteSports, userId]);

  const updateFavoriteSports = useCallback(
    async (nextFavorites: FavoriteSportId[]): Promise<boolean> => {
      if (!userId || savingRef.current) {
        return false;
      }

      savingRef.current = true;
      setFavoriteSportsSaving(true);
      setFavoriteSportsError(null);

      try {
        const favorites = await updateFavoriteSportsRequest(nextFavorites);

        if (currentUserIdRef.current !== userId) {
          return false;
        }

        favoriteSportsRef.current = favorites;
        setFavoriteSports(favorites);
        setFavoriteSportsReady(true);
        loadedUserIdRef.current = userId;

        return true;
      } catch (error: unknown) {
        if (currentUserIdRef.current === userId) {
          setFavoriteSportsError(getFavoriteSportsErrorMessage(error));
        }

        return false;
      } finally {
        savingRef.current = false;

        if (currentUserIdRef.current === userId) {
          setFavoriteSportsSaving(false);
        }
      }
    },
    [userId],
  );

  const isFavoriteSport = useCallback(
    (league: FavoriteSportId) => favoriteSports.includes(league),
    [favoriteSports],
  );

  const toggleFavoriteSport = useCallback(
    async (league: FavoriteSportId): Promise<boolean> => {
      if (!userId || !favoriteSportsReady || savingRef.current) {
        return false;
      }

      setFavoriteSportsSaving(true);
      setFavoriteSportsError(null);

      const requestUserId = userId;

      return executeFavoriteSportToggle({
        league,
        favoriteSports: favoriteSportsRef.current,
        requestLock: savingRef,
        save: updateFavoriteSportsRequest,
        onOptimisticUpdate: (favorites) => {
          favoriteSportsRef.current = favorites;
          setFavoriteSports(favorites);
        },
        onAccepted: (favorites) => {
          if (currentUserIdRef.current !== requestUserId) {
            return;
          }

          favoriteSportsRef.current = favorites;
          setFavoriteSports(favorites);
          setFavoriteSportsReady(true);
          loadedUserIdRef.current = requestUserId;
        },
        onRejected: (error, previousFavorites) => {
          if (currentUserIdRef.current !== requestUserId) {
            return;
          }

          const rolledBackFavorites = restoreFavoriteSportMembership(
            favoriteSportsRef.current,
            previousFavorites,
            league,
          );

          favoriteSportsRef.current = rolledBackFavorites;
          setFavoriteSports(rolledBackFavorites);
          setFavoriteSportsError(getFavoriteSportsErrorMessage(error));
        },
      }).finally(() => {
        if (currentUserIdRef.current === requestUserId) {
          setFavoriteSportsSaving(false);
        }
      });
    },
    [favoriteSportsReady, userId],
  );

  return {
    favoriteSports,
    favoriteSportsLoading,
    favoriteSportsSaving,
    favoriteSportsReady,
    favoriteSportsError,
    loadFavoriteSports,
    updateFavoriteSports,
    clearFavoriteSports,
    isFavoriteSport,
    toggleFavoriteSport,
  };
}
