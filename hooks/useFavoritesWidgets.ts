// hooks/useFavoriteWidgets.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CBBGameWidgetProps } from "components/Explore/Widgets/Games/CBBGameWidget";
import { GameWidgetProps } from "components/Explore/Widgets/Games/GameWidget";
import { FootballGameWidgetProps } from "components/Explore/Widgets/Games/NFLGameWidget";
import { getTeamLogo as getCBBTeamLogo } from "constants/teamsCBB";
import { useFocusEffect } from "expo-router";
import { useMultipleTeamGames } from "hooks/useMultipleTeamGames";
import { useCallback, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { CFBTeam } from "types/cfb";
import { NFLTeam } from "types/nfl";
import { NBATeam } from "types/types";
import { useMultipleCBBTeamGames } from "./CBBHooks/useMultipleCBBTeamGames";
import { useMultipleCFBTeamGames } from "./CFBHooks/useMultipleCFBTeamGames";
import { useMultipleNFLTeamGames } from "./NFLHooks/useMultipleNFLTeamGames";
import { useWidgetGameLeaders } from "./useWidgetGameLeaders";

export function useFavoriteWidgets(topN = 4) {
  const isDark = useColorScheme() === "dark";
  const [favorites, setFavorites] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await AsyncStorage.getItem("favorites");
        if (stored) setFavorites(JSON.parse(stored));
      };
      load();
    }, [])
  );

  const nbaTeamIds = useMemo(() => favorites.filter(f => f.startsWith("NBA:")).map(f => f.split(":")[1]), [favorites]);
  const nflTeamIds = useMemo(() => favorites.filter(f => f.startsWith("NFL:")).map(f => f.split(":")[1]), [favorites]);
  const cfbTeamIds = useMemo(() => favorites.filter(f => f.startsWith("CFB:")).map(f => f.split(":")[1]), [favorites]);
  const cbbTeamIds = useMemo(() => favorites.filter(f => f.startsWith("CBB:")).map(f => f.split(":")[1]), [favorites]);
  const wcbbTeamIds = useMemo(() => favorites.filter(f => f.startsWith("WCBB:")).map(f => f.split(":")[1]), [favorites]);

  const { allGames: nbaGames, loading: nbaLoading } = useMultipleTeamGames(nbaTeamIds);
  const { allGames: nflGames, loading: nflLoading } = useMultipleNFLTeamGames(nflTeamIds);
  const { allGames: cfbGames, loading: cfbLoading } = useMultipleCFBTeamGames(cfbTeamIds);
  const { allGames: cbbGames, loading: cbbLoading } = useMultipleCBBTeamGames(cbbTeamIds, { isWomen: false });
  const { allGames: wcbbGames, loading: wcbbLoading } = useMultipleCBBTeamGames(wcbbTeamIds, { isWomen: true });

  const loading = useMemo(() => nbaLoading || nflLoading || cfbLoading || cbbLoading || wcbbLoading, [
    nbaLoading, nflLoading, cfbLoading, cbbLoading, wcbbLoading,
  ]);

  // -------------------------------
  // Helper to sort by live > scheduled > final
  // -------------------------------
  const statusOrder = (status: string) => {
    const liveStatuses = ["In Play", "Q1", "Q2", "Q3", "Q4", "OT", "Halftime", "BT", "HT"];
    const scheduledStatuses = ["NS", "Scheduled"];
    const finalStatuses = ["Final", "FT", "AOT"];

    if (liveStatuses.includes(status)) return 0;
    if (scheduledStatuses.includes(status)) return 1;
    if (finalStatuses.includes(status)) return 2;
    return 3; // unknown status
  };

// NBA / generic games
const pickRelevantGame = useCallback((games: any[]) => {
  if (!games?.length) return null;

  // Live games first
  const liveGame = games.find(g => ["In Play"].includes(g.statusText));
  if (liveGame) return liveGame;

  // Scheduled games second (earliest upcoming)
  const scheduledGame = games
    .filter(g => ["Scheduled", "NS"].includes(g.statusText))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  if (scheduledGame) return scheduledGame;

  // Final games last (pick the most recent final)
  const finalGame = games
    .filter(g => ["Final", "FT", "AOT"].includes(g.statusText))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  return finalGame ?? null;
}, []);

// NFL / CFB
const pickRelevantFootballGame = useCallback((games: any[]) => {
  if (!games?.length) return null;

  // Live / in-progress / halftime games first
  const liveGame = games.find(g =>
    ["In Progress", "Halftime"].includes(g.statusText || g.game.status?.long)
  );
  if (liveGame) return liveGame;

  // Scheduled games second (earliest upcoming)
  const scheduledGame = games
    .filter(g => ["NS", "Scheduled"].includes(g.statusText || g.game.status?.long))
    .sort((a, b) => new Date(a.game.date.utc || a.game.date.date).getTime() - new Date(b.game.date.utc || b.game.date.date).getTime())[0];
  if (scheduledGame) return scheduledGame;

  // Final games last (pick the most recent final)
  const finalGame = games
    .filter(g => ["Final", "FT", "AOT"].includes(g.statusText || g.game.status?.long))
    .sort((a, b) => new Date(b.game.date.utc || b.game.date.date).getTime() - new Date(a.game.date.utc || a.game.date.date).getTime())[0];
  return finalGame ?? null;
}, []);

// CBB / WCBB
const pickRelevantCBBGame = useCallback((games: any[]) => {
  if (!games?.length) return null;

  // Live games first
  const liveGame = games.find(g => ["Q1", "Q2", "Q3", "Q4", "OT", "BT", "HT"].includes(g.status));
  if (liveGame) return liveGame;

  // Scheduled games second
  const scheduledGame = games
    .filter(g => ["NS"].includes(g.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  if (scheduledGame) return scheduledGame;

  // Final games last, most recent first
  const finalGame = games
    .filter(g => ["FT", "AOT"].includes(g.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  return finalGame ?? null;
}, []);

  // -------------------------------
  // Build widgets
  // -------------------------------
  // (All your NBA/NFL/CFB/CBB widget building stays mostly the same, just use the updated pickRelevantGame functions)
  const nbaWidgets: GameWidgetProps[] = useMemo(() => {
    const normalizeTeam = (team: any) => ({
      id: Number(team.id),
      espnID: team.espnID,
      name: team.name ?? "",
      code: team.code ?? "",
      logo: team.logo,
      logoLight: team.logoLight ?? team.logo,
    });

    return nbaTeamIds.flatMap(teamId => {
      const game = pickRelevantGame(nbaGames[teamId]);
      if (!game) return [];
      const gameDate = new Date(game.date);
      return [{
        league: "NBA",
        id: game.id,
        date: `${gameDate.getMonth() + 1}/${gameDate.getDate()}`,
        time: gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        gameDateISO: game.date,
        homeTeam: normalizeTeam(game.home),
        awayTeam: normalizeTeam(game.away),
        homeScore: game.scores?.home.points ?? 0,
        awayScore: game.scores?.visitors.points ?? 0,
        status: game.status?.long ?? "",
        halftime: game.status?.halftime,
        periods: game.periods.current,
        clock: game.status.clock,
        loading: nbaLoading,
      }];
    });
  }, [nbaGames, nbaTeamIds, pickRelevantGame, nbaLoading]);

  /* ---------- NFL Widgets ---------- */
  const nflWidgets: FootballGameWidgetProps[] = useMemo(() => {
    const normalizeTeam = (team: NFLTeam) => ({
      id: Number(team.id),
      espnID: String(team.espnID),
      name: team.name ?? "",
      code: team.code ?? "",
      logo: team.logo,
      logoLight: team.logoLight ?? team.logo,
    });

    return nflTeamIds.flatMap((teamId) => {
      const game = pickRelevantFootballGame(nflGames[teamId]);
      if (!game) return [];
      const gameDate = new Date(game.game.date.date);
      return [
        {
          league: "NFL",
          id: game.game.id,
          date: `${gameDate.getMonth() + 1}/${gameDate.getDate()}`,
          time: gameDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          gameDateISO: game.game.date.utc,
          homeTeam: normalizeTeam(game.teams.home),
          awayTeam: normalizeTeam(game.teams.away),
          homeScore: game.scores?.home.total ?? 0,
          awayScore: game.scores?.away.total ?? 0,
          status: game.game.status?.long ?? "",
          halftime: game.game.status?.long,
          periods: game.game.status.long,
          clock: game.game.status.timer,
          loading: nflLoading,
        },
      ];
    });
  }, [nflGames, nflTeamIds, pickRelevantFootballGame, nflLoading]);

  /* ---------- CFB Widgets ---------- */
  const cfbWidgets: FootballGameWidgetProps[] = useMemo(() => {
    const normalizeTeam = (team: CFBTeam) => ({
      id: Number(team.id),
      espnID: String(team.espnID),
      name: team.name ?? "",
      code: team.code ?? "",
      logo: team.logo,
      logoLight: team.logoLight ?? team.logo,
    });

    return cfbTeamIds.flatMap((teamId) => {
      const game = pickRelevantFootballGame(cfbGames[teamId]);
      if (!game) return [];
      const gameDate = new Date(game.game.date.date);
      return [
        {
          league: "CFB",
          id: game.game.id,
          date: `${gameDate.getMonth() + 1}/${gameDate.getDate()}`,
          time: gameDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          gameDateISO: game.game.date.utc,
          homeTeam: normalizeTeam(game.teams.home),
          awayTeam: normalizeTeam(game.teams.away),
          homeScore: game.scores?.home.total ?? 0,
          awayScore: game.scores?.away.total ?? 0,
          status: game.game.status?.long ?? "",
          halftime: game.game.status?.long,
          periods: game.game.status.long,
          clock: game.game.status.timer,
          loading: cfbLoading,
        },
      ];
    });
  }, [cfbGames, cfbTeamIds, pickRelevantFootballGame, cfbLoading]);

  /* ---------- CBB / WCBB Widgets ---------- */
  const buildCBBWidgets = useCallback(
    (
      teamIds: string[],
      gamesMap: Record<string, any[]>,
      isWomen = false,
      widgetLoading = false
    ): CBBGameWidgetProps[] => {
      return teamIds.flatMap((teamId) => {
        const game = pickRelevantCBBGame(gamesMap[teamId]);
        if (!game) return [];
        const date = new Date(game.date);

        const normalizeTeam = (team: any) => {
          const logo = isWomen
            ? team.wLogo ?? getCBBTeamLogo(team.id, isDark, true)
            : getCBBTeamLogo(team.id, isDark);
          return {
            id: team.id,
            wid: team.wid,
            espnID: String(team.espnID ?? ""),
            name: team.name ?? "",
            code: team.code ?? "",
            logo,
            logoLight: team.logoLight ?? logo,
          };
        };

        return [
          {
            league: isWomen ? "WCBB" : "CBB",
            id: game.id,
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            time: date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            gameDateISO: game.date,
            homeTeam: normalizeTeam(game.teams.home),
            awayTeam: normalizeTeam(game.teams.away),
            homeScore: game.scores?.home?.points ?? 0,
            awayScore: game.scores?.away?.points ?? 0,
            status: game.statusText,
            periods: game.periods?.current ?? 0,
            halftime: game.statusText === "Halftime",
            clock: game.clock ?? null,
            isWomen,
            loading: widgetLoading,
          },
        ];
      });
    },
    [pickRelevantCBBGame, isDark]
  );

  const cbbWidgets = useMemo(
    () => buildCBBWidgets(cbbTeamIds, cbbGames, false, cbbLoading),
    [cbbTeamIds, cbbGames, cbbLoading, buildCBBWidgets]
  );
  const wcbbWidgets = useMemo(
    () => buildCBBWidgets(wcbbTeamIds, wcbbGames, true, wcbbLoading),
    [wcbbTeamIds, wcbbGames, wcbbLoading, buildCBBWidgets]
  );

  const leadersMap = useWidgetGameLeaders(nbaWidgets, topN, isDark);

  return {
    nbaWidgets,
    nflWidgets,
    cfbWidgets,
    cbbWidgets,
    wcbbWidgets,
    leadersMap,
    loading,
  };
}
