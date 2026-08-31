// components/Favorites/FavoriteTeamsList.tsx

import Button from "@/components/Buttons/Button";
import { LEAGUE_CONFIG, type FavoriteSportId } from "@/constants/leagues";
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
import { useMemo } from "react";
import {
  Animated,
  Image,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { favoriteTeamsListStyles } from "styles/FavorieTeamsListStyles";
import type { Team } from "types/types";
import { getFavoriteTeamRoute } from "utils/favoriteTeams";
import HeaderWithToggle from "../Headings/HeaderWithToggle";

type Props = {
  favoriteTeams: Team[];
  favoriteSports?: FavoriteSportId[];
  favoriteSportsLoading?: boolean;
  favoriteSportsReady?: boolean;
  isGridView: boolean;
  itemWidth: number;
  isCurrentUser: boolean;
  onToggleView: () => void;
  fadeAnim: Animated.Value;
};

type FavoriteSportItem = {
  type: "sport";
  sport: FavoriteSportId;
};

type FavoriteTeamItem = {
  type: "team";
  team: Team;
};

type FavoriteItem = FavoriteSportItem | FavoriteTeamItem;

type FavoriteRow = FavoriteItem[];

type FavoriteSection = {
  key: "sports" | "teams";
  title: string;
  data: FavoriteRow[];
};

const chunkItems = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
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

const getTeamLogo = (team: Team) => {
  const id = Number(team.id);

  switch (team.league) {
    case "nfl":
      return getNFLTeamLogo(id, true);

    case "nba":
      return getNBATeamLogo(id, true);

    case "wnba":
      return getWNBATeamLogo(id, true);

    case "cfb":
      return getCFBTeamLogo(id, true);

    case "cbb":
      return getCBBTeamLogo(id, true);

    case "wcbb":
      return getWCBBTeamLogo(id, true);

    case "nhl":
      return getNHLTeamLogo(id, true);

    case "mlb":
      return getMLBTeamLogo(id, true);

    case "cb":
      return getCBTeamLogo(id, true);

    case "sb":
      return getSBTeamLogo(id, true);

    default:
      return null;
  }
};

export default function FavoritesSection({
  favoriteTeams,
  favoriteSports,
  favoriteSportsLoading = false,
  favoriteSportsReady = true,
  isGridView,
  itemWidth,
  isCurrentUser,
  onToggleView,
  fadeAnim,
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

  const sports = useMemo(() => favoriteSports ?? [], [favoriteSports]);

  const showSportsLoader = favoriteSportsLoading && !favoriteSportsReady;
  const sections = useMemo<FavoriteSection[]>(() => {
    const columns = isGridView ? 3 : 1;

    const favoriteSportItems: FavoriteSportItem[] = showSportsLoader
      ? []
      : sports.map((sport) => ({
          type: "sport",
          sport,
        }));

    const favoriteTeamItems: FavoriteTeamItem[] = favoriteTeams.map((team) => ({
      type: "team",
      team,
    }));

    const nextSections: FavoriteSection[] = [];

    if (showFavoriteSports) {
      nextSections.push({
        key: "sports",
        title: "Favorite Sports",
        data: chunkItems(favoriteSportItems, columns),
      });
    }

    nextSections.push({
      key: "teams",
      title: showFavoriteSports ? "Favorite Teams" : "",
      data: chunkItems(favoriteTeamItems, columns),
    });

    return nextSections;
  }, [favoriteTeams, isGridView, showFavoriteSports, showSportsLoader, sports]);

  const renderSport = (sport: FavoriteSportId) => {
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
              isGridView ? styles.logoGridMargin : styles.logoListMargin,
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
  };

  const renderTeam = (team: Team) => {
    const id = team.id;
    const { league } = team;

    const logo = getTeamLogo(team);

    const teamBackgroundColor = team.color ?? Colors.midTone;

    const showLeagueBadge = ["cfb", "cbb", "wcbb", "cb", "sb"].includes(league);

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

          <View style={styles.teamItem}>
            {logo && (
              <Image
                source={logo}
                style={[
                  styles.teamLogo,
                  isGridView ? styles.logoGridMargin : styles.logoListMargin,
                ]}
              />
            )}

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
  };

  const renderRow = ({ item }: { item: FavoriteRow }) => {
    return (
      <View style={[isGridView ? styles.grid : styles.list]}>
        {item.map((favorite) => {
          if (favorite.type === "sport") {
            return renderSport(favorite.sport);
          }

          return renderTeam(favorite.team);
        })}
      </View>
    );
  };

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

      <HeaderWithToggle
        title={"Favorites"}
        isGridView={isGridView}
        onToggleView={onToggleView}
      />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <SectionList
          sections={sections}
          scrollEnabled={false}
          key={isGridView ? "grid" : "list"}
          keyExtractor={(row, index) => {
            const rowKey = row
              .map((item) => {
                if (item.type === "sport") {
                  return `sport:${item.sport}`;
                }

                return `${item.team.league}:${item.team.id}`;
              })
              .join("|");

            return `${rowKey}:${index}`;
          }}
          renderItem={renderRow}
          renderSectionHeader={({ section }) => {
            if (!section.title) {
              return null;
            }

            return (
              <Text
                style={[
                  styles.sectionTitle,
                  section.key === "teams" &&
                    showFavoriteSports &&
                    styles.nextSectionTitle,
                ]}
              >
                {section.title}
              </Text>
            );
          }}
          renderSectionFooter={({ section }) => {
            if (section.key !== "sports") {
              return null;
            }

            return null;
          }}
          ListFooterComponent={
            isCurrentUser ? (
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
            ) : null
          }
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </>
  );
}
