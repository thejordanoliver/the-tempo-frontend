import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import TeamForum from "components/Forum/TeamForum";
import GamesList from "components/Games/GamesList";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import TabBar from "components/TabBar";
import RosterStats from "components/Team/RosterStats";
import TeamInfoBottomSheet from "components/Team/TeamInfoModal";
import TeamPlayerList from "components/Team/TeamRoster";
import { Fonts } from "constants/fonts";
import { teams } from "constants/teams";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useNewsStore } from "hooks/newsStore";
import useDbPlayersByTeam from "hooks/useDbPlayersByTeam";
import { useFavoriteTeams } from "hooks/useFavoriteTeams";
import { useTeamGames } from "hooks/useTeamGames";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
import { useTeamRosterStats } from "hooks/useTeamRosterStats";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import PagerView from "react-native-pager-view";
import { style } from "styles/TeamDetails.styles";
import { User } from "types/types";
import GameCard from "components/Games/GameCard";
import { mockGames } from "mocks/games";

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const teamIdNum = parseInt(teamId as string, 10);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // ✅ bottom sheet state
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = style(isDark);
  const tabs = ["schedule", "news", "roster", "stats", "forum"] as const;
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
    () => teams.find((t) => t.id === teamIdNum.toString()),
    [teamIdNum]
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      if (selectedTab === "schedule") {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      if (selectedTab === "news") {
        await refreshNews();
      }
      if (selectedTab === "roster") {
        await refreshPlayers();
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
  } = useTeamHighlights(team?.fullName ?? "", 5);
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
    loading: rosterStatsLoading,
    error: rosterStatsError,
  } = useTeamRosterStats(teamIdNum);



  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const rawMonths = [
    { label: "Oct", month: 9, year: 2025 },
    { label: "Nov", month: 10, year: 2025 },
    { label: "Dec", month: 11, year: 2025 },
    { label: "Jan", month: 0, year: 2026 },
    { label: "Feb", month: 1, year: 2026 },
    { label: "Mar", month: 2, year: 2026 },
    { label: "Apr", month: 3, year: 2026 },
    { label: "May", month: 4, year: 2026 },
    { label: "Jun", month: 5, year: 2026 },
  ];

  const monthsToShow = rawMonths.filter(({ month, year }) => {
    return teamGames.some((game: any) => {
      const gameDate = new Date(game.date);
      return gameDate.getFullYear() === year && gameDate.getMonth() === month;
    });
  });

useEffect(() => {
  if (!gamesLoading && teamGames.length > 0 && !selectedDate && monthsToShow.length > 0) {
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
          index * itemWidth + index * spacing - screenWidth / 2 + itemWidth / 2;

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
  } = useDbPlayersByTeam(teamIdNum.toString());

  const handleConfirmDate = (date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
  };

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

  const playersForRosterStats = players.map((p) => {
    const [first_name, ...rest] = p.name.split(" ");
    const last_name = rest.join(" ");
    return {
      player_id: p.id,
      first_name,
      last_name,
      jersey_number: p.jersey_number,
      headshot_url: p.avatarUrl ?? undefined,
    };
  });

  // ✅ Use the favorite teams hook
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const league = "NBA";
  const favorited = team ? isFavorite(league, team.id) : false;

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

  if (!team || selectedDate === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabBar tabs={tabs} selected={selectedTab} onTabPress={handleTabPress} />
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
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={70}
              decelerationRate="fast"
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            >
              {monthsToShow.map(({ label, month, year }, index) => {
                const isSelected =
                  selectedDate.getMonth() === month &&
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

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={selectedDate}
            onConfirm={handleConfirmDate}
            onCancel={handleCancelDate}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(2000, 0, 1)}
          />

          <GamesList
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            expectedCount={filteredGames.length}
          />

          
          {/* <GamesList
            games={mockGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            expectedCount={filteredGames.length}
          /> */}

       
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
          {playersError ? (
            <Text
              style={{
                fontFamily: Fonts.OSLIGHT,
                fontSize: 16,
                textAlign: "center",
                marginTop: 20,
                color: isDark ? "#aaa" : "#888",
              }}
            >
              {playersError}
            </Text>
          ) : (
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
          )}
        </View>

        {/* Stats Page */}
        <View key="stats" style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={team.color}
              />
            }
          >
            <View>
              {rosterStatsLoading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
              ) : rosterStatsError ? (
                <Text
                  style={{
                    fontFamily: Fonts.OSLIGHT,
                    fontSize: 16,
                    textAlign: "center",
                    marginTop: 20,
                    color: isDark ? "#aaa" : "#888",
                  }}
                >
                  {rosterStatsError.message}
                </Text>
              ) : rosterStats.length === 0 ? (
                <Text
                  style={{
                    fontFamily: Fonts.OSLIGHT,
                    fontSize: 16,
                    textAlign: "center",
                    marginTop: 20,
                    color: isDark ? "#aaa" : "#888",
                  }}
                >
                  No player stats available.
                </Text>
              ) : (
                <RosterStats
                  rosterStats={rosterStats}
                  playersDb={playersForRosterStats}
                  teamId={teamId as string}
                />
              )}
            </View>
          </ScrollView>
        </View>

        {/* Forum Page */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="NBA" />
        </View>
      </PagerView>
      {/* --- Bottom Sheet --- */}
      {team && (
        <TeamInfoBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
          coachName={team.coach ?? "N/A"}
        />
      )}
    </View>
  );
}
