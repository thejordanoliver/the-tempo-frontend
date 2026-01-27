import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import DraftList from "components/League/DraftList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import NewsHighlightsList from "components/News/NewsHighlightsList";
import NFLGamesList from "components/Sports/NFL/Games/NFLGamesList";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import { NFLStandingsList } from "components/Sports/NFL/Standings/NFLStandingsList";
import WeekSelector from "components/Sports/NFL/WeekSelector";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useNFLGamesByWeek } from "hooks/NFLHooks/useNFLGamesByWeek";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueNews } from "hooks/useLeagueNews";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import {
  generateWeeksFromGames,
  getCurrentWeekIndexFromGames,
  NFLWeekFromGames,
} from "utils/nflWeeks";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { useHighlights } from "../../hooks/useHighlights";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

function StatsTabContent() {
  const { categories, loading, error } = useSeasonLeaders(2025);

  return (
    <SeasonLeadersList
      loading={loading}
      error={error}
      categories={categories}
      league={"NFL"}
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

export default function NFLLeagueScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const [selectedTab, setSelectedTab] = useState<
    "scores" | "news" | "standings" | "stats" | "draft" | "awards" | "forum"
  >("scores");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [draftYear, setDraftYear] = useState(dayjs().year().toString());
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");

  const [weeks, setWeeks] = useState<NFLWeekFromGames[]>([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const tabs = [
    "scores",
    "news",
    "standings",
    "stats",
    "draft",
    "awards",
    "forum",
  ] as const;

  // --- Fetch News & Highlights ---
  const { news: nflNews, loading: newsLoading } = useLeagueNews("NFL");
  const { highlights } = useHighlights("nfl", "", 10);

  const selectedWeek = weeks[selectedWeekIndex] ?? null;

  const {
    games: nflGames,
    loading: nflLoading,
    refresh: refreshNFLGames,
  } = useNFLGamesByWeek({
    selectedWeek,
  });

  // --- Generate weeks dynamically once games load ---
  React.useEffect(() => {
    if (!nflGames || nflGames.length === 0) return;

    // Only generate weeks if we haven't done it yet
    if (weeks.length === 0) {
      const generatedWeeks = generateWeeksFromGames(nflGames);
      setWeeks(generatedWeeks);

      // Set current week on first load
      const currentWeekIndex = getCurrentWeekIndexFromGames(generatedWeeks);
      setSelectedWeekIndex(currentWeekIndex);
    }
  }, [nflGames, weeks.length]);

  // --- Load favorites from AsyncStorage ---
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

  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="NFL"
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

  // --- Refresh handler ---
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNFLGames();
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Sort games: live games first, then by date ---
  const sortedGames = React.useMemo(() => {
    if (!nflGames) return [];

    return [...nflGames].sort((a, b) => {
      const aStatus = a?.game?.status?.long?.toLowerCase?.() || "";
      const bStatus = b?.game?.status?.long?.toLowerCase?.() || "";

      const liveStatuses = [
        "not started",
        "final",
        "finished",
        "postponed",
        "canceled",
      ];
      const aIsLive = !liveStatuses.includes(aStatus);
      const bIsLive = !liveStatuses.includes(bStatus);

      if (aIsLive && !bIsLive) return -1;
      if (!aIsLive && bIsLive) return 1;

      const aTime = a?.game?.date.timestamp ?? 0;
      const bTime = b?.game?.date.timestamp ?? 0;
      return aTime - bTime;
    });
  }, [nflGames]);

  // --- Combine news + highlights ---
  const combinedNewsAndHighlights: CombinedItem[] = React.useMemo(() => {
    const taggedNews: CombinedItem[] = nflNews.map((item) => ({
      ...item,
      itemType: "news",
      // ensure publishedAt is always defined
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
        new Date(a.publishedAt || new Date().toISOString()).getTime() -
        new Date(b.publishedAt || new Date().toISOString()).getTime()
    );
    return combined;
  }, [nflNews, highlights]);

  return (
    <>
      <View style={styles.container}>
        <MainScrollTabBar
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
                <NFLGamesList
                  games={sortedGames}
                  loading={nflLoading}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={false}
                />
              </ScrollView>
            </>
          )}

          {selectedTab === "news" && (
            <ScrollView
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
                loading={newsLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            </ScrollView>
          )}

          {selectedTab === "standings" && <NFLStandingsList />}
          {selectedTab === "stats" && <StatsTabContent />}

          {selectedTab === "draft" && (
            <DraftList
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league="nfl"
            />
          )}
          {selectedTab === "awards" && <AwardSeasons league="NFL" />}
          {selectedTab === "forum" && <LeagueForum league="NFL" />}
        </View>
      </View>

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
