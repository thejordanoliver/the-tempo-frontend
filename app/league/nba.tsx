import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import DraftList from "components/League/DraftList";
import SeasonLeadersList from "components/League/SeasonLeadersList";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import NewsList from "components/News/NewsList";
import GamesList from "components/Sports/NBA/Games/GamesList";
import SLGamesList from "components/Sports/NBASummerLeague/Games/SLGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useSeasonGames } from "hooks/NBAHooks/useSeasonGames";
import { useNBASLGames } from "hooks/NBASLHooks/useNBASLGames";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import { useSeasonLeaders } from "hooks/useSeasonLeaders";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getNBACalendarSeason, getNBASeason } from "utils/dateUtils";
import { filterByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function NBALeagueScreen() {
  const currentYear = getNBASeason();

  const {
    games,
    error: errorGames,
    loading: loadingGames,
    refreshGames: refreshGames,
  } = useSeasonGames(currentYear);

  const {
    games: summerGames,
    loading: loadingSummer,
    error: errorSummer,
    refreshSummerGames,
  } = useNBASLGames({ season: currentYear.toString() });

  // Filter both sets by selectedDate
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const filteredSeasonGames = filterByDate(games, selectedDate);
  const filteredSummerGames = filterByDate(summerGames, selectedDate);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);
  const [draftYear, setDraftYear] = useState(dayjs().year().toString());
  const [standingsYear, setStandingsYear] = useState(
    getNBACalendarSeason().toString(),
  );
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");
  const { leaders, loading, error } = useSeasonLeaders();
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("NBA");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, "NBA");

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const stored = await AsyncStorage.getItem("favorites");
          if (stored) setFavorites(JSON.parse(stored));
        } catch (error) {
          console.warn("Failed to load favorites:", error);
        }
      };
      loadFavorites();
    }, []),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="NBA"
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
              league="NBA"
            />
          </ScrollView>

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
              league="nba"
            />
          </View>

          {/* AWARDS */}
          <ScrollView key="awards">
            <AwardSeasons league="NBA" />
          </ScrollView>

          {/* FORUM */}
          <View key="forum">
            <LeagueForum league="NBA" />
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
          ...markDates([...games, ...summerGames]),
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
