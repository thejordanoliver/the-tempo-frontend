import { useNavigation } from "@react-navigation/native";
import TeamForum from "components/Forum/TeamForum";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import MLBGamesList from "components/Sports/MLB/Games/MLBGamesList";
import TeamInfoBottomSheet from "components/Sports/MLB/Team/TeamInfoModal";
import TeamPlayerList from "components/Sports/MLB/Team/TeamRoster";
import { Colors } from "constants/Colors";
import { players } from "constants/mlbPlayers";
import { teams } from "constants/teamsMLB";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useMLBTeamGames } from "hooks/MLBHooks/useMLBTeamGames";
import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { useTeamHighlights } from "hooks/useTeamHighlights";
import { useTeamNews } from "hooks/useTeamNews";
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
import { CustomHeaderTitle } from "../../../components/CustomHeaderTitle";
import TabBar from "../../../components/TabBar";
import { style } from "../../../styles/TeamStyles/TeamDetailsStyles";

type PageSelectedEvent = {
  nativeEvent: {
    position: number;
  };
};

type MonthItem = {
  label: string;
  month: number;
  year: number;
};

export default function TeamDetailScreen() {
  const navigation = useNavigation();
  const { teamId } = useLocalSearchParams();
  const teamIdNum = teamId ? parseInt(teamId as string, 10) : null;
  const league = "MLB";

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const isDark = useColorScheme() === "dark";
  const styles = style(isDark);

  const tabs = ["schedule", "news", "roster", "stats", "forum"] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("schedule");

  const rosterRef = useRef<{ refresh: () => void }>(null);
  const pagerRef = useRef<PagerView>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];

  const team = useMemo(
    () => (teamIdNum ? teams.find((t) => Number(t.id) === teamIdNum) : null),
    [teamIdNum]
  );

  const {
    games: rawTeamGames = [],
    loading: gamesLoading,
    refreshGames: refreshTeamGames,
  } = useMLBTeamGames(teamIdNum ? teamIdNum.toString() : "");

  // -------------------------------
  // MONTHS TO SHOW
  // -------------------------------
  const monthsToShow: MonthItem[] = rawTeamGames
    .map((game) => {
      const dateStr = game?.date?.utc;
      if (!dateStr) return null;

      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;

      return {
        label: d.toLocaleString("en-US", { month: "short" }),
        month: d.getMonth(),
        year: d.getFullYear(),
      };
    })
    .filter((m): m is MonthItem => m !== null)
    .filter(
      (m, i, arr) =>
        arr.findIndex((x) => x.month === m.month && x.year === m.year) === i
    )
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

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

    if (scrollViewRef.current) {
      const screenWidth = Dimensions.get("window").width;
      const itemWidth = 70;
      const spacing = 12;
      const scrollToX =
        index * itemWidth + index * spacing - screenWidth / 2 + itemWidth / 2;

      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollToX),
        animated: true,
      });
    }
  };

  // -------------------------------
  // FILTER GAMES FOR MONTH
  // -------------------------------
  const filteredGames = useMemo(() => {
    if (!selectedDate) return rawTeamGames;

    return rawTeamGames.filter((game) => {
      const dateStr = game?.date?.utc;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth()
      );
    });
  }, [rawTeamGames, selectedDate]);

  // -------------------------------
  // NEWS + HIGHLIGHTS
  // -------------------------------
  const {
    highlights: teamHighlights,
    loading: highlightsLoading,
    error: highlightsError,
  } = useTeamHighlights("mlb", team?.fullName ?? "", 5);

  const {
    articles: newsArticles,
    loading: newsLoading,
    error: newsError,
    refreshNews,
  } = useTeamNews(team?.fullName ?? "", "MLB");

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
      duration: String(item.duration),
    }));

    const combined = [...taggedNews, ...taggedHighlights];

    combined.sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bDate - aDate;
    });

    return combined;
  }, [newsArticles, teamHighlights]);

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
  // -------------------------------
  // FAVORITES
  // -------------------------------
  const { toggleFavorite, isFavorite } = useFavoriteTeams();
  const favorited = team ? isFavorite(league, team.id) : false;

  // -------------------------------
  // HEADER
  // -------------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={team?.logo ? { uri: team.logo } : undefined}
          logoLight={team?.logoLight ? { uri: team.logoLight } : undefined}
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

  if (!teamIdNum || !team) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      </View>
    );
  }

  // -------------------------------
  // UI
  // -------------------------------
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
        initialPage={0}
        onPageSelected={(e: PageSelectedEvent) =>
          setSelectedTab(indexToTab(e.nativeEvent.position))
        }
      >
        {/* Schedule */}
        <View key="schedule" style={{ flex: 1 }}>
          <View style={styles.monthSelector}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={82}
              decelerationRate="fast"
              scrollEventThrottle={16}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              {monthsToShow.map(({ label, month, year }, index) => {
                const isSelected =
                  selectedDate?.getMonth() === month &&
                  selectedDate?.getFullYear() === year;

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

          <MLBGamesList
            games={filteredGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={refreshTeamGames}
          />

          {/* <MLBGamesList
            games={mockMLBGames}
            loading={gamesLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            expectedCount={filteredGames.length}
          /> */}
        </View>

        {/* News */}
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
            teamColor={team?.color ?? Colors.midTone}
            isDark={isDark}
          />
        </View>

        {/* Stats */}
        <ScrollView key="stats" style={{ flex: 1 }} />

        {/* Forum */}
        <View key="forum" style={{ flex: 1 }}>
          <TeamForum teamId={teamId as string} league="MLB" />
        </View>
      </PagerView>

      {team && (
        <TeamInfoBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          teamId={team.id}
        />
      )}
    </View>
  );
}
