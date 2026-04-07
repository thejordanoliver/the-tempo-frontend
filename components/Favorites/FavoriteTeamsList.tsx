// components/FavoriteTeamsList.tsx

import { Ionicons } from "@expo/vector-icons";
import Button from "components/Button";
import TeamPreviewModal from "components/Favorites/TeamPreviewModal";
import { Colors } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { favoriteTeamsListStyles } from "styles/FavorieTeamsListStyles";
import type { LeagueType, Team } from "types/types";
import { getTeamRoute } from "utils/teams";

type TeamWithLeague = Team & { league: LeagueType };

type Props = {
  favoriteTeams: TeamWithLeague[];
  isGridView: boolean;
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

const getLeagueBadgeColor = (league: LeagueType) => {
  switch (league) {
    case "CFB":
      return "#228B22";
    case "CBB":
      return "#1E90FF";
    case "WCBB":
      return "#C2185B";
    default:
      return "transparent";
  }
};

/* ---------------- COMPONENT ---------------- */

const FavoriteTeamsList = ({
  favoriteTeams,
  isGridView,
  isCurrentUser,
}: Props) => {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const styles = favoriteTeamsListStyles(isDark);
  // ✅ shared context — same instance as ProfileScreenInner
  const {
    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  } = useFavoriteTeamsContext();

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

      <View style={[isGridView ? styles.teamGrid : {}, styles.gridContainer]}>
        {favoriteTeams.map((team) => {
          const id = getTeamId(team);
          const teamBackgroundColor = team.color ?? Colors.midTone;

          let logo;
          switch (team.league) {
            case "NFL":
              logo = getNFLTeamLogo(Number(team.id), true);
              break;
            case "NBA":
              logo = getTeamLogo(Number(team.id), true);
              break;
            case "WNBA":
              logo = getWNBATeamLogo(Number(team.id), true);
              break;
            case "CFB":
              logo = getCFBTeamLogo(Number(team.id), true);
              break;
            case "CBB":
              logo = getCBBTeamLogo(Number(team.id), true, false);
              break;
            case "WCBB":
              logo = getCBBTeamLogo(Number(team.id), true, true);
              break;
            case "NHL":
              logo = getNHLTeamLogo(Number(team.id), true);
              break;
            case "MLB":
              logo = getMLBTeamLogo(Number(team.id), true);
              break;
            default:
              logo = null;
          }
          const isCollege =
            team.league === "CFB" ||
            team.league === "CBB" ||
            team.league === "WCBB";
          const showLeagueBadge = isCollege;

          const teamName = team.name;

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
                  pressed && styles.pressed,
                  isGridView ? styles.gridItem : styles.listItem,
                ]}
                onPress={() =>
                  router.push({
                    pathname: getTeamRoute(team.league) as any,
                    params: { teamId: String(id) },
                  })
                }
              >
                <View
                  style={[
                    styles.teamItem,
                    styles.teamItemBase,
                    {
                      backgroundColor: teamBackgroundColor,
                      flexDirection: isGridView ? "column" : "row",
                      justifyContent: isGridView ? "center" : "flex-start",
                      height: isGridView ? 130 : "auto",
                      marginBottom: isGridView ? 0 : 8,
                      paddingVertical: isGridView ? 20 : 12,
                    },
                  ]}
                >
                  {showLeagueBadge && (
                    <View
                      style={[
                        styles.leagueBadge,
                        { backgroundColor: getLeagueBadgeColor(team.league) },
                      ]}
                    >
                      <Text style={styles.leagueBadgeText}>{team.league}</Text>
                    </View>
                  )}

                  <Image
                    source={logo}
                    style={[
                      styles.teamLogo,
                      isGridView
                        ? styles.logoGridMargin
                        : styles.logoListMargin,
                    ]}
                  />

                  {isGridView ? (
                    <View style={styles.gridNameContainer}>
                      <Text style={[styles.teamName, styles.gridNameText]}>
                        {teamName}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.teamName, styles.listNameText]}>
                      {teamName}
                    </Text>
                  )}
                </View>
              </Pressable>
            </LongPressGestureHandler>
          );
        })}
      </View>

      {isCurrentUser && (
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => router.push("/edit-favorites")}
            isDark={isDark}
          >
            Edit Teams
            <Ionicons
              style={styles.editIcon}
              name="create"
              size={20}
              color={isDark ? Colors.black : Colors.white}
            />
          </Button>
        </View>
      )}
    </>
  );
};

export default FavoriteTeamsList;
