import { CustomHeader } from "@/components/CustomHeader";
import GamesList from "@/components/Sports/Baseball/Games/GamesList";
import { CBStandingsList } from "@/components/Sports/Baseball/Standings/CBStandingsList";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { getCBTeam, getCBTeamLogo } from "@/constants/teamsCB";
import { useTeamMonthSelector } from "@/hooks/LeagueHooks/useMonthSelector";
import useTeamDetails from "@/hooks/useTeams";
import { getWNBASeason } from "@/utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/League/MonthSelector";
import NewsList from "components/News/NewsList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import {
  BaseballScheduleMonth,
  useBaseballTeamGames,
} from "hooks/BaseballHooks/useBaseballTeamGames";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import {
  filterGamesBySeasonYear,
  getFirstSeasonGame,
  isSameCalendarMonth,
} from "utils/seasonGames";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

function getMonthKeyFromDate(date: Date | null) {
  if (!date) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getMonthIndex(monthGroup: BaseballScheduleMonth) {
  if (typeof monthGroup.month !== "number") return null;

  // Backend returns month as 1-12. JS Date + MonthSelector flow use 0-11.
  return monthGroup.month - 1;
}

export default function TeamDetailScreen() {
  const league = "CB";
  const currentSeason = getWNBASeason();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();

  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getCBTeam(teamIdNum);
  const teamLogo = getCBTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);

  const { teamDetails } = useTeamDetails(league, teamIdNum);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  const {
    games,
    months,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
    season: scheduleSeason,
  } = useBaseballTeamGames("cb", teamIdNum ?? null, currentSeason);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };

  const handlePageChange = (index: number) => {
    const nextTab = indexToTab(index);

    if (nextTab) {
      setSelectedTab(nextTab);
    }
  };

  const monthGroups = useMemo(() => {
    return months
      .map((monthGroup) => {
        const monthIndex = getMonthIndex(monthGroup);

        if (
          typeof monthGroup.year !== "number" ||
          typeof monthIndex !== "number"
        ) {
          return null;
        }

        return {
          key: monthGroup.key,
          year: monthGroup.year,
          month: monthIndex,
          label: monthGroup.label,
          count: monthGroup.games.length,
          games: monthGroup.games,
        };
      })
      .filter((monthGroup): monthGroup is NonNullable<typeof monthGroup> =>
        Boolean(monthGroup),
      );
  }, [months]);

  const selectedMonthKey = useMemo(
    () => getMonthKeyFromDate(selectedDate),
    [selectedDate],
  );

  const selectedMonthGames = useMemo(() => {
    if (!selectedMonthKey) {
      return games;
    }

    return (
      months.find((monthGroup) => monthGroup.key === selectedMonthKey)?.games ??
      []
    );
  }, [games, months, selectedMonthKey]);

  const seasonGames = useMemo(
    () => filterGamesBySeasonYear(games, scheduleSeason?.year),
    [games, scheduleSeason?.year],
  );

  const firstSeasonGame = useMemo(
    () => getFirstSeasonGame(seasonGames),
    [seasonGames],
  );

  const isSeasonOpeningMonth = useMemo(
    () => isSameCalendarMonth(firstSeasonGame?.date, selectedDate),
    [firstSeasonGame?.date, selectedDate],
  );

  const { monthsToShow, gameCountByMonth, handleSelectMonth } =
    useTeamMonthSelector({
      gamesByMonth: monthGroups,
      selectedDate,
      setSelectedDate,
    });

  const favorited = team ? isFavorite(league, team.id) : false;

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "news") {
        await refreshNews();
      }
    } finally {
      setRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          teamId={team?.id}
          logo={teamLogo}
          teamColor={teamColor}
          onBack={goBack}
          isTeamScreen={true}
          isFavorite={favorited}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [favorited, navigation, team, teamLogo, teamColor, toggleFavorite]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={tabToIndex(selectedTab)}
        onPageSelected={(event) => handlePageChange(event.nativeEvent.position)}
      >
        {/* SCHEDULE */}
        <View key="schedule" style={styles.contentArea}>
          <MonthSelector
            months={monthsToShow}
            selectedDate={selectedDate}
            onSelect={handleSelectMonth}
            loading={gamesLoading}
            gameCountByMonth={gameCountByMonth}
          />

          <GamesList
            games={selectedMonthGames}
            error={gamesError}
            loading={gamesLoading}
            refreshing={gamesRefreshing || refreshing}
            onRefresh={handleRefresh}
            scrollEnabled={true}
            showHeaders={true}
            showCountdown={isSeasonOpeningMonth}
            countdownGame={firstSeasonGame}
            isCB={true}
          />
        </View>

        {/* NEWS */}
        <View key="news" style={styles.contentArea}>
          <NewsList
            items={articles}
            loading={newsLoading}
            error={newsError}
            refreshing={refreshingNews}
            onRefresh={refreshNews}
            isDark={isDark}
          />
        </View>

        {/* ROSTER */}
        <View key="roster" style={styles.contentArea}></View>

        {/* STANDINGS */}
        <View key="standings">
          <CBStandingsList league="cb" />
        </View>

        {/* FORUM */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamIdStr ?? ""} league={league} />
        </View>
      </PagerView>

      <TeamInfoModal
        teamDetails={teamDetails}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        teamId={teamIdNum}
        teamLogo={teamLogo}
        league={league}
        isDark={isDark}
      />
    </View>
  );
}
