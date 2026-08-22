import { activeOpacity, Colors } from "constants/styles";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { RenderItemParams } from "react-native-draggable-flatlist";
import { favoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import type { FavoriteTeamItem } from "types/favorites";
import {
  getFavoriteTeamLogo,
  getFavoriteTeamRoute,
  isCollegeFavoriteLeague,
} from "utils/favoriteTeams";

export const TeamTab = ({
  item,
  drag,
  isActive,
}: RenderItemParams<FavoriteTeamItem>) => {
  const router = useRouter();
  const styles = favoritesScrollStyles(item.isDark);
  const logo = getFavoriteTeamLogo(item);
  const isCollege = isCollegeFavoriteLeague(item.league);
  const teamId = String(item.id);
  const league = item.league;

  const handlePress = async () => {
    await Haptics.selectionAsync();

    router.push({
      pathname: getFavoriteTeamRoute(item.league),
      params: { teamId, league },
    });
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    drag();
  };

  return (
    <Pressable
      key={item.key}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.teamContainer,
        pressed && { opacity: 0.6 },
        isActive && { opacity: activeOpacity, transform: [{ scale: 1.05 }] },
      ]}
    >
      <View
        style={[
          styles.logoWrapper,
          {
            backgroundColor: item.color || Colors.midTone,
          },
        ]}
      >
        <Image source={logo} style={styles.logo} />
      </View>

      <View style={styles.teamLabelContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.teamLabel}>
          {item.name}
        </Text>

        {isCollege && (
          <>
            <View style={styles.divider} />
            <Text style={styles.teamLabel}>{item.league}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};
