// app/league/cbb.tsx
import { useNavigation } from "@react-navigation/native";
import CalendarModal from "components/CalendarModal";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
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
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useCBBTournamentGames } from "hooks/CBBHooks/useCBBTournamentGames";
import { useLeaguesNews } from "hooks/NewsHooks/useLeaguesNews";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { filterCBBGames, useAPTop25 } from "utils/CBBUtils/cbbGameUtils";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function CBBLeagueScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);
  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const [selectedConference, setSelectedConference] =
    useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    games: seasonGames,
    loading: cbbloading,
    refreshCBBGames,
  } = useCBBSeasonGames();
  const tournamentFilter = useCBBTournamentGames();
  const {
    articles,
    loading: newsLoading,
    error: newsError,
  } = useLeaguesNews(10, "CBB");
  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("CBB");
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const apTop25 = useAPTop25("CBB");
  const top25Teams = apTop25.map((t) => String(t?.id));
  const { categories, loading, error } = useSeasonLeaders(2026, "CBB");

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="CBB"
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConference ?? undefined}
        />
      ),
    });
  }, [navigation, selectedConference, isDropdownOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshCBBGames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const changeDateByDays = (days: number) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  };

  const markDates = (gamesArray: any[]) =>
    gamesArray.reduce((acc, game) => {
      const d = dayjs.utc(game).local();
      const iso = d.format("YYYY-MM-DD");
      acc[iso] = {
        marked: true,
        dotColor: isDark ? Colors.white : Colors.black,
      };
      return acc;
    }, {});

  const filteredGames = React.useMemo(() => {
    const gamesForDate = seasonGames.filter((game) =>
      dayjs.utc(game.date).local().isSame(dayjs(selectedDate), "day"),
    );

    let result = gamesForDate;

    if (selectedConference === "Top 25") {
      result = gamesForDate.filter((game) => {
        const home = getCBBTeam(game?.teams?.home?.id, false);
        const away = getCBBTeam(game?.teams?.away?.id, false);
        const homeESPN = home?.espnID;
        const awayESPN = away?.espnID;

        return (
          (homeESPN && top25Teams.includes(String(homeESPN))) ||
          (awayESPN && top25Teams.includes(String(awayESPN)))
        );
      });
    }
    if (selectedConference === "NCAA Tournament") {
      result = gamesForDate.filter((game) => {
        const home = getCBBTeam(game?.teams?.home?.id, false);
        const away = getCBBTeam(game?.teams?.away?.id, false);
        const homeESPN = home?.espnID;
        const awayESPN = away?.espnID;
        const seasonStage =
          tournamentFilter?.games[0]?.competitions[0]?.tournamentId === 22;

        return (seasonStage && homeESPN) || (seasonStage && awayESPN);
      });
    } else if (selectedConference) {
      result = filterCBBGames({
        games: gamesForDate,
        selectedConference,
        top25Teams,
      });
    }

    return result;
  }, [seasonGames, selectedDate, selectedConference, top25Teams]);

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
              {selectedConference === "Top 25" ||
              selectedConference === "NCAA Tournament" ||
              !selectedConference ? (
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
              league={"CBB"}
              isDark={isDark}
            />
          </View>

          {/* Bracket */}
          <View key="bracket"></View>

          {/* AWARDS */}
          <ScrollView key="awards">
            <AwardSeasons league="CBB" />
          </ScrollView>

          {/* FORUM */}
          <View key="forum">
            <LeagueForum league="CBB" />
          </View>
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const [year, month, day] = dateString.split("-").map(Number);
          setSelectedDate(new Date(year, month - 1, day));
          setShowCalendarModal(false);
        }}
        markedDates={{
          ...markDates(seasonGames.map((g) => g.date)),
        }}
      />

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conf) => setSelectedConference(conf ?? "")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
        league="cbb"
      />
    </>
  );
}
