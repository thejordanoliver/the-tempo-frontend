import type { HomeLeagueSource, LeagueGame } from "@/types/leagues";
import { filterByDate } from "@/utils/dateUtils";
import { HOME_SCORE_LEAGUES, type HomeLeagueId } from "constants/leagues";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeGames } from "utils/games";
import { buildHomeGameSections } from "utils/homeGames";

import { useBaseballGames } from "./BaseballHooks/useBaseballGames";
import { useBasketballGames } from "./BasketballHooks/useBasketballGames";
import { useFootballGames } from "./FootballHooks/useFootballGames";
import { useHockeyGames } from "./HockeyHooks/useHockeyGames";
import { useMMAEvents } from "./MMAHooks/useMMAEvents";
import { useSoccerGames } from "./SoccerHooks/useSoccerGames";
import { useTennisMatches } from "./TennisHooks/useTennisMatches";
import { useForYouFeed } from "./useForYouFeed";

dayjs.extend(utc);
dayjs.extend(timezone);

const getStartOfToday = () => dayjs().startOf("day").toDate();

export function useHomeData(selectedTab: "scores" | "for you") {
  const {
    favorites,
    favoriteSports,
    favoriteSportsError,
    favoriteSportsReady,
    ready: favoriteTeamsReady,
    userId,
  } = useFavoriteTeamsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getStartOfToday);
  const isGeneralHome =
    favoriteTeamsReady &&
    (favoriteSportsReady || userId === null) &&
    favorites.length === 0 &&
    favoriteSports.length === 0;
  const shouldResetDate =
    favoriteTeamsReady && favoriteSportsReady && !isGeneralHome;
  const [previousShouldResetDate, setPreviousShouldResetDate] =
    useState(shouldResetDate);

  // Reset before committing children when loaded preferences switch the home
  // feed to personalized scores, so game hooks receive the updated date.
  if (previousShouldResetDate !== shouldResetDate) {
    setPreviousShouldResetDate(shouldResetDate);
    if (shouldResetDate && !dayjs(selectedDate).isSame(getStartOfToday(), "day")) {
      setSelectedDate(getStartOfToday());
    }
  }

  const forYouFeed = useForYouFeed(
    selectedTab === "for you" &&
      favoriteTeamsReady &&
      (favoriteSportsReady || favoriteSportsError !== null || userId === null),
    userId,
    JSON.stringify([favorites, favoriteSports]),
  );

  const {
    games: nbaGames,
    loading: nbaLoading,
    refreshGames: refreshNBAGames,
  } = useBasketballGames(selectedDate, "nba");

  const {
    games: mlbGames,
    loading: mlbLoading,
    refreshGames: refreshMLBGames,
  } = useBaseballGames(selectedDate, "mlb");

  const {
    games: nhlGames,
    loading: nhlLoading,
    refreshGames: refreshNHLGames,
  } = useHockeyGames(selectedDate, "nhl");

  const {
    games: cfbGames,
    loading: cfbLoading,
    refreshGames: refreshCFBGames,
  } = useFootballGames({
    date: selectedDate,
    league: "cfb",
  });

  const {
    games: nflGames,
    loading: nflLoading,
    refreshGames: refreshNFLGames,
  } = useFootballGames({
    date: selectedDate,
    league: "nfl",
  });

  const {
    games: uflGames,
    loading: uflLoading,
    refreshGames: refreshUFLGames,
  } = useFootballGames({
    date: selectedDate,
    league: "ufl",
  });

  const {
    games: mensBasketballGames,
    loading: mensMCBBLoading,
    refreshGames: refreshMensMCBB,
  } = useBasketballGames(selectedDate, "mcbb");

  const {
    games: womensBasketballGames,
    loading: womensMCBBLoading,
    refreshGames: refreshWomensMCBB,
  } = useBasketballGames(selectedDate, "wcbb");

  const {
    games: wnbaGames,
    loading: wnbaLoading,
    refreshGames: refreshWNBA,
  } = useBasketballGames(selectedDate, "wnba");

  const {
    games: mmaGames,
    loading: mmaLoading,
    error: mmaError,
    refreshGames: refreshMMAGames,
  } = useMMAEvents({
    date: selectedDate,
    league: "ufc",
  });

  const {
    matches: atpMatches,
    loading: atpLoading,
    refreshMatches: refreshATPMatches,
  } = useTennisMatches(selectedDate, "atp");

  const {
    matches: wtaMatches,
    loading: wtaLoading,
    refreshMatches: refreshWTAMatches,
  } = useTennisMatches(selectedDate, "wta");

  const {
    games: mlsGames,
    loading: mlsLoading,
    refreshGames: refreshMLSGames,
  } = useSoccerGames(selectedDate, "mls");

  const {
    games: leaguesCupGames,
    loading: leaguesCupLoading,
    refreshGames: refreshLeaguesCupGames,
  } = useSoccerGames(selectedDate, "leaguescup");

  const {
    games: fifaGames,
    loading: fifaLoading,
    refreshGames: refreshFIFAGames,
  } = useSoccerGames(selectedDate, "fifa");

  const {
    games: eplGames,
    loading: eplLoading,
    refreshGames: refreshEPLGames,
  } = useSoccerGames(selectedDate, "epl");

  const {
    games: championsGames,
    loading: championsLoading,
    refreshGames: refreshChampionsGames,
  } = useSoccerGames(selectedDate, "champions");

  const {
    games: europaGames,
    loading: europaLoading,
    refreshGames: refreshEuropaGames,
  } = useSoccerGames(selectedDate, "europa");

  const {
    games: bundesligaGames,
    loading: bundesligaLoading,
    refreshGames: refreshBundesligaGames,
  } = useSoccerGames(selectedDate, "bundesliga");

  const {
    games: laligaGames,
    loading: laligaLoading,
    refreshGames: refreshLaligaGames,
  } = useSoccerGames(selectedDate, "laliga");

  const {
    games: ligue1Games,
    loading: ligue1Loading,
    refreshGames: refreshLigue1Games,
  } = useSoccerGames(selectedDate, "ligue1");

  const {
    games: ligue2Games,
    loading: ligue2Loading,
    refreshGames: refreshLigue2Games,
  } = useSoccerGames(selectedDate, "ligue2");

  const {
    games: msocGames,
    loading: msocLoading,
    refreshGames: refreshMensSoccerGames,
  } = useSoccerGames(selectedDate, "msoc");

  const {
    games: wsocGames,
    loading: wsocLoading,
    refreshGames: refreshWomensSoccerGames,
  } = useSoccerGames(selectedDate, "wsoc");

  const normalizedNBA = useMemo(
    () => normalizeGames(nbaGames, "nba"),
    [nbaGames],
  );
  const normalizedNFL = useMemo(
    () => normalizeGames(nflGames, "nfl"),
    [nflGames],
  );
  const normalizedUFL = useMemo(
    () => normalizeGames(uflGames, "ufl"),
    [uflGames],
  );
  const normalizedMLB = useMemo(
    () => normalizeGames(mlbGames, "mlb"),
    [mlbGames],
  );
  const normalizedNHL = useMemo(
    () => normalizeGames(nhlGames, "nhl"),
    [nhlGames],
  );
  const normalizedCFB = useMemo(
    () => normalizeGames(cfbGames, "cfb"),
    [cfbGames],
  );
  const normalizedMensMCBB = useMemo(
    () => normalizeGames(mensBasketballGames, "mcbb"),
    [mensBasketballGames],
  );
  const normalizedWomensMCBB = useMemo(
    () => normalizeGames(womensBasketballGames, "wcbb"),
    [womensBasketballGames],
  );
  const normalizedWNBA = useMemo(
    () => normalizeGames(wnbaGames, "wnba"),
    [wnbaGames],
  );
  const normalizedMLS = useMemo(
    () => normalizeGames(mlsGames, "mls"),
    [mlsGames],
  );
  const normalizedLeaguesCup = useMemo(
    () => normalizeGames(leaguesCupGames, "leaguescup"),
    [leaguesCupGames],
  );
  const normalizedFIFA = useMemo(
    () => normalizeGames(fifaGames, "fifa"),
    [fifaGames],
  );
  const normalizedEuropa = useMemo(
    () => normalizeGames(europaGames, "europa"),
    [europaGames],
  );
  const normalizedChampions = useMemo(
    () => normalizeGames(championsGames, "champions"),
    [championsGames],
  );
  const normalizedEPL = useMemo(
    () => normalizeGames(eplGames, "epl"),
    [eplGames],
  );
  const normalizedBundesliga = useMemo(
    () => normalizeGames(bundesligaGames, "bundesliga"),
    [bundesligaGames],
  );
  const normalizedLaliga = useMemo(
    () => normalizeGames(laligaGames, "laliga"),
    [laligaGames],
  );
  const normalizedLigue1 = useMemo(
    () => normalizeGames(ligue1Games, "ligue1"),
    [ligue1Games],
  );
  const normalizedLigue2 = useMemo(
    () => normalizeGames(ligue2Games, "ligue2"),
    [ligue2Games],
  );
  const normalizedMensSoccer = useMemo(
    () => normalizeGames(msocGames, "msoc"),
    [msocGames],
  );
  const normalizedWomensSoccer = useMemo(
    () => normalizeGames(wsocGames, "wsoc"),
    [wsocGames],
  );
  const normalizedMMA = useMemo(
    () => normalizeGames(mmaGames, "ufc"),
    [mmaGames],
  );

  const safeFilterByDate = useCallback(
    <Game extends LeagueGame>(
      games: readonly Game[],
      alreadyDateScoped = false,
    ): Game[] => {
      const filtered = filterByDate(games, selectedDate);

      if (alreadyDateScoped && games.length > 0 && filtered.length === 0) {
        return [...games];
      }

      return filtered;
    },
    [selectedDate],
  );

  const filteredNBA = useMemo(
    () => safeFilterByDate(normalizedNBA, true),
    [normalizedNBA, safeFilterByDate],
  );
  const filteredNFL = useMemo(
    () => safeFilterByDate(normalizedNFL, true),
    [normalizedNFL, safeFilterByDate],
  );
  const filteredUFL = useMemo(
    () => safeFilterByDate(normalizedUFL, true),
    [normalizedUFL, safeFilterByDate],
  );
  const filteredMLB = useMemo(
    () => safeFilterByDate(normalizedMLB, true),
    [normalizedMLB, safeFilterByDate],
  );
  const filteredNHL = useMemo(
    () => safeFilterByDate(normalizedNHL, true),
    [normalizedNHL, safeFilterByDate],
  );
  const filteredCFB = useMemo(
    () => safeFilterByDate(normalizedCFB, true),
    [normalizedCFB, safeFilterByDate],
  );
  const filteredMensMCBB = useMemo(
    () => safeFilterByDate(normalizedMensMCBB),
    [normalizedMensMCBB, safeFilterByDate],
  );
  const filteredWomensMCBB = useMemo(
    () => safeFilterByDate(normalizedWomensMCBB),
    [normalizedWomensMCBB, safeFilterByDate],
  );
  const filteredWNBA = useMemo(
    () => safeFilterByDate(normalizedWNBA),
    [normalizedWNBA, safeFilterByDate],
  );
  const filteredMLS = useMemo(
    () => safeFilterByDate(normalizedMLS),
    [normalizedMLS, safeFilterByDate],
  );
  const filteredLeaguesCup = useMemo(
    () => safeFilterByDate(normalizedLeaguesCup),
    [normalizedLeaguesCup, safeFilterByDate],
  );
  const filteredFIFA = useMemo(
    () => safeFilterByDate(normalizedFIFA),
    [normalizedFIFA, safeFilterByDate],
  );
  const filteredEPL = useMemo(
    () => safeFilterByDate(normalizedEPL),
    [normalizedEPL, safeFilterByDate],
  );
  const filteredChampions = useMemo(
    () => safeFilterByDate(normalizedChampions),
    [normalizedChampions, safeFilterByDate],
  );
  const filteredEuropa = useMemo(
    () => safeFilterByDate(normalizedEuropa),
    [normalizedEuropa, safeFilterByDate],
  );
  const filteredBundesliga = useMemo(
    () => safeFilterByDate(normalizedBundesliga),
    [normalizedBundesliga, safeFilterByDate],
  );
  const filteredLaliga = useMemo(
    () => safeFilterByDate(normalizedLaliga),
    [normalizedLaliga, safeFilterByDate],
  );
  const filteredLigue1 = useMemo(
    () => safeFilterByDate(normalizedLigue1),
    [normalizedLigue1, safeFilterByDate],
  );
  const filteredLigue2 = useMemo(
    () => safeFilterByDate(normalizedLigue2),
    [normalizedLigue2, safeFilterByDate],
  );
  const filteredMensSoccer = useMemo(
    () => safeFilterByDate(normalizedMensSoccer),
    [normalizedMensSoccer, safeFilterByDate],
  );
  const filteredWomensSoccer = useMemo(
    () => safeFilterByDate(normalizedWomensSoccer),
    [normalizedWomensSoccer, safeFilterByDate],
  );
  const filteredMMA = useMemo(
    () => safeFilterByDate(normalizedMMA, true),
    [normalizedMMA, safeFilterByDate],
  );

  const homeLeagueSources = useMemo<HomeLeagueSource[]>(() => {
    const gamesByLeague: Record<HomeLeagueId, readonly LeagueGame[]> = {
      nba: filteredNBA,
      nfl: filteredNFL,
      ufl: filteredUFL,
      mlb: filteredMLB,
      nhl: filteredNHL,
      cfb: filteredCFB,
      msoc: filteredMensSoccer,
      wsoc: filteredWomensSoccer,
      mls: filteredMLS,
      leaguescup: filteredLeaguesCup,
      fifa: filteredFIFA,
      europa: filteredEuropa,
      champions: filteredChampions,
      epl: filteredEPL,
      bundesliga: filteredBundesliga,
      laliga: filteredLaliga,
      ligue1: filteredLigue1,
      ligue2: filteredLigue2,
      mcbb: filteredMensMCBB,
      wcbb: filteredWomensMCBB,
      wnba: filteredWNBA,
      ufc: filteredMMA,
      atp: atpMatches,
      wta: wtaMatches,
    };

    return HOME_SCORE_LEAGUES.map((id) => ({
      id,
      games: gamesByLeague[id],
    }));
  }, [
    filteredNBA,
    filteredNFL,
    filteredUFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredMensSoccer,
    filteredWomensSoccer,
    filteredMLS,
    filteredLeaguesCup,
    filteredFIFA,
    filteredEuropa,
    filteredChampions,
    filteredEPL,
    filteredBundesliga,
    filteredLaliga,
    filteredLigue1,
    filteredLigue2,
    filteredMensMCBB,
    filteredWomensMCBB,
    filteredWNBA,
    filteredMMA,
    atpMatches,
    wtaMatches,
  ]);

  const homeGameSections = useMemo(
    () =>
      buildHomeGameSections({
        sources: homeLeagueSources,
        favoriteTeams: favorites,
        favoriteSports,
        favoriteSportsReady:
          favoriteSportsReady || (userId === null && favoriteTeamsReady),
      }),
    [
      favoriteSports,
      favoriteSportsReady,
      favorites,
      homeLeagueSources,
      userId,
      favoriteTeamsReady,
    ],
  );

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      const today = getStartOfToday();
      const shouldUpdateSelectedDate = !dayjs(selectedDate).isSame(
        today,
        "day",
      );

      if (shouldUpdateSelectedDate) {
        setSelectedDate(today);

        if (selectedTab === "scores") return;
      }

      if (selectedTab === "scores") {
        await Promise.allSettled([
          refreshNBAGames(),
          refreshMLBGames(),
          refreshNHLGames(),
          refreshNFLGames(),
          refreshUFLGames(),
          refreshCFBGames(),
          refreshMensMCBB(),
          refreshWomensMCBB(),
          refreshWNBA(),
          refreshMensSoccerGames(),
          refreshWomensSoccerGames(),
          refreshMLSGames(),
          refreshLeaguesCupGames(),
          refreshEPLGames(),
          refreshFIFAGames(),
          refreshChampionsGames(),
          refreshEuropaGames(),
          refreshBundesligaGames(),
          refreshLaligaGames(),
          refreshLigue1Games(),
          refreshLigue2Games(),
          refreshMMAGames(),
          refreshATPMatches(),
          refreshWTAMatches(),
        ]);
      } else {
        await forYouFeed.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const favoriteOrderReady =
    favoriteTeamsReady &&
    (userId === null || favoriteSportsReady || favoriteSportsError !== null);

  // Keep the list behind its loading state until every source that affects its
  // contents and personalized order has settled. Otherwise the first completed
  // request renders a partial list that visibly moves as later requests finish.
  const scoresLoading =
    !favoriteOrderReady ||
    nbaLoading ||
    mlbLoading ||
    nhlLoading ||
    nflLoading ||
    uflLoading ||
    cfbLoading ||
    mensMCBBLoading ||
    womensMCBBLoading ||
    wnbaLoading ||
    msocLoading ||
    wsocLoading ||
    mlsLoading ||
    leaguesCupLoading ||
    fifaLoading ||
    eplLoading ||
    europaLoading ||
    bundesligaLoading ||
    laligaLoading ||
    ligue1Loading ||
    ligue2Loading ||
    championsLoading ||
    mmaLoading ||
    atpLoading ||
    wtaLoading;

  const searchingUpcoming =
    isGeneralHome &&
    !scoresLoading &&
    homeGameSections.length === 0 &&
    dayjs(selectedDate).diff(dayjs(getStartOfToday()), "day") < 7;

  useEffect(() => {
    if (selectedTab !== "scores" || !searchingUpcoming) return;
    const timer = setTimeout(
      () => setSelectedDate((date) => dayjs(date).add(1, "day").toDate()),
      250,
    );
    return () => clearTimeout(timer);
  }, [selectedTab, searchingUpcoming, selectedDate]);

  return {
    isGeneralHome,
    selectedDate,
    setSelectedDate,
    currentUserId: userId,
    favorites,
    refreshing,
    handleRefresh,
    homeGameSections,
    forYouError: forYouFeed.error,
    errorFights: mmaError,
    forYouLoading: forYouFeed.loading,
    forYouArticles: forYouFeed.articles,
    forYouPosts: forYouFeed.posts,
    forYouPredictions: forYouFeed.predictions,
    favoriteLeagues: forYouFeed.favoriteLeagues,
    loading:
      selectedTab === "scores"
        ? scoresLoading || refreshing || searchingUpcoming
        : forYouFeed.loading,
  };
}
