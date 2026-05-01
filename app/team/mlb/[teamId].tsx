import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import MLBGamesList from "components/Sports/MLB/Games/MLBGamesList";
import Roster from "components/Sports/MLB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { mlbTeams } from "constants/teamsMLB";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useMLBTeamGames } from "hooks/MLBHooks/useMLBTeamGames";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import {
  getGameCountByMonth,
  getMLBSeason,
  getMonthsToShow,
  scrollToMonth,
} from "utils/dateUtils";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const league = "MLB";
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(getMLBSeason().toString());
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
  const pagerRef = useRef<PagerView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handlePageChange = (index: number) => {
    setSelectedTab(indexToTab(index));
  };

  const team = useMemo(
    () => (teamIdNum ? mlbTeams.find((t) => Number(t.id) === teamIdNum) : null),
    [teamIdNum],
  );

  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);
  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    refreshGames: refreshTeamGames,
  } = useMLBTeamGames(teamIdNum ? teamIdNum.toString() : "");

  const gameCountByMonth = useMemo(
    () => getGameCountByMonth(rawTeamGames, (g) => g.date ?? null),
    [rawTeamGames],
  );

  const monthsToShow = useMemo(
    () => getMonthsToShow(rawTeamGames, (g) => g.date ?? null),
    [rawTeamGames],
  );

  // -------------------------------
  // SELECTED MONTH
  // -------------------------------
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Auto-select first month
  useEffect(() => {
    if (!selectedDate && monthsToShow.length > 0) {
      const m = monthsToShow[0];
      setSelectedDate(new Date(m.year, m.month, 1));
    }
  }, [monthsToShow]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };
  // -------------------------------
  // FILTER GAMES FOR MONTH
  // -------------------------------
  const filteredGames = useMemo(() => {
    if (!selectedDate) return rawTeamGames;

    return rawTeamGames.filter((game) => {
      const dateStr = game?.date;
      if (!dateStr) return false;

      const d = new Date(dateStr);

      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth()
      );
    });
  }, [rawTeamGames, selectedDate]);

  const favorited = team ? isFavorite(league, team.id) : false;

  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={team?.id}
          logo={team?.logoLight || team?.logo}
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
  }, [navigation, isDark, team, favorited]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  // -------------------------------
  // UI
  // -------------------------------
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
        initialPage={0}
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
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
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={refreshTeamGames}
          />
        </View>

        {/* News */}
        <ScrollView key="news" style={styles.contentArea}></ScrollView>

        {/* Roster Page */}
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

        {/* Standings Page */}
        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="MLB"
          />
        </View>

        {/* Forum */}
        <View key="forum" style={styles.contentArea}>
          <TeamForum teamId={teamId as string} league={league} />
        </View>
      </PagerView>

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
