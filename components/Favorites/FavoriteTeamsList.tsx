// components/FavoriteTeamsList.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import type { Team } from "types/types"; // Team type should include `league: "NBA" | "NFL"`
import { LeagueType } from "types/types";
import TeamPreviewModal from "./../Team/TeamPreviewModal";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
type TeamWithLeague = Team & { league: LeagueType };

type Props = {
  favoriteTeams: TeamWithLeague[];
  isGridView: boolean;
  styles: any;
  itemWidth?: number;
  isCurrentUser: boolean;
  username?: string;
};

const FavoriteTeamsList = ({
  favoriteTeams,
  isGridView,
  styles,
  isCurrentUser,
  username,
}: Props) => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const [favorites, setFavorites] = useState<TeamWithLeague[]>(
    favoriteTeams.map((t) => ({
      ...t,
      league:
        (t as any).league || (t.fullName?.includes("State") ? "CFB" : "NBA"), // fallback guess
    }))
  );
  useEffect(() => {}, [favoriteTeams]);

  const [previewTeam, setPreviewTeam] = useState<TeamWithLeague | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (team: TeamWithLeague) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPreviewTeam(team);
    setModalVisible(true);
  };

  const handleGoToTeam = () => {
    if (previewTeam) {
      const route =
        previewTeam.league === "NFL"
          ? "/team/nfl/[teamId]"
          : previewTeam.league === "NBA"
          ? "/team/[teamId]"
          : "/team/cfb/[teamId]";
      router.push({
        pathname: route,
        params: { teamId: previewTeam.id.toString() },
      });
      setModalVisible(false);
    }
  };
  const alwaysLightLogoTeams = [
    "Alabama",
    "Duke",
    "Texas",
    "Tennessee",
    "UCLA",
    "Kentucky",
    "Clemson",
    "Nebraska",
    "Oregon",
    "West Virginia",
    "Tulsa",
    "TCU",
    "Sam Houston",
    "Baylor",
    "Air Force",
    "California",
    "BYU",
    "Kansas State",
    "Indiana",
    "Eastern Michigan",
    "Cincinnati",
  ]; // add more teams as needed

  const handleRemoveFavorite = async (team: TeamWithLeague) => {
    try {
      const key = `${team.league}:${team.id}`;
      const updated = favorites.filter((t) => `${t.league}:${t.id}` !== key);
      setFavorites(updated);
      setModalVisible(false);
      setPreviewTeam(null);

      const keysOnly = updated.map((t) => `${t.league}:${t.id}`);
      await AsyncStorage.setItem("favorites", JSON.stringify(keysOnly));

      if (username) {
        await axios.patch(`${API_URL}/api/users/${username}/favorites`, {
          favorites: keysOnly,
        });
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  useEffect(() => {
    setFavorites(favoriteTeams);
  }, [favoriteTeams]);

  // ✅ The .map() block must be inside return()
  return (
    <>
      {previewTeam && (
        <TeamPreviewModal
          visible={modalVisible}
          team={previewTeam}
          onClose={() => setModalVisible(false)}
          onGo={handleGoToTeam}
          onRemove={() => handleRemoveFavorite(previewTeam)}
        />
      )}

      <View
        style={[
          isGridView ? styles.teamGrid : {},
          { columnGap: isGridView ? 6 : 0 },
          { rowGap: isGridView ? 8 : 0 },
          { justifyContent: "flex-start" },
        ]}
      >
        {favorites.map((team) => {
          // ✅ Moved inside .map()
          const useSecondaryInDark = [
            "Grizzlies",
            "Suns",
            "Ravens",
            "Texans",
            "Cowboys",
            "Broncos",
            "Bears",
            "Pelicans",
            "Timberwolves",
            "Jaguars",
            "UCF",
            "Cincinnati",
          ].includes(team.name ?? "");

          const teamBackgroundColor = isDark
            ? useSecondaryInDark
              ? (team as any).secondaryColor ??
                (team as any).secondary_color ??
                "#888"
              : team.color ?? "#888"
            : team.color ?? "#888";

          const split = team.fullName?.split(" ");
          const city = split?.slice(0, -1).join(" ");
          const nickname = split?.at(-1) || "";

          return (
            <LongPressGestureHandler
              key={`${team.league}:${team.id}`}
              minDurationMs={300}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) {
                  handleLongPress(team);
                }
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && { opacity: 0.6 },
                  isGridView ? { width: "32%" } : { width: "100%" },
                ]}
                onPress={() => {
                  const route =
                    team.league === "NFL"
                      ? "/team/nfl/[teamId]"
                      : team.league === "NBA"
                      ? "/team/[teamId]"
                      : "/team/cfb/[teamId]";
                  router.push({
                    pathname: route,
                    params: { teamId: team.id.toString() },
                  });
                }}
              >
                <View
                  style={[
                    styles.teamItem,
                    {
                      backgroundColor: teamBackgroundColor,
                      flexDirection: isGridView ? "column" : "row",
                      justifyContent: isGridView ? "center" : "flex-start",
                      alignItems: "center",
                      height: isGridView ? 130 : "auto",
                      marginBottom: isGridView ? 0 : 8,
                      paddingHorizontal: 12,
                      paddingVertical: isGridView ? 20 : 12,
                    },
                  ]}
                >
                  <Image
                    source={
                      alwaysLightLogoTeams.includes(team.name ?? "") &&
                      team.logoLight
                        ? team.logoLight
                        : isDark && team.logoLight
                        ? team.logoLight
                        : team.logo || team.logoLight
                    }
                    style={[
                      styles.teamLogo,
                      isGridView ? { marginBottom: 8 } : { marginRight: 10 },
                    ]}
                  />
                  {isGridView ? (
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={[
                          styles.teamName,
                          { fontSize: 12, textAlign: "center" },
                        ]}
                      >
                        {team.league === "CFB" ? team.name : city}
                      </Text>
                      <Text
                        style={[
                          styles.teamName,
                          {
                            fontSize: 12,
                            textAlign: "center",
                            marginTop: 2,
                          },
                        ]}
                      >
                        {team.league === "CFB" ? null : nickname}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.teamName,
                        {
                          textAlign: "left",
                          fontSize: 14,
                          marginLeft: 10,
                        },
                      ]}
                    >
                      {team.fullName}
                    </Text>
                  )}
                </View>
              </Pressable>
            </LongPressGestureHandler>
          );
        })}
      </View>

      {isCurrentUser && (
        <View style={{ width: "100%" }}>
          <Pressable onPress={() => router.push("/edit-favorites")}>
            <View
              style={[
                styles.editButton,
                {
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={styles.editText}>Edit Teams</Text>
              <Ionicons
                style={styles.editIcon}
                name="create"
                size={20}
                color={isDark ? "#000" : "#fff"}
              />
            </View>
          </Pressable>
        </View>
      )}
    </>
  );
};

export default FavoriteTeamsList;
