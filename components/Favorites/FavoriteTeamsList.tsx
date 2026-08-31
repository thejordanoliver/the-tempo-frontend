// components/Favorites/FavoriteTeamsList.tsx

import Button from "@/components/Buttons/Button";
import {
  LEAGUE_CONFIG,
  type FavoriteSportId,
} from "@/constants/leagues";
import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { isFavoriteLeague } from "@/types/favorites";
import { Ionicons } from "@expo/vector-icons";
import TeamPreviewModal from "components/Favorites/TeamPreviewModal";
import { Colors } from "constants/styles";
import { getNBATeamLogo } from "constants/teams";
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
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { favoriteTeamsListStyles } from "styles/FavorieTeamsListStyles";
import type { Team } from "types/types";
import { getFavoriteTeamRoute } from "utils/favoriteTeams";

type Props = {
  favoriteTeams: Team[];
  favoriteSports?: FavoriteSportId[];
  favoriteSportsLoading?: boolean;
  favoriteSportsReady?: boolean;
  isGridView: boolean;
  itemWidth: number;
  isCurrentUser: boolean;
};

const getLeagueBadgeColor = (league: string) => {
  switch (league) {
    case "cfb":
      return "#228B22";
    case "cbb":
      return "#1E90FF";
    case "wcbb":
      return "#C2185B";
    case "cb":
      return "#0F766E";
    case "sb":
      return "#B45309";
    default:
      return "transparent";
  }
};

export default function FavoriteTeamsList({
  favoriteTeams,
  favoriteSports,
  favoriteSportsLoading = false,
  favoriteSportsReady = true,
  isGridView,
  itemWidth,
  isCurrentUser,
}: Props) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = favoriteTeamsListStyles(isDark, itemWidth, isGridView);

  const {
    previewTeam,
    modalVisible,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
  } = useFavoriteTeamsContext();

  const showFavoriteSports = favoriteSports !== undefined;
  const sports = favoriteSports ?? [];

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

      {showFavoriteSports && (
        <>
          <Text style={styles.sectionTitle}>Favorite Sports</Text>

          {favoriteSportsLoading && !favoriteSportsReady ? (
            <ActivityIndicator
              accessibilityLabel="Loading favorite sports"
              color={isDark ? Colors.white : Colors.black}
              style={styles.loadingIndicator}
            />
          ) : sports.length > 0 ? (
            <View style={isGridView ? styles.grid : styles.list}>
              {sports.map((sport) => {
                const config = LEAGUE_CONFIG[sport];

                return (
                  <Pressable
                    key={`sport:${sport}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${config.label}`}
                    onPress={() => {
                      router.push({
                        pathname: config.route,
                        params: {
                          league: sport,
                          leagueLabel: config.label,
                        },
                      });
                    }}
                    style={({ pressed }) => [
                      pressed && styles.pressed,
                      isGridView ? styles.gridItem : styles.listItem,
                      {
                        backgroundColor: config.color,
                        padding: isGridView ? 20 : 12,
                      },
                    ]}
                  >
                    <View style={styles.teamItem}>
                      <Image
                        source={config.logoLight}
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
                            {config.label}
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.teamName, styles.listNameText]}>
                          {config.label}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyText}>No favorite sports yet.</Text>
          )}

          <Text style={[styles.sectionTitle, styles.nextSectionTitle]}>
            Favorite Teams
          </Text>
        </>
      )}

      <View style={[isGridView ? styles.grid : styles.list]}>
        {favoriteTeams.map((team) => {
          const id = team.id;
          const { league } = team;
          const teamBackgroundColor = team.color ?? Colors.midTone;

          let logo;

          switch (league) {
            case "nfl":
              logo = getNFLTeamLogo(Number(id), true);
              break;
            case "nba":
              logo = getNBATeamLogo(Number(id), true);
              break;
            case "wnba":
              logo = getWNBATeamLogo(Number(id), true);
              break;
            case "cfb":
              logo = getCFBTeamLogo(Number(id), true);
              break;
            case "cbb":
              logo = getCBBTeamLogo(Number(id), true);
              break;
            case "wcbb":
              logo = getWCBBTeamLogo(Number(id), true);
              break;
            case "nhl":
              logo = getNHLTeamLogo(Number(id), true);
              break;
            case "mlb":
              logo = getMLBTeamLogo(Number(id), true);
              break;
            case "cb":
              logo = getCBTeamLogo(Number(id), true);
              break;
            case "sb":
              logo = getSBTeamLogo(Number(id), true);
              break;
            default:
              logo = null;
          }

          const showLeagueBadge = ["cfb", "cbb", "wcbb", "cb", "sb"].includes(
            league,
          );

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
                  {
                    backgroundColor: teamBackgroundColor,
                    padding: isGridView ? 20 : 12,
                  },
                ]}
                onPress={() => {
                  if (!isFavoriteLeague(league)) {
                    console.warn(`Unsupported favorite league: ${league}`);
                    return;
                  }

                  router.push({
                    pathname: getFavoriteTeamRoute(league),
                    params: {
                      teamId: String(id),
                      league,
                    },
                  });
                }}
              >
                {showLeagueBadge && (
                  <View
                    style={[
                      styles.sportTag,
                      {
                        backgroundColor: getLeagueBadgeColor(league),
                      },
                    ]}
                  >
                    <Text style={styles.sportTagText}>{league}</Text>
                  </View>
                )}
                <View style={[styles.teamItem]}>
                  <Image
                    source={logo}
                    style={[
                      styles.teamLogo,
                      isGridView
                        ? styles.logoGridMargin
                        : styles.logoListMargin,
                    ]}
                  />

                  {isGridView && (
                    <View style={styles.gridNameContainer}>
                      <Text style={[styles.teamName, styles.gridNameText]}>
                        {teamName}
                      </Text>
                    </View>
                  )}
                  {!isGridView && (
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
            Edit Favorites
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
}
