import { Ionicons } from "@expo/vector-icons";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { Colors } from "constants/styles";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { favoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import type { FavoriteTeamItem } from "types/favorites";
import { isFavoriteLeague } from "types/favorites";
import { getFavoriteBaseTeam } from "utils/favoriteTeams";
import { TeamTab } from "./TeamTab";

type Props = {
  favoriteTeamIds: string[];
  onFavoritesChange?: (ids: string[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  loading?: boolean;
  isDark: boolean;
};

export default function FavoritesScroll({
  favoriteTeamIds,
  onFavoritesChange,
  onDragStart,
  onDragEnd,
  loading,
  isDark,
}: Props) {
  const router = useRouter();
  const styles = favoritesScrollStyles(isDark);
  const { syncFavorites } = useFavoriteTeamsContext();

  const data = useMemo<FavoriteTeamItem[]>(() => {
    return favoriteTeamIds.reduce<FavoriteTeamItem[]>((teams, favorite) => {
      const [leagueValue, favoriteId] = favorite.split(":");

      if (!isFavoriteLeague(leagueValue) || !favoriteId) {
        return teams;
      }

      const league = leagueValue;
      const baseTeam = getFavoriteBaseTeam(league, favoriteId);

      if (!baseTeam) {
        return teams;
      }

      teams.push({
        ...baseTeam,
        id: favoriteId,
        code: baseTeam.code ?? "",
        league,
        key: favorite,
        color: baseTeam.color ?? undefined,
        isDark,
      });

      return teams;
    }, []);
  }, [favoriteTeamIds, isDark]);

  if (loading) {
    return <FavoritesScrollSkeleton isDark={isDark} />;
  }

  return (
    <DraggableFlatList
      data={data}
      horizontal
      keyExtractor={(item) => item.key}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.favorites}
      activationDistance={30}
      renderItem={TeamTab}
      onDragBegin={async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        onDragStart?.();
      }}
      onPlaceholderIndexChange={async () => {
        await Haptics.selectionAsync();
      }}
      onDragEnd={async ({ data: reordered }) => {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );

        const orderedFavorites = reordered.map(
          (team) => `${team.league}:${team.id}`,
        );

        await syncFavorites(orderedFavorites);
        onFavoritesChange?.(orderedFavorites);
        onDragEnd?.();
      }}
      ListFooterComponent={() => (
        <Pressable
          onPress={async () => {
            await Haptics.selectionAsync();
            router.push("/edit-favorites");
          }}
          style={styles.teamContainer}
        >
          <View style={styles.editIcon}>
            <Ionicons
              name={data.length === 0 ? "add" : "create"}
              size={28}
              color={isDark ? Colors.dark.background : Colors.light.background}
            />
          </View>
          <View style={styles.teamLabelContainer}>
            <Text style={styles.teamLabel}>
              {data.length === 0 ? "Add teams" : "Edit"}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}
