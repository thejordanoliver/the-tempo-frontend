// app/league/cbb.tsx (WOMEN)

import { useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/Awards/AwardSeasons";
import NewsList from "components/News/NewsList";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import { CBBStandingsList } from "components/Sports/CBB/Standings/CBBStandingsList";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "components/Sports/CFB/ConferenceListModal";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { Colors } from "constants/styles";
import { getCBBTeam } from "constants/teamsCBB";
import { usePreferences } from "contexts/PreferencesContext";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useSeasonLeaders } from "hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { filterBasketballGames, useAPTop25 } from "utils/CBBUtils/cbbGameUtils";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function WCBBLeagueScreen() {
  const league = "WCBB";
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);
  const [selectedConference, setSelectedConference] =
    useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { categories, loading, error } = useSeasonLeaders(2026, league);

  const {
    games: seasonGames,
    loading: cbbloading,
    refreshBasketballGames,
  } = useCBBSeasonGames({ isWomen: true });
  const { calendar } = useLeagueCalendar(league);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshBasketballGames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, league);
  /* -------------------------------
     WOMEN’S AP TOP 25 (FIXED)
  -------------------------------- */
  const apTop25 = useAPTop25(league);
  const top25Teams = useMemo(
    () => apTop25.map((t) => String(t?.id)),
    [apTop25],
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
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConference}
        />
      ),
    });
  }, [navigation, selectedConference, isDropdownOpen]);

  /* -------------------------------
     FILTERED GAMES (FIXED)
  -------------------------------- */
  const filteredGames = useMemo(() => {
    const gamesForDate = seasonGames.filter((game) =>
      dayjs.utc(game.date).local().isSame(dayjs(selectedDate), "day"),
    );

    let result = gamesForDate;

    if (selectedConference === "Top 25") {
      result = gamesForDate.filter((game) => {
        const home = getCBBTeam(game.teams.home.id, true);
        const away = getCBBTeam(game.teams.away.id, true);
        const homeESPN = home?.espnID;
        const awayESPN = away?.espnID;

        return (
          (homeESPN && top25Teams.includes(String(homeESPN))) ||
          (awayESPN && top25Teams.includes(String(awayESPN)))
        );
      });
    } else if (selectedConference) {
      result = filterBasketballGames({
        games: gamesForDate,
        selectedConference,
        top25Teams,
      });
    }

    return result;
  }, [seasonGames, selectedDate, selectedConference, top25Teams]);

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

            <CBBGamesList
              games={filteredGames}
              loading={cbbloading}
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
          <View key="standings">
            <>
              {selectedConference === "Top 25" || !selectedConference ? (
                <CBBStandingsList league="CBB" />
              ) : (
                <CBBConferenceStandingsList
                  selectedConference={selectedConference}
                />
              )}
            </>
          </View>

          {/* STATS */}
          <View key="stats">
            <SeasonLeadersList
              loading={loading}
              error={error}
              categories={categories}
              league={league}
              isDark={isDark}
            />
          </View>

          {/* Bracket */}
          <View key="bracket"></View>

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
          ...markDates([...calendar]),
        }}
      />
      <ConferenceListModal
        ref={conferenceModalRef}
        league="cbb"
        onSelect={(conf) => setSelectedConference(conf ?? "Top 25")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
      />
    </>
  );
}
