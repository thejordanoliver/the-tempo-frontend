// app/league/wnba.tsx

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
import WNBAGamesList from "components/Sports/WNBA/Games/WNBAGamesList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import { useWNBASeasonGames } from "hooks/WNBAHooks/useWNBASeasonGames";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { getWNBASeason } from "utils/dateUtils";
import { filterByDate } from "utils/games";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import { usePreferences } from "contexts/PreferencesContext";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function WNBALeagueScreen() {
  const league = "WNBA";
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const pagerRef = useRef<PagerView>(null);
  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    dayjs().startOf("day").toDate(),
  );
  const [standingsYear, setStandingsYear] = useState(
    getWNBASeason().toString(),
  );
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);

  const {
    games,
    loading: wnbaGamesLoading,
    refreshGames,
  } = useWNBASeasonGames({ season: getWNBASeason() });
  const filteredSeasonGames = filterByDate(games, selectedDate);

  const changeDateByDays = (days: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshGames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
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
  /* -------------------------------
     HEADER
  -------------------------------- */
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

  /* -------------------------------
     RENDER
  -------------------------------- */
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

            <WNBAGamesList
              games={filteredSeasonGames}
              loading={wnbaGamesLoading}
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
          <View key="standings" style={styles.contentArea}>
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
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
