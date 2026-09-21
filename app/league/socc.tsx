import { useSoccerGames } from "@/hooks/SoccerHooks/useSoccerGames";
import { useLeagueFavoriteHeader } from "@/hooks/UserHooks/useLeagueFavoriteHeader";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import CalendarModal from "../../components/CalendarModal";
import { CustomHeader } from "../../components/CustomHeader";
import DateNavigator from "../../components/DateNavigator";
import ForumFeed from "../../components/Forum/ForumFeed";

import { usePagerTabScrollProgress } from "@/hooks/usePagerTabScrollProgress";
import NewsList from "../../components/News/NewsList";
import GamesList from "../../components/Sports/Soccer/Games/GamesList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { LeagueScreenStyles } from "../../styles/LeagueStyles/LeagueStyles";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function SoccerLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string;
    leagueLabel?: string;
  }>();

  const league = params.league ?? "mls";
  const favoriteHeaderProps = useLeagueFavoriteHeader(league);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const leagueLabel = params.leagueLabel;

  const { calendar } = useLeagueCalendar(league);

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
    loadingMore: loadingMoreNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10, { enabled: hasVisitedTab("news") });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName={leagueLabel}
          league={leagueLabel}
          onBack={goBack}
          {...favoriteHeaderProps}
        />
      ),
    });
  }, [favoriteHeaderProps, navigation, leagueLabel, league]);

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

          <View key="forum">
            {hasVisitedTab("forum") ? <ForumFeed league={league} /> : null}
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
    </>
  );
}
