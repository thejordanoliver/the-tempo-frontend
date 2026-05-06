import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import NewsList from "components/News/NewsList";
import GamesList from "components/Sports/NBA/Games/GamesList";
import Roster from "components/Sports/NBA/Team/Roster";
import RosterStats from "components/Sports/NBA/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import usePlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useTeamGames } from "hooks/NBAHooks/useTeamGames";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useTeamRosterStats } from "hooks/useTeamRosterStats";
import { useTeamStats } from "hooks/useTeamStats";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getNBASeason, scrollToMonth } from "utils/dateUtils";

export default function TeamDetailScreen() {
  const league = "NBA";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = parseInt(teamIdStr, 10);
  const team = getNBATeam(teamIdNum);
  const teamLogo = getTeamLogo(teamIdNum, true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(getNBASeason().toString());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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
  } = useLeaguesNews(10, league);

  const {
    games: selectedMonthGames,
    gamesByMonth,
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useTeamGames(teamIdNum.toString(), getNBASeason(), selectedDate);

  const {
    teamRoster,
    refreshingStats,
    loading: rosterStatsLoading,
    error: rosterStatsError,
    refetch,
  } = useTeamRosterStats(teamIdNum);

  const {
    teamStats,
    loading: teamStatsLoading,
    error: teamStatsError,
  } = useTeamStats(teamIdNum);

  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = usePlayersByTeam(teamIdNum.toString());

  const gameCountByMonth = useMemo(() => {
    return new Map(gamesByMonth.map((group) => [group.key, group.count]));
  }, [gamesByMonth]);

  const monthsToShow = useMemo(() => {
    return gamesByMonth.map((group) => ({
      key: group.key,
      year: group.year,
      month: group.month,
      label: group.label,
      count: group.count,
    }));
  }, [gamesByMonth]);

  useEffect(() => {
    if (
      !gamesLoading &&
      gamesByMonth.length > 0 &&
      !selectedDate &&
      monthsToShow.length > 0
    ) {
      const today = new Date();

      const currentMonthWithGames = monthsToShow.find(
        ({ month, year }) =>
          month === today.getMonth() && year === today.getFullYear(),
      );

      const startingMonth = currentMonthWithGames ?? monthsToShow[0];

      setSelectedDate(new Date(startingMonth.year, startingMonth.month, 1));

      setTimeout(() => {
        if (!scrollViewRef.current) return;

        const index = monthsToShow.findIndex(
          (m) =>
            m.month === startingMonth.month && m.year === startingMonth.year,
        );

        const itemWidth = 70;
        const spacing = 12;
        const screenWidth = Dimensions.get("window").width;
        const scrollToX =
          index * itemWidth + index * spacing - screenWidth / 2 + itemWidth / 2;

        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollToX),
          animated: true,
        });
      }, 150);
    }
  }, [gamesLoading, gamesByMonth, selectedDate, monthsToShow]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };

  const favorited = team ? isFavorite(league, team.id) : false;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={team?.id}
          logo={teamLogo}
          teamColor={team?.color}
          onBack={goBack}
          isTeamScreen={true}
          isFavorite={favorited}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, team, favorited, toggleFavorite]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      if (selectedTab === "news") {
        await refetch();
      }
    } finally {
      setRefreshing(false);
    }
  };

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
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
      >
        {/* Schedule Page */}
        <View key="schedule" style={styles.contentArea}>
          <View style={styles.monthSelector}>
            <MonthSelector
              months={monthsToShow}
              selectedDate={selectedDate}
              onSelect={(month, year, index) =>
                handleSelectMonth(month, year, index)
              }
              loading={gamesLoading}
              gameCountByMonth={gameCountByMonth}
            />
          </View>

          <GamesList
            games={selectedMonthGames}
            loading={gamesLoading}
            error={gamesError}
            refreshing={refreshing}
            onRefresh={refreshTeamGames}
            expectedCount={selectedMonthGames.length}
          />
        </View>

        {/* News Page */}
        <View key="news" style={styles.contentArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <NewsList
              items={articles}
              isDark={isDark}
              loading={newsLoading}
              error={newsError}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </ScrollView>
        </View>

        {/* Roster Page */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            players={players}
            loading={playersLoading}
            error={playersError}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team.fullName}
            teamColor={team.color}
          />
        </View>

        {/* Stats Page */}
        <View key="stats" style={styles.contentArea}>
          <RosterStats
            rosterStats={teamRoster}
            teamId={teamIdStr}
            teamStats={teamStats}
            loading={rosterStatsLoading || teamStatsLoading}
            error={rosterStatsError || teamStatsError}
            refreshing={refreshingStats}
            onRefresh={refetch}
          />
        </View>

        {/* Standings Page */}
        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        </View>

        {/* Forum Page */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamIdStr} league={league} />
        </View>
      </PagerView>

      <TeamInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        teamId={team.id}
        league={league}
        isDark={isDark}
      />
    </View>
  );
}
