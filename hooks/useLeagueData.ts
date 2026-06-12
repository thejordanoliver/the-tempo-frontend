import { Colors } from "@/constants/styles";
import { usePreferences } from "@/contexts/PreferencesContext";
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
import { useSoccerGames } from "./SoccerHooks/useSoccerGames";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useLeagueData() {
  const currentFootballSeason = getFootballSeason();
  const { resolvedColorScheme, viewMode } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const { favorites, isLoading } = useFavoriteTeamsContext();

  const [refreshing, setRefreshing] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate(),
  );

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
    games: cbGames,
    loading: cbLoading,
    refreshGames: refreshCBGames,
  } = useBaseballGames(selectedDate, "cb");

  const {
    games: sbGames,
    loading: sbLoading,
    refreshGames: refreshSBGames,
  } = useBaseballGames(selectedDate, "sb");

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
    refreshGames: refreshMensCBBGames,
  } = useBasketballGames(selectedDate, "cbb");

  const {
    games: slvGames,
    loading: slvLoading,
    refreshGames: refreshSLVGames,
  } = useBasketballGames(selectedDate, "summervegas");

  const {
    games: sluGames,
    loading: sluLoading,
    refreshGames: refreshSLUGames,
  } = useBasketballGames(selectedDate, "summerutah");

  const {
    games: womensBasketballGames,
    loading: womensCBBLoading,
    refreshGames: refreshWomensCBBGames,
  } = useBasketballGames(selectedDate, "wcbb");

  const {
    games: wnbaGames,
    loading: wnbaLoading,
    refreshGames: refreshWNBAGames,
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

  const normalizedCB = useMemo(() => normalizeGames(cbGames, "CB"), [cbGames]);

  const normalizedSB = useMemo(() => normalizeGames(sbGames, "SB"), [sbGames]);

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

  const normalizedSLV = useMemo(
    () => normalizeGames(slvGames, "NBA"),
    [slvGames],
  );

  const normalizedSLU = useMemo(
    () => normalizeGames(sluGames, "NBA"),
    [sluGames],
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

  const filteredCB = useMemo(
    () => safeFilterByDate(normalizedCB, true),
    [normalizedCB, safeFilterByDate],
  );

  const filteredSB = useMemo(
    () => safeFilterByDate(normalizedSB, true),
    [normalizedSB, safeFilterByDate],
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
  // FAVORITES / SORT HELPERS
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
      ...collect(filteredCB, "CB"),
      ...collect(filteredSB, "SB"),
      ...collect(filteredMensCBB, "CBB"),
      ...collect(filteredWomensCBB, "WCBB"),
      ...collect(filteredWNBA, "WNBA"),
      ...collect(filteredMLS, "MLS"),
      ...collect(filteredFIFA, "FIFA"),
      ...collect(filteredEPL, "EPL"),
      ...collect(filteredCHAMPIONS, "CHAMPIONS"),
      ...collect(filteredEUROPA, "EUROPA"),
      ...collect(filteredBUNDESLIGA, "BUNDESLIGA"),
    ];
  }, [
    isFavoriteGame,
    filteredNBA,
    filteredNFL,
    filteredUFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredCB,
    filteredSB,
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
  // SECTIONS
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
        category: "College Baseball",
        data: limitNonFavorites(filteredCB, "CB"),
      },
      {
        category: "College Softball",
        data: limitNonFavorites(filteredSB, "SB"),
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
        category: "English Premier League",
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
    filteredCB,
    filteredSB,
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
  // CALENDAR MARKED DATES
  // ===========================

  const markedDates = useMemo(() => {
    const all = [
      ...normalizedNBA,
      ...normalizedSLV,
      ...normalizedSLU,
      ...normalizedWNBA,
      ...normalizedNFL,
      ...normalizedUFL,
      ...normalizedMLB,
      ...normalizedCB,
      ...normalizedSB,
      ...normalizedCFB,
      ...normalizedNHL,
      ...normalizedMensCBB,
      ...normalizedWomensCBB,
      ...normalizedFIFA,
      ...normalizedMLS,
      ...normalizedEPL,
      ...normalizedEuropa,
      ...normalizedBundesliga,
      ...normalizedChampions,
    ];

    const dotColor = isDark ? Colors.white : Colors.black;

    return Object.fromEntries(
      all.map((g) => [
        dayjs(g.date).format("YYYY-MM-DD"),
        { marked: true, dotColor },
      ]),
    );
  }, [
    normalizedNBA,
    normalizedSLV,
    normalizedSLU,
    normalizedWNBA,
    normalizedNFL,
    normalizedUFL,
    normalizedMLB,
    normalizedCB,
    normalizedSB,
    normalizedNHL,
    normalizedCFB,
    normalizedMensCBB,
    normalizedWomensCBB,
    normalizedFIFA,
    normalizedMLS,
    normalizedEPL,
    normalizedEuropa,
    normalizedBundesliga,
    normalizedChampions,
    isDark,
  ]);

  // ===========================
  // REFRESH
  // ===========================

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.allSettled([
        refreshNBAGames(),
        refreshMLBGames(),
        refreshNHLGames(),
        refreshNFLGames(),
        refreshUFLGames(),
        refreshCFBGames(),
        refreshMensCBBGames(),
        refreshWomensCBBGames(),
        refreshWNBAGames(),
        refreshCBGames(),
        refreshSBGames(),
        refreshSLVGames(),
        refreshSLUGames(),
        refreshMLSGames(),
        refreshEPLGames(),
        refreshFIFAGames(),
        refreshChampionsGames(),
        refreshEuropaGames(),
        refreshBundesligaGames(),
        refreshFights(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // ===========================
  // LOADING
  // ===========================

  const loading =
    isLoading &&
    nbaLoading &&
    mlbLoading &&
    nhlLoading &&
    nflLoading &&
    uflLoading &&
    cfbLoading &&
    cbLoading &&
    sbLoading &&
    slvLoading &&
    sluLoading &&
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
    errorFights,
    loading,
    markedDates,
    viewMode,
  };
}