import { useNavigation } from "@react-navigation/native";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/Awards/AwardSeasons";
import DraftList, {
  getDefaultDraftYear,
} from "components/League/Draft/DraftList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import NFLGamesList from "components/Sports/NFL/Games/NFLGamesList";
import { NFLPlayoffBracket } from "components/Sports/NFL/Playoffs/NFLPlayoffBracket";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import WeekSelector from "components/Sports/NFL/WeekSelector";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useFootballGamesByWeek } from "hooks/FootballHooks/useFootballGamesByWeek";
import { useNFLBracket } from "hooks/FootballHooks/usePlayoffGames";
import { useSeasonLeaders } from "hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getFootballSeason } from "utils/dateUtils";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function NFLLeagueScreen() {
  const league = "NFL";
  const currentSeason = getFootballSeason();
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);
  const [refreshing, setRefreshing] = useState(false);
  const [draftYear, setDraftYear] = useState(() =>
    getDefaultDraftYear("nfl").toString(),
  );
  const [standingsYear, setStandingsYear] = useState(currentSeason.toString());
  const {
    playoffData,
    playoffLoading,
    playoffError,
    onRefresh,
    playoffRefreshing,
  } = useNFLBracket(currentSeason);

  const { categories, loading, error } = useSeasonLeaders(
    currentSeason,
    league,
  );
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const {
    weeks,
    loading: gamesLoading,
    refetch,
  } = useFootballGamesByWeek(getFootballSeason(), 1);
  const { calendar } = useLeagueCalendar(league, "football");
  const weekArray = calendar?.filter((w) => w.stage !== "Off Season") || [];
  const weekLabels = weekArray.map((w) => w.label);
  const selectedWeekLabel = weekLabels[selectedWeekIndex] || "";
  const selectedWeekGames = weeks[selectedWeekLabel] || [];

  useEffect(() => {
    if (!calendar?.length) return;

    const now = dayjs();

    // 1. Active week — skip Off Season entirely
    const activeIndex = calendar.findIndex(
      (week) =>
        week.stage !== "Off Season" &&
        dayjs(now).isBetween(week.startDate, week.endDate, null, "[]"),
    );

    if (activeIndex !== -1) {
      setSelectedWeekIndex(activeIndex);
      return;
    }

    // 2. Find LAST meaningful NFL week (ignore offseason completely)
    let lastIndex = 0;

    calendar.forEach((week, index) => {
      const isOffseason = week.stage === "Off Season";
      const isPast = dayjs(week.endDate).isBefore(now);

      if (!isOffseason && isPast) {
        lastIndex = index;
      }
    });

    setSelectedWeekIndex(lastIndex);
  }, [calendar]);

  // --- Header ---
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={league}
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

            <NFLGamesList
              games={selectedWeekGames}
              loading={gamesLoading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
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
              league={league}
            />
          </View>

          {/* PLAYOFFS */}
          <View key="playoffs" style={styles.contentArea}>
            <NFLPlayoffBracket
              bracket={playoffData}
              loading={playoffLoading}
              error={playoffError}
              refreshing={playoffRefreshing}
              onRefresh={onRefresh}
            />
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={league}
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
          <View key="awards">
            <AwardSeasons league={league} />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <LeagueForum league={league} />
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
