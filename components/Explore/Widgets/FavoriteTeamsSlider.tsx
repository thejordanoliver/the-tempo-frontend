import { useScopedRouter } from "hooks/useScopedRouter";
import { Colors } from "@/constants/styles";
import { FavoriteTeamsSliderStyles } from "@/styles/ExploreStyles/FavoriteTeamsSliderStyles";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { FavoriteLeague, FavoriteTeamKey } from "types/favorites";
import { getFavoriteTeamRoute } from "utils/favoriteTeams";
import WidgetCarousel from "./WidgetCarousel";

export type FavoriteTeamSlide = {
  favorite: {
    key: FavoriteTeamKey;
    league: FavoriteLeague;
    id: string;
  };
  name: string;
  fullName?: string;
  logo?: ImageSourcePropType;
  color?: string;
  secondaryColor?: string;
  code?: string;
};

type FavoriteTeamsSliderProps = {
  teams: FavoriteTeamSlide[];
  width: number;
  height: number;
  isDark: boolean;
  compact?: boolean;
  disabled?: boolean;
};

export default function FavoriteTeamsSlider({
  teams,
  width,
  height,
  isDark,
  compact = false,
  disabled = false,
}: FavoriteTeamsSliderProps) {
  const router = useScopedRouter();
  const styles = useMemo(
    () => FavoriteTeamsSliderStyles(isDark, compact),
    [compact, isDark],
  );
  const keyExtractor = useCallback(
    (item: FavoriteTeamSlide) => item.favorite.key,
    [],
  );

  const renderSlide = useCallback(
    (item: FavoriteTeamSlide) => {
      return (
        <Pressable
          disabled={disabled}
          style={styles.slideButton}
          onPress={() => {
            const route = getFavoriteTeamRoute(item.favorite.league);
            const teamType =
              route === "/team/[teamId]" ? null : route.split("/")[2];

            router.push({
              pathname: teamType
                ? "/(tabs)/(explore)/team/[teamType]/[teamId]"
                : "/(tabs)/(explore)/team/[teamId]",
              params: {
                teamId: item.favorite.id,
                league: item.favorite.league,
                ...(teamType ? { teamType } : {}),
              },
            } as any);
          }}
        >
          <LinearGradient
            colors={[
              item.color ?? Colors.midTone,
              isDark ? Colors.black : Colors.white,
            ]}
            locations={[0, 0.8]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.teamGlow, StyleSheet.absoluteFill]}
          />

          <Image
            source={item.logo ?? PlaceholderLogo}
            style={styles.teamLogo}
          />
          <View style={styles.teamTextWrap}>
            <Text
              style={styles.teamName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.fullName}
            </Text>

            <Text style={styles.leagueText}>
              {item.favorite.league.toUpperCase()}
            </Text>
          </View>
        </Pressable>
      );
    },
    [disabled, isDark, router, styles],
  );

  return (
    <WidgetCarousel
      items={teams}
      initialWidth={width}
      height={height}
      isDark={isDark}
      disabled={disabled}
      keyExtractor={keyExtractor}
      renderItem={renderSlide}
      accessibilityLabel={(pageIndex, pageCount) =>
        `Favorite teams, page ${pageIndex + 1} of ${pageCount}`
      }
    />
  );
}
