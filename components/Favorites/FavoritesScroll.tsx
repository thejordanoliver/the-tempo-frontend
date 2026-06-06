import { Ionicons } from "@expo/vector-icons";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { Colors } from "constants/styles";
import { mlbTeams } from "constants/teamsMLB";
import { nhlTeams } from "constants/teamsNHL";
import { wnbaTeams } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { favoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import { LeagueType } from "types/types";
import { teams } from "../../constants/teams";
import { cbbTeams } from "../../constants/teamsCBB";
import { cfbTeams } from "../../constants/teamsCFB";
import { nflTeams } from "../../constants/teamsNFL";
import { TeamTab } from "./TeamTab";

type TeamWithLeague = {
  id: string | number;
  name: string;
  code: string;
  logo?: any;
  logoLight?: any;
  color?: string;
  league: LeagueType;
  key: string;
  wid?: number;
  isDark: boolean;
};

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

  // -------------------------
  // Prepare teams from favoriteTeamIds
  // -------------------------
  const data: TeamWithLeague[] = useMemo(() => {
    return favoriteTeamIds
      .map((fav) => {
        const [league, id] = fav.split(":");

        let baseTeam:
          | {
              id: number;
              name: string;
              logo?: any;
              color?: string | null;
              wid?: number;
            }
          | undefined;

        switch (league) {
          case "NBA":
            baseTeam = teams.find((t) => String(t.id) === id);
            break;
          case "WNBA":
            baseTeam = wnbaTeams.find((t) => String(t.id) === id);
            break;
          case "NFL":
            baseTeam = nflTeams.find((t) => String(t.id) === id);
            break;
          case "CFB":
            baseTeam = cfbTeams.find((t) => String(t.id) === id);
            break;
          case "CBB":
            baseTeam = cbbTeams.find((t) => String(t.id) === id);
            break;
          case "WCBB":
            baseTeam = cbbTeams.find((t) => String(t.wid) === id);
            if (!baseTeam?.wid) return null;
            break;
          case "MLB":
            baseTeam = mlbTeams.find((t) => String(t.id) === id);
            break;
          case "NHL":
            baseTeam = nhlTeams.find((t) => String(t.id) === id);
            break;
          default:
            return null;
        }

        if (!baseTeam) return null;

        return {
          ...baseTeam,
          id: league === "WCBB" ? String(baseTeam.wid) : String(baseTeam.id),
          color: baseTeam.color ?? undefined,
          league: league as LeagueType,
          key: `${league}-${id}`,
          wid: baseTeam.wid,
          isDark, // ✅ now correctly set on every item
        } as TeamWithLeague;
      })
      .filter((t): t is TeamWithLeague => t !== null);
  }, [favoriteTeamIds, isDark]); // ✅ isDark added to deps so items update on theme change
  if (loading) return <FavoritesScrollSkeleton isDark={isDark} />;

  // -------------------------
  // Render
  // -------------------------
  return (
    <View style={styles.favoritesWrapper}>
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

          const orderedIds = reordered.map((t) =>
            t.league === "WCBB" ? `WCBB:${t.wid}` : `${t.league}:${t.id}`,
          );

          await syncFavorites(orderedIds); // ✅ hook handles storage + API
          onFavoritesChange?.(orderedIds);
          onDragEnd?.();
        }}
        ListFooterComponent={() => (
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push("/edit-favorites");
            }}
            style={[styles.teamIcon, styles.editButton]}
          >
            <View style={styles.editIcon}>
              <Ionicons
                name={data.length === 0 ? "add" : "create"}
                size={32}
                color={
                  isDark ? Colors.dark.background : Colors.light.background
                }
              />
            </View>
            <Text style={styles.teamLabel}>
              {data.length === 0 ? "Add teams" : "Edit"}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
