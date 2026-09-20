import dayjs from "dayjs";
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

import { usePagerTabScrollProgress } from "@/hooks/usePagerTabScrollProgress";
import CalendarModal from "components/CalendarModal";
import { CustomHeader } from "components/CustomHeader";
import DateNavigator from "components/DateNavigator";
import ForumFeed from "components/Forum/ForumFeed";
import NewsList from "components/News/NewsList";
import DivisionFilter from "components/Sports/Tennis/DivisionFilter";
import TennisGamesList from "components/Sports/Tennis/Games/GamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useTennisMatches } from "hooks/TennisHooks/useTennisMatches";
import { useLeagueFavoriteHeader } from "hooks/UserHooks/useLeagueFavoriteHeader";
import { LeagueScreenStyles } from "styles/LeagueStyles/LeagueStyles";
import type { TennisDivision, TennisLeague } from "types/tennis/tennis";
import { getLeagueCalendarDateKey } from "utils/leagueCalendarCache";

function normalizeLeague(value?: string | string[]): TennisLeague {
  const league = Array.isArray(value) ? value[0] : value;

  return league?.toLowerCase() === "wta" ? "wta" : "atp";
}

function normalizeDivisionValue(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDefaultDivision(
  divisions: TennisDivision[],
  league: TennisLeague,
): string {
  if (!divisions.length) {
    return "";
  }

  const preferred = league === "wta" ? "womens singles" : "mens singles";

  const preferredDivision = divisions.find((division) => {
    const slug = normalizeDivisionValue(division.slug);
    const name = normalizeDivisionValue(division.name);

    return slug === preferred || name === preferred;
  });

  return preferredDivision?.slug ?? divisions[0].slug;
}

export default function TennisLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string | string[];
  }>();

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);
  const league = normalizeLeague(params.league);

  const navigation = useNavigation();
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

  const favoriteHeaderProps = useLeagueFavoriteHeader(league);
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate(),
  );
  const [calendarAnchor, setCalendarAnchor] = useState(() =>
    dayjs().format("YYYY-MM-DD"),
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("");
  const { calendar } = useLeagueCalendar(league, "raw", calendarAnchor);

  const {
    matches,
    availableDivisions,
    loading,
    refreshing,
    error,
    refreshMatches,
  } = useTennisMatches(selectedDate, league);

  const {
    articles,
    loading: newsLoading,
    refreshing: newsRefreshing,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10, { enabled: hasVisitedTab("news") });

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (cancelled) return;

      if (!availableDivisions.length) {
        return;
      }

      const selectedStillExists = availableDivisions.some(
        (division) => division.slug === selectedDivision,
      );

      if (selectedStillExists) {
        return;
      }

      setSelectedDivision(getDefaultDivision(availableDivisions, league));
    });

    return () => {
      cancelled = true;
    };
  }, [availableDivisions, league, selectedDivision]);

  const visibleMatches = useMemo(() => {
    if (!selectedDivision) {
      return matches;
    }

    return matches.filter((match) => match.division.slug === selectedDivision);
  }, [matches, selectedDivision]);

  const markedDates = useMemo(
    () =>
      calendar.reduce<Record<string, { marked: boolean; dotColor: string }>>(
        (result, value) => {
          if (typeof value !== "string") {
            return result;
          }

          const dateKey = getLeagueCalendarDateKey(value);

          if (dateKey) {
            result[dateKey] = {
              marked: true,
              dotColor: isDark ? Colors.white : Colors.black,
            };
          }

          return result;
        },
        {},
      ),
    [calendar, isDark],
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
  }, [favoriteHeaderProps, league, navigation]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((current) => {
      const nextDate = dayjs(current).add(days, "day").startOf("day");

      setCalendarAnchor(nextDate.format("YYYY-MM-DD"));

      return nextDate.toDate();
    });

    /**
     * Clear the current selection so the preferred singles division
     * is selected again when the new day's divisions load.
     */
    setSelectedDivision("");
  }, []);

  const handleSelectCalendarDate = useCallback((dateString: string) => {
    setSelectedDate(dayjs(dateString).startOf("day").toDate());

    setCalendarAnchor(dateString);

    /**
     * Let availableDivisions resolve the correct Women's/Men's
     * Singles slug for the selected day.
     */
    setSelectedDivision("");

    setShowCalendar(false);
  }, []);

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
            <DateNavigator
              selectedDate={selectedDate}
              onChangeDate={changeDateByDays}
              onOpenCalendar={() => setShowCalendar(true)}
              isDark={isDark}
            />

            <DivisionFilter
              divisions={availableDivisions}
              selected={selectedDivision}
              onSelect={setSelectedDivision}
              isDark={isDark}
              loading={loading}
            />

            <TennisGamesList
              matches={visibleMatches}
              loading={loading}
              refreshing={refreshing}
              onRefresh={refreshMatches}
              error={error}
            />
          </View>

          <View key="news" style={styles.contentArea}>
            {hasVisitedTab("news") ? (
              <NewsList
                items={articles}
                loading={newsLoading}
                error={newsError}
                refreshing={newsRefreshing}
                onRefresh={refreshNews}
                isDark={isDark}
              />
            ) : null}
          </View>

          <View key="forum" style={styles.contentArea}>
            {hasVisitedTab("forum") ? <ForumFeed league={league} /> : null}
          </View>
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendar}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        markedDates={markedDates}
        onClose={() => setShowCalendar(false)}
        onMonthChange={setCalendarAnchor}
        onSelectDate={handleSelectCalendarDate}
      />
    </>
  );
}
