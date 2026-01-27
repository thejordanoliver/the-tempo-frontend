import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "constants/Colors";
import { teams as mlbTeams } from "constants/teamsMLB";
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
import { teams } from "../../constants/teams";
import { teams as cbbteams } from "../../constants/teamsCBB";
import { teams as cfbteams } from "../../constants/teamsCFB";
import { teams as nflteams } from "../../constants/teamsNFL";

type TeamWithLeague = {
  id: string | number;
  name: string;
  logo: any;
  logoLight?: string;
  color?: string;
  league: LeagueType;
  key: string;
};

type Props = {
  favoriteTeamIds: string[];
  onFavoritesChange?: (ids: string[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FavoritesScroll({
  favoriteTeamIds,
  onFavoritesChange,
  onDragStart,
  onDragEnd,
}: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = favoritesScrollStyles(isDark);
  const [username, setUsername] = useState<string | null>(null);

  const initialTeams: TeamWithLeague[] = favoriteTeamIds
    .map((fav) => {
      const [league, id] = fav.split(":");
      let baseTeam:
        | {
            id: number;
            name: string;
            logo?: any;
            logoLight?: string;
            color?: string;
          }
        | undefined;

      switch (league) {
        case "NBA":
          baseTeam = teams.find((t) => String(t.id) === id);
          break;
        case "NFL":
          baseTeam = nflteams.find((t) => String(t.id) === id);
          break;
        case "CFB":
          baseTeam = cfbteams.find((t) => String(t.id) === id);
          break;
        case "CBB":
          baseTeam = cbbteams.find((t) => String(t.id) === id);
          break;
        case "WCBB":
          baseTeam = cbbteams.find((t) => String(t.wid) === id);
          break;
        case "MLB":
          baseTeam = mlbTeams.find((t) => String(t.id) === id);
          break;
      }

      if (!baseTeam) return null;
      return {
        ...baseTeam,
        id:
          league === "WCBB"
            ? String((baseTeam as any).wid)
            : String(baseTeam.id),
        league: league as LeagueType,
        key: `${league}-${id}`,
      } as TeamWithLeague;
    })
    .filter((t): t is TeamWithLeague => t !== null);

  const [data, setData] = useState<TeamWithLeague[]>(initialTeams);

  useEffect(() => {
    AsyncStorage.getItem("username").then((u) => {
      if (u) setUsername(u);
    });
  }, []);

  useEffect(() => {
    setData(initialTeams);
  }, [favoriteTeamIds]);

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<TeamWithLeague>) => (
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

        if (!item.id) {
          console.warn("⚠️ Missing team id for navigation:", item);
          return;
        }

        const route =
          item.league === "NFL"
            ? "/team/nfl/[teamId]"
            : item.league === "NBA"
            ? "/team/[teamId]"
            : item.league === "CFB"
            ? "/team/cfb/[teamId]"
            : item.league === "CBB"
            ? "/team/cbb/[teamId]"
            : item.league === "WCBB"
            ? "/team/wcbb/[teamId]"
            : "/team/mlb/[teamId]";

        router.push({
          pathname: route,
          params: { teamId: item.id },
        });
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
        <Image
          source={
            isDark && item.logoLight
              ? item.logoLight
              : item.logoLight || item.logo
          }
          style={styles.logo}
        />
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

  return (
    <View style={styles.favoritesWrapper}>
      <DraggableFlatList
        data={data}
        horizontal
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.favorites}
        // 👇 Start of drag
        onDragBegin={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDragStart?.(); // notify parent
        }}
        // 👇 Fires when the placeholder position changes during drag
        onPlaceholderIndexChange={async () => {
          await Haptics.selectionAsync();
        }}
        // 👇 End of drag
        onDragEnd={async ({ data }) => {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
   

          setData(data);
          const orderedIds = data.map((t) => `${t.league}:${t.id}`);
          await AsyncStorage.setItem("favorites", JSON.stringify(orderedIds));
          onFavoritesChange?.(orderedIds);
          onDragEnd?.(); // notify parent
          const storedUsername = await AsyncStorage.getItem("username");
          if (!storedUsername) {
            console.warn("No username found — will sync favorites later.");
            return;
          }

          try {
            const res = await fetch(
              `${BASE_URL}/api/users/${storedUsername}/favorites`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favorites: orderedIds }),
              }
            );

            if (!res.ok) {
              console.warn(
                "Failed to update backend favorites:",
                await res.text()
              );
            } else {
              console.log("✅ Favorites reordered and synced successfully.");
            }
          } catch (err) {
            console.warn("❌ Network error syncing favorites:", err);
          }
        }}
        renderItem={renderItem}
        activationDistance={30}
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
