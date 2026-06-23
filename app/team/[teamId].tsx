import DepthChart from "@/components/Sports/Football/Team/DepthChart";
import GamesList from "@/components/Sports/NBA/Games/GamesList";
import {
  BasketballScheduleMonth,
  useBasketballTeamGames,
} from "@/hooks/BasketballHooks/useBasketballTeamGames";
import { useTeamStats } from "@/hooks/BasketballHooks/useTeamStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
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
import { useRosterStats } from "hooks/NBAHooks/useRosterStats";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { getNBASeason, scrollToMonth } from "utils/dateUtils";

type MonthSelectorItem = {
  key: string;
  year: number;
  month: number;
  label: string;
  count: number;
};

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
  const league = "NBA";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();

  const { teamId } = useLocalSearchParams();
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();

  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = Number.parseInt(teamIdStr ?? "", 10);

  const team = getNBATeam(teamIdNum);
  const teamColor = team?.color;
  const espnId = team?.espnId ?? 0;
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
    refreshing: refreshingNews,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  const {
    teamRoster,
    refreshingStats,
    loading: rosterStatsLoading,
    error: rosterStatsError,
    refetch,
  } = useRosterStats(teamIdNum);

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

  const favorited = team ? isFavorite(league, team.id) : false;

  const {
    games,
    months,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
  } = useBasketballTeamGames("nba", teamIdNum);

  const monthsToShow = useMemo<MonthSelectorItem[]>(() => {
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
        };
      })
      .filter((monthGroup): monthGroup is MonthSelectorItem =>
        Boolean(monthGroup),
      );
  }, [months]);

  const gameCountByMonth = useMemo(() => {
    const counts = new Map<string, number>();

    monthsToShow.forEach((monthGroup) => {
      counts.set(monthGroup.key, monthGroup.count);
    });

    return counts;
  }, [monthsToShow]);

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

  useEffect(() => {
    if (selectedDate || monthsToShow.length === 0) return;

    const today = new Date();

    const currentMonth = monthsToShow.find(
      (monthGroup) =>
        monthGroup.month === today.getMonth() &&
        monthGroup.year === today.getFullYear(),
    );

    const upcomingMonth = monthsToShow.find((monthGroup) => {
      if (monthGroup.year > today.getFullYear()) return true;

      return (
        monthGroup.year === today.getFullYear() &&
        monthGroup.month >= today.getMonth()
      );
    });

    const start = currentMonth ?? upcomingMonth ?? monthsToShow[0];

    setSelectedDate(new Date(start.year, start.month, 1));
  }, [monthsToShow, selectedDate]);

  const handleSelectMonth = (month: number, year: number, index: number) => {
    setSelectedDate(new Date(year, month, 1));
    scrollToMonth(scrollViewRef, monthsToShow, month, year, index);
  };
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
          onToggleFavorite={() => team && toggleFavorite(league, teamIdNum)}
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
            onSelect={(month, year, index) =>
              handleSelectMonth(month, year, index)
            }
            loading={gamesLoading}
            gameCountByMonth={gameCountByMonth}
          />

          <GamesList
            games={selectedMonthGames as any}
            error={gamesError}
            loading={gamesLoading}
            refreshing={gamesRefreshing || refreshing}
            onRefresh={handleRefresh}
            scrollEnabled={true}
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

           {/* DEPTH */}
                <View key="depth" style={styles.contentArea}>
                  <DepthChart teamId={espnId} season={2026} isDark={isDark} league={"nba"} />
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
          />
        </View>

        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        </View>

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
