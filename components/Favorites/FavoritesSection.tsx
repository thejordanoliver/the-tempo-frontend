// components/Favorites/FavoritesSection.tsx

import Button from "@/components/Buttons/Button";
import { LEAGUE_CONFIG, type FavoriteSportId } from "@/constants/leagues";
import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { FavoritesSectionStyles } from "@/styles/FavoritesSectionStyles";
import { isFavoriteLeague } from "@/types/favorites";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import PreviewModal, {
  type PreviewItem,
} from "components/Favorites/PreviewModal";
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
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutAnimation,
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import type { Team } from "types/types";
import { getFavoriteTeamRoute } from "utils/favoriteTeams";
import HeadingTwo from "../Headings/HeadingTwo";
import Subheading from "../Headings/Subheading";

type Props = {
  favoriteTeams: Team[];
  favoriteSports?: FavoriteSportId[];
  favoriteSportsLoading?: boolean;
  favoriteSportsReady?: boolean;
  itemWidth: number;
  isCurrentUser: boolean;
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
  itemWidth,
  isCurrentUser,
  fadeAnim,
}: Props) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = FavoritesSectionStyles(isDark, itemWidth);

  const {
    previewTeam,
    setModalVisible,
    handleLongPress,
    handleGoToTeam,
    handleRemoveFavorite,
    toggleFavoriteSport,
  } = useFavoriteTeamsContext();
  const [previewSport, setPreviewSport] = useState<FavoriteSportId | null>(
    null,
  );
  const previewSheetRef = useRef<BottomSheetModal>(null);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<FavoriteSection["key"], boolean>
  >({
    sports: false,
    teams: false,
  });

  const showFavoriteSports = favoriteSports !== undefined;

  const sports = useMemo(() => favoriteSports ?? [], [favoriteSports]);

  const showSportsLoader = favoriteSportsLoading && !favoriteSportsReady;
  const sections = useMemo<FavoriteSection[]>(() => {
    const columns = 3;

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
  }, [favoriteTeams, showFavoriteSports, showSportsLoader, sports]);

  const visibleSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        data: collapsedSections[section.key] ? [] : section.data,
      })),
    [collapsedSections, sections],
  );

  const toggleSection = useCallback((sectionKey: FavoriteSection["key"]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }, []);

  const renderSport = (sport: FavoriteSportId) => {
    const config = LEAGUE_CONFIG[sport];

    return (
      <Pressable
        key={`sport:${sport}`}
        accessibilityRole="button"
        accessibilityLabel={`Open ${config.label}`}
        delayLongPress={300}
        onLongPress={() => {
          setPreviewSport(sport);
          setModalVisible(true);
          requestAnimationFrame(() => previewSheetRef.current?.present());
        }}
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
          styles.gridItem,
          {
            backgroundColor: config.color,
          },
        ]}
      >
        <View style={styles.teamItem}>
          <Image
            source={config.logoLight}
            style={[styles.teamLogo, styles.logoGridMargin]}
          />

          <View style={styles.gridNameContainer}>
            <Text style={[styles.teamName, styles.gridNameText]}>
              {config.label}
            </Text>
          </View>
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
      <Pressable
        key={`${league}:${id}`}
        delayLongPress={300}
        onLongPress={() => {
          setPreviewSport(null);
          handleLongPress(team);
          requestAnimationFrame(() => previewSheetRef.current?.present());
        }}
        style={({ pressed }) => [
          pressed && styles.pressed,
          styles.gridItem,
          {
            backgroundColor: teamBackgroundColor,
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
              style={[styles.teamLogo, styles.logoGridMargin]}
            />
          )}

          <View style={styles.gridNameContainer}>
            <Text style={[styles.teamName, styles.gridNameText]}>
              {teamName}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderRow = ({ item }: { item: FavoriteRow }) => {
    return (
      <View style={styles.grid}>
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
      <PreviewModal
        sheetRef={previewSheetRef}
        item={
          previewSport
            ? ({ type: "sport", sport: previewSport } satisfies PreviewItem)
            : previewTeam
              ? ({ type: "team", team: previewTeam } satisfies PreviewItem)
              : null
        }
        onClose={() => {
          setModalVisible(false);
          setPreviewSport(null);
        }}
        onGo={() => {
          if (previewSport) {
            const config = LEAGUE_CONFIG[previewSport];
            previewSheetRef.current?.dismiss();
            router.push({
              pathname: config.route,
              params: {
                league: previewSport,
                leagueLabel: config.label,
              },
            });
            setModalVisible(false);
            setPreviewSport(null);
            return;
          }

          if (previewTeam) {
            previewSheetRef.current?.dismiss();
            handleGoToTeam();
          }
        }}
        onRemove={() => {
          if (previewSport) {
            previewSheetRef.current?.dismiss();
            void toggleFavoriteSport(previewSport);
            setModalVisible(false);
            setPreviewSport(null);
            return;
          }

          if (previewTeam) {
            previewSheetRef.current?.dismiss();
            void handleRemoveFavorite(previewTeam);
          }
        }}
        currentUser={isCurrentUser}
      />

      <HeadingTwo isDark={isDark}>Favorites</HeadingTwo>

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <SectionList
          sections={visibleSections}
          scrollEnabled={false}
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

            const isCollapsed = collapsedSections[section.key];

            return (
              <Subheading
                collapsible
                collapsed={isCollapsed}
                onToggle={() => toggleSection(section.key)}
              >
                {section.title}
              </Subheading>
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
