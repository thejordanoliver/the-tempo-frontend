import { useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import DraftList from "components/League/DraftList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import NFLGamesList from "components/Sports/NFL/Games/NFLGamesList";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import WeekSelector from "components/Sports/NFL/WeekSelector";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useFootballGamesByWeek } from "hooks/NFLHooks/useFootballGamesByWeek";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getFootballSeason } from "utils/dateUtils";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

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
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, "NFL");
  const [refreshing, setRefreshing] = useState(false);
  const [draftYear, setDraftYear] = useState(getFootballSeason().toString());
  const [standingsYear, setStandingsYear] = useState(
    getFootballSeason().toString(),
  );
  const { categories, loading, error } = useSeasonLeaders(
    getFootballSeason(),
    "NFL",
  );
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("NFL");

  const {
    weeks,
    loading: gamesLoading,
    refetch,
  } = useFootballGamesByWeek(getFootballSeason(), 1);
  const weekLabels = Object.keys(weeks);

  // ✅ Map weeks to array of objects for WeekSelector
  const weekArray = weekLabels.map((label) => ({
    label, // week name
    stage: weeks[label][0]?.game?.stage || "Unknown", // stage (Pre Season / Regular / Playoffs)
  }));

  const selectedWeekLabel = weekLabels[selectedWeekIndex] || "";
  const selectedWeekGames = weeks[selectedWeekLabel] || [];

  React.useEffect(() => {
    if (!weekLabels.length) return;

    const now = dayjs();

    let liveIndex: number | null = null;
    let upcomingIndex: number | null = null;
    let pastIndex: number | null = null;

    weekLabels.forEach((label, index) => {
      const games = weeks[label];
      if (!games?.length) return;

      const gameDate = dayjs(games[0]?.game?.date?.timestamp);

      // 🟢 LIVE (same week as today)
      if (gameDate.isSame(now, "week")) {
        liveIndex = index;
      }

      // 🔵 UPCOMING (first future week)
      if (gameDate.isAfter(now) && upcomingIndex === null) {
        upcomingIndex = index;
      }

      // ⚫ PAST (keep updating → last past week wins)
      if (gameDate.isBefore(now)) {
        pastIndex = index;
      }
    });

    const finalIndex = liveIndex ?? upcomingIndex ?? pastIndex ?? 0;

    setSelectedWeekIndex(finalIndex);
  }, [weeks]);

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
      await refetch();
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);
          const index = tabs.indexOf(tab);
          pagerRef.current?.setPage(index);
        }}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setSelectedTab(tabs[index]);
          }}
        >
          {/* SCORES */}
          <View key="scores" style={styles.contentArea}>
            <WeekSelector
              weeks={weekArray}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={setSelectedWeekIndex}
              isDark={isDark}
              loading={gamesLoading}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              <NFLGamesList
                games={selectedWeekGames}
                loading={gamesLoading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                scrollEnabled={false}
              />
            </ScrollView>
          </View>

          {/* NEWS */}
          <View key="news" style={styles.contentArea}>
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
              <NewsList
                items={articles}
                isDark={isDark}
                loading={newsLoading}
                error={newsError}
                refreshing
                onRefresh={handleRefresh}
              />
            </ScrollView>
          </View>

          {/* STANDINGS */}
          <View key="standings" style={styles.contentArea}>
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league="NFL"
            />
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={"NFL"}
              isDark={isDark}
            />
          </View>

          {/* DRAFT */}
          <View key="draft" style={styles.contentArea}>
            <DraftList
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league="nfl"
            />
          </View>

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league="NFL" />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <LeagueForum league="NFL" />
          </View>
        </PagerView>
      </View>

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
