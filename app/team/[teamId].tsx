import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import MonthSelector from "components/MonthSelector";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import GamesList from "components/Sports/NBA/Games/GamesList";
import { StandingsList } from "components/Sports/NBA/Standings/StandingsList";
import TeamPlayerList from "components/Sports/NBA/Team/Roster";
import RosterStats from "components/Sports/NBA/Team/RosterStats";
import TeamInfoModal from "components/Sports/NBA/Team/TeamInfoModal";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { teams } from "constants/teams";
import { useNotifications } from "contexts/NotificationContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useNewsStore } from "hooks/newsStore";
import usePlayersByTeam from "hooks/usePlayersByTeam";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useTeamGames } from "hooks/useTeamGames";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
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
import { style } from "styles/TeamStyles/TeamDetailsStyles";
import { PlayerInfo, User } from "types/types";
import { getNBASeason } from "utils/dateUtils";

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { teamId } = useLocalSearchParams();
  const teamIdStr = Array.isArray(teamId) ? teamId[0] : teamId;
  const teamIdNum = parseInt(teamIdStr);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // ✅ bottom sheet state
  const [standingsYear, setStandingsYear] = useState(getNBASeason().toString());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = style(isDark);
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

  // map tabs to page index
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const team = useMemo(
    () => teams.find((t) => t.id === teamIdNum),
    [teamIdNum]
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      switch (selectedTab) {
        case "schedule":
          // optional: re-fetch games later if you want
          await new Promise((resolve) => setTimeout(resolve, 300));
          break;

        case "news":
          await refreshNews();
          break;

        case "roster":
          await refreshPlayers();
          break;

        case "stats":
          await refetch(); // ✅ THIS is the key fix
          break;

        default:
          break;
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const {
    games: teamGames,
    loading: gamesLoading,
    error: gamesError,
  } = useTeamGames(teamIdNum.toString());

  const {
    highlights: teamHighlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useTeamHighlights("nba", team?.fullName ?? "", 5);

  const {
    articles: newsArticles,
    loading: newsLoading,
    error: newsError,
    refreshNews,
  } = useTeamNews(team?.fullName ?? "");

  const combinedNewsAndHighlights = useMemo(() => {
    const taggedNews = newsArticles.map((item) => ({
      ...item,
      itemType: "news" as const,
      publishedAt: item.publishedAt ?? new Date().toISOString(),
    }));

    const taggedHighlights = teamHighlights.map((item) => ({
      ...item,
      itemType: "highlight" as const,
      publishedAt: item.publishedAt ?? new Date().toISOString(),
      duration: String(item.duration), // ✅ fix type mismatch
    }));

    const combined = [...taggedNews, ...taggedHighlights];

    combined.sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bDate - aDate;
    });

    return combined;
  }, [newsArticles, teamHighlights]);

  const setArticles = useNewsStore((state) => state.setArticles);

  useEffect(() => {
    if (!newsLoading && newsArticles.length > 0) {
      setArticles(newsArticles);
    }
  }, [newsLoading, newsArticles, setArticles]);

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

  const gameCountByMonth = useMemo(() => {
    const map = new Map<string, number>();

    teamGames.forEach((game) => {
      const d = new Date(game.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return map;
  }, [teamGames]);

  const monthsToShow = useMemo(() => {
    const map = new Map<string, { month: number; year: number }>();

    teamGames.forEach((g) => {
      const d = new Date(g.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, { year: d.getFullYear(), month: d.getMonth() });
    });

    return Array.from(map.values()).sort(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month)
    );
  }, [teamGames]);

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
          month === today.getMonth() && year === today.getFullYear()
      );

      const startingMonth = currentMonthWithGames ?? monthsToShow[0];

      setSelectedDate(new Date(startingMonth.year, startingMonth.month, 1));

      // Scroll to that month
      setTimeout(() => {
        if (scrollViewRef.current) {
          const index = monthsToShow.findIndex(
            (m) =>
              m.month === startingMonth.month && m.year === startingMonth.year
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

    if (scrollViewRef.current) {
      const screenWidth = Dimensions.get("window").width;
      const itemWidth = 70; // your month button width
      const spacing = 12; // your padding/margin
      const scrollToX =
        index * itemWidth + index * spacing - screenWidth / 2 + itemWidth / 2;

      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollToX),
        animated: true,
      });
    }
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

  // ✅ Use the favorite teams hook
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const { toggleNotifications, isNotified } = useNotifications();
  const league = "NBA";
  const favorited = team ? isFavorite(league, team.id) : false;
  const teamKey = String(team?.id);
  const notfied = team ? isNotified(league, teamKey) : false;
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={team?.logo}
          logoLight={team?.logoLight}
          teamColor={team?.color}
          onBack={goBack}
          isTeamScreen={true}
          teamCode={team?.code}
          isFavorite={favorited}
          isNotified={notfied}
          onToggleFavorite={() => team && toggleFavorite(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [navigation, isDark, team, favorited]);

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
            refreshing={refreshing}
            onRefresh={handleRefresh}
            expectedCount={filteredGames.length}
          />
        </View>

        {/* News Page */}
        <ScrollView key="news" style={{ flex: 1 }}>
          <NewsHighlightsList
            items={combinedNewsAndHighlights}
            loading={newsLoading || highlightsLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </ScrollView>

        {/* Roster Page */}
        <View key="roster" style={{ flex: 1 }}>
          <TeamPlayerList
            players={players}
            loading={playersLoading}
            error={playersError}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team.fullName}
            teamColor={team.color}
            isDark={isDark}
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
          <StandingsList year={standingsYear} onYearChange={setStandingsYear} />
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
