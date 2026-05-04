import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "constants/styles";
import { useRouter } from "expo-router";
import { ExploreFavoriteTeam } from "hooks/WidgetHooks/useExploreWidgetGames";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getTeamRoute } from "utils/teams";

export type FavoriteTeamSlide = {
  favorite: ExploreFavoriteTeam;
  name: string;
  fullName?: string;
  logo?: ImageSourcePropType;
};

type FavoriteTeamsSliderProps = {
  teams: FavoriteTeamSlide[];
  width: number;
  height: number;
  isDark: boolean;
  compact?: boolean;
};

export default function FavoriteTeamsSlider({
  teams,
  width,
  height,
  isDark,
  compact = false,
}: FavoriteTeamsSliderProps) {
  const router = useRouter();
  const listRef = useRef<FlatList<FavoriteTeamSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const styles = favoriteTeamsSliderStyles(isDark, compact);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / width));
    },
    [width],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<FavoriteTeamSlide> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  const renderSlide = useCallback(
    ({ item }: { item: FavoriteTeamSlide }) => (
      <View style={[styles.slide, { width, height }]}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.slideButton}
          onPress={() =>
            router.push({
              pathname: getTeamRoute(item.favorite.league) as any,
              params: { teamId: item.favorite.id },
            })
          }
        >
          <View style={styles.leagueBadge}>
            <Text style={styles.leagueBadgeText}>{item.favorite.league}</Text>
          </View>

          {item.logo ? (
            <Image source={item.logo} style={styles.teamLogo} />
          ) : (
            <View style={styles.teamLogoFallback}>
              <Ionicons
                name="shield-outline"
                size={compact ? 36 : 46}
                color={isDark ? Colors.white : Colors.black}
              />
            </View>
          )}

          <View style={styles.teamTextWrap}>
            <Text style={styles.teamName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.fullName && item.fullName !== item.name && (
              <Text style={styles.teamFullName} numberOfLines={1}>
                {item.fullName}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    ),
    [compact, height, isDark, router, styles, width],
  );

  return (
    <View style={[styles.container, { width, height }]}>
      <FlatList
        ref={listRef}
        data={teams}
        keyExtractor={(item) => item.favorite.key}
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        disableIntervalMomentum
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        style={styles.list}
      />

      {teams.length > 1 && (
        <View style={styles.dots}>
          {teams.map((team, index) => (
            <View
              key={team.favorite.key}
              style={[styles.dot, index === currentIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const favoriteTeamsSliderStyles = (isDark: boolean, compact: boolean) =>
  StyleSheet.create({
    container: {
      overflow: "hidden",
      borderRadius: 6,
    },
    list: {
      flex: 1,
    },
    slide: {
      alignItems: "center",
      justifyContent: "center",
    },
    slideButton: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: compact ? 10 : 18,
      paddingHorizontal: compact ? 8 : 14,
      paddingTop: compact ? 8 : 12,
      paddingBottom: compact ? 18 : 24,
    },
    leagueBadge: {
      position: "absolute",
      top: compact ? 10 : 14,
      right: compact ? 10 : 14,
      borderRadius: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      backgroundColor: isDark ? Colors.darkGray : Colors.white,
    },
    leagueBadgeText: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.white : Colors.black,
    },
    teamLogo: {
      width: compact ? "48%" : "52%",
      height: compact ? "48%" : "52%",
      resizeMode: "contain",
    },
    teamLogoFallback: {
      width: compact ? "48%" : "52%",
      height: compact ? "48%" : "52%",
      alignItems: "center",
      justifyContent: "center",
    },
    teamTextWrap: {
      alignItems: "center",
      gap: 4,
      maxWidth: "100%",
    },
    teamName: {
      textAlign: "center",
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: compact ? 16 : 22,
      lineHeight: compact ? 20 : 27,
      color: isDark ? Colors.white : Colors.black,
    },
    teamFullName: {
      textAlign: "center",
      fontFamily: Fonts.OSREGULAR,
      fontSize: compact ? 10 : 12,
      color: isDark ? Colors.lightGray : Colors.darkGray,
    },
    dots: {
      position: "absolute",
      bottom: 12,
      alignSelf: "center",
      flexDirection: "row",
      gap: 5,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
    },
    activeDot: {
      width: 16,
      backgroundColor: isDark ? Colors.white : Colors.black,
    },
  });
