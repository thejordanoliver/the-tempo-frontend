import LeagueForum from "@/components/Forum/LeagueForum";
import WeekSelector, {
  FootballWeekGroup,
} from "@/components/League/WeekSelector";
import { useFootballGames } from "@/hooks/FootballHooks/useFootballGames";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import { StandingsList } from "../../components/League/Standings/StandingsList";
import NewsList from "../../components/News/NewsList";
import FootballGamesList from "../../components/Sports/Football/Games/FootballGamesList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getFootballSeason } from "../../utils/dateUtils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function NFLLeagueScreen() {
  const league = "UFL";
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const currentSeason = getFootballSeason();
  const navigation = useNavigation();
  const styles = getScoresStyles(isDark);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [screenRefreshing, setScreenRefreshing] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [standingsYear, setStandingsYear] = useState(currentSeason.toString());
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const { calendar } = useLeagueCalendar(league, "football");

  const getSeasonTypeFromStage = (stage?: string) => {
    const normalizedStage = String(stage || "").toLowerCase();

    if (normalizedStage.includes("preseason")) return 1;
    if (normalizedStage.includes("postseason")) return 3;
    if (normalizedStage.includes("playoff")) return 3;

    return 2; // regular season
  };

  const getSeasonSlugFromStage = (stage?: string) => {
    const normalizedStage = String(stage || "").toLowerCase();

    if (normalizedStage.includes("preseason")) return "pre-season";
    if (normalizedStage.includes("postseason")) return "post-season";
    if (normalizedStage.includes("playoff")) return "post-season";

    return "regular-season";
  };

  const weekGroups: FootballWeekGroup[] = useMemo(() => {
    if (!calendar?.length) return [];

    return calendar
      .filter((week) => week.stage !== "Off Season")
      .map((week, index) => {
        const seasonType = getSeasonTypeFromStage(week.stage);
        const seasonSlug = getSeasonSlugFromStage(week.stage);

        return {
          key: `${seasonSlug}-week-${week.weekNumber}-${index}`,
          label: week.label || `Week ${week.weekNumber}`,
          season: {
            year: currentSeason,
            type: seasonType,
            slug: seasonSlug,
          },
          week: {
            number: week.weekNumber,
          },
          count: 0,
          games: [],
        };
      });
  }, [calendar, currentSeason]);

  const selectedWeekNumber = weekGroups[selectedWeekIndex]?.week.number ?? 1;

  const {
    games: selectedWeekGames,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    refreshGames,
  } = useFootballGames({
    league: "ufl",
    season: currentSeason,
    week: selectedWeekNumber,
    seasontype: weekGroups[selectedWeekIndex]?.season.type ?? 2,
  });

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  useEffect(() => {
    if (!weekGroups.length) {
      setSelectedWeekIndex(0);
      return;
    }

    setSelectedWeekIndex((currentIndex) => {
      if (currentIndex >= weekGroups.length) return 0;
      return currentIndex;
    });
  }, [weekGroups.length]);

  useEffect(() => {
    if (!calendar?.length || !weekGroups.length) return;

    const now = dayjs();

    const activeCalendarWeek = calendar.find(
      (week) =>
        week.stage !== "Off Season" &&
        dayjs(now).isBetween(week.startDate, week.endDate, null, "[]"),
    );

    if (!activeCalendarWeek) return;

    const activeSeasonType = getSeasonTypeFromStage(activeCalendarWeek.stage);

    const matchingGroupIndex = weekGroups.findIndex((group) => {
      return (
        group.week.number === activeCalendarWeek.weekNumber &&
        group.season.type === activeSeasonType
      );
    });

    if (matchingGroupIndex !== -1) {
      setSelectedWeekIndex(matchingGroupIndex);
    }
  }, [calendar, weekGroups]);

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
    setScreenRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setScreenRefreshing(false);
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
          onPageSelected={(event) => {
            const index = event.nativeEvent.position;
            setSelectedTab(tabs[index]);
          }}
        >
          <View key="scores" style={styles.contentArea}>
            <WeekSelector
              groups={weekGroups}
              loading={gamesLoading}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={setSelectedWeekIndex}
              isDark={isDark}
            />

            <FootballGamesList
              games={selectedWeekGames}
              loading={gamesLoading}
              refreshing={screenRefreshing || gamesRefreshing}
              onRefresh={handleRefresh}
              isNFL={false}
              isCFB={false}
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

          <View key="standings" style={styles.contentArea}>
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </View>

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
