import { useBasketballGames } from "@/hooks/BasketballHooks/useBasketballGames";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";

import CalendarModal from "../../components/CalendarModal";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import DateNavigator from "../../components/DateNavigator";
import LeagueForum from "../../components/Forum/LeagueForum";
import AwardSeasons from "../../components/League/Awards/AwardSeasons";
import Draft, {
  getDefaultDraftYear,
} from "../../components/League/Draft/Draft";
import SeasonLeadersList from "../../components/League/SeasonLeadersList";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import { StandingsList } from "../../components/League/Standings/StandingsList";
import NewsList from "../../components/News/NewsList";
import GamesList from "../../components/Sports/NBA/Games/GamesList";
import { NBAPlayoffBracket } from "../../components/Sports/NBA/Playoffs/NBAPlayoffBracket";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useNBAPlayoffGames } from "../../hooks/NBAHooks/useNBAPlayoffGames";
import { useSeasonLeaders } from "../../hooks/NBAHooks/useSeasonLeaders";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getNBACalendarSeason } from "../../utils/dateUtils";
import { getLeagueCalendarDateKey } from "../../utils/leagueCalendarCache";

dayjs.extend(utc);
dayjs.extend(timezone);

const getMonthAnchor = (value: Date | string) => {
  return dayjs(value).startOf("month").format("YYYY-MM-DD");
};

export default function NBALeagueScreen() {
  const league = "NBA";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    dayjs().startOf("day").toDate(),
  );

  /*
   * This date tells the backend which season
   * should be returned.
   */
  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() =>
    getMonthAnchor(new Date()),
  );

  const {
    calendar,
    error: calendarError,
    refresh: refreshCalendar,
  } = useLeagueCalendar(league, "raw", calendarAnchorDate);

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [draftTeam, setDraftTeam] = useState("all");

  const [draftRound, setDraftRound] = useState("all");

  const [draftYear, setDraftYear] = useState(() =>
    getDefaultDraftYear("nba").toString(),
  );

  const [standingsYear, setStandingsYear] = useState(() =>
    getNBACalendarSeason().toString(),
  );

  const selectedSeason = getNBACalendarSeason();

  /*
   * Keep the calendar season synchronized with
   * dates selected using the day navigator.
   */
  useEffect(() => {
    const nextAnchor = getMonthAnchor(selectedDate);

    setCalendarAnchorDate((previousAnchor) =>
      previousAnchor === nextAnchor ? previousAnchor : nextAnchor,
    );
  }, [selectedDate]);

  const {
    games: nbaGames,
    error: nbaGamesError,
    refreshGames: refreshNBAGames,
    loading: loadingNBAGames,
  } = useBasketballGames(selectedDate, "nba");

  const {
    games: summerVegasGames,
    error: summerVegasGamesError,
    refreshGames: refreshSummerVegasGames,
    loading: loadingSummerVegasGames,
  } = useBasketballGames(selectedDate, "summervegas");

  const {
    games: summerUtahGames,
    error: summerUtahGamesError,
    refreshGames: refreshSummerUtahGames,
    loading: loadingSummerUtahGames,
  } = useBasketballGames(selectedDate, "summerutah");

  const {
    games: summerCaliforniaGames,
    error: summerCaliforniaGamesError,
    refreshGames: refreshSummerCaliforniaGames,
    loading: loadingSummerCaliforniaGames,
  } = useBasketballGames(selectedDate, "summercalifornia");

  const combinedGames = useMemo(
    () => [
      ...(nbaGames ?? []),
      ...(summerVegasGames ?? []),
      ...(summerUtahGames ?? []),
      ...(summerCaliforniaGames ?? []),
    ],
    [nbaGames, summerVegasGames, summerUtahGames, summerCaliforniaGames],
  );

  const combinedGamesLoading =
    loadingNBAGames ||
    loadingSummerVegasGames ||
    loadingSummerUtahGames ||
    loadingSummerCaliforniaGames;

  const combinedGamesError =
    nbaGamesError ??
    summerVegasGamesError ??
    summerUtahGamesError ??
    summerCaliforniaGamesError ??
    null;

  const {
    rounds: playoffRounds,
    loading: playoffLoading,
    error: playoffError,
    refreshingGames: refreshingPlayoffGames,
    refreshGames: refreshPlayoffGames,
  } = useNBAPlayoffGames({
    season: selectedSeason,
  });

  const {
    leaders,
    loading: leadersLoading,
    error: leadersError,
  } = useSeasonLeaders();

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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        refreshNBAGames(),
        refreshSummerVegasGames(),
        refreshSummerUtahGames(),
        refreshSummerCaliforniaGames(),
        refreshCalendar(),
      ]);
    } catch (refreshError) {
      console.warn(
        "Failed to refresh one or more basketball game feeds:",
        refreshError,
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshNBAGames,
    refreshSummerVegasGames,
    refreshSummerUtahGames,
    refreshSummerCaliforniaGames,
    refreshCalendar,
  ]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

  const handleCalendarMonthChange = useCallback((anchorDate: string) => {
    setCalendarAnchorDate((previousAnchor) =>
      previousAnchor === anchorDate ? previousAnchor : anchorDate,
    );
  }, []);

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey = getLeagueCalendarDateKey(calendarDate);

        if (!dateKey) {
          return dates;
        }

        dates[dateKey] = {
          marked: true,

          dotColor: isDark ? Colors.white : Colors.black,
        };

        return dates;
      },
      {} as Record<
        string,
        {
          marked: boolean;
          dotColor: string;
        }
      >,
    );
  }, [calendar, isDark]);

  useEffect(() => {
    if (calendarError) {
      console.warn("NBA calendar error:", calendarError);
    }
  }, [calendarError]);

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);

          const pageIndex = tabs.indexOf(tab);

          if (pageIndex >= 0) {
            pagerRef.current?.setPage(pageIndex);
          }
        }}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={styles.contentArea}
          initialPage={0}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;

            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
          <View key="scores">
            <DateNavigator
              selectedDate={selectedDate}
              onChangeDate={changeDateByDays}
              onOpenCalendar={() => setShowCalendarModal(true)}
              isDark={isDark}
            />

            <GamesList
              games={combinedGames}
              error={combinedGamesError}
              loading={combinedGamesLoading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              showHeaders={false}
              scrollEnabled
            />
          </View>

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

          <ScrollView key="standings">
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </ScrollView>

          <View key="playoffs" style={styles.contentArea}>
            <NBAPlayoffBracket
              rounds={playoffRounds}
              loading={playoffLoading}
              error={playoffError}
              refreshing={refreshingPlayoffGames}
              onRefresh={refreshPlayoffGames}
            />
          </View>

          <ScrollView key="stats">
            <SeasonLeadersList
              leadersByStat={leaders}
              loading={leadersLoading}
              error={leadersError}
            />
          </ScrollView>

          <View key="draft">
            <Draft
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league="nba"
            />
          </View>

          <View key="awards">
            <AwardSeasons league={league} />
          </View>

          <View key="forum">
            <LeagueForum league={league} />
          </View>
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onMonthChange={handleCalendarMonthChange}
        onSelectDate={(dateString) => {
          const localSelectedDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(localSelectedDate);

          setCalendarAnchorDate(getMonthAnchor(localSelectedDate));

          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />

      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
