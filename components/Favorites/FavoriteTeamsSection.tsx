import { Animated } from "react-native";
import { profileStyles } from "../../styles/ProfileStyles/ProfileScreenStyles";
import FavoriteTeamsList from "../Favorites/FavoriteTeamsList";
import SectionHeaderWithToggle from "../SectionHeaderWithToggle";

type Props = {
  favorites: any[];
  isGridView: boolean;
  fadeAnim: Animated.Value;
  toggleFavoriteTeamsView: () => void;
  styles: ReturnType<typeof profileStyles>;
  itemWidth: number;
  isCurrentUser: boolean;
};

export default function FavoriteTeamsSection({
  favorites,
  isGridView,
  fadeAnim,
  toggleFavoriteTeamsView,
  styles,
  itemWidth,
  isCurrentUser,
}: Props) {
  return (
    <>
      <SectionHeaderWithToggle
        title="Favorite Teams"
        isGridView={isGridView}
        onToggleView={toggleFavoriteTeamsView}
      />

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FavoriteTeamsList
          favoriteTeams={favorites}
          isGridView={isGridView}
          itemWidth={itemWidth}
          key={isGridView ? "grid" : "list"}
          isCurrentUser={isCurrentUser}
        />
      </Animated.View>
    </>
  );
}
