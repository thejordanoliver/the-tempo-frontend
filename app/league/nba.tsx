import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import GamesList from "components/Games/GamesList";
import SeasonLeadersList from "components/League/SeasonLeadersList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import { StandingsList } from "components/Standings/StandingsList";
import SummerGamesList from "components/summer-league/SummerGamesList";
import { mapToInternalTeam } from "constants/teams";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useLeagueNews } from "hooks/useLeagueNews";
import { useSeasonGames } from "hooks/useSeasonGames";
import { useSeasonLeaders } from "hooks/useSeasonLeaders";
import { useSummerLeagueGames } from "hooks/useSummerLeagueGames";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
  View,
  useColorScheme,
} from "react-native";
import { getScoresStyles } from "styles/leagueStyles";
import { filterByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import TabBar from "../../components/TabBar";
import { useHighlights } from "../../hooks/useHighlights";

dayjs.extend(utc);
dayjs.extend(timezone);

function StatsTabContent() {
  const { leaders, loading, error } = useSeasonLeaders({
    season: 2024,
    limit: 5,
    minGames: 10,
  });

  return (
    <SeasonLeadersList
      leadersByStat={leaders}
      loading={loading}
      error={error}
    />
  );
}

export default function NBALeagueScreen() {
  const currentYear = "2025";
  const {
    games,
    loading: liveLoading,
    refreshGames: refreshLiveGames,
  } = useSeasonGames(currentYear);
  const {
    games: summerGames,
    loading: summerLoading,
    refreshGames: refreshSummerGames,
  } = useSummerLeagueGames();
  const { news, loading: newsLoading, refreshNews } = useLeagueNews("NBA");
  const { highlights, loading: highlightsLoading } = useHighlights(
    "NBA highlights",
    "10"
  );

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // --- State ---
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate()
  );

  const [selectedTab, setSelectedTab] = useState<
    "scores" | "news" | "standings" | "stats" | "forum"
  >("scores");

  const underlineX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const tabMeasurements = useRef<{ x: number; width: number }[]>([]);
  const router = useRouter();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load favorites
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const stored = await AsyncStorage.getItem("favorites");
          if (stored) setFavorites(JSON.parse(stored));
        } catch (error) {
          console.warn("Failed to load favorites:", error);
        }
      };
      loadFavorites();
    }, [])
  );

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="NBA"
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={() => {
            setLeagueModalVisible(true);
            sportsModalRef.current?.present();
          }}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible]);

  const handleTabPress = (tab: typeof selectedTab) => {
    setSelectedTab(tab);
    const index = ["scores", "news", "standings", "stats", "forum"].indexOf(
      tab
    );
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

// --- Normalize regular season games ---
const normalizedSeasonGames = games.map((game: any) => {
  const home = mapToInternalTeam(game.teams?.home ?? {});
  const away = mapToInternalTeam(game.teams?.visitors ?? {});
  const rawDate = game.date?.start ?? game.date;

  // ✅ Use local time directly (no timezone conversion)
  const date = dayjs(rawDate);

  return {
    ...game,
    date: date.toDate(),
    dateString: date.format("YYYY-MM-DD"),
    time: date.format("h:mm A"),
    home,
    away,
  };
});

  // Normalize Summer League games
  const normalizedSummerGames = summerGames.map((game) => ({
    ...game,
    period: game.period === undefined ? undefined : String(game.period),
    home: game.home,
    away: game.away,
  }));

  // --- Helper to sort live games on top ---
  const sortLiveGamesFirst = (gamesArray: any[]) =>
    [...gamesArray].sort((a, b) => {
      const aStatus = a.status?.long?.toLowerCase() || "";
      const bStatus = b.status?.long?.toLowerCase() || "";

      if (aStatus === "in play" && bStatus !== "in play") return -1;
      if (aStatus !== "in play" && bStatus === "in play") return 1;

      // Otherwise, sort by date/time
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Filter both sets by selectedDate
  const filteredSeasonGames = sortLiveGamesFirst(
    filterByDate(normalizedSeasonGames, selectedDate)
  );
  const filteredSummerGames = sortLiveGamesFirst(
    filterByDate(normalizedSummerGames, selectedDate)
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshLiveGames(),
        refreshSummerGames(),
        refreshNews(),
      ]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

// --- Change Date (now local) ---
const changeDateByDays = (days: number) => {
  setSelectedDate((prev) =>
    dayjs(prev).add(days, "day").startOf("day").toDate()
  );
};

  // Combine news + highlights
  const combinedNewsAndHighlights = React.useMemo(() => {
    const taggedNews = news.map((item) => ({
      ...item,
      itemType: "news" as const,
      publishedAt: item.publishedAt ?? item.date ?? new Date().toISOString(),
    }));

    const taggedHighlights = highlights.map((item) => ({
      ...item,
      itemType: "highlight" as const,
      // convert numeric duration to string
      duration: String(item.duration),
      publishedAt: item.publishedAt ?? new Date().toISOString(),
    }));

    return [...taggedNews, ...taggedHighlights].sort(
      (a, b) =>
        new Date(b.publishedAt ?? 0).getTime() -
        new Date(a.publishedAt ?? 0).getTime()
    );
  }, [news, highlights]);

  // Helper to mark games on calendar
  const markDates = (gamesArray: any[]) =>
    gamesArray.reduce((acc, game) => {
      const localDate = new Date(game.date);
      const iso = `${localDate.getFullYear()}-${String(
        localDate.getMonth() + 1
      ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
      acc[iso] = { marked: true, dotColor: isDark ? "#fff" : "#1d1d1d" };
      return acc;
    }, {} as Record<string, { marked: boolean; dotColor: string }>);

  return (
    <>
      <View style={styles.container}>
        <TabBar
          tabs={["scores", "news", "standings", "stats", "forum"]}
          selected={selectedTab}
          onTabPress={handleTabPress}
        />

        <View style={styles.contentArea}>
          {selectedTab === "scores" && (
            <>
              <DateNavigator
                selectedDate={selectedDate}
                onChangeDate={changeDateByDays}
                onOpenCalendar={() => setShowCalendarModal(true)}
                isDark={isDark}
              />
              <ScrollView
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              >
                {filteredSeasonGames.length > 0 ? (
                  <GamesList
                    games={filteredSeasonGames}
                    loading={liveLoading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    scrollEnabled={false}
                  />
                ) : (
                  <SummerGamesList
                    games={filteredSummerGames}
                    loading={summerLoading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    scrollEnabled={false}
                  />
                )}
              </ScrollView>
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <NewsHighlightsList
                items={combinedNewsAndHighlights}
                loading={newsLoading || highlightsLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          )}

          {selectedTab === "standings" && <StandingsList />}
          {selectedTab === "stats" && <StatsTabContent />}
          {selectedTab === "forum" && <LeagueForum league="NBA" />}
        </View>
      </View>

   
<CalendarModal
  visible={showCalendarModal}
  onClose={() => setShowCalendarModal(false)}
  onSelectDate={(dateString) => {
    const localSelected = dayjs(dateString, "YYYY-MM-DD")
      .startOf("day")
      .toDate();
    setSelectedDate(localSelected);
    setShowCalendarModal(false);
  }}
  markedDates={{
    ...markDates([...normalizedSeasonGames, ...normalizedSummerGames]),
  }}
/>

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
