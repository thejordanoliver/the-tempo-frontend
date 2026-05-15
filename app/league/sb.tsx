import { useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import SportsListModal, {
  SportsListModalRef,
} from "components/League/SportsListModal";
import NewsList from "components/News/NewsList";
import GamesList from "components/Sports/CB/Games/GamesList";
import { CBStandingsList } from "components/Sports/CB/Standings/CBStandingsList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBDailyGames } from "hooks/CBHooks/useCBDailyGames";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function SBLeagueScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const league = "SB" as const;

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);
  const sportsModalRef = useRef<SportsListModalRef>(null);

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const { calendar } = useLeagueCalendar(league);

  const {
    games,
    error: gamesError,
    refreshGames,
    loading: loadingGames,
  } = useCBDailyGames(selectedDate, "sb");

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(10, league);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={"College Softball" as "SB"}
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

  const handleScoresRefresh = useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshGames]);

  const handleNewsRefresh = useCallback(async () => {
    setNewsRefreshing(true);

    try {
      await refreshNews();
    } catch (error) {
      console.warn("Failed to refresh news:", error);
    } finally {
      setNewsRefreshing(false);
    }
  }, [refreshNews]);

  const changeDateByDays = (days: number) => {
    setSelectedDate((prev) =>
      dayjs(prev).add(days, "day").startOf("day").toDate(),
    );
  };

  const markDates = (calendarArray: string[]) =>
    calendarArray.reduce(
      (acc, dateStr) => {
        const iso = dayjs(dateStr).format("YYYY-MM-DD");

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
          style={styles.contentArea}
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

            <GamesList
              games={games}
              error={gamesError}
              loading={loadingGames}
              refreshing={gamesRefreshing}
              onRefresh={handleScoresRefresh}
              scrollEnabled={true}
              isWomens={true}
            />
          </View>

          {/* NEWS */}
          <View key="news" style={styles.contentArea}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={newsRefreshing}
                  onRefresh={handleNewsRefresh}
                  tintColor={isDark ? Colors.white : Colors.black}
                />
              }
            >
              <NewsList
                items={articles}
                isDark={isDark}
                loading={newsLoading}
                error={newsError}
                refreshing={newsRefreshing}
                onRefresh={handleNewsRefresh}
              />
            </ScrollView>
          </View>

          {/* STANDINGS */}
          <View key="standings">
            <CBStandingsList league="sb" />
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
          ...markDates([...calendar]),
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