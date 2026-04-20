import { useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import NHLGamesList from "components/Sports/NHL/Games/NHLGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { getNHLTeam } from "constants/teamsNHL";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useNHLSeasonGames } from "hooks/NHLHooks/useNHLSeasonGames";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { NHLGame } from "types/hockey";
import { getNHLSeason } from "utils/dateUtils";
import { filterByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { usePreferences } from "contexts/PreferencesContext";
dayjs.extend(utc);
dayjs.extend(timezone);

export default function NHLLeagueScreen() {
  const league = "NHL";
  const currentSeason = getNHLSeason();
  const { categories, loading, error } = useSeasonLeaders(
    Number(getNHLSeason()),
    league,
  );
  const { games, loading: liveLoading } = useNHLSeasonGames(currentSeason);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(currentSeason);
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [refreshing, setRefreshing] = useState(false);
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);

  // Header
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

  // --- Normalize regular season games ---
  const normalizedSeasonGames = games.map((game: NHLGame) => {
    const home = getNHLTeam(game.teams?.home.id ?? {});
    const away = getNHLTeam(game.teams?.away.id ?? {});

    let rawTimestamp: number | null = null;

    if (typeof game.date === "number") {
      rawTimestamp = game.date;
    } else if (typeof game.timestamp === "number") {
      rawTimestamp = game.timestamp;
    }

    const date = rawTimestamp ? dayjs(rawTimestamp * 1000) : dayjs(NaN);

    return {
      ...game,
      date: date.toDate(),
      dateString: date.isValid() ? date.format("YYYY-MM-DD") : "",
      time: date.isValid() ? date.format("h:mm A") : "",
      home,
      away,
    };
  });

  // --- Helper to sort live games on top ---
  const sortLiveGamesFirst = (gamesArray: any[]) =>
    [...gamesArray].sort((a, b) => {
      const aStatus = a.status?.long?.toLowerCase() || "";
      const bStatus = b.status?.long?.toLowerCase() || "";

      if (aStatus === "in play" && bStatus !== "in play") return -1;
      if (aStatus !== "in play" && bStatus === "in play") return 1;

      // Otherwise, sort by date/time
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Filter both sets by selectedDate
  const filteredSeasonGames = sortLiveGamesFirst(
    filterByDate(normalizedSeasonGames, selectedDate),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- Change Date (now local) ---
  const changeDateByDays = (days: number) => {
    setSelectedDate((prev) =>
      dayjs(prev).add(days, "day").startOf("day").toDate(),
    );
  };

  // Helper to mark games on calendar
  const markDates = (gamesArray: any[]) =>
    gamesArray.reduce(
      (acc, game) => {
        const localDate = new Date(game.date);
        const iso = `${localDate.getFullYear()}-${String(
          localDate.getMonth() + 1,
        ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
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

            <NHLGamesList
              games={filteredSeasonGames} // <-- filtered by selectedDate
              loading={liveLoading}
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
          <ScrollView key="standings">
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </ScrollView>

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
          ...markDates([...normalizedSeasonGames]),
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
