import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import MLBGamesList from "components/Sports/MLB/Games/MLBGamesList";
import Roster from "components/Sports/MLB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useMLBTeamGames } from "hooks/MLBHooks/useMLBTeamGames";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getMLBSeason, scrollToMonth } from "utils/dateUtils";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const league = "MLB";
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number(teamId);
  const team = getMLBTeam(teamIdNum);
  const teamLogo = getMLBTeamLogo(teamIdNum, true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(getMLBSeason().toString());
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);

  const pagerRef = useRef<PagerView>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(10, league);

  const {
    games: selectedMonthGames,
    gamesByMonth,
    selectedMonth,
    loading: gamesLoading,
    refreshGames: refreshTeamGames,
  } = useMLBTeamGames(teamIdNum ? teamIdNum.toString() : "", {
    season: "2024",
    selectedDate,
  });

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
        {/* Schedule */}
        <View key="schedule" style={styles.contentArea}>
          <MonthSelector
            months={monthsToShow}
            selectedDate={selectedDate}
            onSelect={(month, year, index) =>
              handleSelectMonth(month, year, index)
            }
            loading={gamesLoading}
            gameCountByMonth={gameCountByMonth}
          />

          <MLBGamesList
            games={selectedMonthGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </View>

        {/* News */}
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

        {/* Roster */}
        <View key="roster" style={styles.contentArea}>
          <Roster
            teamId={Number(team.id)}
            teamFullName={team.fullName}
            teamColor={team.color}
            isDark={isDark}
          />
        </View>

        {/* Stats */}
        <ScrollView key="stats" style={{ flex: 1 }} />

        {/* Standings */}
        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="MLB"
          />
        </View>

        {/* Forum */}
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
