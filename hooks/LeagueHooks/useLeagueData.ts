import { Colors } from "@/constants/styles";
import { MY_TEAMS_SECTION_TITLE } from "@/constants/leagues";
import { usePreferences } from "@/contexts/PreferencesContext";
import { filterByDate, getFootballSeason } from "@/utils/dateUtils";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCallback, useMemo, useState } from "react";
import { buildFavoriteTeamKey } from "types/favorites";
import { isGameLive, normalizeGames } from "utils/games";
import { useBaseballGames } from "../BaseballHooks/useBaseballGames";
import { useBasketballGames } from "../BasketballHooks/useBasketballGames";
import { useFootballGames } from "../FootballHooks/useFootballGames";
import { useHockeyGames } from "../HockeyHooks/useHockeyGames";
import { useMMAEvents } from "../MMAHooks/useMMAEvents";
import { useSoccerGames } from "../SoccerHooks/useSoccerGames";

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
    data: mmaResponse,
    loading: mmaLoading,
    refreshGames: refreshMMAGames,
    error: mmaError,
  } = useMMAEvents({
    league: "ufc",
    date: selectedDate,
    enabled: Boolean(selectedDate),
  });

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

  const mmaGames = useMemo(() => {
    const events = Array.isArray(mmaResponse?.events)
      ? mmaResponse.events
      : Array.isArray(mmaResponse?.games)
        ? mmaResponse.games
        : [];

    return events.flatMap((event: any) => {
      const fights = Array.isArray(event?.fights) ? event.fights : [];

      if (!fights.length) {
        return [event];
      }

      return [...fights]
        .filter(Boolean)
        .sort((a: any, b: any) => {
          const aOrder = Number(a?.order ?? 999);
          const bOrder = Number(b?.order ?? 999);

          return aOrder - bOrder;
        })
        .map((fight: any, index: number) => {
          const fightId =
            fight?.id ??
            fight?.uid ??
            `${event?.id ?? event?.uid ?? "ufc-event"}-fight-${index}`;

          const fightDate =
            fight?.date ??
            fight?.startDate ??
            fight?.raw?.date ??
            fight?.raw?.startDate ??
            event?.date ??
            event?.startDate ??
            null;

          return {
            ...fight,

            id: fightId,
            gameId: fightId,
            eventId: fightId,
            parentEventId: event?.id ?? null,

            league: event?.league ?? mmaResponse?.leagueInfo ?? null,
            season: event?.season ?? mmaResponse?.season ?? null,

            date: fightDate,
            startDate: fightDate,
            timestamp: event?.timestamp ?? null,

            venue: fight?.venue ?? fight?.raw?.venue ?? event?.venue ?? null,
            broadcasts: Array.isArray(fight?.broadcasts)
              ? fight.broadcasts
              : (event?.broadcasts ?? []),
            geoBroadcasts:
              fight?.geoBroadcasts ??
              fight?.raw?.geoBroadcasts ??
              event?.geoBroadcasts ??
              [],

            eventName: event?.name ?? null,
            eventShortName: event?.shortName ?? null,
            parentEvent: event,

            mainEvent: fight,
            fights: [fight],
          };
        });
    });
  }, [mmaResponse]);

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

  const normalizedCB = useMemo(() => normalizeGames(cbGames, "cb"), [cbGames]);

  const normalizedSB = useMemo(() => normalizeGames(sbGames, "sb"), [sbGames]);

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

  const normalizedSLV = useMemo(
    () => normalizeGames(slvGames, "nba"),
    [slvGames],
  );

  const normalizedSLU = useMemo(
    () => normalizeGames(sluGames, "nba"),
    [sluGames],
  );

  const normalizedWNBA = useMemo(
    () => normalizeGames(wnbaGames, "wnba"),
    [wnbaGames],
  );

  const normalizedMLS = useMemo(
    () => normalizeGames(mlsGames, "mls"),
    [mlsGames],
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

  const filteredMMA = useMemo(
    () => safeFilterByDate(normalizedMMA, true),
    [normalizedMMA, safeFilterByDate],
  );

  // ===========================
  // FAVORITES / SORT HELPERS
  // ===========================

  const isFavoriteGame = useCallback(
    (g: any, prefix: string) => {
      const homeId = g?.home?.id;
      const awayId = g?.away?.id;
      const homeKey = buildFavoriteTeamKey(prefix, homeId);
      const awayKey = buildFavoriteTeamKey(prefix, awayId);

      return (
        (homeKey !== null && favorites.includes(homeKey)) ||
        (awayKey !== null && favorites.includes(awayKey))
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
      ...collect(filteredNBA, "nba"),
      ...collect(filteredNFL, "nfl"),
      ...collect(filteredUFL, "ufl"),
      ...collect(filteredMLB, "mlb"),
      ...collect(filteredNHL, "nhl"),
      ...collect(filteredCFB, "cfb"),
      ...collect(filteredCB, "cb"),
      ...collect(filteredSB, "sb"),
      ...collect(filteredMensCBB, "cbb"),
      ...collect(filteredWomensCBB, "wcbb"),
      ...collect(filteredWNBA, "wnba"),
      ...collect(filteredMLS, "mls"),
      ...collect(filteredFIFA, "fifa"),
      ...collect(filteredEPL, "epl"),
      ...collect(filteredCHAMPIONS, "champions"),
      ...collect(filteredEUROPA, "europa"),
      ...collect(filteredBUNDESLIGA, "bundesliga"),
      ...collect(filteredMMA, "ufc"),
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
    filteredMMA,
  ]);

  // ===========================
  // SECTIONS
  // ===========================

  const gamesByCategory = useMemo(() => {
    const sections = [
      {
        category: MY_TEAMS_SECTION_TITLE,
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
        category: "College Baseball",
        data: limitNonFavorites(filteredCB, "cb"),
      },
      {
        category: "College Softball",
        data: limitNonFavorites(filteredSB, "sb"),
      },
      {
        category: "MLS",
        data: limitNonFavorites(filteredMLS, "mls"),
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
        data: limitNonFavorites(filteredMMA, "ufc"),
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
    filteredMMA,
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
      ...normalizedMMA,
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
    normalizedMMA,
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
        refreshMMAGames(),
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
    mmaLoading &&
    gamesByCategory.length === 0;

  return {
    selectedDate,
    setSelectedDate,
    favorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    errorFights: mmaError,
    loading,
    markedDates,
    viewMode,
  };
}
