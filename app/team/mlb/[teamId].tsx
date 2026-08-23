import { CustomHeader } from "@/components/CustomHeader";
import ForumFeed from "@/components/Forum/ForumFeed";
import GamesList from "@/components/Sports/Baseball/Games/GamesList";
import RosterStats from "@/components/Sports/Baseball/Team/RosterStats";
import TeamInfoModal from "@/components/Sports/Basketball/Team/TeamInfoModal";
import { Colors } from "@/constants/styles";
import { useRosterStats } from "@/hooks/BaseballHooks/useRosterStats";
import { useTeamStats } from "@/hooks/BaseballHooks/useTeamStats";
import { useTeamMonthSelector } from "@/hooks/LeagueHooks/useMonthSelector";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import useTeamDetails from "@/hooks/useTeams";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import Roster from "components/Sports/Baseball/Team/Roster";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
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
import { getMLBSeason } from "utils/dateUtils";
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

  return monthGroup.month - 1;
}

export default function TeamDetailScreen() {
  const league = "MLB";
  const navigation = useNavigation();
  const currentSeason = getMLBSeason();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getMLBTeam(teamIdNum);
  const espnId = team?.espnId ?? 0;
  const teamLogo = getMLBTeamLogo(teamIdNum, true);
  const teamColor = team?.color ?? Colors.midTone;
  const teamSecondaryColor = team?.secondaryColor ?? Colors.midTone;
  const teamName = team?.name;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(currentSeason.toString());
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const favorited = team ? isFavorite(league, team.id) : false;

  const { teamDetails } = useTeamDetails(league, teamIdNum);

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

  const {
    games,
    months,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
    season: scheduleSeason,
  } = useBaseballTeamGames("mlb", teamIdNum, currentSeason);

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
          teamId={teamIdNum}
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
  }, [
    favorited,
    navigation,
    team,
    teamIdNum,
    teamLogo,
    teamColor,
    toggleFavorite,
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
            showHeaders={true}
            showCountdown={isSeasonOpeningMonth}
            countdownGame={firstSeasonGame}
            scrollEnabled={true}
            teamLogo={teamLogo}
            teamColor={teamColor}
            teamSecondaryColor={teamSecondaryColor}
            teamName={teamName}
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

        {/* STATS */}
        <View key="stats" style={styles.contentArea}>
          <RosterStats
            rosterStats={teamRoster}
            teamId={teamIdNum}
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
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="MLB"
          />
        </View>

        {/* FORUM */}
        <View key="forum" style={styles.contentArea}>
          <ForumFeed teamId={teamIdStr ?? ""} league={league} />
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
