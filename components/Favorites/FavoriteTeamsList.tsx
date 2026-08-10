// components/Favorites/FavoriteTeamsList.tsx

import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { Ionicons } from "@expo/vector-icons";
import Button from "components/Button";
import TeamPreviewModal from "components/Favorites/TeamPreviewModal";
import { Colors } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBTeamLogo } from "constants/teamsCB";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeamLogo } from "constants/teamsSB";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import { favoriteTeamsListStyles } from "styles/FavorieTeamsListStyles";
import type { LeagueType, Team } from "types/types";
import { getFavoriteTeamRoute } from "utils/favoriteTeams";

type FavoriteTeam = Team & {
  league: LeagueType;
};

type Props = {
  favoriteTeams: FavoriteTeam[];
  isGridView: boolean;
  itemWidth?: number;
  isCurrentUser: boolean;
};

const getLeagueBadgeColor = (league: LeagueType) => {
  switch (league) {
    case "CFB":
      return "#228B22";
    case "CBB":
      return "#1E90FF";
    case "WCBB":
      return "#C2185B";
    case "CB":
      return "#0F766E";
    case "SB":
      return "#B45309";
    default:
      return "transparent";
  }
};

const FavoriteTeamsList = ({
  favoriteTeams,
  isGridView,
  isCurrentUser,
}: Props) => {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = favoriteTeamsListStyles(isDark);

  const {
    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  } = useFavoriteTeamsContext();

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
          isGridView ? styles.teamGrid : undefined,
          styles.gridContainer,
        ]}
      >
        {favoriteTeams.map((team) => {
          const id = team.id;
          const { league } = team;
          const teamBackgroundColor = team.color ?? Colors.midTone;

          let logo;

          switch (league) {
            case "NFL":
              logo = getNFLTeamLogo(Number(id), true);
              break;
            case "NBA":
              logo = getTeamLogo(Number(id), true);
              break;
            case "WNBA":
              logo = getWNBATeamLogo(Number(id), true);
              break;
            case "CFB":
              logo = getCFBTeamLogo(Number(id), true);
              break;
            case "CBB":
              logo = getCBBTeamLogo(Number(id), true);
              break;
            case "WCBB":
              logo = getWCBBTeamLogo(Number(id), true);
              break;
            case "NHL":
              logo = getNHLTeamLogo(Number(id), true);
              break;
            case "MLB":
              logo = getMLBTeamLogo(Number(id), true);
              break;
            case "CB":
              logo = getCBTeamLogo(Number(id), true);
              break;
            case "SB":
              logo = getSBTeamLogo(Number(id), true);
              break;
            default:
              logo = null;
          }

          const showLeagueBadge = [
            "CFB",
            "CBB",
            "WCBB",
            "CB",
            "SB",
          ].includes(league);

          const teamName = team.name ?? team.shortName ?? String(id);

          return (
            <LongPressGestureHandler
              key={`${league}:${id}`}
              minDurationMs={300}
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) {
                  handleLongPress(team);
                }
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  pressed && styles.pressed,
                  isGridView ? styles.gridItem : styles.listItem,
                ]}
                onPress={() => {
                  router.push({
                    pathname: getFavoriteTeamRoute(league),
                    params: {
                      teamId: String(id),
                      league,
                    },
                  });
                }}
              >
                <View
                  style={[
                    styles.teamItem,
                    {
                      flex: 1,
                      backgroundColor: teamBackgroundColor,
                      flexDirection: isGridView ? "column" : "row",
                      paddingVertical: isGridView ? 20 : 12,
                    },
                  ]}
                >
                  {showLeagueBadge && (
                    <View
                      style={[
                        styles.leagueBadge,
                        {
                          backgroundColor: getLeagueBadgeColor(league),
                        },
                      ]}
                    >
                      <Text style={styles.leagueBadgeText}>{league}</Text>
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