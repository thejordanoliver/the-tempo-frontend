import { Animated } from "react-native";
import { profileStyles } from "../../styles/ProfileScreenStyles";
import FavoriteTeamsList from "../Favorites/FavoriteTeamsList";
import SectionHeaderWithToggle from "../SectionHeaderWithToggle";

type Props = {
  favoriteTeams: any[]; // replace with proper team type if you have one
  isGridView: boolean;
  fadeAnim: Animated.Value;
  toggleFavoriteTeamsView: () => void;
  styles: ReturnType<typeof profileStyles>;
  itemWidth: number;
  isCurrentUser: boolean;
  username?: string;
};

export default function FavoriteTeamsSection({
  favoriteTeams,
  isGridView,
  fadeAnim,
  toggleFavoriteTeamsView,
  styles,
  itemWidth,
  isCurrentUser,
  username,
}: Props) {
  return (
    <>
      {/* Header with toggle button (grid/list) */}
      <SectionHeaderWithToggle
        title="Favorite Teams"
        isGridView={isGridView}
        onToggleView={toggleFavoriteTeamsView}
      />

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FavoriteTeamsList
          favoriteTeams={favoriteTeams}
          isGridView={isGridView}
          styles={styles}
          itemWidth={itemWidth}
          key={isGridView ? "grid" : "list"}
          isCurrentUser={isCurrentUser} // ✅ enforce current user
          username={username}
        />
      </Animated.View>
    </>
  );
}
