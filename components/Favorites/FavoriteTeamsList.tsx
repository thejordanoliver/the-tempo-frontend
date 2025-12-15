// components/FavoriteTeamsList.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import type { Team } from "types/types"; // Team type should include `league: "NBA" | "NFL" | "CFB" | "CBB"`
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

// Accepts: require(), string URLs, { uri }, or null
function resolveLogo(source: any) {
  if (!source) return null;

  // Already a require() number
  if (typeof source === "number") return source;

  // Already { uri: string }
  if (typeof source === "object" && source.uri) return source;

  // String URL
  if (typeof source === "string") return { uri: source };

  return null;
}

const FavoriteTeamsList = ({
  favoriteTeams,
  isGridView,
  styles,
  isCurrentUser,
  username,
}: Props) => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const [favorites, setFavorites] = useState<TeamWithLeague[]>(favoriteTeams);
  const [previewTeam, setPreviewTeam] = useState<TeamWithLeague | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const alwaysLightLogoTeams = [
    "Alabama",
    "Arkansas",
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
    "Dodgers",
    "Rangers",
  ]; // add more teams as needed

  const handleLongPress = (team: TeamWithLeague) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPreviewTeam(team);
    setModalVisible(true);
  };

  const handleGoToTeam = () => {
    if (!previewTeam) return;
    const route =
      previewTeam.league === "NFL"
        ? "/team/nfl/[teamId]"
        : previewTeam.league === "NBA"
        ? "/team/[teamId]"
        : previewTeam.league === "CFB"
        ? "/team/cfb/[teamId]"
        : "/team/cbb/[teamId]";
    router.push({
      pathname: route,
      params: { teamId: previewTeam.id.toString() },
    });
    setModalVisible(false);
  };

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

  return (
    <>
      {previewTeam && (
        <TeamPreviewModal
          visible={modalVisible}
          team={previewTeam}
          onClose={() => setModalVisible(false)}
          onGo={handleGoToTeam}
          onRemove={() => handleRemoveFavorite(previewTeam)}
          currentUser={isCurrentUser}
        />
      )}

      <View
        style={[
          isGridView ? styles.teamGrid : {},
          {
            columnGap: isGridView ? 6 : 0,
            rowGap: isGridView ? 8 : 0,
            justifyContent: "flex-start",
          },
        ]}
      >
        {favorites.map((team) => {
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
          ].includes(team.name ?? team.fullName ?? "");

          const teamBackgroundColor = isDark
            ? useSecondaryInDark
              ? (team as any).secondaryColor ??
                (team as any).secondary_color ??
                Colors.midTone
              : team.color ?? Colors.midTone
            : team.color ?? Colors.midTone;

          const split = team.fullName?.split(" ");
          const city = split?.slice(0, -1).join(" ");
          const nickname = split?.at(-1) || "";

          const displayName =
            team.league === "CFB" || team.league === "CBB"
              ? team.name || team.fullName || "Unknown Team"
              : city;

          const displayNickname =
            team.league === "CFB" || team.league === "CBB" ? null : nickname;

          const rawLogo =
            (alwaysLightLogoTeams.includes(team.name ?? team.fullName ?? "") &&
              team.logoLight) ||
            (isDark && team.logoLight) ||
            team.logo ||
            team.logoLight ||
            null;

          const logoSource =
            resolveLogo(rawLogo) ??
            require("assets/Placeholders/teamPlaceholder.png");

          return (
            <LongPressGestureHandler
              key={`${team.league}:${team.id}`}
              minDurationMs={300}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) handleLongPress(team);
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
                      : team.league === "CFB"
                      ? "/team/cfb/[teamId]"
                      : team.league === "CBB"
                      ? "/team/cbb/[teamId]"
                      : "/team/mlb/[teamId]";
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
                      position: "relative", // ensure badge overlays correctly
                      overflow: "hidden",
                    },
                  ]}
                >
                  {/* League Tag for CFB / CBB */}
                  {(team.league === "CFB" || team.league === "CBB") && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        paddingLeft: 12,
                        paddingRight: 6,
                        paddingVertical: 4,
                        borderTopLeftRadius: 6,
                        borderBottomLeftRadius: 100,
                        zIndex: 2,
                        backgroundColor:
                          team.league === "CFB" ? "#228B22" : "#1E90FF",
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.white,
                          fontSize: 11,
                          fontFamily: Fonts.OSBOLD,
                        }}
                      >
                        {team.league}
                      </Text>
                    </View>
                  )}

                  <Image
                    source={logoSource}
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
                        {displayName}
                      </Text>
                      {displayNickname && (
                        <Text
                          style={[
                            styles.teamName,
                            { fontSize: 12, textAlign: "center", marginTop: 2 },
                          ]}
                        >
                          {displayNickname}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.teamName,
                        { textAlign: "left", fontSize: 14, marginLeft: 10 },
                      ]}
                    >
                      {team.fullName || displayName}
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
                color={isDark ? Colors.black : Colors.white}
              />
            </View>
          </Pressable>
        </View>
      )}
    </>
  );
};

export default FavoriteTeamsList;
