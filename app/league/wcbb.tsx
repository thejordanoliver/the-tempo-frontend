// app/league/cbb.tsx (WOMEN)

import { useNavigation } from "@react-navigation/native";
import DateNavigator from "components/DateNavigator";
import LeagueForum from "components/Forum/LeagueForum";
import AwardSeasons from "components/League/AwardSeasons";
import CBBGamesList from "components/Sports/CBB/Games/CBBGamesList";
import { CBBConferenceStandingsList } from "components/Sports/CBB/Standings/CBBConferenceStandingsList";
import { CBBStandingsList } from "components/Sports/CBB/Standings/CBBStandingsList";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "components/Sports/CFB/ConferenceListModal";
import SeasonLeadersList from "components/Sports/NFL/SeasonLeaderList";
import MainScrollTabBar from "components/TabBars/MainTabScrollBar";
import { getTeamInfo } from "constants/teamsCBB";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import { useCBBSeasonGames } from "hooks/CBBHooks/useCBBSeasonGames";
import { useSeasonLeaders } from "hooks/NFLHooks/useSeasonLeaders";
import { useLeagueTabs } from "hooks/useLeagueTabs";
import * as React from "react";
import { ScrollView, useColorScheme, View } from "react-native";
import PagerView from "react-native-pager-view";
import { getScoresStyles } from "styles/LeagueStyles/LeagueStyles";
import { filterCBBGames, useAPTop25 } from "utils/CBBUtils/cbbGameUtils";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default function WCBBLeagueScreen() {
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const styles = getScoresStyles(isDark);

  const conferenceModalRef = React.useRef<ConferenceListModalRef>(null);
  const pagerRef = React.useRef<PagerView>(null);
  const [selectedConference, setSelectedConference] =
    React.useState<string>("Top 25");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs("WCBB");
  const [refreshing, setRefreshing] = React.useState(false);
  const [showCalendarModal, setShowCalendarModal] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const { categories, loading, error } = useSeasonLeaders(2026, "WCBB");

  const {
    games: seasonGames,
    loading: cbbloading,
    refreshCBBGames,
  } = useCBBSeasonGames({ isWomen: true });

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
      await Promise.all([refreshCBBGames()]);
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------------------
     WOMEN’S AP TOP 25 (FIXED)
  -------------------------------- */
  const apTop25 = useAPTop25("WCBB");
  const top25Teams = React.useMemo(
    () => apTop25.map((t) => String(t?.id)),
    [apTop25],
  );

  /* -------------------------------
     HEADER
  -------------------------------- */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league="WCBB"
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
  const filteredGames = React.useMemo(() => {
    const gamesForDate = seasonGames.filter((game) =>
      dayjs.utc(game.date).local().isSame(dayjs(selectedDate), "day"),
    );

    let result = gamesForDate;

    if (selectedConference === "Top 25") {
      result = gamesForDate.filter((game) => {
        const home = getTeamInfo(game.teams.home.id, true);
        const away = getTeamInfo(game.teams.away.id, true);
        const homeESPN = home?.espnID;
        const awayESPN = away?.espnID;

        return (
          (homeESPN && top25Teams.includes(String(homeESPN))) ||
          (awayESPN && top25Teams.includes(String(awayESPN)))
        );
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
          <ScrollView key="news" />

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
              league={"WCBB"}
            />
          </View>

          {/* Bracket */}
          <View key="bracket"></View>

          {/* AWARDS */}
          <ScrollView key="awards">
            <AwardSeasons league="WCBB" />
          </ScrollView>

          {/* FORUM */}
          <View key="forum">
            <LeagueForum league="WCBB" />
          </View>
        </PagerView>
      </View>

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
