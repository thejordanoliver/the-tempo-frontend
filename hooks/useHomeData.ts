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
import { useWeeklyFights } from "./MMAHooks/useWeeklyFights";
import { useAllNews } from "./NewsHooks/useAllNews";
import { useSoccerGames } from "./SoccerHooks/useSoccerGames";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useHomeData(selectedTab: "scores" | "news") {
  const currentFootballSeason = getFootballSeason();
  const { favorites } = useFavoriteTeamsContext();

  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate(),
  );

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refresh,
  } = useAllNews(10);

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
    fights,
    loading: loadingFights,
    error: errorFights,
    refreshFights,
  } = useWeeklyFights();

  const {
    games: mlsGames,
    loading: mlsLoading,
    refreshGames: refreshMLSGames,
  } = useSoccerGames(selectedDate, "mls");

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
    () => normalizeGames(nbaGames, "NBA"),
    [nbaGames],
  );

  const normalizedMLB = useMemo(
    () => normalizeGames(mlbGames, "MLB"),
    [mlbGames],
  );

  const normalizedNHL = useMemo(
    () => normalizeGames(nhlGames, "NHL"),
    [nhlGames],
  );

  const normalizedNFL = useMemo(
    () => normalizeGames(nflGames, "NFL"),
    [nflGames],
  );

  const normalizedUFL = useMemo(
    () => normalizeGames(uflGames, "UFL"),
    [uflGames],
  );

  const normalizedCFB = useMemo(
    () => normalizeGames(cfbGames, "CFB"),
    [cfbGames],
  );

  const normalizedMensCBB = useMemo(
    () => normalizeGames(mensBasketballGames, "CBB"),
    [mensBasketballGames],
  );

  const normalizedWomensCBB = useMemo(
    () => normalizeGames(womensBasketballGames, "WCBB"),
    [womensBasketballGames],
  );

  const normalizedWNBA = useMemo(
    () => normalizeGames(wnbaGames, "WNBA"),
    [wnbaGames],
  );

  const normalizedMLS = useMemo(
    () => normalizeGames(mlsGames, "MLS"),
    [mlsGames],
  );
  const normalizedFIFA = useMemo(
    () => normalizeGames(fifaGames, "FIFA"),
    [fifaGames],
  );

  const normalizedEuropa = useMemo(
    () => normalizeGames(europaGames, "EUROPA"),
    [europaGames],
  );

  const normalizedChampions = useMemo(
    () => normalizeGames(championsGames, "CHAMPIONS"),
    [championsGames],
  );

  const normalizedEPL = useMemo(
    () => normalizeGames(eplGames, "EPL"),
    [eplGames],
  );

  const normalizedBundesliga = useMemo(
    () => normalizeGames(bundesligaGames, "BUNDESLIGA"),
    [bundesligaGames],
  );

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
      ...collect(filteredNBA, "NBA"),
      ...collect(filteredNFL, "NFL"),
      ...collect(filteredUFL, "UFL"),
      ...collect(filteredMLB, "MLB"),
      ...collect(filteredNHL, "NHL"),
      ...collect(filteredCFB, "CFB"),
      ...collect(filteredMensCBB, "CBB"),
      ...collect(filteredWomensCBB, "WCBB"),
      ...collect(filteredWNBA, "WNBA"),
      ...collect(filteredMLS, "MLS"),
      ...collect(filteredFIFA, "FIFA"),
      ...collect(filteredEPL, "EPL"),
      ...collect(filteredCHAMPIONS, "CHAMPIONS"),
      ...collect(filteredEUROPA, "EUROPA"),
      ...collect(filteredBUNDESLIGA, "EUROPA"),
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
    filteredFIFA,
    filteredEPL,
    filteredCHAMPIONS,
    filteredEUROPA,
    filteredBUNDESLIGA,
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
        data: limitNonFavorites(filteredNBA, "NBA"),
      },
      {
        category: "NFL",
        data: limitNonFavorites(filteredNFL, "NFL"),
      },
      {
        category: "UFL",
        data: limitNonFavorites(filteredUFL, "UFL"),
      },
      {
        category: "MLB",
        data: limitNonFavorites(filteredMLB, "MLB"),
      },
      {
        category: "NHL",
        data: limitNonFavorites(filteredNHL, "NHL"),
      },
      {
        category: "College Football",
        data: limitNonFavorites(filteredCFB, "CFB"),
      },
      {
        category: "MLS",
        data: limitNonFavorites(filteredMLS, "MLS"),
      },
      {
        category: "FIFA World Cup",
        data: limitNonFavorites(filteredFIFA, "FIFA"),
      },
      {
        category: "UEFA Europa League",
        data: limitNonFavorites(filteredEUROPA, "EUROPA"),
      },
      {
        category: "UEFA Champions League",
        data: limitNonFavorites(filteredCHAMPIONS, "CHAMPIONS"),
      },
      {
        category: "English Premiere League",
        data: limitNonFavorites(filteredEPL, "EPL"),
      },
      {
        category: "German Bundesliga",
        data: limitNonFavorites(filteredBUNDESLIGA, "BUNDESLIGA"),
      },
      {
        category: "Men's College Basketball",
        data: limitNonFavorites(filteredMensCBB, "CBB"),
      },
      {
        category: "Women's College Basketball",
        data: limitNonFavorites(filteredWomensCBB, "WCBB"),
      },
      {
        category: "WNBA",
        data: limitNonFavorites(filteredWNBA, "WNBA"),
      },
      {
        category: "MMA",
        data: fights.slice(0, 5),
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
    filteredEPL,
    filteredFIFA,
    filteredEUROPA,
    filteredCHAMPIONS,
    filteredBUNDESLIGA,
    fights,
  ]);

  // ===========================
  // REFRESH
  // ===========================

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
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
          refreshEPLGames(),
          refreshFIFAGames(),
          refreshChampionsGames(),
          refreshEuropaGames(),
          refreshBundesligaGames(),
          refreshFights(),
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
    fifaLoading &&
    eplLoading &&
    europaLoading &&
    bundesligaLoading &&
    championsLoading &&
    loadingFights &&
    gamesByCategory.length === 0;

  return {
    selectedDate,
    setSelectedDate,
    favorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    newsError,
    errorFights,
    newsLoading,
    articles,
    loading: selectedTab === "scores" ? scoresLoading : newsLoading,
  };
}
