import FootballGamesList from "@/components/Sports/NFL/Games/FootballGamesList";
import { cfbConferences } from "@/constants/cfbConferences";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { goBack } from "expo-router/build/global-state/routing";
import * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeaderTitle } from "../../components/CustomHeaderTitle";
import LeagueForum from "../../components/Forum/LeagueForum";
import AwardSeasons from "../../components/League/Awards/AwardSeasons";
import RecruitsList from "../../components/League/Recruiting/CFB/RecruitsList";
import WeekSelector, {
  FootballWeekGroup,
} from "../../components/League/WeekSelector";
import NewsList from "../../components/News/NewsList";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "../../components/Sports/CFB/ConferenceListModal";
import { CFBPlayoffBracket } from "../../components/Sports/CFB/Playoffs/CFBPlayoffBracket";
import { CFBConferenceStandingsList } from "../../components/Sports/CFB/Standings/CFBConferenceStandingsList";
import { CFBStandingsList } from "../../components/Sports/CFB/Standings/CFBStandingsList";
import SeasonLeadersList from "../../components/Sports/NFL/SeasonLeaderList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useCFPBracket } from "../../hooks/FootballHooks/useCFPBracket";
import { useFootballGames } from "../../hooks/FootballHooks/useFootballGames";
import { useSeasonLeaders } from "../../hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { getScoresStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getFootballSeason, getRecruitYear } from "../../utils/dateUtils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

type SelectedConference = number | string | null;

export default function CFBLeagueScreen() {
  const league = "CFB";
  const currentSeason = getFootballSeason();
  const { calendar } = useLeagueCalendar(league, "football");
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = getScoresStyles(isDark);
  const conferenceModalRef = useRef<ConferenceListModalRef>(null);
  const pagerRef = useRef<PagerView>(null);
  const [selectedConference, setSelectedConference] =
    useState<SelectedConference>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recruitView, setRecruitView] = useState<"players" | "teams">(
    "players",
  );
  const [recruitYear, setRecruitYear] = useState(() =>
    String(getRecruitYear()),
  );
  const [recruitTeam, setRecruitTeam] = useState("all");
  const [screenRefreshing, setScreenRefreshing] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const {
    data: bracketData,
    loading: playoffLoading,
    error: playoffError,
    refreshing: playoffRefreshing,
    onRefresh,
  } = useCFPBracket();

  const getSeasonTypeFromStage = (stage?: string) => {
    const normalizedStage = String(stage || "").toLowerCase();
    if (normalizedStage.includes("preseason")) return 1;
    if (normalizedStage.includes("postseason")) return 3;
    if (normalizedStage.includes("playoff")) return 3;
    return 2;
  };

  const getSeasonSlugFromStage = (stage?: string) => {
    const normalizedStage = String(stage || "").toLowerCase();
    if (normalizedStage.includes("preseason")) return "pre-season";
    if (normalizedStage.includes("postseason")) return "post-season";
    if (normalizedStage.includes("playoff")) return "post-season";
    return "regular-season";
  };

  const selectedConferenceName = useMemo(() => {
    if (!selectedConference) return undefined;

    if (selectedConference === "top25") {
      return "Top 25";
    }

    const conference = cfbConferences.find(
      (conf) => String(conf.groupId) === String(selectedConference),
    );

    return conference?.shortName || conference?.name || undefined;
  }, [selectedConference]);

  const selectedConferenceGroupId = useMemo(() => {
    if (!selectedConference || selectedConference === "top25") return null;

    const conferenceId = Number(selectedConference);
    return Number.isFinite(conferenceId) ? conferenceId : null;
  }, [selectedConference]);

  const weekGroups: FootballWeekGroup[] = useMemo(() => {
    if (!calendar?.length) return [];

    return calendar
      .filter((week) => week.stage !== "Off Season")
      .map((week, index) => {
        const seasonType = getSeasonTypeFromStage(week.stage);
        const seasonSlug = getSeasonSlugFromStage(week.stage);

        return {
          key: `${seasonSlug}-week-${week.weekNumber}-${index}`,
          label: week.label || `Week ${week.weekNumber}`,
          season: {
            year: currentSeason,
            type: seasonType,
            slug: seasonSlug,
          },
          week: {
            number: week.weekNumber,
          },
          count: 0,
          games: [],
        };
      });
  }, [calendar, currentSeason]);

  const selectedWeekNumber = weekGroups[selectedWeekIndex]?.week.number ?? 1;

  const {
    games: selectedWeekGames,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    refreshGames,
  } = useFootballGames({
    league: "cfb",
    season: currentSeason,
    week: selectedWeekNumber,
    seasontype: weekGroups[selectedWeekIndex]?.season.type ?? 2,
    conferenceId:
      selectedConference && selectedConference !== "top25"
        ? String(selectedConference)
        : undefined,
  });

  const filteredWeekGames = useMemo(() => {
    if (!selectedConference) return selectedWeekGames;

    if (selectedConference === "top25") {
      return selectedWeekGames.filter(
        (game) => game.home?.rank !== null || game.away?.rank !== null,
      );
    }

    // Backend already fetched the selected conference.
    return selectedWeekGames;
  }, [selectedWeekGames, selectedConference]);

  const {
    categories,
    loading: leadersLoading,
    error: leadersError,
  } = useSeasonLeaders(2025, league);

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  useEffect(() => {
    if (!weekGroups.length) {
      setSelectedWeekIndex(0);
      return;
    }

    setSelectedWeekIndex((current) => {
      if (current >= weekGroups.length) return 0;
      return current;
    });
  }, [weekGroups.length]);

  useEffect(() => {
    if (!calendar?.length || !weekGroups.length) return;

    const now = dayjs();
    const activeCalendarWeek = calendar.find(
      (week) =>
        week.stage !== "Off Season" &&
        dayjs(now).isBetween(week.startDate, week.endDate, null, "[]"),
    );

    if (!activeCalendarWeek) return;

    const activeSeasonType = getSeasonTypeFromStage(activeCalendarWeek.stage);
    const matchingGroupIndex = weekGroups.findIndex(
      (group) =>
        group.week.number === activeCalendarWeek.weekNumber &&
        group.season.type === activeSeasonType,
    );

    if (matchingGroupIndex !== -1) {
      setSelectedWeekIndex(matchingGroupIndex);
    }
  }, [calendar, weekGroups]);

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
          selectedConferenceName={selectedConferenceName}
        />
      ),
    });
  }, [navigation, selectedConferenceName, isDropdownOpen]);

  const handleRefresh = async () => {
    setScreenRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn("Failed to refresh:", error);
    } finally {
      setScreenRefreshing(false);
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
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setSelectedTab(tabs[index]);
          }}
        >
          {/* SCORES */}
          <View key="scores" style={styles.contentArea}>
            <WeekSelector
              groups={weekGroups}
              loading={gamesLoading}
              selectedWeekIndex={selectedWeekIndex}
              onSelectWeek={setSelectedWeekIndex}
              isDark={isDark}
            />

            <FootballGamesList
              games={filteredWeekGames}
              loading={gamesLoading}
              refreshing={screenRefreshing || gamesRefreshing}
              onRefresh={handleRefresh}
              isCFB={true}
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
          <View key="standings" style={styles.contentArea}>
            {!selectedConferenceGroupId ? (
              <CFBStandingsList />
            ) : (
              <CFBConferenceStandingsList
                selectedConference={String(selectedConferenceGroupId)}
              />
            )}
          </View>

          {/* STATS */}
          <View key="stats" style={styles.contentArea}>
            <SeasonLeadersList
              loading={leadersLoading}
              error={leadersError}
              categories={categories}
              league="CFB"
            />
          </View>

          {/* PLAYOFFS */}
          <View key="playoffs" style={styles.contentArea}>
            <CFBPlayoffBracket
              bracket={bracketData}
              loading={playoffLoading}
              error={playoffError}
              refreshing={playoffRefreshing}
              onRefresh={onRefresh}
            />
          </View>

          {/* RECRUITS */}
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
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league={league} />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <LeagueForum league={league} />
          </View>
        </PagerView>
      </View>

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conf) => setSelectedConference(conf)}
        onOpen={() => setIsDropdownOpen(true)}
        onClose={() => setIsDropdownOpen(false)}
        league={league}
      />
    </>
  );
}
