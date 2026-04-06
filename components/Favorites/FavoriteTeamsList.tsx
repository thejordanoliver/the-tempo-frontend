// components/FavoriteTeamsList.tsx

import { Ionicons } from "@expo/vector-icons";
import TeamPreviewModal from "components/Favorites/TeamPreviewModal";
import { Colors, Fonts } from "constants/styles";
import { useRouter } from "expo-router";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import type { LeagueType, Team } from "types/types";
import { getTeamRoute } from "utils/teams";

type TeamWithLeague = Team & { league: LeagueType };

type Props = {
  favoriteTeams: TeamWithLeague[];
  isGridView: boolean;
  styles: any;
  itemWidth?: number;
  isCurrentUser: boolean;
};

/* ---------------- LOGO HELPER ---------------- */

function resolveLogo(source: any) {
  if (!source) return null;

  if (typeof source === "number") return source;
  if (typeof source === "object" && source.uri) return source;
  if (typeof source === "string") return { uri: source };

  return null;
}

/* ---------------- TEAM HELPERS ---------------- */

const getTeamId = (team: TeamWithLeague) => {
  if (team.league === "WCBB") return (team as any).wid;
  return team.id;
};

/* ---------------- COMPONENT ---------------- */

const FavoriteTeamsList = ({
  favoriteTeams,
  isGridView,
  styles,
  isCurrentUser,
}: Props) => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const {
    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  } = useFavoriteTeams();

  /* ---------------- RENDER ---------------- */

  return (
    <>
      {previewTeam && (
        <TeamPreviewModal
          visible={modalVisible}
          team={previewTeam}
          onClose={() => setModalVisible(false)}
          onGo={handleGoToTeam}
          onRemove={handleRemoveFavorite}
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
        {favoriteTeams.map((team) => {
          const id = getTeamId(team);

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
              ? ((team as any).secondaryColor ??
                (team as any).secondary_color ??
                Colors.midTone)
              : (team.color ?? Colors.midTone)
            : (team.color ?? Colors.midTone);

          const split = team.fullName?.split(" ");
          const city = split?.slice(0, -1).join(" ");
          const nickname = split?.at(-1) || "";

          const displayName =
            team.league === "CFB" || team.league === "CBB"
              ? team.name || team.fullName || "Unknown Team"
              : city;

          const displayNickname =
            team.league === "CFB" ||
            team.league === "CBB" ||
            team.league === "WCBB"
              ? null
              : nickname;

          const rawLogo = team.logoLight || team.logo || null;

          const logoSource =
            resolveLogo(rawLogo) ??
            require("assets/Placeholders/teamPlaceholder.png");

          return (
            <LongPressGestureHandler
              key={`${team.league}:${id}`}
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
                onPress={() =>
                  router.push({
                    pathname: getTeamRoute(team.league),
                    params: { teamId: String(id) },
                  })
                }
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
                      position: "relative",
                      overflow: "hidden",
                    },
                  ]}
                >
                  {(team.league === "CFB" ||
                    team.league === "CBB" ||
                    team.league === "WCBB") && (
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
                          team.league === "CFB"
                            ? "#228B22"
                            : team.league === "CBB"
                              ? "#1E90FF"
                              : "#C2185B",
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
