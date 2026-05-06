import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import NewsList from "components/News/NewsList";
import Roster from "components/Sports/CBB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import WNBAGamesList from "components/Sports/WNBA/Games/WNBAGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useWNBATeamGames } from "hooks/WNBAHooks/useWNBATeamGames";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getWNBASeason, scrollToMonth } from "utils/dateUtils";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "WNBA";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId) ?? 0;
  const team = getWNBATeam(Number(teamIdNum));
  const teamLogo = getWNBATeamLogo(teamIdNum, true);
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const [standingsYear, setStandingsYear] = useState(
    getWNBASeason().toString(),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
    const nextTab = indexToTab(index);

    if (nextTab) {
      setSelectedTab(nextTab);
    }
  };

  const {
    players,
    loading,
    error,
    refreshing: refreshingRoster,
    onRefresh,
  } = usePlayersByTeam(team?.id ?? "", false, true);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);

  const {
    games,
    gamesByMonth,
    loading: gamesLoading,
    error: gamesError,
    refreshGames,
  } = useWNBATeamGames(teamIdNum ? teamIdNum.toString() : "", {
    selectedDate,
  });

  const monthsToShow = useMemo(
    () =>
      gamesByMonth.map((group) => ({
        key: group.key,
        month: group.month,
        year: group.year,
        label: group.label,
        count: group.count,
      })),
    [gamesByMonth],
  );

  const gameCountByMonth = useMemo(() => {
    return new Map<string, number>(
      gamesByMonth.map((group) => [group.key, group.count]),
    );
  }, [gamesByMonth]);

  useEffect(() => {
    if (selectedDate || gamesByMonth.length === 0) return;

    const today = new Date();

    const currentMonth = gamesByMonth.find(
      (group) =>
        group.month === today.getMonth() && group.year === today.getFullYear(),
    );

    const start = currentMonth ?? gamesByMonth[0];

    setSelectedDate(new Date(start.year, start.month, 1));
  }, [gamesByMonth, selectedDate]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshGames();
      }

      if (selectedTab === "roster") {
        await onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
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

          <WNBAGamesList
            games={games}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            error={gamesError}
            showHeaders={false}
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
            loading={loading}
            error={error}
            refreshing={refreshingRoster}
            onRefresh={onRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            teamId={team.id}
            isWNBA
          />
        </View>

        {/* Stats Page */}
        <View key="stats" style={styles.contentArea} />

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
