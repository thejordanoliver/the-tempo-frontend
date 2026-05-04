import { CombinedGamesSection } from "components/League/CombinedGamesList";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCBBWeeklyGames } from "hooks/CBBHooks/useCBBWeeklyGames";
import { useFootballWeeklyGames } from "hooks/FootballHooks/useFootballWeeklyGames";
import { useWeeklyGames } from "hooks/NBAHooks/useWeeklyGames";
import { useMemo, useState } from "react";
import { filterByDate, isLiveGame, normalizeTeam } from "utils/games";
import { useMLBWeeklyGames } from "./MLBHooks/useMLBWeeklyGames";
import { useWeeklyFights } from "./MMAHooks/useWeeklyFights";
import { useAllNews } from "./NewsHooks/useAllNews";
import { useNHLWeeklyGames } from "./NHLHooks/useNHLWeeklyGames";
import { useWeeklyWNBAGames } from "./WNBAHooks/useWNBAWeeklyGames";

dayjs.extend(utc);
dayjs.extend(timezone);

export function useHomeData(selectedTab: "scores" | "news") {
  const { favorites } = useFavoriteTeamsContext();
  const [refreshing, setRefreshing] = useState(false);

  const {
    articles,
    loading: newsLoading,
    error: newsError,
    refresh,
  } = useAllNews(10);

  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate(),
  );

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
  } = useMLBWeeklyGames();

  const {
    games: weeklyNHLGames,
    loading: nhlLoading,
    refreshGames: refreshNHLGames,
  } = useNHLWeeklyGames();

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
  } = useCBBWeeklyGames();

  const {
    basketballGames: womensBasketballGames,
    cbbLoading: womensCBBLoading,
    refresh: refreshWomensCBB,
  } = useCBBWeeklyGames({ isWomen: true });

  const { wnbaGames, wnbaLoading, refresh: refreshWNBA } = useWeeklyWNBAGames();

  const {
    fights,
    loading: loadingFights,
    error: errorFights,
    refreshFights,
  } = useWeeklyFights();

  // ===========================
  // NORMALIZER
  // ===========================
  const normalizeGames = (games: any[], leagueType: string, isWomen = false) =>
    games
      .map((game: any) => {
        let date: dayjs.Dayjs | null = null;

        if (leagueType === "CFB" || leagueType === "NFL") {
          const ts = game.game?.date?.timestamp;
          if (!ts) return null;
          date = dayjs.unix(ts).local();
        } else {
          const raw =
            game.date?.start ?? game.date?.date ?? game.date ?? game.game?.date;
          if (!raw) return null;
          date = dayjs.utc(raw).local();
        }

        let home, away;

        if (leagueType === "NBA") {
          home = { ...game.home, id: String(game.home?.id) };
          away = { ...game.away, id: String(game.away?.id) };
        } else if (leagueType === "NFL" || leagueType === "CFB") {
          home = { ...game.teams?.home, id: String(game.teams?.home?.id) };
          away = { ...game.teams?.away, id: String(game.teams?.away?.id) };
        } else if (leagueType === "MLB") {
          home = {
            id: game.teams?.home?.id,
            name: game.teams?.home?.name,
          };
          away = {
            id: game.teams?.away?.id,
            name: game.teams?.away?.name,
          };
        } else {
          home = normalizeTeam(game.teams?.home, isWomen);
          away = normalizeTeam(game.teams?.away, isWomen);
        }

        return {
          ...game,
          date: date.toDate(),
          dateString: date.format("YYYY-MM-DD"),
          time: date.format("h:mm A"),
          home,
          away,
        };
      })
      .filter(Boolean);

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
    () => normalizeGames(womensBasketballGames, "CBB", true),
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
  const isFavoriteGame = (g: any, prefix: string) => {
    const homeId = g?.home?.id;
    const awayId = g?.away?.id;

    return (
      (homeId && favorites.includes(`${prefix}:${String(homeId)}`)) ||
      (awayId && favorites.includes(`${prefix}:${String(awayId)}`))
    );
  };

  const sortLiveFirst = (games: any[]) =>
    [...games].sort((a, b) => Number(isLiveGame(b)) - Number(isLiveGame(a)));

  const limitNonFavorites = (games: any[], prefix: string, max = 5) =>
    sortLiveFirst(games.filter((g) => !isFavoriteGame(g, prefix))).slice(
      0,
      max,
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
    favorites,
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
