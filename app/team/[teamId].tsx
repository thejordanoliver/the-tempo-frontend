import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { getNBATeam } from "constants/teams";
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
import { User } from "types/user";
import {
  getGameCountByMonth,
  getMonthsToShow,
  getNBASeason,
  scrollToMonth,
} from "utils/dateUtils";

export default function TeamDetailScreen() {
  const league = "NBA";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = parseInt(teamIdStr);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(getNBASeason().toString());
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const team = getNBATeam(teamIdNum);
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handlePageChange = (index: number) => {
    setSelectedTab(indexToTab(index));
  };
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);
  const {
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useTeamGames(teamIdNum.toString());

  useEffect(() => {
    const loadUser = async () => {
      try {
        const jsonUser = await AsyncStorage.getItem("loggedInUser");
        if (jsonUser) {
          const userData = JSON.parse(jsonUser);
          setLoggedInUser(userData);
        }
      } catch (e) {
        console.error("Failed to load user:", e);
      }
    };
    loadUser();
  }, []);

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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const gameCountByMonth = useMemo(
    () => getGameCountByMonth(teamGames, (g) => g.date),
    [teamGames],
  );

  const monthsToShow = useMemo(
    () => getMonthsToShow(teamGames, (g) => g.date),
    [teamGames],
  );

  useEffect(() => {
    if (
      !gamesLoading &&
      teamGames.length > 0 &&
      !selectedDate &&
      monthsToShow.length > 0
    ) {
      const today = new Date();

      // Try to find a month that matches the current month/year
      const currentMonthWithGames = monthsToShow.find(
        ({ month, year }) =>
          month === today.getMonth() && year === today.getFullYear(),
      );

      const startingMonth = currentMonthWithGames ?? monthsToShow[0];

      setSelectedDate(new Date(startingMonth.year, startingMonth.month, 1));

      // Scroll to that month
      setTimeout(() => {
        if (scrollViewRef.current) {
          const index = monthsToShow.findIndex(
            (m) =>
              m.month === startingMonth.month && m.year === startingMonth.year,
          );
          const itemWidth = 70;
          const spacing = 12;
          const screenWidth = Dimensions.get("window").width;
          const scrollToX =
            index * itemWidth +
            index * spacing -
            screenWidth / 2 +
            itemWidth / 2;

          scrollViewRef.current.scrollTo({
            x: Math.max(0, scrollToX),
            animated: true,
          });
        }
      }, 150);
    }
  }, [gamesLoading, teamGames, selectedDate, monthsToShow]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };

  const {
    players,
    loading: playersLoading,
    error: playersError,
    refreshPlayers,
  } = usePlayersByTeam(teamIdNum.toString());

  const filteredGames = useMemo(() => {
    if (!selectedDate) return [];
    return teamGames.filter((game: any) => {
      const gameDate = new Date(game.date);
      return (
        gameDate.getFullYear() === selectedDate.getFullYear() &&
        gameDate.getMonth() === selectedDate.getMonth()
      );
    });
  }, [selectedDate, teamGames]);

  const favorited = team ? isFavorite(league, team.id) : false;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={team?.id}
          logo={team?.logo}
          logoLight={team?.logoLight}
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
  }, [navigation, team, favorited]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  function handleRefresh(): void {
    throw new Error("Function not implemented.");
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
            games={filteredGames}
            loading={gamesLoading}
            error={gamesError}
            refreshing={refreshing}
            onRefresh={refreshTeamGames}
            expectedCount={filteredGames.length}
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
              refreshing
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
            teamId={teamId as string}
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
          <TeamForum teamId={teamId as string} league={league} />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league={league}
          isDark={isDark}
        />
      )}
    </View>
  );
}
