import GamesList from "@/components/Sports/Basketball/Games/GamesList";
import { CBBConferenceStandingsList } from "@/components/Sports/Basketball/Standings/CBBConferenceStandingsList";
import Roster from "@/components/Sports/NBA/Team/Roster";
import RosterStats from "@/components/Sports/NBA/Team/RosterStats";
import { Colors } from "@/constants/styles";
import { getCBBTeam, getCBBTeamLogo } from "@/constants/teamsCBB";
import {
  BasketballScheduleMonth,
  useBasketballTeamGames,
} from "@/hooks/BasketballHooks/useBasketballTeamGames";
import { useTeamStats } from "@/hooks/BasketballHooks/useTeamStats";
import { useTeamMonthSelector } from "@/hooks/LeagueHooks/useMonthSelector";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { getCBBSeason } from "@/utils/dateUtils";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/League/MonthSelector";
import NewsList from "components/News/NewsList";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useRosterStats } from "hooks/NBAHooks/useRosterStats";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import {
  filterGamesBySeasonYear,
  getFirstSeasonGame,
  isSameCalendarMonth,
} from "utils/seasonGames";

function getMonthKeyFromDate(date: Date | null) {
  if (!date) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getMonthIndex(monthGroup: BasketballScheduleMonth) {
  if (typeof monthGroup.month !== "number") return null;

  return monthGroup.month - 1;
}

export default function TeamDetailScreen() {
  const league = "WCBB";
  const currentSeason = getCBBSeason();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number.parseInt(teamIdStr ?? "", 10);
  const team = getCBBTeam(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const espnId = team?.espnId ?? 0;
  const teamLogo = getCBBTeamLogo(teamIdNum, true, true);
  const wcbbTeamId = team?.wid ?? teamIdNum;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const handlePageChange = (index: number) => {
    setSelectedTab(indexToTab(index));
  };

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  const {
    teamRoster,
    refreshingStats,
    loading: rosterStatsLoading,
    error: rosterStatsError,
    refetch,
  } = useRosterStats(teamIdNum, league);

  const {
    teamStats,
    loading: teamStatsLoading,
    error: teamStatsError,
  } = useTeamStats({
    teamId: espnId,
    league,
  });

  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = useRoster(teamIdNum, league);

  const favorited = team ? isFavorite(league, wcbbTeamId) : false;

  const {
    games,
    months,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
    season: scheduleSeason,
  } = useBasketballTeamGames("wcbb", espnId, currentSeason);

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
          count: monthGroup.games?.length ?? 0,
          games: monthGroup.games ?? [],
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

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "news") {
        await refreshNews();
      }

      if (selectedTab === "stats") {
        await refetch();
      }
    } finally {
      setRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={teamIdNum}
          logo={teamLogo}
          teamColor={teamColor}
          onBack={goBack}
          isTeamScreen
          isFavorite={favorited}
          onToggleFavorite={() => team && toggleFavorite(league, wcbbTeamId)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [
    navigation,
    team,
    teamLogo,
    teamColor,
    favorited,
    toggleFavorite,
    teamIdNum,
    wcbbTeamId,
  ]);

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
        style={styles.contentArea}
        initialPage={tabToIndex(selectedTab)}
        onPageSelected={(event) => handlePageChange(event.nativeEvent.position)}
      >
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
            showCountdown={isSeasonOpeningMonth}
            countdownGame={firstSeasonGame}
            scrollEnabled={true}
            showHeaders={true}
          />
        </View>

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

        <View key="roster" style={styles.contentArea}>
          <Roster
            players={players}
            loading={playersLoading}
            error={playersError}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            league={league}
          />
        </View>

        <View key="stats" style={styles.contentArea}>
          <RosterStats
            rosterStats={teamRoster}
            teamId={teamIdStr}
            teamStats={teamStats}
            loading={rosterStatsLoading || teamStatsLoading}
            error={rosterStatsError || teamStatsError}
            refreshing={refreshingStats}
            onRefresh={refetch}
            league={league}
          />
        </View>

        {/* STANDINGS */}
        <View key="standings" style={styles.contentArea}>
          <CBBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>

        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamIdStr} league={league} />
        </View>
      </PagerView>

      <TeamInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        teamId={teamIdNum}
        league={league}
        isDark={isDark}
      />
    </View>
  );
}
