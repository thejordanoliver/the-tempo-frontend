import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import FavoritesScrollSkeleton from "components/Skeletons/FavoritesScrollSkeleton";
import { Colors } from "constants/Styles";
import { getMLBTeamLogo, mlbTeams } from "constants/teamsMLB";
import { getNHLTeamLogo, nhlTeams } from "constants/teamsNHL";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { favoritesScrollStyles } from "styles/HomeStyles/FavoritesScrollStyles";
import { LeagueType } from "types/types";
import { getTeamLogo, teams } from "../../constants/teams";
import { cbbTeams, getCBBTeamLogo } from "../../constants/teamsCBB";
import { cfbTeams, getCFBTeamLogo } from "../../constants/teamsCFB";
import { getNFLTeamLogo, nflTeams } from "../../constants/teamsNFL";
type TeamWithLeague = {
  id: string | number;
  name: string;
  logo?: any;
  logoLight?: any;
  color?: string;
  league: LeagueType;
  key: string;
  wid?: number;
};

type Props = {
  favoriteTeamIds: string[];
  onFavoritesChange?: (ids: string[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  loading?: boolean;
};

import { BASE_URL } from "utils/apiClient";

export default function FavoritesScroll({
  favoriteTeamIds,
  onFavoritesChange,
  onDragStart,
  onDragEnd,
  loading,
}: Props) {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = favoritesScrollStyles(isDark);
  const [username, setUsername] = useState<string | null>(null);

  // -------------------------
  // Prepare initial teams
  // -------------------------
  const initialTeams: TeamWithLeague[] = favoriteTeamIds
    .map((fav) => {
      const [league, id] = fav.split(":");
      let baseTeam:
        | { id: number; name: string; logo?: any; color?: string; wid?: number }
        | undefined;

      switch (league) {
        case "NBA":
          baseTeam = teams.find((t) => String(t.id) === id);
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
          if (!baseTeam?.wid) return null; // Skip if wid not present
          break;
        case "MLB":
          baseTeam = mlbTeams.find((t) => String(t.id) === id);
          break;
        case "NHL":
          baseTeam = nhlTeams.find((t) => String(t.id) === id);
          break;
      }

      if (!baseTeam) return null;

      return {
        ...baseTeam,
        id: league === "WCBB" ? String(baseTeam.wid) : String(baseTeam.id),
        league: league as LeagueType,
        key: `${league}-${id}`,
        wid: baseTeam.wid,
      } as TeamWithLeague;
    })
    .filter((t): t is TeamWithLeague => t !== null);

  const [data, setData] = useState<TeamWithLeague[]>(initialTeams);

  // -------------------------
  // Load username
  // -------------------------
  useEffect(() => {
    AsyncStorage.getItem("username").then((u) => {
      if (u) setUsername(u);
    });
  }, []);

  // -------------------------
  // Update data if favorites change
  // -------------------------
  useEffect(() => {
    setData(initialTeams);
  }, [favoriteTeamIds]);

  // -------------------------
  // Render a single team
  // -------------------------
  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<TeamWithLeague>) => {
    // Determine logo based on league
    let logo;
    switch (item.league) {
      case "NFL":
        logo = getNFLTeamLogo(Number(item.id), true);
        break;
      case "NBA":
        logo = getTeamLogo(Number(item.id), true);
        break;
      case "CFB":
        logo = getCFBTeamLogo(Number(item.id), true);
        break;
      case "CBB":
        logo = getCBBTeamLogo(Number(item.id), true, false);
        break;
      case "WCBB":
        logo = getCBBTeamLogo(Number(item.id), true, true); // Use wid for women's teams
        break;
      case "NHL":
        logo = getNHLTeamLogo(Number(item.id), true);
        break;
      case "MLB":
        logo = getMLBTeamLogo(Number(item.id), true);
        break;
      default:
        logo = null;
    }

    return (
      <Pressable
        onLongPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          drag();
        }}
        key={item.key}
        style={({ pressed }) => [
          styles.teamIcon,
          pressed && { opacity: 0.6 },
          isActive && { opacity: 0.8, transform: [{ scale: 1.05 }] },
        ]}
        onPress={async () => {
          await Haptics.selectionAsync();
          const routeMap: Record<LeagueType, string> = {
            NBA: "/team/[teamId]",
            NFL: "/team/nfl/[teamId]",
            CFB: "/team/cfb/[teamId]",
            CBB: "/team/cbb/[teamId]",
            WCBB: "/team/wcbb/[teamId]",
            MLB: "/team/mlb/[teamId]",
            NHL: "/team/nhl/[teamId]",
            MMA: "/player/mma/[id]",
          };
          const route = routeMap[item.league];
          router.push({ pathname: route as any, params: { teamId: item.id } });
        }}
      >
        <View
          style={[
            styles.logoWrapper,
            {
              backgroundColor: isDark
                ? item.color || Colors.dark.itemBackground
                : item.color || Colors.light.itemBackground,
            },
          ]}
        >
          <Image source={logo} style={styles.logo} />
        </View>

        <View style={styles.teamLabelContainer}>
          <Text style={styles.teamLabel}>{item.name}</Text>
          {(item.league === "CFB" ||
            item.league === "CBB" ||
            item.league === "WCBB") && (
            <>
              <View style={styles.divider} />
              <Text style={styles.teamLabel}>{item.league}</Text>
            </>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) return <FavoritesScrollSkeleton />;

  // -------------------------
  // Render the list
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
        renderItem={renderItem}
        onDragBegin={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDragStart?.();
        }}
        onPlaceholderIndexChange={async () => {
          await Haptics.selectionAsync();
        }}
        onDragEnd={async ({ data }) => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          setData(data);

          const orderedIds = data.map((t) =>
            t.league === "WCBB" ? `WCBB:${t.wid}` : `${t.league}:${t.id}`,
          );

          await AsyncStorage.setItem("favorites", JSON.stringify(orderedIds));
          onFavoritesChange?.(orderedIds);
          onDragEnd?.();

          const storedUserId = await AsyncStorage.getItem("userId");
          if (!storedUserId) {
            console.warn("No userId found — will sync favorites later.");
            return;
          }

          try {
            await axios.patch(
              `${BASE_URL}/api/users/id/${storedUserId}/favorites`,
              {
                favorites: orderedIds,
              },
            );
            console.log("✅ Favorites reordered and synced successfully.");
          } catch (err) {
            console.warn("❌ Network error syncing favorites:", err);
          }
        }}
        ListFooterComponent={() => (
          <Pressable
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push("/edit-favorites");
            }}
            accessibilityRole="button"
            accessibilityLabel={
              data.length === 0 ? "Add favorite teams" : "Edit favorite teams"
            }
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
