import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "components/CFB/ConferenceListModal";
import CFBGamesList from "components/CFB/Games/CFBGamesList";
import { CFBConferenceStandingsList } from "components/CFB/Standings/CFBConferenceStandingsList";
import { CFBStandingsList } from "components/CFB/Standings/CFBStandingsList";
import WeekSelector from "components/CFB/WeekSelector";
import LeagueForum from "components/Forum/LeagueForum";
import SeasonLeadersList from "components/League/SeasonLeadersList";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCFBGamesByWeek } from "hooks/CFBHooks/useCFBGamesByWeek";
import { useCFBRankings } from "hooks/CFBHooks/useCFBRankings";
import { useLeagueNews } from "hooks/useLeagueNews";
import { useSeasonLeaders } from "hooks/useSeasonLeaders";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import { getScoresStyles } from "styles/leagueStyles";
import { filterCFBGames, useAPTop25 } from "utils/CFBUtils/cfbGameUtils";
import { CFBWeek, generateCFBWeeks, getCurrentWeekIndex } from "utils/cfbWeeks";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import TabBar from "../../components/TabBar";
import { useHighlights } from "../../hooks/useHighlights";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

// --- Stats tab ---
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

type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
};

type HighlightItem = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
};

type CombinedItem =
  | (NewsItem & { itemType: "news" })
  | (HighlightItem & { itemType: "highlight" });

export default function CFBeagueScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const { rankings } = useCFBRankings();

  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const [selectedConference, setSelectedConference] =
    useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState<
    "scores" | "news" | "standings" | "stats" | "forum"
  >("scores");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = ["scores", "news", "standings", "stats", "forum"] as const;

  // --- News & Highlights ---
  const { news: cfbNews, loading: cfbLoading } = useLeagueNews("CFB");
  const { highlights } = useHighlights("College Football Highlights", "10");

  // --- Week handling ---
  const weeks: CFBWeek[] = React.useMemo(() => generateCFBWeeks(), []);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(
    getCurrentWeekIndex(weeks)
  );
  const selectedWeek = weeks[selectedWeekIndex];

  // --- AP Top 25 from rankings ---
  const apTop25 = useAPTop25();

  const top25Teams = React.useMemo(() => {
    return apTop25.map((t) => t.name);
  }, [apTop25]);

  const selectedWeekForAPI = React.useMemo(() => {
    // If user selects Championship, use Bowls API week
    if (selectedWeek.label.toLowerCase() === "championship") {
      const bowlsWeek = weeks.find((w) => w.label.toLowerCase() === "bowls");
      return bowlsWeek ?? selectedWeek;
    }
    return selectedWeek;
  }, [selectedWeek, weeks]);

  const {
    games: cfbgames,
    loading: cfbloading,
    refresh: refreshcfbgames,
  } = useCFBGamesByWeek({ week: selectedWeekForAPI, weeks });

  // --- Load favorites ---
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

  // --- Header with rotating chevron ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="CFB"
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConference ?? undefined}
        />
      ),
    });
  }, [navigation, selectedConference, isDropdownOpen]);

  // --- Refresh handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshcfbgames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Combine news + highlights ---
  const combinedNewsAndHighlights: CombinedItem[] = React.useMemo(() => {
    const taggedNews: CombinedItem[] = cfbNews.map((item) => ({
      ...item,
      itemType: "news",
      publishedAt: item.publishedAt ?? item.date ?? new Date().toISOString(),
    }));
    const taggedHighlights: CombinedItem[] = highlights.map((item) => ({
      ...item,
      itemType: "highlight",
      publishedAt: item.publishedAt ?? new Date().toISOString(),
    }));
    const combined = [...taggedNews, ...taggedHighlights];
    combined.sort(
      (a, b) =>
        new Date(b.publishedAt || new Date().toISOString()).getTime() -
        new Date(a.publishedAt || new Date().toISOString()).getTime()
    );
    return combined;
  }, [cfbNews, highlights]);

  // --- Filter games by selected conference ---
  const filteredGames = React.useMemo(() => {
    const weekLabel = selectedWeek.label.toLowerCase();


    if (weekLabel.includes("bowl") || weekLabel.includes("championship")) {
      if (selectedWeek.label.toLowerCase().includes("championship")) {
        // Championship week: show only the final game
        return cfbgames.length ? [cfbgames[cfbgames.length - 1]] : [];
      }

      // 🧠 Otherwise (Bowls week): exclude the latest game, which is the championship
      if (cfbgames.length > 0) {
        // Sort games by date to identify the last one (championship)
        const sorted = [...cfbgames].sort(
          (a, b) =>
            new Date(a.game?.date?.date ?? 0).getTime() -
            new Date(b.game?.date?.date ?? 0).getTime()
        );

        // Remove the last (latest) game — usually the championship
        return sorted.slice(0, -1);
      }

      return cfbgames;
    }

    // Regular weeks: filter by conference / top 25
    return filterCFBGames({
      games: cfbgames,
      selectedConference,
      top25Teams,
    });
  }, [cfbgames, selectedConference, top25Teams, selectedWeek]);

  return (
    <>
      <View style={styles.container}>
        <TabBar
          tabs={tabs}
          selected={selectedTab}
          onTabPress={setSelectedTab}
        />

        <View style={styles.contentArea}>
          {selectedTab === "scores" && (
            <>
              <WeekSelector
                weeks={weeks}
                selectedWeekIndex={selectedWeekIndex}
                onSelectWeek={setSelectedWeekIndex}
                monthTextStyle={styles.monthText}
                monthTextSelectedStyle={styles.monthTextSelected}
              />

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
                <CFBGamesList
                  games={filteredGames}
                  loading={cfbloading}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={false}
                />
              </ScrollView>
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              <NewsHighlightsList
                items={combinedNewsAndHighlights}
                loading={cfbLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          )}
          {selectedTab === "standings" && (
            <>
              {selectedConference === "Top 25" || !selectedConference ? (
                <CFBStandingsList />
              ) : (
                <CFBConferenceStandingsList
                  selectedConference={selectedConference}
                />
              )}
            </>
          )}

          {selectedTab === "stats" && <StatsTabContent />}
          {selectedTab === "forum" && <LeagueForum league="CFB" />}
        </View>
      </View>

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conf) => setSelectedConference(conf ?? "")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
      />
    </>
  );
}
