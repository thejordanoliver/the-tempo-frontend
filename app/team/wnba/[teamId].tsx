import BasketballGamesList from "@/components/Sports/Basketball/Games/GamesList";
import RosterStats from "@/components/Sports/Basketball/Team/RosterStats";
import {
  BasketballScheduleMonth,
  useBasketballTeamGames,
} from "@/hooks/BasketballHooks/useBasketballTeamGames";
import { useRosterStats } from "@/hooks/BasketballHooks/useRosterStats";
import { useTeamStats } from "@/hooks/BasketballHooks/useTeamStats";
import useRoster from "@/hooks/LeagueHooks/useRoster";
import { useNavigation } from "@react-navigation/native";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/League/MonthSelector";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import Roster from "components/Sports/NBA/Team/Roster";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useTeamTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getWNBASeason, scrollToMonth } from "utils/dateUtils";
import { teamDetailStyles } from "../../../styles/TeamStyles/TeamDetailsStyles";

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
  const league = "WNBA";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamDetailStyles;
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = Number(teamId) ?? 0;
  const team = getWNBATeam(Number(teamIdNum));
  const teamLogo = getWNBATeamLogo(teamIdNum, true);
  const teamColor = team?.color;
  const espnId = team?.espnId ?? 0;
  const { toggleFavorite, isFavorite } = useFavoriteTeamsContext();
  const favorited = team ? isFavorite(league, team.id) : false;
  const [standingsYear, setStandingsYear] = useState(
    getWNBASeason().toString(),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tabs, selectedTab, setSelectedTab } = useTeamTabs(league);
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
    const nextTab = indexToTab(index);

    if (nextTab) {
      setSelectedTab(nextTab);
    }
  };

  const {
    rosterStats,
    loading: statsLoading,
    error: statsError,
    refreshingStats,
    onRefresh: refreshRosterStats,
  } = useRosterStats(league, teamIdNum);

  const {
    teamStats,
    loading: teamStatsLoading,
    error: teamStatsError,
  } = useTeamStats({ teamId: espnId, league: league });

  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = useRoster(teamIdNum, league);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refreshing: refreshingNews,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  const {
    games,
    months,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    error: gamesError,
    refresh: refreshTeamGames,
  } = useBasketballTeamGames("wnba", teamIdNum);

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

      if (selectedTab === "roster") {
        rosterRef.current?.refresh();
      }

      if (selectedTab === "stats") {
        await refreshRosterStats();
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
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [
    navigation,
    team,
    teamIdNum,
    teamLogo,
    teamColor,
    favorited,
    toggleFavorite,
  ]);

  if (!team) {
    return (
      <View style={styles.loadContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

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
            onSelect={(month, year, index) =>
              handleSelectMonth(month, year, index)
            }
            loading={gamesLoading}
            gameCountByMonth={gameCountByMonth}
          />

          <BasketballGamesList
            games={selectedMonthGames as any}
            error={gamesError}
            loading={gamesLoading}
            refreshing={gamesRefreshing || refreshing}
            onRefresh={handleRefresh}
            scrollEnabled={true}
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
            teamStats={teamStats}
            rosterStats={rosterStats}
            teamId={espnId}
            league={league}
            loading={statsLoading || teamStatsLoading}
            error={statsError || teamStatsError}
            refreshing={refreshingStats}
            onRefresh={refreshRosterStats}
          />
        </View>

        {/* STANDINGS */}
        <View key="standings" style={styles.contentArea}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league={league}
          />
        </View>

        {/* FORUM */}
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
