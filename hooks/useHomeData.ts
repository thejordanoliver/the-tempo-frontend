import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { CombinedGamesSection } from "components/CombinedGamesList";
import { getTeamInfo } from "constants/teams";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCBBWeeklyGames } from "hooks/CBBHooks/useCBBWeeklyGames";
import { usetodayYesterday as useCFBtodayYesterday } from "hooks/CFBHooks/useCFBTodayYesterdayGames";
import { useWeeklyGames } from "hooks/NBAHooks/useWeeklyGames";
import { useNewsStore } from "hooks/newsStore";
import { usetodayYesterday as useNFLtodayYesterday } from "hooks/NFLHooks/useNFLTodayYesterdayGames";
import { useHighlights } from "hooks/useHighlights";
import { useNews } from "hooks/useNews";
import { useCallback, useEffect, useMemo, useState } from "react";
import { filterByDate, isLiveGame, normalizeTeam } from "utils/games";
import { useMLBWeeklyGames } from "./MLBHooks/useMLBWeeklyGames";
import { useWeeklyFights } from "./MMAHooks/useWeeklyFights";
import { useNHLWeeklyGames } from "./NHLHooks/useNHLWeeklyGames";
dayjs.extend(utc);
dayjs.extend(timezone);

export function useHomeData(selectedTab: "scores" | "news") {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Local date for filtering
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().startOf("day").toDate(),
  );

  // Data sources
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
  } = useNFLtodayYesterday();
  const {
    games: cfbGames,
    loading: cfbLoading,
    refetch: refreshCFB,
  } = useCFBtodayYesterday();
  const {
    cbbGames: mensCBBGames,
    cbbLoading: mensCBBLoading,
    refresh: refreshMensCBB,
  } = useCBBWeeklyGames();

  const {
    cbbGames: womensCBBGames,
    cbbLoading: womensCBBLoading,
    refresh: refreshWomensCBB,
  } = useCBBWeeklyGames({ isWomen: true });

  const {
    fights,
    loading: loadingFights,
    error: errorFights,
    refreshFights,
  } = useWeeklyFights();

  const {
    news,
    loading: newsLoading,
    error: newsError,
    refresh: refreshNews,
  } = useNews();
  const { highlights, loading: highlightsLoading } = useHighlights(
    "all",
    "",
    10,
  );

  const setArticles = useNewsStore((s) => s.setArticles);

  // 🧠 Load favorites when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const stored = await AsyncStorage.getItem("favorites");
          if (stored) setFavorites(JSON.parse(stored));
        } catch (error) {
          console.warn("Failed to load favorites:", error);
        }
      };
      loadFavorites();
    }, []),
  );

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
          home = getTeamInfo(game.home?.id);
          away = getTeamInfo(game.away?.id);
          if (!home || !away) return null;
        } else if (leagueType === "MLB") {
          home = {
            id: game.teams?.home?.id,
            name: game.teams?.home?.name,
            logo: game.teams?.home?.logo,
          };
          away = {
            id: game.teams?.away?.id,
            name: game.teams?.away?.name,
            logo: game.teams?.away?.logo,
          };
        } else if (leagueType === "NHL") {
          home = {
            id: game.teams?.home?.id,
            name: game.teams?.home?.name,
            logo: game.teams?.home?.logo,
          };
          away = {
            id: game.teams?.away?.id,
            name: game.teams?.away?.name,
            logo: game.teams?.away?.logo,
          };
        } else if (leagueType === "NFL" || leagueType === "CFB") {
          home = { ...game.teams?.home, id: String(game.teams?.home?.id) };
          away = { ...game.teams?.away, id: String(game.teams?.away?.id) };
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

  // 🗞 Cache latest news
  useEffect(() => {
    if (news && news.length > 0) setArticles(news);
  }, [news, setArticles]);

  // Helpers
  const isFavoriteGame = (g: any, prefix: string) => {
    const homeId = g?.home?.id;
    const awayId = g?.away?.id;

    if (!homeId && !awayId) return false;

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
    () => normalizeGames(mensCBBGames, "CBB", false),
    [mensCBBGames],
  );

  const normalizedWomensCBB = useMemo(
    () => normalizeGames(womensCBBGames, "CBB", true),
    [womensCBBGames],
  );

  const filteredNBA = filterByDate(normalizedNBA, selectedDate);
  const filteredNFL = filterByDate(normalizedNFL, selectedDate);
  const filteredMLB = filterByDate(normalizedMLB, selectedDate);
  const filteredNHL = filterByDate(normalizedNHL, selectedDate);
  const filteredCFB = filterByDate(normalizedCFB, selectedDate);
  const filteredMensCBB = filterByDate(normalizedMensCBB, selectedDate);
  const filteredWomensCBB = filterByDate(normalizedWomensCBB, selectedDate);

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
    ];
  }, [
    favorites,
    filteredNBA,
    filteredNFL,
    filteredMLB,
    filteredCFB,
    filteredMensCBB,
    filteredWomensCBB,
  ]);

  const gamesByCategory: CombinedGamesSection[] = useMemo(() => {
    const sections: CombinedGamesSection[] = [
      { category: "Favorites" as const, data: sortLiveFirst(favoriteGames) },
      { category: "NBA" as const, data: limitNonFavorites(filteredNBA, "NBA") },
      { category: "NFL" as const, data: limitNonFavorites(filteredNFL, "NFL") },
      { category: "MLB" as const, data: limitNonFavorites(filteredMLB, "MLB") },
      { category: "NHL" as const, data: limitNonFavorites(filteredNHL, "NHL") },
      {
        category: "College Football" as const,
        data: limitNonFavorites(filteredCFB, "CFB"),
      },
      {
        category: "Men's College Basketball" as const,
        data: limitNonFavorites(filteredMensCBB, "CBB"),
      },
      {
        category: "Women's College Basketball" as const,
        data: limitNonFavorites(filteredWomensCBB, "WCBB"),
      },
      { category: "MMA" as const, data: fights.slice(0, 5) },
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
    fights,
  ]);

  // 📰 Merge news + highlights
  const combinedNewsAndHighlights = useMemo(() => {
    const taggedNews = news.map((n) => ({
      ...n,
      itemType: "news" as const,
      publishedAt: n.publishedAt ?? new Date().toISOString(),
    }));
    const taggedHighlights = highlights.map((h) => ({
      ...h,
      itemType: "highlight" as const,
      publishedAt: h.publishedAt ?? new Date().toISOString(),
      duration: String(h.duration),
    }));
    return [...taggedNews, ...taggedHighlights].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }, [news, highlights]);

  // 🔄 Refresh logic
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
        ]);
      } else {
        await refreshNews();
      }
    } finally {
      setRefreshing(false);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    favorites,
    setFavorites,
    refreshing,
    handleRefresh,
    gamesByCategory,
    combinedNewsAndHighlights,
    newsError,
    loading:
      nbaLoading ||
      mlbLoading ||
      nhlLoading ||
      nflLoading ||
      cfbLoading ||
      mensCBBLoading ||
      womensCBBLoading ||
      newsLoading ||
      highlightsLoading,
  };
}
