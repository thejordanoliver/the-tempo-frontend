import { useBasketballWeeklyGames } from "@/hooks/BasketballHooks/useBasketballWeeklyGames";
import { filterByDate } from "@/utils/dateUtils";
import { CombinedGamesSection } from "components/League/CombinedGamesList";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useFootballWeeklyGames } from "hooks/FootballHooks/useFootballWeeklyGames";
import { useWeeklyGames } from "hooks/NBAHooks/useWeeklyGames";
import { useCallback, useMemo, useState } from "react";
import { isLiveGame, normalizeGames } from "utils/games";
import { useBaseballGames } from "./BaseballHooks/useBaseballGames";
import { useHockeyGames } from "./HockeyHooks/useHockeyGames";
import { useWeeklyFights } from "./MMAHooks/useWeeklyFights";
import { useAllNews } from "./NewsHooks/useAllNews";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useHomeData(selectedTab: "scores" | "news") {
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

  // const { socialData, socialLoading, socialError } = useLeagueSocial(
  //   undefined,
  //   15,
  //   ["nba", "nfl", "ufc"],
  // );

  // ===========================
  // DATA SOURCES
  // ===========================
  const {
    games: weeklyGames,
    loading: nbaLoading,
    refreshGames,
  } = useWeeklyGames();

  const {
    games: weeklyMLBGames,
    loading: mlbLoading,
    refreshGames: refreshMLBGames,
  } = useBaseballGames(selectedDate, "mlb");

  const {
    games: weeklyNHLGames,
    loading: nhlLoading,
    refreshGames: refreshNHLGames,
  } = useHockeyGames(selectedDate, "nhl");

  const {
    games: nflGames,
    loading: nflLoading,
    refetch: refreshNFL,
  } = useFootballWeeklyGames(1);

  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshCFB,
  } = useFootballWeeklyGames(2);

  const {
    basketballGames: mensBasketballGames,
    cbbLoading: mensCBBLoading,
    refresh: refreshMensCBB,
  } = useBasketballWeeklyGames();

  const {
    basketballGames: womensBasketballGames,
    cbbLoading: womensCBBLoading,
    refresh: refreshWomensCBB,
  } = useBasketballWeeklyGames({ isWomen: true });

  const {
    basketballGames: wnbaGames,
    cbbLoading: wnbaLoading,
    refresh: refreshWNBA,
  } = useBasketballWeeklyGames({ isWNBA: true });

  const {
    fights,
    loading: loadingFights,
    error: errorFights,
    refreshFights,
  } = useWeeklyFights();

  // ===========================
  // NORMALIZED DATA
  // ===========================
  const normalizedNBA = useMemo(
    () => normalizeGames(weeklyGames, "NBA"),
    [weeklyGames],
  );

  const normalizedMLB = useMemo(
    () => normalizeGames(weeklyMLBGames, "MLB"),
    [weeklyMLBGames],
  );

  const normalizedNHL = useMemo(
    () => normalizeGames(weeklyNHLGames, "NHL"),
    [weeklyNHLGames],
  );

  const normalizedNFL = useMemo(
    () => normalizeGames(nflGames, "NFL"),
    [nflGames],
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
    () => normalizeGames(womensBasketballGames, "CBB"),
    [womensBasketballGames],
  );

  const normalizedWNBA = useMemo(
    () => normalizeGames(wnbaGames, "WNBA"),
    [wnbaGames],
  );

  // ===========================
  // FILTERED
  // ===========================
  const filteredNBA = filterByDate(normalizedNBA, selectedDate);
  const filteredNFL = filterByDate(normalizedNFL, selectedDate);
  const filteredMLB = filterByDate(normalizedMLB, selectedDate);
  const filteredNHL = filterByDate(normalizedNHL, selectedDate);
  const filteredCFB = filterByDate(normalizedCFB, selectedDate);
  const filteredMensCBB = filterByDate(normalizedMensCBB, selectedDate);
  const filteredWomensCBB = filterByDate(normalizedWomensCBB, selectedDate);
  const filteredWNBA = filterByDate(normalizedWNBA, selectedDate);

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
      [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a))),
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
      ...collect(filteredMLB, "MLB"),
      ...collect(filteredNHL, "NHL"),
      ...collect(filteredCFB, "CFB"),
      ...collect(filteredMensCBB, "CBB"),
      ...collect(filteredWomensCBB, "WCBB"),
      ...collect(filteredWNBA, "WNBA"),
    ];
  }, [
    isFavoriteGame,
    filteredNBA,
    filteredNFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
    filteredWNBA,
  ]);

  // ===========================
  // FINAL SECTIONS
  // ===========================
  const gamesByCategory: CombinedGamesSection[] = useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites", data: sortLiveFirst(favoriteGames) },
      { category: "NBA", data: limitNonFavorites(filteredNBA, "NBA") },
      { category: "NFL", data: limitNonFavorites(filteredNFL, "NFL") },
      { category: "MLB", data: limitNonFavorites(filteredMLB, "MLB") },
      { category: "NHL", data: limitNonFavorites(filteredNHL, "NHL") },
      {
        category: "College Football",
        data: limitNonFavorites(filteredCFB, "CFB"),
      },
      {
        category: "Men's College Basketball",
        data: limitNonFavorites(filteredMensCBB, "CBB"),
      },
      {
        category: "Women's College Basketball",
        data: limitNonFavorites(filteredWomensCBB, "WCBB"),
      },
      { category: "WNBA", data: limitNonFavorites(filteredWNBA, "WNBA") },
      { category: "MMA", data: fights.slice(0, 5) },
    ];

    return sections.filter((s) => s.data.length > 0);
  }, [
    sortLiveFirst,
    limitNonFavorites,
    favoriteGames,
    filteredNBA,
    filteredNFL,
    filteredMLB,
    filteredNHL,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
    filteredWNBA,
    fights,
  ]);

  // ===========================
  // REFRESH
  // ===========================
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === "scores") {
        await Promise.all([
          refreshGames(),
          refreshMLBGames(),
          refreshNHLGames(),
          refreshNFL(),
          refreshCFB(),
          refreshMensCBB(),
          refreshWomensCBB(),
          refreshWNBA(),
          refreshFights(),
        ]);
      }
      if (selectedTab === "news") {
        await Promise.all([refresh()]);
      }
    } finally {
      setRefreshing(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    favorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    // socialData,
    // socialLoading,
    // socialError,
    newsError,
    errorFights,
    newsLoading,
    articles,
    loading:
      nbaLoading ||
      mlbLoading ||
      nhlLoading ||
      nflLoading ||
      cfbLoading ||
      mensCBBLoading ||
      womensCBBLoading ||
      wnbaLoading ||
      loadingFights,
  };
}
