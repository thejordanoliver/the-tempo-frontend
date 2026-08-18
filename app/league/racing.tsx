import EventSelector, {
  getDefaultUFCEventIndex,
} from "@/components/Sports/MMA/EventSelector";
import GamesList from "@/components/Sports/Racing/Games/RacingGamesList";
import { useLeagueCalendar } from "@/hooks/LeagueHooks/useLeagueCalendar";
import { useRacingEvents } from "@/hooks/RacingHooks/useRacingEvents";
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
import { LEAGUE_TABS, League } from "utils/tabs";
import { CustomHeader } from "../../components/CustomHeader";
import Forum from "../../components/Forum/Forum";
import NewsList from "../../components/News/NewsList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { LeagueScreenStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { formatDateToUTCYYYYMMDD } from "../../utils/dateUtils";

function isLeague(value: unknown): value is League {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(LEAGUE_TABS, value) &&
    Array.isArray(LEAGUE_TABS[value as League])
  );
}

function normalizeLeagueParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return String(rawValue || "")
    .trim()
    .toUpperCase();
}

export default function RacingLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string;
  }>();

  const normalizedParamLeague = normalizeLeagueParam(params.league);
  const leagueLabel = params.leagueLabel;

  const league: League = isLeague(normalizedParamLeague)
    ? normalizedParamLeague
    : "F1";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null,
  );

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const { calendar, loading: calendarLoading } = useLeagueCalendar(
    normalizedParamLeague,
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
    league,
    enabled: Boolean(selectedEventDate),
  });

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(normalizedParamLeague, 10);

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
        <CustomHeader tabName="League" league={leagueLabel} onBack={goBack} />
      ),
    });
  }, [navigation, leagueLabel]);

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={(tab) => {
          setSelectedTab(tab);

          const index = tabs.indexOf(tab);

          if (index >= 0) {
            pagerRef.current?.setPage(index);
          }
        }}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(event) => {
            const index = event.nativeEvent.position;
            const nextTab = tabs[index];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
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
            <NewsList
              items={articles}
              loading={newsLoading}
              error={newsError}
              refreshing={refreshingNews}
              onRefresh={refreshNews}
              isDark={isDark}
            />
          </View>

          <View key="forum" style={styles.contentArea}>
            <Forum league={league} />
          </View>
        </PagerView>
      </View>
    </>
  );
}
