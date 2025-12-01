import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import CBBGamesList from "components/CBB/Games/CBBGamesList";
import TeamPlayerList from "components/CBB/Team/TeamRoster";
import TeamInfoBottomSheet from "components/CFB/Team/TeamInfoModal";
import TeamForum from "components/Forum/TeamForum";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import { players } from "constants/cbbPlayers";
import { teams } from "constants/teamsCBB";
import { useNotifications } from "contexts/NotificationContext";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBTeamGames } from "hooks/CBBHooks/useCBBTeamGames";
import { useFavoriteTeams } from "hooks/useFavoriteTeams";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
import CBBRosterStats from "components/CBB/Team/RosterStats";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import PagerView from "react-native-pager-view";
import { CBBGame, User } from "types/types";
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import TabBar from "../../../components/TabBar";
import { style } from "../../../styles/TeamDetails.styles";

type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const [refreshing, setRefreshing] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cachedGames, setCachedGames] = useState<CBBGame[]>([]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = style(isDark);

  const tabs = ["schedule", "news", "roster", "stats", "forum"] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("schedule");
  const rosterRef = useRef<{ refresh: () => void }>(null);

  const pagerRef = useRef<PagerView>(null);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const team = useMemo(
    () => (teamIdNum ? teams.find((t) => Number(t.id) === teamIdNum) : null),
    [teamIdNum]
  );

  const CACHE_KEY = `teamGames-${teamIdNum}`;
  const CACHE_EXPIRY_HOURS = 6;

  // ✅ call hook directly
  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    error: gamesError,
    refreshGames: refreshTeamGames,
  } = useCBBTeamGames(teamIdNum ? teamIdNum.toString() : "");

  const {
    highlights: teamHighlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useTeamHighlights("cbb", team?.fullName ?? "", 5);

  const {
    articles: newsArticles,
    loading: newsLoading,
    error: newsError,
    refreshNews,
  } = useTeamNews(team?.fullName ?? "", "CBB");

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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  // --- Memoize valid games ---
  const teamGames = useMemo(
    () =>
      (cachedGames.length ? cachedGames : rawTeamGames).filter(
        (g: CBBGame) => !!g?.date
      ),
    [cachedGames, rawTeamGames]
  );

  const rawMonths = [
    { label: "Oct", month: 9, year: 2025 },
    { label: "Nov", month: 10, year: 2025 },
    { label: "Dec", month: 11, year: 2025 },
    { label: "Jan", month: 0, year: 2026 },
    { label: "Feb", month: 1, year: 2026 },
    { label: "Mar", month: 2, year: 2026 },
    { label: "Apr", month: 3, year: 2026 },
  ];
  const monthsToShow = useMemo(() => {
    if (!teamGames || teamGames.length === 0) return [];
    return rawMonths.filter(({ month, year }) =>
      teamGames.some((game: any) => {
        const gameDate = new Date(game.date);
        return gameDate.getFullYear() === year && gameDate.getMonth() === month;
      })
    );
  }, [teamGames]);

  // --- Load cached games on mount ---
  useEffect(() => {
    const loadCachedGames = async () => {
      if (!teamIdNum) return;
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (!cached) return;

        const { timestamp, data } = JSON.parse(cached);
        const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (diffHours < CACHE_EXPIRY_HOURS) {
          setCachedGames(data);
        } else {
          await AsyncStorage.removeItem(CACHE_KEY);
        }
      } catch (err) {
        console.error("Failed to load cached games:", err);
      }
    };
    loadCachedGames();
  }, [teamIdNum]);

  // --- Save fresh games to cache ---
  useEffect(() => {
    if (!teamIdNum || !rawTeamGames?.length) return;
    const saveToCache = async () => {
      try {
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: rawTeamGames })
        );
      } catch (err) {
        console.error("Failed to save games to cache:", err);
      }
    };
    saveToCache();
  }, [rawTeamGames, teamIdNum]);

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

  const filteredGames = useMemo(() => {
    if (!selectedDate) return teamGames;
    return teamGames.filter((game) => {
      const gameDate = new Date(game.date);
      return (
        gameDate.getMonth() === selectedDate.getMonth() &&
        gameDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [teamGames, selectedDate]);

  // --- Refresh handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "schedule") {
        await refreshTeamGames?.();
      } else if (selectedTab === "roster") {
        rosterRef.current?.refresh();
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Load logged-in user ---
  useEffect(() => {
    const loadUser = async () => {
      try {
        const jsonUser = await AsyncStorage.getItem("loggedInUser");
        if (jsonUser) setLoggedInUser(JSON.parse(jsonUser));
      } catch (e) {
        console.error("Failed to load user:", e);
      }
    };
    loadUser();
  }, []);

  // ✅ Use the favorite teams hook
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const { toggleNotifications, isNotified } = useNotifications();
  const league = "CBB";
  const favorited = team ? isFavorite(league, team.id) : false;

  // --- Header ---
  useLayoutEffect(() => {
    if (!team) return;

    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={team.logo ? { uri: team.logo } : undefined}
          logoLight={team.logoLight ? { uri: team.logoLight } : undefined}
          teamColor={team.color}
          onBack={goBack}
          isTeamScreen={true}
          teamCode={team.code}
          isFavorite={isFavorite(league, team.id)} // recompute here
          isNotified={isNotified(league, team.id)} // recompute here
          onToggleFavorite={() => toggleFavorite(league, team.id)}
          onToggleNotifications={() => toggleNotifications(league, team.id)}
          onOpenInfo={() => setModalVisible(true)}
          league={league}
        />
      ),
    });
  }, [
    navigation,
    isDark,
    team,
    isFavorite,
    isNotified,
    toggleFavorite,
    toggleNotifications,
  ]);

  if (!teamIdNum || !team) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);
          pagerRef.current?.setPage(tabToIndex(tab));
        }}
      />

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={tabToIndex(selectedTab)}
        onPageSelected={(e: PageSelectedEvent) => {
          const index = e.nativeEvent.position;
          setSelectedTab(indexToTab(index));
        }}
      >
        {/* Schedule Page */}
        <View key="schedule" style={{ flex: 1 }}>
          <View style={styles.monthSelector}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={82} // slightly wider for spacing
              decelerationRate="fast"
              scrollEventThrottle={16}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 20,
              }}
            >
              {monthsToShow.map(({ label, month, year }, index) => {
                const isSelected =
                  selectedDate?.getMonth() === month &&
                  selectedDate.getFullYear() === year;

                return (
                  <TouchableOpacity
                    key={`${label}-${year}`}
                    onPress={() => handleSelectMonth(month, year, index)}
                    style={[
                      styles.monthButton,
                      { width: 70 },
                      isSelected && styles.monthButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthText,
                        isSelected && styles.monthTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <CBBGamesList
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showHeaders={false}
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
            players={players.filter((p) => p.teamId === String(team.espnID))}
            loading={false}
            error={null}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            teamFullName={team?.fullName ?? "Unknown Team"}
            teamColor={team?.color ?? "#888"}
            isDark={isDark}
          />
        </View>

           {/* Stats Page */}
        <ScrollView key="stats" contentContainerStyle={{ paddingBottom: 100 }}>
          {team?.espnID && team?.id && (
            <CBBRosterStats
              espnID={Number(team.espnID)}
              teamID={Number(team.id)}
          
            />
          )}
        </ScrollView>
        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="CBB" />
        </View>
      </PagerView>

      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          league="CBB"
        />
      )}
    </View>
  );
}
