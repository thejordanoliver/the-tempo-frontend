import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import { StandingsList } from "components/League/Standings/StandingsList";
import MLBGamesList from "components/Sports/MLB/Games/MLBGamesList";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/Styles";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useMLBSeasonGames } from "hooks/MLBHooks/useMLBSeasonGames";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getMLBSeason, getMLBStandingsSeason } from "utils/dateUtils";
import { filterMLBByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function MLBLeagueScreen() {
  const {
    games,
    loading: liveLoading,
    refreshGames,
  } = useMLBSeasonGames(getMLBSeason().toString());

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);

  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [standingsYear, setStandingsYear] = useState(getMLBStandingsSeason());

  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const { categories, loading, error } = useSeasonLeaders(2025, "MLB");

  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );

  const [selectedTab, setSelectedTab] = useState<
    "scores" | "news" | "standings" | "stats" | "draft" | "awards" | "forum"
  >("scores");

  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    "scores",
    "news",
    "standings",
    "stats",
    "draft",
    "awards",
    "forum",
  ] as const;

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
          league="MLB"
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

  const filteredSeasonGames = filterMLBByDate(games, selectedDate);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGames();
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
        if (!game.date) return acc;

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
          <View key="scores" style={styles.contentArea}>
            <DateNavigator
              selectedDate={selectedDate}
              onChangeDate={changeDateByDays}
              onOpenCalendar={() => setShowCalendarModal(true)}
              isDark={isDark}
            />

            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            >
              {filteredSeasonGames.length > 0 && (
                <MLBGamesList
                  games={filteredSeasonGames}
                  loading={liveLoading}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={false}
                />
              )}
            </ScrollView>
          </View>

          {/* NEWS */}
          <View key="news" style={styles.contentArea}>
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
            />
          </View>

          {/* STANDINGS */}
          <View key="standings" style={styles.contentArea}>
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league="MLB"
            />
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={"MLB"}
              isDark={isDark}
            />
          </View>

          {/* DRAFT */}
          <View key="draft" style={styles.contentArea} />

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league="MLB" />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <LeagueForum league="MLB" />
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
          ...markDates([...games]),
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
