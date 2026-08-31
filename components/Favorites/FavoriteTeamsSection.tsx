import { Animated } from "react-native";
import type { FavoriteSportId } from "../../constants/leagues";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";
import FavoriteTeamsList from "../Favorites/FavoriteTeamsList";
import HeaderWithToggle from "../Headings/HeaderWithToggle";

type Props = {
  favorites: any[];
  favoriteSports?: FavoriteSportId[];
  favoriteSportsLoading?: boolean;
  favoriteSportsReady?: boolean;
  isGridView: boolean;
  fadeAnim: Animated.Value;
  toggleFavoriteTeamsView: () => void;
  styles: ReturnType<typeof profileStyles>;
  itemWidth: number;
  isCurrentUser: boolean;
};

export default function FavoriteTeamsSection({
  favorites,
  favoriteSports,
  favoriteSportsLoading,
  favoriteSportsReady,
  isGridView,
  fadeAnim,
  toggleFavoriteTeamsView,
  itemWidth,
  isCurrentUser,
}: Props) {
  return (
    <>
      <HeaderWithToggle
        title={favoriteSports === undefined ? "Favorite Teams" : "Favorites"}
        isGridView={isGridView}
        onToggleView={toggleFavoriteTeamsView}
      />

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FavoriteTeamsList
          favoriteTeams={favorites}
          favoriteSports={favoriteSports}
          favoriteSportsLoading={favoriteSportsLoading}
          favoriteSportsReady={favoriteSportsReady}
          isGridView={isGridView}
          itemWidth={itemWidth}
          key={isGridView ? "grid" : "list"}
          isCurrentUser={isCurrentUser}
        />
      </Animated.View>
    </>
  );
}
