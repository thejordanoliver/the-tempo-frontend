export type FavoriteHeaderIconName = "heart" | "heart-outline";

export function getFavoriteHeaderIconName(
  isFavorite: boolean,
): FavoriteHeaderIconName {
  return isFavorite ? "heart" : "heart-outline";
}

export function getFavoriteHeaderAccessibilityLabel(
  isFavorite: boolean,
): string {
  return isFavorite ? "Remove from favorites" : "Add to favorites";
}
