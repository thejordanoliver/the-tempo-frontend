import { Colors } from "constants/styles";
import { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import type { FavoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import type { FavoriteItem } from "types/favorites";
import {
  getFavoriteTeamLogo,
  isCollegeFavoriteLeague,
} from "utils/favorites/favoriteTeams";

type Props = {
  item: FavoriteItem;
  onPressItem: (item: FavoriteItem) => void;
  styles: ReturnType<typeof FavoritesScrollStyles>;
};

function FavoritesTabComponent({ item, onPressItem, styles }: Props) {
  const isTeam = item.kind === "team";
  const logo = isTeam ? getFavoriteTeamLogo(item) : item.logo;
  const showLeague = isTeam && isCollegeFavoriteLeague(item.league);

  return (
    <View style={styles.cell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}`}
        onPress={() => onPressItem(item)}
        style={({ pressed }) => [
          styles.tabContainer,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.logoWrapper,
            { backgroundColor: item.color || Colors.midTone },
          ]}
        >
          <Image
            source={logo ?? undefined}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.labelContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.tabLabel}>
            {item.name}
          </Text>
          {showLeague && (
            <>
              <View style={styles.divider} />
              <Text style={styles.tabLabel}>{item.league.toUpperCase()}</Text>
            </>
          )}
        </View>
      </Pressable>
    </View>
  );
}

export const FavoritesTab = memo(FavoritesTabComponent);
