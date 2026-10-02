import { Colors } from "constants/styles";
import { Image } from "expo-image";
import { memo, useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import {
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import { FavoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import type { FavoriteItem } from "types/favorites";
import {
  getFavoriteTeamLogo,
  isCollegeFavoriteLeague,
} from "utils/favoriteTeams";

type Props = RenderItemParams<FavoriteItem> & {
  onPressItem: (item: FavoriteItem) => void;
  styles: ReturnType<typeof FavoritesScrollStyles>;
};

const FAVORITE_DRAG_HOLD_DELAY_MS = 650;
const FAVORITE_HOLD_MOVEMENT_TOLERANCE = 10;

function FavoritesTabComponent({
  item,
  drag,
  isActive,
  onPressItem,
  styles,
}: Props) {
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const touchMovedRef = useRef(false);
  const isTeam = item.kind === "team";
  const logo = isTeam ? getFavoriteTeamLogo(item) : item.logo;
  const collegeLeague =
    isTeam && isCollegeFavoriteLeague(item.league) ? item.league : null;

  const handlePress = useCallback(() => {
    if (!touchMovedRef.current) onPressItem(item);
  }, [item, onPressItem]);

  return (
    <View style={styles.cell}>
      <ScaleDecorator activeScale={1.08}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.name}`}
          accessibilityHint="Long press and drag to reorder"
          accessibilityState={{ disabled: isActive }}
          disabled={isActive}
          delayLongPress={FAVORITE_DRAG_HOLD_DELAY_MS}
          onPress={handlePress}
          onTouchStart={(event) => {
            touchOriginRef.current = {
              x: event.nativeEvent.pageX,
              y: event.nativeEvent.pageY,
            };
            touchMovedRef.current = false;
          }}
          onTouchMove={(event) => {
            const origin = touchOriginRef.current;
            if (!origin) return;

            if (
              Math.hypot(
                event.nativeEvent.pageX - origin.x,
                event.nativeEvent.pageY - origin.y,
              ) > FAVORITE_HOLD_MOVEMENT_TOLERANCE
            ) {
              touchMovedRef.current = true;
            }
          }}
          onTouchCancel={() => {
            touchMovedRef.current = true;
          }}
          onLongPress={() => {
            if (!touchMovedRef.current) drag();
          }}
          style={({ pressed }) => [
            styles.tabContainer,
            pressed && styles.pressed,
            isActive && styles.activeTabContainer,
          ]}
        >
          <View
            style={[
              styles.logoWrapper,
              { backgroundColor: item.color || Colors.midTone },
            ]}
          >
            <Image
              source={logo}
              style={styles.logo}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>

          {!collegeLeague && (
            <View style={styles.labelContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.tabLabel}
              >
                {item.name}
              </Text>
            </View>
          )}
          {collegeLeague && (
            <View style={styles.labelContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.tabLabel}
              >
                {item.name}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.tabLabel}>{item.league.toUpperCase()}</Text>
            </View>
          )}
        </Pressable>
      </ScaleDecorator>
    </View>
  );
}

export const FavoritesTab = memo(FavoritesTabComponent);
