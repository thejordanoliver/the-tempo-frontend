import { useBaseballGames } from "@/hooks/BaseballHooks/useBaseballGames";
import { isLeague, League, normalizeLeagueParam } from "@/utils/tabs";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

/* -------------------------------------------------------------------------- */
/*                                   Shared                                   */
/* -------------------------------------------------------------------------- */

import CalendarModal from "../../components/CalendarModal";
import { CustomHeader } from "../../components/CustomHeader";
import DateNavigator from "../../components/DateNavigator";
import ForumFeed from "../../components/Forum/ForumFeed";
import NewsList from "../../components/News/NewsList";
import GamesList from "../../components/Sports/Baseball/Games/GamesList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";

import AwardSeasons from "@/components/League/Awards/AwardSeasons";
import { StandingsList } from "@/components/League/Standings/StandingsList";
import { CBStandingsList } from "@/components/Sports/Baseball/Standings/CBStandingsList";
import { getMLBStandingsSeason } from "@/utils/dateUtils";
import SeasonLeadersList from "../../components/Sports/Football/SeasonLeaderList";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useSeasonLeaders } from "../../hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { LeagueScreenStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getLeagueCalendarDateKey } from "../../utils/leagueCalendarCache";

dayjs.extend(utc);
dayjs.extend(timezone);

type SupportedBaseballLeague = Extract<League, "MLB" | "CB" | "SB">;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function isSupportedBaseballLeague(
  league: League,
): league is SupportedBaseballLeague {
  return league === "MLB" || league === "CB" || league === "SB";
}

/* -------------------------------------------------------------------------- */
/*                                 Main Route                                 */
/* -------------------------------------------------------------------------- */

export default function BaseballLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string;
  }>();

  const normalizedLeague = normalizeLeagueParam(params.league);

  const parsedLeague: League = isLeague(normalizedLeague)
    ? normalizedLeague
    : "MLB";

  const league: SupportedBaseballLeague = isSupportedBaseballLeague(
    parsedLeague,
  )
    ? parsedLeague
    : "MLB";

  if (league === "CB") {
    return <CBLeagueScreen />;
  }
  if (league === "SB") {
    return <SBLeagueScreen />;
  }

  return <MLBLeagueScreen />;
}

/* ========================================================================== */
/*                                    MLB                                     */
/* ========================================================================== */

function MLBLeagueScreen() {
  const league = "MLB";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const pagerRef = useRef<PagerView>(null);
  const [standingsYear, setStandingsYear] = useState(getMLBStandingsSeason());
  const navigation = useNavigation();
  const { categories, loading, error } = useSeasonLeaders(2025, league);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);

  const { calendar } = useLeagueCalendar(league);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey =
          getLeagueCalendarDateKey(calendarDate) ??
          dayjs(calendarDate).format("YYYY-MM-DD");

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

  /* ------------------------------------------------------------------------ */
  /*                                   Games                                  */
  /* ------------------------------------------------------------------------ */

  const {
    games,
    error: gamesError,
    refreshGames,
    loading: loadingGames,
  } = useBaseballGames(selectedDate, "mlb");

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader tabName={league} league={league} onBack={goBack} />
      ),
    });
  }, [navigation, league]);

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleScoresRefresh = useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh MLB games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshGames]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

  const handleTabPress = useCallback(
    (tab: (typeof tabs)[number]) => {
      const pageIndex = tabs.indexOf(tab);

      if (pageIndex < 0) {
        return;
      }

      setSelectedTab(tab);
      pagerRef.current?.setPage(pageIndex);
    },
    [setSelectedTab, tabs],
  );

  /* ------------------------------------------------------------------------ */
  /*                                  Pages                                   */
  /* ------------------------------------------------------------------------ */

  const scoresPage = (
    <View key="scores" style={styles.contentArea}>
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
  );

  const newsPage = (
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
  );

  const standingsPage = (
    <View key="standings" style={styles.contentArea}>
      <StandingsList
        year={standingsYear}
        onYearChange={setStandingsYear}
        league={league}
      />
    </View>
  );

  const statsPage = (
    <View key="stats" style={styles.contentArea}>
      <SeasonLeadersList
        loading={loading}
        error={error}
        categories={categories}
        league={league}
      />
    </View>
  );

  const awardsPage = (
    <View key="awards" style={styles.contentArea}>
      <AwardSeasons league={league} />
    </View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      <ForumFeed league={league} />
    </View>
  );

  const pagerPages = [
    scoresPage,
    newsPage,
    standingsPage,
    statsPage,
    awardsPage,
    forumPage,
  ];

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={selectedTab !== "bracket"}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;

            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
          {pagerPages}
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />
    </>
  );
}

/* ========================================================================== */
/*                                    CB                                     */
/* ========================================================================== */

function CBLeagueScreen() {
  const league = "CB";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const pagerRef = useRef<PagerView>(null);
  const navigation = useNavigation();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const { calendar } = useLeagueCalendar(league);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey =
          getLeagueCalendarDateKey(calendarDate) ??
          dayjs(calendarDate).format("YYYY-MM-DD");

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

  /* ------------------------------------------------------------------------ */
  /*                                   Games                                  */
  /* ------------------------------------------------------------------------ */

  const {
    games,
    error: gamesError,
    refreshGames,
    loading: loadingGames,
  } = useBaseballGames(selectedDate, "cb");

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="College Baseball"
          league={league}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, league]);

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleScoresRefresh = useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh CB games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshGames]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

  const handleTabPress = useCallback(
    (tab: (typeof tabs)[number]) => {
      const pageIndex = tabs.indexOf(tab);

      if (pageIndex < 0) {
        return;
      }

      setSelectedTab(tab);
      pagerRef.current?.setPage(pageIndex);
    },
    [setSelectedTab, tabs],
  );

  /* ------------------------------------------------------------------------ */
  /*                                  Pages                                   */
  /* ------------------------------------------------------------------------ */

  const scoresPage = (
    <View key="scores" style={styles.contentArea}>
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
  );

  const newsPage = (
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
  );

  const standingsPage = (
    <View key="standings">
      <CBStandingsList league="cb" />
    </View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      <ForumFeed league={league} />
    </View>
  );

  const pagerPages = [scoresPage, newsPage, standingsPage, forumPage];

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={selectedTab !== "bracket"}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;

            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
          {pagerPages}
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />
    </>
  );
}

/* ========================================================================== */
/*                                    SB                                     */
/* ========================================================================== */

function SBLeagueScreen() {
  const league = "SB";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const pagerRef = useRef<PagerView>(null);
  const navigation = useNavigation();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const { calendar } = useLeagueCalendar(league);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey =
          getLeagueCalendarDateKey(calendarDate) ??
          dayjs(calendarDate).format("YYYY-MM-DD");

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

  /* ------------------------------------------------------------------------ */
  /*                                   Games                                  */
  /* ------------------------------------------------------------------------ */

  const {
    games,
    error: gamesError,
    refreshGames,
    loading: loadingGames,
  } = useBaseballGames(selectedDate, "sb");

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="College Softball"
          league={league}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, league]);

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleScoresRefresh = useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh SB games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshGames]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

  const handleTabPress = useCallback(
    (tab: (typeof tabs)[number]) => {
      const pageIndex = tabs.indexOf(tab);

      if (pageIndex < 0) {
        return;
      }

      setSelectedTab(tab);
      pagerRef.current?.setPage(pageIndex);
    },
    [setSelectedTab, tabs],
  );

  /* ------------------------------------------------------------------------ */
  /*                                  Pages                                   */
  /* ------------------------------------------------------------------------ */

  const scoresPage = (
    <View key="scores" style={styles.contentArea}>
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
  );

  const newsPage = (
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
  );

  const standingsPage = (
    <View key="standings">
      <CBStandingsList league="sb" />
    </View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      <ForumFeed league={league} />
    </View>
  );

  const pagerPages = [scoresPage, newsPage, standingsPage, forumPage];

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={selectedTab !== "bracket"}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;

            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
          {pagerPages}
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />
    </>
  );
}
