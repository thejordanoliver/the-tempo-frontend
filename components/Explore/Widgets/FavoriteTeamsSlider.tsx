import { Colors } from "@/constants/styles";
import { FavoriteTeamsSliderStyles } from "@/styles/ExploreStyles/FavoriteTeamsSliderStyles";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  const router = useRouter();
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
          onPress={() =>
            router.push({
              pathname: getFavoriteTeamRoute(item.favorite.league),
              params: { teamId: item.favorite.id },
            })
          }
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
