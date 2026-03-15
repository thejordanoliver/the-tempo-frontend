import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import { StandingsList } from "components/League/Standings/StandingsList";
import MonthSelector from "components/MonthSelector";
import GamesList from "components/Sports/NBA/Games/GamesList";
import Roster from "components/Sports/NBA/Team/Roster";
import RosterStats from "components/Sports/NBA/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getTeamById, teams } from "constants/teams";
import { useNotifications } from "contexts/NotificationContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import usePlayersByTeam from "hooks/NBAHooks/usePlayersByTeam";
import { useTeamGames } from "hooks/NBAHooks/useTeamGames";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useTeamRosterStats } from "hooks/useTeamRosterStats";
import { useTeamStats } from "hooks/useTeamStats";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  View,
  useColorScheme,
} from "react-native";
import PagerView from "react-native-pager-view";
import { teamDetailStyles } from "styles/TeamStyles/TeamDetailsStyles";
import { PlayerInfo, User } from "types/types";
import {
  getGameCountByMonth,
  getMonthsToShow,
  getNBASeason,
  scrollToMonth,
} from "utils/dateUtils";

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [scheduleRefreshing, setScheduleRefreshing] = useState(false);
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = parseInt(teamIdStr);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false); 
  const [standingsYear, setStandingsYear] = useState(getNBASeason().toString());
  const isDark = useColorScheme() === "dark";
  const styles = teamDetailStyles;
  const tabs = [
    "schedule",
    "news",
    "roster",
    "stats",
    "standings",
    "forum",
  ] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("schedule");
  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const tabMeasurements = useRef<{ x: number; width: number }[]>([]);
  const pagerRef = useRef<PagerView>(null);
  const team = getTeamById(teamIdNum)

  // map tabs to page index
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const handleRefresh = async () => {
    if (selectedTab !== "schedule") return;

    setRefreshing(true);
    setScheduleRefreshing(true);

    try {
      await new Promise((r) => setTimeout(r, 300));
    } finally {
      setScheduleRefreshing(false);
      setRefreshing(false);
    }
  };

  const {
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
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
    rosterStats,
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

  const playersForRosterStats: PlayerInfo[] = players.map((p) => {
    return {
      player_id: p.player_id,
      first_name: p.first_name,
      last_name: p.last_name,
      full_name: p.full_name,
      short_name: p.short_name,
      position: p.position,
      jersey_number: p.jersey_number,
      headshot_url: p.avatarUrl ?? undefined,
    };
  });

  const { toggleNotifications, isNotified } = useNotifications();
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "NBA";
  const favorited = team ? isFavorite(league, team.id) : false;
  const teamKey = String(team?.id);
  const notfied = team ? isNotified(league, teamKey) : false;

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
          isNotified={notfied}
          onToggleNotifications={() => toggleNotifications(league, teamKey)}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, team, favorited, notfied]); // ✅ ADD THIS

  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));

    const index = tabs.indexOf(tab);
    if (tabMeasurements.current[index]) {
      Animated.parallel([
        Animated.timing(underlineX, {
          toValue: tabMeasurements.current[index].x,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(underlineWidth, {
          toValue: tabMeasurements.current[index].width,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

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
      />
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={tabToIndex(selectedTab)}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          setSelectedTab(indexToTab(index));
        }}
      >
        {/* Schedule Page */}
        <View key="schedule" style={{ flex: 1 }}>
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
            refreshing={scheduleRefreshing}
            onRefresh={handleRefresh}
            expectedCount={filteredGames.length}
          />
        </View>

        {/* News Page */}
        <ScrollView key="news" style={{ flex: 1 }}></ScrollView>

        {/* Roster Page */}
        <View key="roster" style={{ flex: 1 }}>
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
        <View key="stats" style={{ flex: 1 }}>
          <RosterStats
            rosterStats={rosterStats}
            players={playersForRosterStats}
            teamId={teamId as string}
            teamStats={teamStats}
            loading={rosterStatsLoading || teamStatsLoading}
            error={rosterStatsError || teamStatsError}
            refreshing={refreshingStats}
            onRefresh={refetch}
          />
        </View>

        {/* Standings Page */}
        <View key="standings" style={{ flex: 1 }}>
          <StandingsList
            year={standingsYear}
            onYearChange={setStandingsYear}
            league="NBA"
          />
        </View>

        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="NBA" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="NBA"
        />
      )}
    </View>
  );
}
