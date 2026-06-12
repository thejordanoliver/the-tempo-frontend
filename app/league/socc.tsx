import { useSoccerGames } from "@/hooks/SoccerHooks/useSoccerGames";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { LEAGUE_TABS, League } from "utils/tabs";
import CalendarModal from "../../components/CalendarModal";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import DateNavigator from "../../components/DateNavigator";
import LeagueForum from "../../components/Forum/LeagueForum";
import SportsListModal, {
  SportsListModalRef,
} from "../../components/League/SportsListModal";
import NewsList from "../../components/News/NewsList";
import GamesList from "../../components/Sports/Soccer/Games/GamesList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";

dayjs.extend(utc);
dayjs.extend(timezone);

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

export default function SoccerLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string;
  }>();

  const normalizedParamLeague = normalizeLeagueParam(params.league);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);

  const league: League = isLeague(normalizedParamLeague)
    ? normalizedParamLeague
    : "EPL";

  const leagueLabel = params.leagueLabel;


  const { calendar } = useLeagueCalendar(league);

  const sportsModalRef = useRef<SportsListModalRef>(null);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [selectedDate, setSelectedDate] = React.useState<Date>(
    dayjs().startOf("day").toDate(),
  );

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
  const {
    games,
    error: gamesError,
    refreshGames: refreshScoreGames,
    loading: loadingGames,
  } = useSoccerGames(selectedDate, league);

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  const openLeagueModal = useCallback(() => {
    setLeagueModalVisible(true);
    sportsModalRef.current?.present();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={leagueLabel}
          modalVisible={leagueModalVisible}
          setModalVisible={setLeagueModalVisible}
          onOpenLeagueModal={openLeagueModal}
          onBack={goBack}
        />
      ),
    });
  }, [navigation, leagueModalVisible, leagueLabel, openLeagueModal]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await refreshScoreGames();
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
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
          style={styles.contentArea}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            const nextTab = tabs[index];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
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
              refreshing={refreshing}
              onRefresh={handleRefresh}
              scrollEnabled={true}
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

          <View key="standings" />

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
          ...markDates([...calendar]),
        }}
      />
      <SportsListModal
        ref={sportsModalRef}
        onSelect={() => {}}
        onOpen={() => setLeagueModalVisible(true)}
        onClose={() => setLeagueModalVisible(false)}
      />
    </>
  );
}
