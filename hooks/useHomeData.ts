import { CombinedGamesSection } from "@/types/leagues";
import { filterByDate, getFootballSeason } from "@/utils/dateUtils";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useMemo, useState } from "react";
import { isGameLive, normalizeGames } from "utils/games";
import { useBaseballGames } from "./BaseballHooks/useBaseballGames";
import { useBasketballGames } from "./BasketballHooks/useBasketballGames";
import { useFootballGames } from "./FootballHooks/useFootballGames";
import { useHockeyGames } from "./HockeyHooks/useHockeyGames";
import { useMMAEvents } from "./MMAHooks/useMMAEvents";
import { useAllNews } from "./NewsHooks/useAllNews";
import { useSoccerGames } from "./SoccerHooks/useSoccerGames";

dayjs.extend(utc);
dayjs.extend(timezone);

const getStartOfToday = () => dayjs().startOf("day").toDate();

export function useHomeData(selectedTab: "scores" | "news") {
  const currentFootballSeason = getFootballSeason();
  const { favorites } = useFavoriteTeamsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getStartOfToday);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refresh,
  } = useAllNews(30);

  // ===========================
  // DATA SOURCES
  // ===========================

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
    season: currentFootballSeason,
    league: "cfb",
  });

  const {
    games: nflGames,
    loading: nflLoading,
    refreshGames: refreshNFLGames,
  } = useFootballGames({
    date: selectedDate,
    season: currentFootballSeason,
    league: "nfl",
  });

  const {
    games: uflGames,
    loading: uflLoading,
    refreshGames: refreshUFLGames,
  } = useFootballGames({
    date: selectedDate,
    season: currentFootballSeason,
    league: "ufl",
  });

  const {
    games: mensBasketballGames,
    loading: mensCBBLoading,
    refreshGames: refreshMensCBB,
  } = useBasketballGames(selectedDate, "cbb");

  const {
    games: womensBasketballGames,
    loading: womensCBBLoading,
    refreshGames: refreshWomensCBB,
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

  // ===========================
  // NORMALIZED DATA
  // ===========================

  const normalizedNBA = useMemo(
    () => normalizeGames(nbaGames, "nba"),
    [nbaGames],
  );

  const normalizedMLB = useMemo(
    () => normalizeGames(mlbGames, "mlb"),
    [mlbGames],
  );

  const normalizedNHL = useMemo(
    () => normalizeGames(nhlGames, "nhl"),
    [nhlGames],
  );

  const normalizedNFL = useMemo(
    () => normalizeGames(nflGames, "nfl"),
    [nflGames],
  );

  const normalizedUFL = useMemo(
    () => normalizeGames(uflGames, "ufl"),
    [uflGames],
  );

  const normalizedCFB = useMemo(
    () => normalizeGames(cfbGames, "cfb"),
    [cfbGames],
  );

  const normalizedMensCBB = useMemo(
    () => normalizeGames(mensBasketballGames, "cbb"),
    [mensBasketballGames],
  );

  const normalizedWomensCBB = useMemo(
    () => normalizeGames(womensBasketballGames, "wcbb"),
    [womensBasketballGames],
  );

  const normalizedWNBA = useMemo(
    () => normalizeGames(wnbaGames, "wnba"),
    [wnbaGames],
  );

  const normalizedMLS = useMemo(
    () => normalizeGames(mlsGames, "mlb"),
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

  const normalizedMMA = useMemo(() => {
    return Array.isArray(mmaGames) ? mmaGames : [];
  }, [mmaGames]);

  // ===========================
  // SAFE DATE FILTER
  // ===========================
  // Some hooks already fetch by selectedDate.
  // If the backend already returns date-scoped games, do not let a timezone mismatch
  // wipe out the section completely.

  const safeFilterByDate = useCallback(
    (games: any[], alreadyDateScoped = false) => {
      const filtered = filterByDate(games, selectedDate);

      if (alreadyDateScoped && games.length > 0 && filtered.length === 0) {
        return games;
      }

      return filtered;
    },
    [selectedDate],
  );

  // ===========================
  // FILTERED
  // ===========================

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

  const filteredMensCBB = useMemo(
    () => safeFilterByDate(normalizedMensCBB, false),
    [normalizedMensCBB, safeFilterByDate],
  );

  const filteredWomensCBB = useMemo(
    () => safeFilterByDate(normalizedWomensCBB, false),
    [normalizedWomensCBB, safeFilterByDate],
  );

  const filteredWNBA = useMemo(
    () => safeFilterByDate(normalizedWNBA, false),
    [normalizedWNBA, safeFilterByDate],
  );

  const filteredMLS = useMemo(
    () => safeFilterByDate(normalizedMLS, false),
    [normalizedMLS, safeFilterByDate],
  );

  const filteredLEAGUESCUP = useMemo(
    () => safeFilterByDate(normalizedLeaguesCup, false),
    [normalizedLeaguesCup, safeFilterByDate],
  );

  const filteredFIFA = useMemo(
    () => safeFilterByDate(normalizedFIFA, false),
    [normalizedFIFA, safeFilterByDate],
  );

  const filteredEPL = useMemo(
    () => safeFilterByDate(normalizedEPL, false),
    [normalizedEPL, safeFilterByDate],
  );

  const filteredCHAMPIONS = useMemo(
    () => safeFilterByDate(normalizedChampions, false),
    [normalizedChampions, safeFilterByDate],
  );

  const filteredEUROPA = useMemo(
    () => safeFilterByDate(normalizedEuropa, false),
    [normalizedEuropa, safeFilterByDate],
  );

  const filteredBUNDESLIGA = useMemo(
    () => safeFilterByDate(normalizedBundesliga, false),
    [normalizedBundesliga, safeFilterByDate],
  );

  const filteredMMA = useMemo(
    () => safeFilterByDate(normalizedMMA, true),
    [normalizedMMA, safeFilterByDate],
  );

  // ===========================
  // HELPERS
  // ===========================

  const isFavoriteGame = useCallback(
    (g: any, prefix: string) => {
      const homeId = g?.home?.id;
      const awayId = g?.away?.id;

      return (
        (homeId && favorites.includes(`${prefix}:${String(homeId)}`)) ||
        (awayId && favorites.includes(`${prefix}:${String(awayId)}`))
      );
    },
    [favorites],
  );

  const sortLiveFirst = useCallback(
    (games: any[]) =>
      [...games].sort((a, b) => Number(isGameLive(b)) - Number(isGameLive(a))),
    [],
  );

  const limitNonFavorites = useCallback(
    (games: any[], prefix: string, max = 5) =>
      sortLiveFirst(games.filter((g) => !isFavoriteGame(g, prefix))).slice(
        0,
        max,
      ),
    [isFavoriteGame, sortLiveFirst],
  );

  // ===========================
  // FAVORITES
  // ===========================

  const favoriteGames = useMemo(() => {
    const collect = (games: any[], prefix: string) =>
      games.filter((g) => isFavoriteGame(g, prefix));

    return [
      ...collect(filteredNBA, "nba"),
      ...collect(filteredNFL, "nfl"),
      ...collect(filteredUFL, "ufl"),
      ...collect(filteredMLB, "mlb"),
      ...collect(filteredNHL, "nhl"),
      ...collect(filteredCFB, "cfb"),
      ...collect(filteredMensCBB, "cbb"),
      ...collect(filteredWomensCBB, "wcbb"),
      ...collect(filteredWNBA, "wnba"),
      ...collect(filteredMLS, "mls"),
      ...collect(filteredFIFA, "fifa"),
      ...collect(filteredEPL, "epl"),
      ...collect(filteredLEAGUESCUP, "leaguescup"),
      ...collect(filteredCHAMPIONS, "champions"),
      ...collect(filteredEUROPA, "europa"),
      ...collect(filteredBUNDESLIGA, "bundesliga"),
      ...collect(filteredMMA, "mma"),
    ];
  }, [
    isFavoriteGame,
    filteredNBA,
    filteredNFL,
    filteredUFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
    filteredWNBA,
    filteredMLS,
    filteredLEAGUESCUP,
    filteredFIFA,
    filteredEPL,
    filteredCHAMPIONS,
    filteredEUROPA,
    filteredBUNDESLIGA,
    filteredMMA,
  ]);

  // ===========================
  // FINAL SECTIONS
  // ===========================

  const gamesByCategory: CombinedGamesSection[] = useMemo(() => {
    const sections: CombinedGamesSection[] = [
      {
        category: "Favorites",
        data: sortLiveFirst(favoriteGames),
      },
      {
        category: "NBA",
        data: limitNonFavorites(filteredNBA, "nba"),
      },
      {
        category: "NFL",
        data: limitNonFavorites(filteredNFL, "nfl"),
      },
      {
        category: "UFL",
        data: limitNonFavorites(filteredUFL, "ufl"),
      },
      {
        category: "MLB",
        data: limitNonFavorites(filteredMLB, "mlb"),
      },
      {
        category: "NHL",
        data: limitNonFavorites(filteredNHL, "nhl"),
      },
      {
        category: "College Football",
        data: limitNonFavorites(filteredCFB, "cfb"),
      },
      {
        category: "MLS",
        data: limitNonFavorites(filteredMLS, "mls"),
      },
      {
        category: "Leagues Cup",
        data: limitNonFavorites(filteredLEAGUESCUP, "leaguescup"),
      },
      {
        category: "FIFA World Cup",
        data: limitNonFavorites(filteredFIFA, "fifa"),
      },
      {
        category: "UEFA Europa League",
        data: limitNonFavorites(filteredEUROPA, "europa"),
      },
      {
        category: "UEFA Champions League",
        data: limitNonFavorites(filteredCHAMPIONS, "champions"),
      },
      {
        category: "English Premier League",
        data: limitNonFavorites(filteredEPL, "epl"),
      },
      {
        category: "German Bundesliga",
        data: limitNonFavorites(filteredBUNDESLIGA, "bundesliga"),
      },
      {
        category: "Men's College Basketball",
        data: limitNonFavorites(filteredMensCBB, "cbb"),
      },
      {
        category: "Women's College Basketball",
        data: limitNonFavorites(filteredWomensCBB, "wcbb"),
      },
      {
        category: "WNBA",
        data: limitNonFavorites(filteredWNBA, "wnba"),
      },
      {
        category: "MMA",
        data: limitNonFavorites(filteredMMA, "mma"),
      },
    ];

    return sections.filter((section) => section.data.length > 0);
  }, [
    sortLiveFirst,
    limitNonFavorites,
    favoriteGames,
    filteredNBA,
    filteredNFL,
    filteredUFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
    filteredWNBA,
    filteredMLS,
    filteredLEAGUESCUP,
    filteredEPL,
    filteredFIFA,
    filteredEUROPA,
    filteredCHAMPIONS,
    filteredBUNDESLIGA,
    filteredMMA,
  ]);

  // ===========================
  // REFRESH
  // ===========================

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

        if (selectedTab === "scores") {
          return;
        }
      }

      if (selectedTab === "scores") {
        await Promise.allSettled([
          refreshNBAGames(),
          refreshMLBGames(),
          refreshNHLGames(),
          refreshNFLGames(),
          refreshUFLGames(),
          refreshCFBGames(),
          refreshMensCBB(),
          refreshWomensCBB(),
          refreshWNBA(),
          refreshMLSGames(),
          refreshLeaguesCupGames(),
          refreshEPLGames(),
          refreshFIFAGames(),
          refreshChampionsGames(),
          refreshEuropaGames(),
          refreshBundesligaGames(),
          refreshMMAGames(),
        ]);
      }

      if (selectedTab === "news") {
        await Promise.allSettled([refresh()]);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const scoresLoading =
    nbaLoading &&
    mlbLoading &&
    nhlLoading &&
    nflLoading &&
    uflLoading &&
    cfbLoading &&
    mensCBBLoading &&
    womensCBBLoading &&
    wnbaLoading &&
    mlsLoading &&
    leaguesCupLoading &&
    fifaLoading &&
    eplLoading &&
    europaLoading &&
    bundesligaLoading &&
    championsLoading &&
    mmaLoading &&
    gamesByCategory.length === 0;

  return {
    selectedDate,
    setSelectedDate,
    favorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    newsError,
    errorFights: mmaError,
    newsLoading,
    articles,
    loading: selectedTab === "scores" ? scoresLoading : newsLoading,
  };
}
