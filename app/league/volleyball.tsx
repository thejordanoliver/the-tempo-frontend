import GamesList from "@/components/Sports/Volleyball/VolleyballGamesList";
import MainScrollTabBar from "@/components/TabBars/MainTabScrollBar";
import { Colors } from "@/constants/styles";
import { usePagerTabScrollProgress } from "@/hooks/usePagerTabScrollProgress";
import { useVolleyballGames } from "@/hooks/VolleyballHooks/useVolleyball";
import { LeagueScreenStyles } from "@/styles/LeagueStyles/LeagueStyles";
import {
  isLeague,
  League,
  normalizeLeagueParam,
} from "@/utils/navigation/tabs";
import { getLeagueCalendarDateKey } from "@/utils/teams/leagueCalendarCache";
import CalendarModal from "components/CalendarModal";
import { CustomHeader } from "components/CustomHeader";
import DateNavigator from "components/DateNavigator";
import ForumFeed from "components/Forum/ForumFeed";
import NewsList from "components/News/NewsList";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/router";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useScoreboardCalendar } from "hooks/LeagueHooks/useScoreboardCalendar";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLeagueFavoriteHeader } from "hooks/UserHooks/useLeagueFavoriteHeader";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

dayjs.extend(utc);
dayjs.extend(timezone);

type SupportedVolleyballLeague = Extract<League, "mcvb" | "wcvb">;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function isSupportedVolleyballLeague(
  league: League,
): league is SupportedVolleyballLeague {
  return league === "mcvb" || league === "wcvb";
}

/* -------------------------------------------------------------------------- */
/*                                 Main Route                                 */
/* -------------------------------------------------------------------------- */

export default function VolleyballLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string;
  }>();

  const normalizedLeague = normalizeLeagueParam(params.league);

  const parsedLeague: League = isLeague(normalizedLeague)
    ? normalizedLeague
    : "mcvb";

  const league: SupportedVolleyballLeague = isSupportedVolleyballLeague(
    parsedLeague,
  )
    ? parsedLeague
    : "mcvb";

  if (league === "mcvb") {
    return <MCVBLeagueScreen />;
  }
  if (league === "wcvb") {
    return <WCVBLeagueScreen />;
  }

  return <MCVBLeagueScreen />;
}

/* ========================================================================== */
/*                                    MCVB                                     */
/* ========================================================================== */

function MCVBLeagueScreen() {
  const league = "mcvb";
  const favoriteHeaderProps = useLeagueFavoriteHeader(league);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const navigation = useNavigation();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const { scoreboardCalendar, onScoreboardCalendar } =
    useScoreboardCalendar(league);
  const { calendar } = useLeagueCalendar(
    league,
    "raw",
    undefined,
    scoreboardCalendar,
  );
  const { tabs, selectedTab, setSelectedTab, hasVisitedTab } =
    useLeagueTabs(league);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const pagerRef = useRef<PagerView>(null);
  const { scrollProgress, handlePageScroll, syncPageScrollProgress } =
    usePagerTabScrollProgress();
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const handlePageChange = (index: number) => {
    syncPageScrollProgress(index);
    setSelectedTab(indexToTab(index));
  };

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
  } = useVolleyballGames(selectedDate, league, onScoreboardCalendar);

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10, { enabled: hasVisitedTab("news") });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Men's College Volleyball"
          league={league}
          onBack={goBack}
          {...favoriteHeaderProps}
        />
      ),
    });
  }, [favoriteHeaderProps, navigation, league]);

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
        isMCVB={true}
      />
    </View>
  );

  const newsPage = (
    <View key="news" style={styles.contentArea}>
      {hasVisitedTab("news") ? (
        <NewsList
          items={articles}
          loading={newsLoading}
          error={newsError}
          refreshing={refreshingNews}
          loadingMore={loadingMoreNews}
          onRefresh={refreshNews}
          isDark={isDark}
        />
      ) : null}
    </View>
  );

  const standingsPage = (
    <View key="standings">{hasVisitedTab("standings") ? null : null}</View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      {hasVisitedTab("forum") ? <ForumFeed league={league} /> : null}
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
        scrollProgress={scrollProgress}
      />

      <View style={styles.container}>
        <PagerView
          key={league}
          ref={pagerRef}
          style={styles.container}
          initialPage={tabToIndex(selectedTab)}
          onPageScroll={handlePageScroll}
          onPageSelected={(event) =>
            handlePageChange(event.nativeEvent.position)
          }
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
/*                                    WCVB                                     */
/* ========================================================================== */

function WCVBLeagueScreen() {
  const league = "wcvb";
  const favoriteHeaderProps = useLeagueFavoriteHeader(league);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const navigation = useNavigation();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const { scoreboardCalendar, onScoreboardCalendar } =
    useScoreboardCalendar(league);
  const { calendar } = useLeagueCalendar(
    league,
    "raw",
    undefined,
    scoreboardCalendar,
  );
  const { tabs, selectedTab, setSelectedTab, hasVisitedTab } =
    useLeagueTabs(league);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const pagerRef = useRef<PagerView>(null);
  const { scrollProgress, handlePageScroll, syncPageScrollProgress } =
    usePagerTabScrollProgress();
  const tabToIndex = (tab: (typeof tabs)[number]) => tabs.indexOf(tab);
  const indexToTab = (index: number) => tabs[index];
  const handleTabPress = (tab: (typeof tabs)[number]) => {
    setSelectedTab(tab);
    pagerRef.current?.setPage(tabToIndex(tab));
  };
  const handlePageChange = (index: number) => {
    syncPageScrollProgress(index);
    setSelectedTab(indexToTab(index));
  };

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
  } = useVolleyballGames(selectedDate, league, onScoreboardCalendar);

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10, { enabled: hasVisitedTab("news") });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="Women's College Volleyball"
          league={league}
          onBack={goBack}
          {...favoriteHeaderProps}
        />
      ),
    });
  }, [favoriteHeaderProps, navigation, league]);

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
        isWCVB={true}
      />
    </View>
  );

  const newsPage = (
    <View key="news" style={styles.contentArea}>
      {hasVisitedTab("news") ? (
        <NewsList
          items={articles}
          loading={newsLoading}
          error={newsError}
          refreshing={refreshingNews}
          loadingMore={loadingMoreNews}
          onRefresh={refreshNews}
          isDark={isDark}
        />
      ) : null}
    </View>
  );

  const standingsPage = (
    <View key="standings">{hasVisitedTab("standings") ? null : null}</View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      {hasVisitedTab("forum") ? <ForumFeed league={league} /> : null}
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
        scrollProgress={scrollProgress}
      />

      <View style={styles.container}>
        <PagerView
          key={league}
          ref={pagerRef}
          style={styles.container}
          initialPage={tabToIndex(selectedTab)}
          onPageScroll={handlePageScroll}
          onPageSelected={(event) =>
            handlePageChange(event.nativeEvent.position)
          }
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
