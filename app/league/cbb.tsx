// app/league/cbb.tsx
import ConferenceListModal, {
  ConferenceListModalRef,
} from "@/components/Sports/Basketball/ConferenceListModal";
import { CBBConferenceStandingsList } from "@/components/Sports/Basketball/Standings/CBBConferenceStandingsList";
import { cbbConferences } from "@/constants/cbbConferences";
import { useBasketballGames } from "@/hooks/BasketballHooks/useBasketballGames";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import CalendarModal from "../../components/CalendarModal";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import DateNavigator from "../../components/DateNavigator";
import LeagueForum from "../../components/Forum/LeagueForum";
import AwardSeasons from "../../components/League/Awards/AwardSeasons";
import RecruitsList from "../../components/League/Recruiting/CBB/RecruitsList";
import NewsList from "../../components/News/NewsList";
import BasketballGamesList from "../../components/Sports/Basketball/Games/GamesList";
import { CBBStandingsList } from "../../components/Sports/Basketball/Standings/CBBStandingsList";
import SeasonLeadersList from "../../components/Sports/Football/SeasonLeaderList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useSeasonLeaders } from "../../hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getRecruitYear } from "../../utils/dateUtils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

type SelectedConference = number | string | null;

export default function CBBLeagueScreen() {
  const league = "CBB";
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const [selectedConference, setSelectedConference] =
    useState<SelectedConference>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const pagerRef = useRef<PagerView>(null);
  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);
  const [gamesRefreshing, setGamesRefreshing] = useState(false);
  const [recruitTeam, setRecruitTeam] = useState("all");
  const [recruitYear, setRecruitYear] = useState(() =>
    String(getRecruitYear()),
  );

  const [recruitView, setRecruitView] = useState<"players" | "teams">(
    "players",
  );
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const { categories, loading, error } = useSeasonLeaders(2026, league);

  const selectedConferenceName = useMemo(() => {
    if (!selectedConference) return undefined;

    if (selectedConference === "top25") {
      return "Top 25";
    }

    const conference = cbbConferences.find(
      (conf) => String(conf.groupId) === String(selectedConference),
    );

    return conference?.shortName || conference?.name || undefined;
  }, [selectedConference]);

  const selectedConferenceGroupId = useMemo(() => {
    if (!selectedConference || selectedConference === "top25") return null;

    const conferenceId = Number(selectedConference);
    return Number.isFinite(conferenceId) ? conferenceId : null;
  }, [selectedConference]);

  const { calendar } = useLeagueCalendar(league);

  const {
    games,
    error: gamesError,
    refreshGames,
    loading: loadingGames,
  } = useBasketballGames(selectedDate, "cbb");

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          tabName="League"
          league={"Men's College Basketball" as "CBB"}
          modalVisible={isDropdownOpen}
          setModalVisible={setIsDropdownOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          onBack={goBack}
          selectedConferenceName={selectedConferenceName}
        />
      ),
    });
  }, [navigation, selectedConferenceName, isDropdownOpen]);

  const handleScoresRefresh = React.useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshGames]);

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

            <BasketballGamesList
              games={games}
              error={gamesError}
              loading={loadingGames}
              refreshing={gamesRefreshing}
              onRefresh={handleScoresRefresh}
              isCBB={true}
            />
          </View>

          {/* NEWS */}
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

          {/* STANDINGS */}
          <View key="standings">
            <>
              {selectedConference === "Top 25" ||
              selectedConference === "NCAA Tournament" ||
              !selectedConference ? (
                <CBBStandingsList league={league} />
              ) : (
                <CBBConferenceStandingsList
                  selectedConference={String(selectedConferenceGroupId)}
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
            />
          </View>

          {/* Bracket */}
          <View key="bracket"></View>

          <View key="recruits" style={styles.contentArea}>
            <RecruitsList
              year={recruitYear}
              team={recruitTeam}
              view={recruitView}
              onYearChange={setRecruitYear}
              onTeamChange={setRecruitTeam}
              onViewChange={setRecruitView}
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
          ...markDates([...calendar]),
        }}
      />
      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conf) => setSelectedConference(conf ?? "")}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
        league={league}
      />
    </>
  );
}
