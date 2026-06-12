import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import CalendarModal from "../../components/CalendarModal";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import DateNavigator from "../../components/DateNavigator";
import LeagueForum from "../../components/Forum/LeagueForum";
import AwardSeasons from "../../components/League/Awards/AwardSeasons";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import { StandingsList } from "../../components/League/Standings/StandingsList";
import NewsList from "../../components/News/NewsList";
import GamesList from "../../components/Sports/Baseball/Games/GamesList";
import SeasonLeadersList from "../../components/Sports/Football/SeasonLeaderList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useBaseballGames } from "../../hooks/BaseballHooks/useBaseballGames";
import { useSeasonLeaders } from "../../hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getMLBStandingsSeason } from "../../utils/dateUtils";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function MLBLeagueScreen() {
  const league = "MLB";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);
  const [standingsYear, setStandingsYear] = useState(getMLBStandingsSeason());
  const navigation = useNavigation();
  const { categories, loading, error } = useSeasonLeaders(2025, league);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const { calendar } = useLeagueCalendar(league);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );

  const {
    games,
    error: gamesError,
    refreshGames,
    loading: loadingGames,
  } = useBaseballGames(selectedDate);

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  const openLeagueModal = useCallback(() => {
    setLeagueModalVisible(true);
    sportsModalRef.current?.present();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={league}
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={openLeagueModal}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible, league, openLeagueModal]);

  const handleScoresRefresh = React.useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshGames]);

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
      <View style={styles.container}>
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
          <View key="scores">
            <DateNavigator
              selectedDate={selectedDate}
              onChangeDate={changeDateByDays}
              onOpenCalendar={() => setShowCalendarModal(true)}
              isDark={isDark}
            />

            <GamesList
              games={games}
              error={gamesError}
              loading={loadingGames}
              refreshing={gamesRefreshing}
              onRefresh={handleScoresRefresh}
              scrollEnabled={true}
            />
          </View>

          {/* NEWS */}
          <View key="news" style={styles.contentArea}>
            <NewsList
              items={articles}
              loading={newsLoading}
              error={newsError}
              refreshing={refreshingNews}
              onRefresh={refreshNews}
              isDark={isDark}
            />
          </View>

          {/* STANDINGS */}
          <View key="standings" style={styles.contentArea}>
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={league}
            />
          </View>

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league={league} />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
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
