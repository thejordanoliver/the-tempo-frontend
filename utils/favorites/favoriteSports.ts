import type { FavoriteSportId } from "constants/leagues";

export type FavoriteSportRequestLock = {
  current: boolean;
};

type ExecuteFavoriteSportToggleOptions = {
  league: FavoriteSportId;
  favoriteSports: readonly FavoriteSportId[];
  requestLock: FavoriteSportRequestLock;
  save: (favoriteSports: FavoriteSportId[]) => Promise<FavoriteSportId[]>;
  onOptimisticUpdate: (favoriteSports: FavoriteSportId[]) => void;
  onAccepted: (favoriteSports: FavoriteSportId[]) => void;
  onRejected: (
    error: unknown,
    previousFavoriteSports: FavoriteSportId[],
  ) => void;
};

export function toggleFavoriteSportInOrder(
  favoriteSports: readonly FavoriteSportId[],
  league: FavoriteSportId,
): FavoriteSportId[] {
  return favoriteSports.includes(league)
    ? favoriteSports.filter((favorite) => favorite !== league)
    : [...favoriteSports, league];
}

export function restoreFavoriteSportMembership(
  currentFavoriteSports: readonly FavoriteSportId[],
  previousFavoriteSports: readonly FavoriteSportId[],
  league: FavoriteSportId,
): FavoriteSportId[] {
  const wasFavorite = previousFavoriteSports.includes(league);
  const withoutLeague = currentFavoriteSports.filter(
    (favorite) => favorite !== league,
  );

  if (!wasFavorite) {
    return withoutLeague;
  }

  const previousIndex = previousFavoriteSports.indexOf(league);
  const insertionIndex = Math.min(previousIndex, withoutLeague.length);

  return [
    ...withoutLeague.slice(0, insertionIndex),
    league,
    ...withoutLeague.slice(insertionIndex),
  ];
}

export async function executeFavoriteSportToggle({
  league,
  favoriteSports,
  requestLock,
  save,
  onOptimisticUpdate,
  onAccepted,
  onRejected,
}: ExecuteFavoriteSportToggleOptions): Promise<boolean> {
  if (requestLock.current) {
    return false;
  }

  requestLock.current = true;
  const previousFavoriteSports = [...favoriteSports];
  const nextFavoriteSports = toggleFavoriteSportInOrder(
    previousFavoriteSports,
    league,
  );

  onOptimisticUpdate(nextFavoriteSports);

  try {
    const acceptedFavoriteSports = await save(nextFavoriteSports);
    onAccepted(acceptedFavoriteSports);
    return true;
  } catch (error: unknown) {
    onRejected(error, previousFavoriteSports);
    return false;
  } finally {
    requestLock.current = false;
  }
}
