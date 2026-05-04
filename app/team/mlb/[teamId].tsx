import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import NewsList from "components/News/NewsList";
import MLBGamesList from "components/Sports/MLB/Games/MLBGamesList";
import Roster from "components/Sports/MLB/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getMLBTeam } from "constants/teamsMLB";
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
import {
  getGameCountByMonth,
  getMLBSeason,
  getMonthsToShow,
  scrollToMonth,
} from "utils/dateUtils";
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
  const team = getMLBTeam(teamIdNum ?? 0);

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
  } = useLeaguesNews(10, league);

  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    refreshGames: refreshTeamGames,
  } = useMLBTeamGames(teamIdNum ? teamIdNum.toString() : "");

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

  const gameCountByMonth = useMemo(
    () => getGameCountByMonth(rawTeamGames, (game) => game.date ?? null),
    [rawTeamGames],
  );

  const monthsToShow = useMemo(
    () => getMonthsToShow(rawTeamGames, (game) => game.date ?? null),
    [rawTeamGames],
  );

  useEffect(() => {
    if (!selectedDate && monthsToShow.length > 0) {
      const firstMonth = monthsToShow[0];
      setSelectedDate(new Date(firstMonth.year, firstMonth.month, 1));
    }
  }, [monthsToShow, selectedDate]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };

  const filteredGames = useMemo(() => {
    if (!selectedDate) return rawTeamGames;

    return rawTeamGames.filter((game) => {
      const dateStr = game?.date;
      if (!dateStr) return false;

      const gameDate = new Date(dateStr);

      return (
        gameDate.getFullYear() === selectedDate.getFullYear() &&
        gameDate.getMonth() === selectedDate.getMonth()
      );
    });
  }, [rawTeamGames, selectedDate]);

  const favorited = team ? isFavorite(league, team.id) : false;

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames();
      }

      // useLeaguesNews currently does not expose a refresh function.
      // Add one inside useLeaguesNews if you want pull-to-refresh for news.
    } finally {
      setRefreshing(false);
    }
  };

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
        initialPage={0}
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
            games={filteredGames}
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