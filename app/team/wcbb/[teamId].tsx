import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/MonthSelector";
import NewsList from "components/News/NewsList";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import CBBRosterStats from "components/Sports/CBB/Team/CBBRosterStats";
import Roster from "components/Sports/CBB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useRosterStats } from "hooks/CBBHooks/useCBBRosterStats";
import { useCBBTeamGames } from "hooks/CBBHooks/useCBBTeamGames";
import usePlayersByTeam from "hooks/CBBHooks/usePlayersByTeam";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { scrollToMonth } from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const league = "WCBB";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamIdStr);
  const team = getCBBTeam(teamIdNum, true);
  const teamLogo = getCBBTeamLogo(teamIdNum, true, true);
  const espnId = team?.espnID;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const favorited = team ? isFavorite(league, teamIdNum) : false;
  const pagerRef = useRef<PagerView>(null);
  const rosterRef = useRef<{ refresh: () => void }>(null);
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
    rosterStats,
    loading: statsLoading,
    error: statsError,
    refreshingStats,
    onRefresh: refreshRosterStats,
  } = useRosterStats(league, espnId ?? 0);

  const { players } = usePlayersByTeam(team?.espnID?.toString() ?? "", true);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);

  const {
    games: selectedMonthGames,
    gamesByMonth,
    selectedMonth,
    loading: gamesLoading,
    error: gamesError,
    refreshGames,
  } = useCBBTeamGames(teamIdNum ?? "", "423", {
    selectedDate,
  });

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
    if (selectedDate || monthsToShow.length === 0) return;

    if (selectedMonth) {
      setSelectedDate(new Date(selectedMonth.year, selectedMonth.month, 1));
      return;
    }

    const today = new Date();

    const currentMonth = monthsToShow.find(
      (monthGroup) =>
        monthGroup.month === today.getMonth() &&
        monthGroup.year === today.getFullYear(),
    );

    const start = currentMonth ?? monthsToShow[0];

    setSelectedDate(new Date(start.year, start.month, 1));
  }, [monthsToShow, selectedDate, selectedMonth]);

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
        rosterRef.current?.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={team?.wid}
          logo={teamLogo}
          teamColor={team?.color}
          onBack={goBack}
          isTeamScreen={true}
          isFavorite={favorited}
          onToggleFavorite={() =>
            team && toggleFavorite(league, team?.wid ?? 0)
          }
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

          <CBBGamesList
            games={selectedMonthGames}
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
              refreshing
              onRefresh={handleRefresh}
            />
          </ScrollView>
        </View>

        {/* Roster Page */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            players={players}
            loading={false}
            error={null}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            teamId={team.id}
          />
        </View>

        {/* Stats Page */}
        <View key="stats" style={styles.contentArea}>
          {team?.espnID && team?.id && (
            <CBBRosterStats
              rosterStats={rosterStats}
              espnId={team.espnID}
              teamId={Number(team.id)}
              league={league}
              loading={statsLoading}
              error={statsError}
              refreshing={refreshingStats}
              onRefresh={refreshRosterStats}
            />
          )}
        </View>

        {/* Standings Page */}
        <View key="standings" style={styles.contentArea}>
          <CBBConferenceStandingsList
            onlyTeamConference={true}
            teamName={team.fullName}
          />
        </View>

        {/* Forum Page */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamIdStr ?? ""} league={league} />
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
