import { useBasketballGames } from "@/hooks/BasketballHooks/useBasketballGames";
import { isLeague, League, normalizeLeagueParam } from "@/utils/tabs";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
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
import { ScrollView, View } from "react-native";
import PagerView from "react-native-pager-view";

/* -------------------------------------------------------------------------- */
/*                                   Shared                                   */
/* -------------------------------------------------------------------------- */

import CalendarModal from "../../components/CalendarModal";
import { CustomHeader } from "../../components/CustomHeader";
import DateNavigator from "../../components/DateNavigator";
import Forum from "../../components/Forum/Forum";
import AwardSeasons from "../../components/League/Awards/AwardSeasons";
import RecruitsList from "../../components/League/Recruiting/RecruitsList";
import NewsList from "../../components/News/NewsList";
import GamesList from "../../components/Sports/Basketball/Games/GamesList";
import MainScrollTabBar from "../../components/TabBars/MainTabScrollBar";

import { Colors } from "../../constants/styles";
import { usePreferences } from "../../contexts/PreferencesContext";
import { useLeagueCalendar } from "../../hooks/LeagueHooks/useLeagueCalendar";
import { useLeagueTabs } from "../../hooks/LeagueHooks/useLeagueTabs";
import { useLeaguesNews } from "../../hooks/NewsHooks/useLeaguesNews";
import { LeagueScreenStyles } from "../../styles/LeagueStyles/LeagueStyles";
import { getLeagueCalendarDateKey } from "../../utils/leagueCalendarCache";

/* -------------------------------------------------------------------------- */
/*                                     NBA                                    */
/* -------------------------------------------------------------------------- */

import Draft, {
  getDefaultDraftYear,
} from "../../components/League/Draft/Draft";
import NBASeasonLeadersList from "../../components/League/SeasonLeadersList";
import { StandingsList } from "../../components/League/Standings/StandingsList";
import { NBAPlayoffBracket } from "../../components/Sports/Basketball/NBAPlayoffs/NBAPlayoffBracket";

import { useNBAPlayoffGames } from "../../hooks/NBAHooks/useNBAPlayoffGames";
import { useSeasonLeaders as useNBASeasonLeaders } from "../../hooks/NBAHooks/useSeasonLeaders";

/* -------------------------------------------------------------------------- */
/*                                     CBB/WCBB                                    */
/* -------------------------------------------------------------------------- */

import TournamentBracket from "../../components/Sports/Basketball/CBBTournament";
import ConferenceListModal, {
  ConferenceListModalRef,
} from "../../components/Sports/Basketball/ConferenceListModal";
import { CBBConferenceStandingsList } from "../../components/Sports/Basketball/Standings/CBBConferenceStandingsList";
import { CBBStandingsList } from "../../components/Sports/Basketball/Standings/CBBStandingsList";
import CollegeSeasonLeadersList from "../../components/Sports/Football/SeasonLeaderList";

import { cbbConferences } from "../../constants/cbbConferences";
import { useTournamentBracket } from "../../hooks/BasketballHooks/useTournamentBracket";
import { useSeasonLeaders } from "../../hooks/FootballHooks/useSeasonLeaders";
import {
  getCBBSeason,
  getNBACalendarSeason,
  getRecruitYear,
  getWNBASeason,
} from "../../utils/dateUtils";

dayjs.extend(utc);
dayjs.extend(timezone);

type SupportedBasketballLeague = Extract<
  League,
  "NBA" | "WNBA" | "CBB" | "WCBB"
>;
type SelectedConference = number | string | null;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const getMonthAnchor = (value: Date | string) =>
  dayjs(value).startOf("month").format("YYYY-MM-DD");

function isSupportedBasketballLeague(
  league: League,
): league is SupportedBasketballLeague {
  return (
    league === "NBA" ||
    league === "WNBA" ||
    league === "CBB" ||
    league === "WCBB"
  );
}

function isTop25Rank(rank: unknown) {
  const parsedRank = Number(rank);

  return Number.isFinite(parsedRank) && parsedRank >= 1 && parsedRank <= 25;
}

/* -------------------------------------------------------------------------- */
/*                                 Main Route                                 */
/* -------------------------------------------------------------------------- */

export default function BasketballLeagueScreen() {
  const params = useLocalSearchParams<{
    league?: string | string[];
    leagueLabel?: string;
  }>();

  const normalizedLeague = normalizeLeagueParam(params.league);

  const parsedLeague: League = isLeague(normalizedLeague)
    ? normalizedLeague
    : "NBA";

  const league: SupportedBasketballLeague = isSupportedBasketballLeague(
    parsedLeague,
  )
    ? parsedLeague
    : "NBA";

  /*
   * Keep NBA and CBB hooks in separate child components.
   *
   * This prevents:
   * - CBB loading NBA Summer League feeds
   * - NBA loading CBB tournament/recruiting data
   * - conditional hook-order problems
   */
  if (league === "CBB") {
    return <CBBLeagueScreen />;
  }
  if (league === "WCBB") {
    return <WCBBLeagueScreen />;
  }
  if (league === "WNBA") {
    return <WNBALeagueScreen />;
  }

  return <NBALeagueScreen />;
}

/* ========================================================================== */
/*                                    NBA                                     */
/* ========================================================================== */

function NBALeagueScreen() {
  const league = "NBA";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    dayjs().startOf("day").toDate(),
  );

  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() =>
    getMonthAnchor(new Date()),
  );

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");

  const [draftYear, setDraftYear] = useState(() =>
    getDefaultDraftYear("nba").toString(),
  );

  const [standingsYear, setStandingsYear] = useState(() =>
    getNBACalendarSeason().toString(),
  );

  const selectedSeason = getNBACalendarSeason();

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const {
    calendar,
    error: calendarError,
    refresh: refreshCalendar,
  } = useLeagueCalendar(league, "raw", calendarAnchorDate);

  /* ------------------------------------------------------------------------ */
  /*                                NBA Games                                 */
  /* ------------------------------------------------------------------------ */

  const {
    games: nbaGames,
    error: nbaGamesError,
    refreshGames: refreshNBAGames,
    loading: loadingNBAGames,
  } = useBasketballGames(selectedDate, "nba");

  const {
    games: summerVegasGames,
    error: summerVegasGamesError,
    refreshGames: refreshSummerVegasGames,
    loading: loadingSummerVegasGames,
  } = useBasketballGames(selectedDate, "summervegas");

  const {
    games: summerUtahGames,
    error: summerUtahGamesError,
    refreshGames: refreshSummerUtahGames,
    loading: loadingSummerUtahGames,
  } = useBasketballGames(selectedDate, "summerutah");

  const {
    games: summerCaliforniaGames,
    error: summerCaliforniaGamesError,
    refreshGames: refreshSummerCaliforniaGames,
    loading: loadingSummerCaliforniaGames,
  } = useBasketballGames(selectedDate, "summercalifornia");

  /*
   * NBA + all Summer League feeds.
   *
   * Dedupe by ESPN game ID because an event could theoretically
   * appear in more than one feed.
   */
  const combinedGames = useMemo(() => {
    const allGames = [
      ...(nbaGames ?? []),
      ...(summerVegasGames ?? []),
      ...(summerUtahGames ?? []),
      ...(summerCaliforniaGames ?? []),
    ];

    const seenGameIds = new Set<string>();

    return allGames
      .filter((game) => {
        if (game.id === null || game.id === undefined) {
          return true;
        }

        const id = String(game.id);

        if (seenGameIds.has(id)) {
          return false;
        }

        seenGameIds.add(id);

        return true;
      })
      .sort((a, b) => {
        const aTime = new Date(a.date ?? 0).getTime();
        const bTime = new Date(b.date ?? 0).getTime();

        return aTime - bTime;
      });
  }, [nbaGames, summerVegasGames, summerUtahGames, summerCaliforniaGames]);

  const combinedGamesLoading =
    loadingNBAGames ||
    loadingSummerVegasGames ||
    loadingSummerUtahGames ||
    loadingSummerCaliforniaGames;

  const combinedGamesError =
    nbaGamesError ??
    summerVegasGamesError ??
    summerUtahGamesError ??
    summerCaliforniaGamesError ??
    null;

  /* ------------------------------------------------------------------------ */
  /*                              NBA Playoffs                                */
  /* ------------------------------------------------------------------------ */

  const {
    rounds: playoffRounds,
    loading: playoffLoading,
    error: playoffError,
    refreshingGames: refreshingPlayoffGames,
    refreshGames: refreshPlayoffGames,
  } = useNBAPlayoffGames({
    season: selectedSeason,
  });

  /* ------------------------------------------------------------------------ */
  /*                              NBA Leaders                                 */
  /* ------------------------------------------------------------------------ */

  const {
    leaders,
    loading: leadersLoading,
    error: leadersError,
  } = useNBASeasonLeaders();

  /* ------------------------------------------------------------------------ */
  /*                                  News                                    */
  /* ------------------------------------------------------------------------ */

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  /* ------------------------------------------------------------------------ */
  /*                                 Effects                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const nextAnchor = getMonthAnchor(selectedDate);

    setCalendarAnchorDate((previousAnchor) =>
      previousAnchor === nextAnchor ? previousAnchor : nextAnchor,
    );
  }, [selectedDate]);

  useEffect(() => {
    if (calendarError) {
      console.warn("NBA calendar error:", calendarError);
    }
  }, [calendarError]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader tabName={league} league={league} onBack={goBack} />
      ),
    });
  }, [league, navigation]);

  /* ------------------------------------------------------------------------ */
  /*                                Handlers                                  */
  /* ------------------------------------------------------------------------ */

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        refreshNBAGames(),
        refreshSummerVegasGames(),
        refreshSummerUtahGames(),
        refreshSummerCaliforniaGames(),
        refreshCalendar(),
      ]);
    } catch (refreshError) {
      console.warn(
        "Failed to refresh one or more NBA game feeds:",
        refreshError,
      );
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshNBAGames,
    refreshSummerVegasGames,
    refreshSummerUtahGames,
    refreshSummerCaliforniaGames,
    refreshCalendar,
  ]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

  const handleCalendarMonthChange = useCallback((anchorDate: string) => {
    setCalendarAnchorDate((previousAnchor) =>
      previousAnchor === anchorDate ? previousAnchor : anchorDate,
    );
  }, []);

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

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey = getLeagueCalendarDateKey(calendarDate);

        if (!dateKey) {
          return dates;
        }

        dates[dateKey] = {
          marked: true,
          dotColor: isDark ? Colors.white : Colors.black,
        };

        return dates;
      },
      {} as Record<
        string,
        {
          marked: boolean;
          dotColor: string;
        }
      >,
    );
  }, [calendar, isDark]);

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

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
          ref={pagerRef}
          style={styles.contentArea}
          initialPage={0}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;
            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
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
              games={combinedGames}
              error={combinedGamesError}
              loading={combinedGamesLoading}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              showHeaders={false}
              scrollEnabled
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
          <ScrollView key="standings">
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </ScrollView>

          {/* PLAYOFFS */}
          <View key="playoffs" style={styles.contentArea}>
            <NBAPlayoffBracket
              rounds={playoffRounds}
              loading={playoffLoading}
              error={playoffError}
              refreshing={refreshingPlayoffGames}
              onRefresh={refreshPlayoffGames}
            />
          </View>

          {/* STATS */}
          <ScrollView key="stats">
            <NBASeasonLeadersList
              leadersByStat={leaders}
              loading={leadersLoading}
              error={leadersError}
            />
          </ScrollView>

          {/* DRAFT */}
          <View key="draft" style={styles.contentArea}>
            <Draft
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league="nba"
            />
          </View>

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league={league} />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <Forum league={league} />
          </View>
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onMonthChange={handleCalendarMonthChange}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setCalendarAnchorDate(getMonthAnchor(nextDate));
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />
    </>
  );
}

function WNBALeagueScreen() {
  const league = "WNBA";

  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    dayjs().startOf("day").toDate(),
  );

  const [calendarAnchorDate, setCalendarAnchorDate] = useState(() =>
    getMonthAnchor(new Date()),
  );

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [draftTeam, setDraftTeam] = useState("all");
  const [draftRound, setDraftRound] = useState("all");

  const [draftYear, setDraftYear] = useState(() =>
    getDefaultDraftYear("wnba").toString(),
  );

  const [standingsYear, setStandingsYear] = useState(
    getWNBASeason().toString(),
  );


  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  const {
    calendar,
    error: calendarError,
    refresh: refreshCalendar,
  } = useLeagueCalendar(league, "raw", calendarAnchorDate);

  /* ------------------------------------------------------------------------ */
  /*                                NBA Games                                 */
  /* ------------------------------------------------------------------------ */

  const {
    games: wnbaGames,
    error: wnbaGamesError,
    refreshGames: refreshWNBAGames,
    loading: loadingWNBAGames,
  } = useBasketballGames(selectedDate, "wnba");

  /* ------------------------------------------------------------------------ */
  /*                                  News                                    */
  /* ------------------------------------------------------------------------ */

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  /* ------------------------------------------------------------------------ */
  /*                                 Effects                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const nextAnchor = getMonthAnchor(selectedDate);

    setCalendarAnchorDate((previousAnchor) =>
      previousAnchor === nextAnchor ? previousAnchor : nextAnchor,
    );
  }, [selectedDate]);

  useEffect(() => {
    if (calendarError) {
      console.warn("WNBA calendar error:", calendarError);
    }
  }, [calendarError]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader tabName={league} league={league} onBack={goBack} />
      ),
    });
  }, [league, navigation]);

  /* ------------------------------------------------------------------------ */
  /*                                Handlers                                  */
  /* ------------------------------------------------------------------------ */

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([refreshWNBAGames(), refreshCalendar()]);
    } catch (refreshError) {
      console.warn(
        "Failed to refresh one or more WNBA game feeds:",
        refreshError,
      );
    } finally {
      setRefreshing(false);
    }
  }, [refreshWNBAGames, refreshCalendar]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

  const handleCalendarMonthChange = useCallback((anchorDate: string) => {
    setCalendarAnchorDate((previousAnchor) =>
      previousAnchor === anchorDate ? previousAnchor : anchorDate,
    );
  }, []);

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

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey = getLeagueCalendarDateKey(calendarDate);

        if (!dateKey) {
          return dates;
        }

        dates[dateKey] = {
          marked: true,
          dotColor: isDark ? Colors.white : Colors.black,
        };

        return dates;
      },
      {} as Record<
        string,
        {
          marked: boolean;
          dotColor: string;
        }
      >,
    );
  }, [calendar, isDark]);

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

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
          ref={pagerRef}
          style={styles.contentArea}
          initialPage={0}
          onPageSelected={(event) => {
            const pageIndex = event.nativeEvent.position;
            const nextTab = tabs[pageIndex];

            if (nextTab) {
              setSelectedTab(nextTab);
            }
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
              games={wnbaGames}
              error={wnbaGamesError}
              loading={loadingWNBAGames}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              showHeaders={false}
              scrollEnabled
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
          <ScrollView key="standings">
            <StandingsList
              year={standingsYear}
              onYearChange={setStandingsYear}
              league={league}
            />
          </ScrollView>

          {/* DRAFT */}
          <View key="draft" style={styles.contentArea}>
            <Draft
              year={draftYear}
              team={draftTeam}
              round={draftRound}
              onYearChange={setDraftYear}
              onTeamChange={setDraftTeam}
              onRoundChange={setDraftRound}
              league="wnba"
            />
          </View>

          {/* AWARDS */}
          <View key="awards" style={styles.contentArea}>
            <AwardSeasons league={league} />
          </View>

          {/* FORUM */}
          <View key="forum" style={styles.contentArea}>
            <Forum league={league} />
          </View>
        </PagerView>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onMonthChange={handleCalendarMonthChange}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setCalendarAnchorDate(getMonthAnchor(nextDate));
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />
    </>
  );
}

/* ========================================================================== */
/*                                    CBB                                     */
/* ========================================================================== */

function CBBLeagueScreen() {
  const league = "CBB";
  const currentSeason = getCBBSeason();

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const conferenceModalRef = useRef<ConferenceListModalRef>(null);

  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    dayjs().startOf("day").toDate(),
  );

  const [gamesRefreshing, setGamesRefreshing] = useState(false);

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [selectedConference, setSelectedConference] =
    useState<SelectedConference>(null);

  const [isConferenceModalOpen, setIsConferenceModalOpen] = useState(false);

  const [recruitTeam, setRecruitTeam] = useState("all");

  const [recruitYear, setRecruitYear] = useState(() =>
    String(getRecruitYear()),
  );

  const [recruitView, setRecruitView] = useState<"players" | "teams">(
    "players",
  );

  /* ------------------------------------------------------------------------ */
  /*                                   Tabs                                   */
  /* ------------------------------------------------------------------------ */

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  /* ------------------------------------------------------------------------ */
  /*                               Conference                                 */
  /* ------------------------------------------------------------------------ */

  const selectedConferenceName = useMemo(() => {
    if (!selectedConference) {
      return undefined;
    }

    if (selectedConference === "top25") {
      return "Top 25";
    }

    const conference = cbbConferences.find(
      (item) => String(item.groupId) === String(selectedConference),
    );

    return conference?.shortName || conference?.name;
  }, [selectedConference]);

  const selectedConferenceGroupId = useMemo(() => {
    if (!selectedConference || selectedConference === "top25") {
      return null;
    }

    const conferenceId = Number(selectedConference);

    return Number.isFinite(conferenceId) ? conferenceId : null;
  }, [selectedConference]);

  /* ------------------------------------------------------------------------ */
  /*                                Calendar                                  */
  /* ------------------------------------------------------------------------ */

  const { calendar } = useLeagueCalendar(league);

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey =
          getLeagueCalendarDateKey(calendarDate) ??
          dayjs(calendarDate).format("YYYY-MM-DD");

        if (!dateKey) {
          return dates;
        }

        dates[dateKey] = {
          marked: true,
          dotColor: isDark ? Colors.white : Colors.black,
        };

        return dates;
      },
      {} as Record<
        string,
        {
          marked: boolean;
          dotColor: string;
        }
      >,
    );
  }, [calendar, isDark]);

  /* ------------------------------------------------------------------------ */
  /*                                   Games                                  */
  /* ------------------------------------------------------------------------ */

  const {
    games: cbbGames,
    error: cbbGamesError,
    refreshGames: refreshCBBGames,
    loading: cbbGamesLoading,
  } = useBasketballGames(selectedDate, "cbb");

  /*
   * Same idea as CFB:
   *
   * All = normal CBB scoreboard
   * Top 25 = games containing at least one Top-25 team
   *
   * Conference-specific scoreboard filtering can later be moved
   * into useBasketballGames if you expose ESPN's groups parameter.
   */
  const displayedGames = useMemo(() => {
    if (!selectedConference) {
      return cbbGames ?? [];
    }

    if (selectedConference === "top25") {
      return (cbbGames ?? []).filter(
        (game) => isTop25Rank(game.home?.rank) || isTop25Rank(game.away?.rank),
      );
    }

    return cbbGames ?? [];
  }, [cbbGames, selectedConference]);

  /* ------------------------------------------------------------------------ */
  /*                                   News                                   */
  /* ------------------------------------------------------------------------ */

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  /* ------------------------------------------------------------------------ */
  /*                                  Leaders                                 */
  /* ------------------------------------------------------------------------ */

  const {
    categories,
    loading: leadersLoading,
    error: leadersError,
  } = useSeasonLeaders(currentSeason, league);

  /* ------------------------------------------------------------------------ */
  /*                                 Bracket                                  */
  /* ------------------------------------------------------------------------ */

  const {
    tournament,
    loading: bracketLoading,
    error: bracketError,
    refreshing: bracketRefreshing,
    refresh: refreshBracket,
  } = useTournamentBracket(league, currentSeason);

  /* ------------------------------------------------------------------------ */
  /*                                  Header                                  */
  /* ------------------------------------------------------------------------ */

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="League"
          league={"Men's College Basketball" as "CBB"}
          onBack={goBack}
          modalVisible={isConferenceModalOpen}
          setModalVisible={setIsConferenceModalOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          selectedConferenceName={selectedConferenceName}
        />
      ),
    });
  }, [isConferenceModalOpen, navigation, selectedConferenceName]);

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleScoresRefresh = useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshCBBGames();
    } catch (error) {
      console.warn("Failed to refresh CBB games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshCBBGames]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

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

  /* ------------------------------------------------------------------------ */
  /*                                  Pages                                   */
  /* ------------------------------------------------------------------------ */

  const scoresPage = (
    <View key="scores" style={styles.contentArea}>
      <DateNavigator
        selectedDate={selectedDate}
        onChangeDate={changeDateByDays}
        onOpenCalendar={() => setShowCalendarModal(true)}
        isDark={isDark}
      />

      <GamesList
        games={displayedGames}
        error={cbbGamesError}
        loading={cbbGamesLoading}
        refreshing={gamesRefreshing}
        onRefresh={handleScoresRefresh}
        showHeaders={false}
        isCBB
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

  const standingsPage = (
    <View key="standings" style={styles.contentArea}>
      {!selectedConferenceGroupId ? (
        <CBBStandingsList league={league} />
      ) : (
        <CBBConferenceStandingsList
          selectedConference={String(selectedConferenceGroupId)}
        />
      )}
    </View>
  );

  const statsPage = (
    <View key="stats" style={styles.contentArea}>
      <CollegeSeasonLeadersList
        loading={leadersLoading}
        error={leadersError}
        categories={categories}
        league={league}
      />
    </View>
  );

  const bracketPage = (
    <View key="bracket" style={styles.contentArea}>
      <TournamentBracket
        tournament={tournament}
        loading={bracketLoading}
        error={bracketError}
        refreshing={bracketRefreshing}
        onRefresh={refreshBracket}
      />
    </View>
  );

  const recruitsPage = (
    <View key="recruits" style={styles.contentArea}>
      <RecruitsList
        year={recruitYear}
        team={recruitTeam}
        view={recruitView}
        onYearChange={setRecruitYear}
        onTeamChange={setRecruitTeam}
        onViewChange={setRecruitView}
        league={league}
      />
    </View>
  );

  const awardsPage = (
    <View key="awards" style={styles.contentArea}>
      <AwardSeasons league={league} />
    </View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      <Forum league={league} />
    </View>
  );

  const pagerPages = [
    scoresPage,
    newsPage,
    standingsPage,
    statsPage,
    bracketPage,
    recruitsPage,
    awardsPage,
    forumPage,
  ];

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

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
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={selectedTab !== "bracket"}
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

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conference) => {
          setSelectedConference(conference ?? null);
        }}
        onOpen={() => setIsConferenceModalOpen(true)}
        onClose={() => setIsConferenceModalOpen(false)}
        league={league}
      />
    </>
  );
}

/* ========================================================================== */
/*                                    WCBB                                     */
/* ========================================================================== */

function WCBBLeagueScreen() {
  const league = "WCBB";
  const currentSeason = getCBBSeason();

  const navigation = useNavigation();
  const pagerRef = useRef<PagerView>(null);

  const conferenceModalRef = useRef<ConferenceListModalRef>(null);

  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";
  const styles = LeagueScreenStyles(isDark);

  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    dayjs().startOf("day").toDate(),
  );

  const [gamesRefreshing, setGamesRefreshing] = useState(false);

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [selectedConference, setSelectedConference] =
    useState<SelectedConference>(null);

  const [isConferenceModalOpen, setIsConferenceModalOpen] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                                   Tabs                                   */
  /* ------------------------------------------------------------------------ */

  const { tabs, selectedTab, setSelectedTab } = useLeagueTabs(league);

  /* ------------------------------------------------------------------------ */
  /*                               Conference                                 */
  /* ------------------------------------------------------------------------ */

  const selectedConferenceName = useMemo(() => {
    if (!selectedConference) {
      return undefined;
    }

    if (selectedConference === "top25") {
      return "Top 25";
    }

    const conference = cbbConferences.find(
      (item) => String(item.groupId) === String(selectedConference),
    );

    return conference?.shortName || conference?.name;
  }, [selectedConference]);

  const selectedConferenceGroupId = useMemo(() => {
    if (!selectedConference || selectedConference === "top25") {
      return null;
    }

    const conferenceId = Number(selectedConference);

    return Number.isFinite(conferenceId) ? conferenceId : null;
  }, [selectedConference]);

  /* ------------------------------------------------------------------------ */
  /*                                Calendar                                  */
  /* ------------------------------------------------------------------------ */

  const { calendar } = useLeagueCalendar(league);

  const markedDates = useMemo(() => {
    return (calendar ?? []).reduce(
      (dates, calendarDate) => {
        if (typeof calendarDate !== "string") {
          return dates;
        }

        const dateKey =
          getLeagueCalendarDateKey(calendarDate) ??
          dayjs(calendarDate).format("YYYY-MM-DD");

        if (!dateKey) {
          return dates;
        }

        dates[dateKey] = {
          marked: true,
          dotColor: isDark ? Colors.white : Colors.black,
        };

        return dates;
      },
      {} as Record<
        string,
        {
          marked: boolean;
          dotColor: string;
        }
      >,
    );
  }, [calendar, isDark]);

  /* ------------------------------------------------------------------------ */
  /*                                   Games                                  */
  /* ------------------------------------------------------------------------ */

  const {
    games: wcbbGames,
    error: wcbbGamesError,
    refreshGames: refreshWCBBGames,
    loading: cbbGamesLoading,
  } = useBasketballGames(selectedDate, "wcbb");

  /*
   * Same idea as CFB:
   *
   * All = normal CBB scoreboard
   * Top 25 = games containing at least one Top-25 team
   *
   * Conference-specific scoreboard filtering can later be moved
   * into useBasketballGames if you expose ESPN's groups parameter.
   */
  const displayedGames = useMemo(() => {
    if (!selectedConference) {
      return wcbbGames ?? [];
    }

    if (selectedConference === "top25") {
      return (wcbbGames ?? []).filter(
        (game) => isTop25Rank(game.home?.rank) || isTop25Rank(game.away?.rank),
      );
    }

    return wcbbGames ?? [];
  }, [wcbbGames, selectedConference]);

  /* ------------------------------------------------------------------------ */
  /*                                   News                                   */
  /* ------------------------------------------------------------------------ */

  const {
    articles,
    loading: newsLoading,
    refreshing: refreshingNews,
    error: newsError,
    refresh: refreshNews,
  } = useLeaguesNews(league, 10);

  /* ------------------------------------------------------------------------ */
  /*                                  Leaders                                 */
  /* ------------------------------------------------------------------------ */

  const {
    categories,
    loading: leadersLoading,
    error: leadersError,
  } = useSeasonLeaders(currentSeason, league);

  /* ------------------------------------------------------------------------ */
  /*                                 Bracket                                  */
  /* ------------------------------------------------------------------------ */

  const {
    tournament,
    loading: bracketLoading,
    error: bracketError,
    refreshing: bracketRefreshing,
    refresh: refreshBracket,
  } = useTournamentBracket(league, currentSeason);

  /* ------------------------------------------------------------------------ */
  /*                                  Header                                  */
  /* ------------------------------------------------------------------------ */

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          tabName="League"
          league={"Women's College Basketball" as "WCBB"}
          onBack={goBack}
          modalVisible={isConferenceModalOpen}
          setModalVisible={setIsConferenceModalOpen}
          onOpenLeagueModal={() => conferenceModalRef.current?.present()}
          selectedConferenceName={selectedConferenceName}
        />
      ),
    });
  }, [isConferenceModalOpen, navigation, selectedConferenceName]);

  /* ------------------------------------------------------------------------ */
  /*                                 Handlers                                 */
  /* ------------------------------------------------------------------------ */

  const handleScoresRefresh = useCallback(async () => {
    setGamesRefreshing(true);

    try {
      await refreshWCBBGames();
    } catch (error) {
      console.warn("Failed to refresh WCBB games:", error);
    } finally {
      setGamesRefreshing(false);
    }
  }, [refreshWCBBGames]);

  const changeDateByDays = useCallback((days: number) => {
    setSelectedDate((previousDate) =>
      dayjs(previousDate).add(days, "day").startOf("day").toDate(),
    );
  }, []);

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

  /* ------------------------------------------------------------------------ */
  /*                                  Pages                                   */
  /* ------------------------------------------------------------------------ */

  const scoresPage = (
    <View key="scores" style={styles.contentArea}>
      <DateNavigator
        selectedDate={selectedDate}
        onChangeDate={changeDateByDays}
        onOpenCalendar={() => setShowCalendarModal(true)}
        isDark={isDark}
      />

      <GamesList
        games={displayedGames}
        error={wcbbGamesError}
        loading={cbbGamesLoading}
        refreshing={gamesRefreshing}
        onRefresh={handleScoresRefresh}
        showHeaders={false}
        isCBB
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

  const standingsPage = (
    <View key="standings" style={styles.contentArea}>
      {!selectedConferenceGroupId ? (
        <CBBStandingsList league={league} />
      ) : (
        <CBBConferenceStandingsList
          selectedConference={String(selectedConferenceGroupId)}
        />
      )}
    </View>
  );

  const statsPage = (
    <View key="stats" style={styles.contentArea}>
      <CollegeSeasonLeadersList
        loading={leadersLoading}
        error={leadersError}
        categories={categories}
        league={league}
      />
    </View>
  );

  const bracketPage = (
    <View key="bracket" style={styles.contentArea}>
      <TournamentBracket
        tournament={tournament}
        loading={bracketLoading}
        error={bracketError}
        refreshing={bracketRefreshing}
        onRefresh={refreshBracket}
      />
    </View>
  );

  const awardsPage = (
    <View key="awards" style={styles.contentArea}>
      <AwardSeasons league={league} />
    </View>
  );

  const forumPage = (
    <View key="forum" style={styles.contentArea}>
      <Forum league={league} />
    </View>
  );

  const pagerPages = [
    scoresPage,
    newsPage,
    standingsPage,
    statsPage,
    bracketPage,
    awardsPage,
    forumPage,
  ];

  /* ------------------------------------------------------------------------ */
  /*                                  Render                                  */
  /* ------------------------------------------------------------------------ */

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
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={selectedTab !== "bracket"}
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

      <CalendarModal
        visible={showCalendarModal}
        selectedDate={dayjs(selectedDate).format("YYYY-MM-DD")}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={(dateString) => {
          const nextDate = dayjs(dateString, "YYYY-MM-DD")
            .startOf("day")
            .toDate();

          setSelectedDate(nextDate);
          setShowCalendarModal(false);
        }}
        markedDates={markedDates}
      />

      <ConferenceListModal
        ref={conferenceModalRef}
        onSelect={(conference) => {
          setSelectedConference(conference ?? null);
        }}
        onOpen={() => setIsConferenceModalOpen(true)}
        onClose={() => setIsConferenceModalOpen(false)}
        league={league}
      />
    </>
  );
}
