import Forum from "@/components/Forum/Forum";
import AwardSeasons from "@/components/League/Awards/AwardSeasons";
import Draft, { getDefaultDraftYear } from "@/components/League/Draft/Draft";
import RecruitsList from "@/components/League/Recruiting/RecruitsList";
import { StandingsList } from "@/components/League/Standings/StandingsList";
import WeekSelector, {
  FootballWeekGroup,
} from "@/components/League/WeekSelector";
import NewsList from "@/components/News/NewsList";
import { CFBPlayoffBracket } from "@/components/Sports/Football/CFBPlayoffs/CFBPlayoffBracket";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "@/components/Sports/Football/ConferenceListModal";
import GamesList from "@/components/Sports/Football/Games/GamesList";
import { NFLPlayoffBracket } from "@/components/Sports/Football/NFLPlayoffs/NFLPlayoffBracket";
import SeasonLeadersList from "@/components/Sports/Football/SeasonLeaderList";
import { CFBConferenceStandingsList } from "@/components/Sports/Football/Standings/CFBConferenceStandingsList";
import { CFBStandingsList } from "@/components/Sports/Football/Standings/CFBStandingsList";
import MainScrollTabBar from "@/components/TabBars/MainTabScrollBar";
import { cfbConferences } from "@/constants/cfbConferences";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useCFBConferenceStandings } from "@/hooks/FootballHooks/useCFBConferenceStandings";
import { useCFPBracket } from "@/hooks/FootballHooks/useCFPBracket";
import { useFootballGames } from "@/hooks/FootballHooks/useFootballGames";
import { useNFLPlayoffs } from "@/hooks/FootballHooks/useNFLPlayoffs";
import { useSeasonLeaders } from "@/hooks/FootballHooks/useSeasonLeaders";
import { useLeagueCalendar } from "@/hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "@/hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "@/hooks/NewsHooks/useLeaguesNews";
import { LeagueScreenStyles } from "@/styles/LeagueStyles/LeagueStyles";
import { getFootballSeason, getRecruitYear } from "@/utils/dateUtils";
import { isLeague, League, normalizeLeagueParam } from "@/utils/tabs";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useLocalSearchParams } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { CustomHeader } from "../../components/CustomHeader";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

type SupportedFootballLeague = Extract<League, "NFL" | "CFB" | "UFL">;
type FootballLeagueKey = "nfl" | "cfb" | "ufl";
type SelectedConference = number | string | null;

function isSupportedFootballLeague(
  league: League,
): league is SupportedFootballLeague {
  return league === "NFL" || league === "CFB" || league === "UFL";
}

function getSeasonTypeFromStage(stage?: string): number {
  const normalizedStage = String(stage ?? "").toLowerCase();

  if (normalizedStage.includes("preseason")) {
    return 1;
  }

  if (
    normalizedStage.includes("postseason") ||
    normalizedStage.includes("playoff")
  ) {
    return 3;
  }

  return 2;
}

function getSeasonSlugFromStage(stage?: string): string {
  const normalizedStage = String(stage ?? "").toLowerCase();

  if (normalizedStage.includes("preseason")) {
    return "pre-season";
  }

  if (
    normalizedStage.includes("postseason") ||
    normalizedStage.includes("playoff")
  ) {
    return "post-season";
  }

  return "regular-season";
}

export default function FootballLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
  }>();

  const normalizedLeague = normalizeLeagueParam(params.league);

  const parsedLeague: League = isLeague(normalizedLeague)
    ? normalizedLeague
    : "NFL";

  const league: SupportedFootballLeague = isSupportedFootballLeague(
    parsedLeague,
  )
    ? parsedLeague
    : "NFL";

  const leagueKey = league.toLowerCase() as FootballLeagueKey;

  const isNFL = league === "NFL";
  const isCFB = league === "CFB";
  const isUFL = league === "UFL";

  const currentSeason = getFootballSeason();

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);
  const conferenceModalRef = useRef<ConferenceListModalRef>(null);

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const [screenRefreshing, setScreenRefreshing] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

  const [standingsYear, setStandingsYear] = useState(currentSeason.toString());

  const [draftYear, setDraftYear] = useState(() =>
    getDefaultDraftYear("nfl").toString(),
  );
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");

  const [selectedConference, setSelectedConference] =
    useState<SelectedConference>(null);
  const [isConferenceModalOpen, setIsConferenceModalOpen] = useState(false);

  const [recruitView, setRecruitView] = useState<"players" | "teams">(
    "players",
  );
  const [recruitYear, setRecruitYear] = useState(() =>
    String(getRecruitYear()),
  );
  const [recruitTeam, setRecruitTeam] = useState("all");

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const { calendar } = useLeagueCalendar(league, "football");

  const selectedConferenceName = useMemo(() => {
    if (!isCFB || !selectedConference) {
      return undefined;
    }

    if (selectedConference === "top25") {
      return "Top 25";
    }

    const conference = cfbConferences.find(
      (item) => String(item.groupId) === String(selectedConference),
    );

    return conference?.shortName || conference?.name;
  }, [isCFB, selectedConference]);

  const selectedConferenceGroupId = useMemo(() => {
    if (!isCFB || !selectedConference || selectedConference === "top25") {
      return null;
    }

    const conferenceId = Number(selectedConference);

    return Number.isFinite(conferenceId) ? conferenceId : null;
  }, [isCFB, selectedConference]);

  const weekGroups = useMemo<FootballWeekGroup[]>(() => {
    if (!calendar?.length) {
      return [];
    }

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

  const selectedWeek = weekGroups[selectedWeekIndex];
  const selectedWeekNumber = selectedWeek?.week.number ?? 1;
  const selectedSeasonType = selectedWeek?.season.type ?? 2;

  const {
    games: selectedWeekGames,
    loading: gamesLoading,
    refreshing: gamesRefreshing,
    refreshGames,
  } = useFootballGames({
    league: leagueKey,
    season: currentSeason,
    week: selectedWeekNumber,
    seasontype: selectedSeasonType,
    conferenceId:
      isCFB && selectedConference && selectedConference !== "top25"
        ? String(selectedConference)
        : undefined,
  });

  const displayedGames = useMemo(() => {
    if (!isCFB || !selectedConference) {
      return selectedWeekGames;
    }

    if (selectedConference === "top25") {
      return selectedWeekGames.filter(
        (game) => game.home?.rank != null || game.away?.rank != null,
      );
    }

    return selectedWeekGames;
  }, [isCFB, selectedConference, selectedWeekGames]);

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  /*
   * Keep these hooks unconditional. Their results are only rendered
   * for the leagues that use them.
   */
  const {
    playoffData: nflPlayoffData,
    playoffLoading: nflPlayoffLoading,
    playoffError: nflPlayoffError,
    onRefresh: refreshNFLPlayoffs,
    playoffRefreshing: nflPlayoffRefreshing,
  } = useNFLPlayoffs(currentSeason);

  const {
    data: cfbPlayoffData,
    playoffLoading: cfbPlayoffLoading,
    playoffError: cfbPlayoffError,
    playoffRefreshing: cfbPlayoffRefreshing,
    onRefresh: refreshCFBPlayoffs,
  } = useCFPBracket();

  const {
    categories,
    loading: leadersLoading,
    error: leadersError,
  } = useSeasonLeaders(currentSeason, league);

  const { conferences, conferencesLoading, conferencesError } =
    useCFBConferenceStandings(isCFB ? selectedConferenceGroupId : null);

  useEffect(() => {
    if (!weekGroups.length) {
      setSelectedWeekIndex(0);
      return;
    }

    setSelectedWeekIndex((currentIndex) =>
      currentIndex < weekGroups.length ? currentIndex : 0,
    );
  }, [weekGroups.length]);

  useEffect(() => {
    if (!calendar?.length || !weekGroups.length) {
      return;
    }

    const now = dayjs();

    const activeCalendarWeek = calendar.find(
      (week) =>
        week.stage !== "Off Season" &&
        now.isBetween(dayjs(week.startDate), dayjs(week.endDate), null, "[]"),
    );

    if (!activeCalendarWeek) {
      return;
    }

    const activeSeasonType = getSeasonTypeFromStage(activeCalendarWeek.stage);

    const matchingGroupIndex = weekGroups.findIndex(
      (group) =>
        group.week.number === activeCalendarWeek.weekNumber &&
        group.season.type === activeSeasonType,
    );

    if (matchingGroupIndex >= 0) {
      setSelectedWeekIndex(matchingGroupIndex);
    }
  }, [calendar, weekGroups]);

  useEffect(() => {
    setSelectedWeekIndex(0);
    setStandingsYear(currentSeason.toString());
    setSelectedConference(null);
    setIsConferenceModalOpen(false);

    if (league === "NFL") {
      setDraftYear(getDefaultDraftYear("nfl").toString());
    }
  }, [currentSeason, league]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName={isCFB ? "College Football" : league}
          onBack={goBack}
          modalVisible={isCFB ? isConferenceModalOpen : undefined}
          setModalVisible={isCFB ? setIsConferenceModalOpen : undefined}
          onOpenLeagueModal={
            isCFB ? () => conferenceModalRef.current?.present() : undefined
          }
          selectedConferenceName={isCFB ? selectedConferenceName : undefined}
        />
      ),
    });
  }, [
    isCFB,
    isConferenceModalOpen,
    league,
    navigation,
    selectedConferenceName,
  ]);

  const handleRefresh = useCallback(async () => {
    setScreenRefreshing(true);

    try {
      await refreshGames();
    } catch (error) {
      console.warn(`Failed to refresh ${league} games:`, error);
    } finally {
      setScreenRefreshing(false);
    }
  }, [league, refreshGames]);

  const handleTabPress = useCallback(
    (tab: (typeof tabs)[number]) => {
      const pageIndex = tabs.indexOf(tab);

      if (pageIndex < 0) {
        return;
      }

      setSelectedTab(tab);
      pagerRef.current?.setPage(pageIndex);
    },
    [setSelectedTab, tabs],
  );

  const scoresPage = (
    <View key="scores" style={styles.contentArea}>
      <WeekSelector
        groups={weekGroups}
        loading={gamesLoading}
        selectedWeekIndex={selectedWeekIndex}
        onSelectWeek={setSelectedWeekIndex}
        isDark={isDark}
      />

      <GamesList
        games={displayedGames}
        loading={gamesLoading}
        refreshing={screenRefreshing || gamesRefreshing}
        onRefresh={handleRefresh}
        showHeaders={false}
        isNFL={isNFL}
        isCFB={isCFB}
      />
    </View>
  );

  const newsPage = (
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
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      <Forum league={league} />
    </View>
  );

  const nflPages = [
    scoresPage,
    newsPage,

    <View key="standings" style={styles.contentArea}>
      <StandingsList
        year={standingsYear}
        onYearChange={setStandingsYear}
        league="NFL"
      />
    </View>,

    <View key="playoffs" style={styles.contentArea}>
      <NFLPlayoffBracket
        bracket={nflPlayoffData}
        loading={nflPlayoffLoading}
        error={nflPlayoffError}
        refreshing={nflPlayoffRefreshing}
        onRefresh={refreshNFLPlayoffs}
      />
    </View>,

    <View key="stats" style={styles.contentArea}>
      <SeasonLeadersList
        loading={leadersLoading}
        error={leadersError}
        categories={categories}
        league="NFL"
      />
    </View>,

    <View key="draft" style={styles.contentArea}>
      <Draft
        year={draftYear}
        team={draftTeam}
        round={draftRound}
        onYearChange={setDraftYear}
        onTeamChange={setDraftTeam}
        onRoundChange={setDraftRound}
        league="nfl"
      />
    </View>,

    <View key="awards" style={styles.contentArea}>
      <AwardSeasons league="NFL" />
    </View>,

    forumPage,
  ];

  const cfbPages = [
    scoresPage,
    newsPage,

    <View key="standings" style={styles.contentArea}>
      {!selectedConferenceGroupId ? (
        <CFBStandingsList />
      ) : (
        <CFBConferenceStandingsList
          conferences={conferences}
          loading={conferencesLoading}
          error={conferencesError}
        />
      )}
    </View>,

    <View key="stats" style={styles.contentArea}>
      <SeasonLeadersList
        loading={leadersLoading}
        error={leadersError}
        categories={categories}
        league="CFB"
      />
    </View>,

    <View key="playoffs" style={styles.contentArea}>
      <CFBPlayoffBracket
        bracket={cfbPlayoffData}
        loading={cfbPlayoffLoading}
        error={cfbPlayoffError}
        refreshing={cfbPlayoffRefreshing}
        onRefresh={refreshCFBPlayoffs}
      />
    </View>,

    <View key="recruits" style={styles.contentArea}>
      <RecruitsList
        year={recruitYear}
        team={recruitTeam}
        view={recruitView}
        onYearChange={setRecruitYear}
        onTeamChange={setRecruitTeam}
        onViewChange={setRecruitView}
        league="CFB"
      />
    </View>,

    <View key="awards" style={styles.contentArea}>
      <AwardSeasons league="CFB" />
    </View>,

    forumPage,
  ];

  const uflPages = [
    scoresPage,
    newsPage,

    <View key="standings" style={styles.contentArea}>
      <StandingsList
        year={standingsYear}
        onYearChange={setStandingsYear}
        league="UFL"
      />
    </View>,

    forumPage,
  ];

  const pagerPages = isCFB ? cfbPages : isUFL ? uflPages : nflPages;

  return (
    <>
      <MainScrollTabBar
        tabs={tabs}
        selected={selectedTab}
        onTabPress={handleTabPress}
        isDark={isDark}
      />

      <View style={styles.container}>
        <PagerView
          key={league}
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;
            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
          }}
        >
          {pagerPages}
        </PagerView>
      </View>

      {isCFB ? (
        <ConferenceListModal
          ref={conferenceModalRef}
          onSelect={setSelectedConference}
          onOpen={() => setIsConferenceModalOpen(true)}
          onClose={() => setIsConferenceModalOpen(false)}
          league="CFB"
        />
      ) : null}
    </>
  );
}
