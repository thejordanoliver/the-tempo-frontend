import { useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/Awards/AwardSeasons";
import DraftList, {
  getDefaultDraftYear,
} from "components/League/Draft/DraftList";
import SeasonLeadersList from "components/League/SeasonLeadersList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import GamesList from "components/Sports/NBA/Games/GamesList";
import { NBAPlayoffBracket } from "components/Sports/NBA/Playoffs/NBAPlayoffBracket";
import SLGamesList from "components/Sports/NBASummerLeague/Games/SLGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { usePlayoffGames } from "hooks/NBAHooks/usePlayoffGames";
import { useSeasonGames } from "hooks/NBAHooks/useSeasonGames";
import { useNBASLGames } from "hooks/NBASLHooks/useNBASLGames";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useSeasonLeaders } from "hooks/useSeasonLeaders";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getNBACalendarSeason, getNBASeason } from "utils/dateUtils";
import { filterByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { XFeed } from "components/League/Social/XFeed";
import { mockSocialFeed } from "mocks/social";
dayjs.extend(utc);
dayjs.extend(timezone);

export default function NBALeagueScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const league = "NBA";
  const currentYear = getNBASeason();
  const playoffYear = Number(currentYear);
  const {
    games,
    error: errorGames,
    loading: loadingGames,
    refreshGames: refreshGames,
  } = useSeasonGames(currentYear);

  const {
    games: summerGames,
    loading: loadingSummer,
    refreshSummerGames,
  } = useNBASLGames({ season: currentYear.toString() });
  const { calendar } = useLeagueCalendar(league);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const filteredSeasonGames = filterByDate(games, selectedDate);
  const filteredSummerGames = filterByDate(summerGames, selectedDate);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const navigation = useNavigation();
  const [draftYear, setDraftYear] = useState(() =>
    getDefaultDraftYear("nba").toString(),
  );
  const [standingsYear, setStandingsYear] = useState(
    getNBACalendarSeason().toString(),
  );
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");
  const { leaders, loading, error } = useSeasonLeaders();
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [refreshing, setRefreshing] = useState(false);
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);
  const {
    bracket,
    playoffsLoading,
    playoffsError,
    refreshing: playoffRefreshing,
    onRefresh,
  } = usePlayoffGames(playoffYear);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshGames(), refreshSummerGames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const changeDateByDays = (days: number) => {
    setSelectedDate((prev) =>
      dayjs(prev).add(days, "day").startOf("day").toDate(),
    );
  };

  const markDates = (calendarArray: string[]) =>
    calendarArray.reduce(
      (acc, dateStr) => {
        const iso = dayjs(dateStr).format("YYYY-MM-DD");

        acc[iso] = {
          marked: true,
          dotColor: isDark ? Colors.white : Colors.black,
        };

        return acc;
      },
      {} as Record<string, { marked: boolean; dotColor: string }>,
    );

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
          style={styles.contentArea}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setSelectedTab(tabs[index]);
          }}
        >
          {/* SCORES */}
          <View key="scores">
            <DateNavigator
              selectedDate={selectedDate}
              onChangeDate={changeDateByDays}
              onOpenCalendar={() => setShowCalendarModal(true)}
              isDark={isDark}
            />

            {filteredSummerGames.length > 0 ? (
              <SLGamesList
                games={filteredSummerGames}
                loading={loadingSummer}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                scrollEnabled={true}
              />
            ) : (
              <GamesList
                games={filteredSeasonGames}
                error={errorGames}
                loading={loadingGames}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                scrollEnabled={true}
              />
            )}
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
              <XFeed
                items={mockSocialFeed}
                loading={newsLoading}
                error={null}
              />
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
          <ScrollView key="standings">
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </ScrollView>

          {/* PLAYOFFS */}
          <View key="playoffs" style={styles.contentArea}>
            <NBAPlayoffBracket
              loading={playoffsLoading}
              error={playoffsError}
              bracket={bracket}
              refreshing={playoffRefreshing}
              onRefresh={onRefresh}
            />
          </View>

          {/* STATS */}
          <ScrollView key="stats">
            <SeasonLeadersList
              leadersByStat={leaders}
              loading={loading}
              error={error}
            />
          </ScrollView>

          {/* DRAFT */}
          <View key="draft">
            <DraftList
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league={"nba"}
            />
          </View>

          {/* AWARDS */}
          <View key="awards">
            <AwardSeasons league={league} />
          </View>

          {/* FORUM */}
          <View key="forum">
            <LeagueForum league={league} />
          </View>
        </PagerView>
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
          ...markDates([...calendar]),
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
