import EventSelector, {
  getDefaultUFCEventIndex,
} from "@/components/Sports/MMA/EventSelector";
import GamesList from "@/components/Sports/Racing/Games/RacingGamesList";
import { useLeagueCalendar } from "@/hooks/LeagueHooks/useLeagueCalendar";
import { useRacingEvents } from "@/hooks/RacingHooks/useRacingEvents";
import { usePagerTabScrollProgress } from "@/hooks/usePagerTabScrollProgress";
import { useLeagueFavoriteHeader } from "@/hooks/UserHooks/useLeagueFavoriteHeader";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeader } from "../../components/CustomHeader";
import ForumFeed from "../../components/Forum/ForumFeed";
import NewsList from "../../components/News/NewsList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { LeagueScreenStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { formatDateToUTCYYYYMMDD } from "../../utils/dateUtils";

export default function RacingLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string;
    leagueLabel?: string;
  }>();

  const league = params.league ?? "f1";
  const favoriteHeaderProps = useLeagueFavoriteHeader(league);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const navigation = useNavigation();
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null,
  );
  const { tabs, selectedTab, setSelectedTab, hasVisitedTab } =
    useLeagueTabs(league);
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

  const { calendar, loading: calendarLoading } = useLeagueCalendar(
    league,
    "racing",
  );

  const sortedCalendar = useMemo(() => {
    return [...(calendar ?? [])].sort((a, b) => {
      const aDate = new Date(a.startDate).getTime();
      const bDate = new Date(b.startDate).getTime();

      return aDate - bDate;
    });
  }, [calendar]);

  const defaultEventIndex = useMemo(() => {
    if (!sortedCalendar.length) {
      return 0;
    }

    return getDefaultUFCEventIndex(sortedCalendar);
  }, [sortedCalendar]);

  /*
   * Set the initial event once the calendar becomes available.
   *
   * This avoids relying on a computed fallback index indefinitely.
   */
  useEffect(() => {
    if (!sortedCalendar.length) {
      return;
    }
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setSelectedEventIndex((currentIndex) => {
        if (
          currentIndex !== null &&
          currentIndex >= 0 &&
          currentIndex < sortedCalendar.length
        ) {
          return currentIndex;
        }
        return defaultEventIndex;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [defaultEventIndex, sortedCalendar.length]);

  const safeSelectedEventIndex = useMemo(() => {
    if (!sortedCalendar.length) {
      return 0;
    }

    const index = selectedEventIndex ?? defaultEventIndex;

    return Math.min(Math.max(index, 0), sortedCalendar.length - 1);
  }, [defaultEventIndex, selectedEventIndex, sortedCalendar.length]);

  const selectedEvent = useMemo(() => {
    return sortedCalendar[safeSelectedEventIndex] ?? null;
  }, [safeSelectedEventIndex, sortedCalendar]);

  const selectedEventDate = useMemo(() => {
    return formatDateToUTCYYYYMMDD(selectedEvent?.startDate);
  }, [selectedEvent?.startDate]);

  const {
    games,
    loading: loadingGames,
    refreshing: gamesRefreshing,
    refreshGames: handleScoresRefresh,
    error: gamesError,
  } = useRacingEvents({
    date: selectedEventDate,
    league: league,
    enabled: Boolean(selectedEventDate),
  });

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    loadingMore: loadingMoreNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10, { enabled: hasVisitedTab("news") });

  const handleSelectEvent = useCallback(
    (index: number) => {
      if (!Number.isInteger(index)) {
        console.warn("EventSelector returned an invalid index:", index);
        return;
      }

      if (index < 0 || index >= sortedCalendar.length) {
        console.warn("EventSelector index is outside the calendar:", index);
        return;
      }

      setSelectedEventIndex(index);
    },
    [sortedCalendar.length],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName={league.toUpperCase()}
          league={league}
          onBack={goBack}
          {...favoriteHeaderProps}
        />
      ),
    });
  }, [favoriteHeaderProps, navigation, league]);

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
          <View key="scores" style={styles.contentArea}>
            <EventSelector
              events={sortedCalendar}
              loading={calendarLoading}
              selectedEventIndex={safeSelectedEventIndex}
              onSelectEvent={handleSelectEvent}
              isDark={isDark}
            />

            <GamesList
              games={games ?? []}
              error={gamesError}
              loading={loadingGames}
              refreshing={gamesRefreshing}
              onRefresh={handleScoresRefresh}
              scrollEnabled
            />
          </View>

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

          <View key="standings" />

          <View key="forum" style={styles.contentArea}>
            {hasVisitedTab("forum") ? <ForumFeed league={league} /> : null}
          </View>
        </PagerView>
      </View>
    </>
  );
}
