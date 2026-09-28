import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { EXPLORE_WIDGET_LEAGUES } from "types/widgets";
import type { ExploreWidgetLeague, ExploreWidgetSize } from "types/widgets";
import FavoriteGamesSettingsModal from "../FavoriteGamesSettingsModal";
import WidgetSlider, { type WidgetSlide } from "./WidgetSlider";

type FavoriteGamesWidgetProps = {
  games: WidgetSlide[];
  loading: boolean;
  height: number;
  width: number;
  isDark: boolean;
  selectedLeagues: readonly ExploreWidgetLeague[];
  autoPlay: boolean;
  onChangeLeagues: (leagues: ExploreWidgetLeague[]) => void;
  onChangeAutoPlay: (autoPlay: boolean) => void;
  widgetId: string;
  widgetSize: ExploreWidgetSize;
  isEditing: boolean;
  availableSizeOptions: readonly ExploreWidgetSize[];
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export default function FavoriteGamesWidget({
  games,
  loading,
  height,
  width,
  isDark,
  selectedLeagues,
  autoPlay,
  onChangeLeagues,
  onChangeAutoPlay,
  ...editProps
}: FavoriteGamesWidgetProps) {
  const router = useRouter();
  const { favorites } = useFavoriteTeamsContext();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const favoriteLeagues = useMemo(
    () =>
      EXPLORE_WIDGET_LEAGUES.filter((league) =>
        favorites.some((favorite) => favorite.startsWith(`${league}:`)),
      ),
    [favorites],
  );
  const filteredGames = useMemo(
    () => games.filter((game) => selectedLeagues.includes(game.type as ExploreWidgetLeague)),
    [games, selectedLeagues],
  );
  const hasSelectedFavoriteLeague = selectedLeagues.some((league) =>
    favoriteLeagues.includes(league),
  );
  const emptyState =
    favoriteLeagues.length === 0
      ? {
          title: "No favorite teams",
          message: "Add a favorite team to start tracking its games here.",
          action: "Edit favorites",
        }
      : !hasSelectedFavoriteLeague
        ? {
            title: "No matching favorites",
            message: "Select a league containing one of your favorite teams.",
            action: "Edit favorites",
          }
        : {
            title: "No games scheduled",
            message: "There are no recent or upcoming games in your selected leagues.",
            action: undefined,
          };

  return (
    <>
      <WidgetSlider
        games={filteredGames}
        loading={loading}
        initialHeight={height}
        initialWidth={width}
        isDark={isDark}
        dashboardMode
        orientation="horizontal"
        autoPlay={autoPlay}
        onOpenSettings={() => setSettingsVisible(true)}
        emptyTitle={emptyState.title}
        emptyMessage={emptyState.message}
        emptyActionLabel={emptyState.action}
        onEmptyAction={() => router.push("/edit-favorites")}
        {...editProps}
      />
      <FavoriteGamesSettingsModal
        visible={settingsVisible}
        isDark={isDark}
        selectedLeagues={selectedLeagues}
        autoPlay={autoPlay}
        favoriteLeagues={favoriteLeagues}
        onClose={() => setSettingsVisible(false)}
        onChangeLeagues={onChangeLeagues}
        onChangeAutoPlay={onChangeAutoPlay}
      />
    </>
  );
}
