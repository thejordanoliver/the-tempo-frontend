import axios from "axios";
import { Colors } from "constants/Colors";
import { teamsCFBById } from "constants/teamsCFB";
import { useCallback, useEffect, useState } from "react";
import { Game } from "types/cfb";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type UseMultipleCFBTeamGamesOptions = {
  season?: string;
  league?: string;
  fetchAll?: boolean;
};

type CFBStatusText =
  | "Scheduled"
  | "In Progress"
  | "Halftime"
  | "Final"
  | "Postponed"
  | "Canceled"
  | "Suspended"
  | "Abandoned"
  | "Awarded";

function mapCFBStatus(status: any): CFBStatusText {
  const short = String(status?.short ?? "").toUpperCase();

  if (["Q1", "Q2", "Q3", "Q4", "OT", "BT"].includes(short))
    return "In Progress";
  if (short === "HT") return "Halftime";
  if (["FT", "AOT"].includes(short)) return "Final";
  if (short === "NS") return "Scheduled";
  if (short === "POST") return "Postponed";
  if (short === "CANC") return "Canceled";
  if (short === "SUSP") return "Suspended";
  if (short === "ABD") return "Abandoned";
  if (short === "AWD") return "Awarded";

  return "Scheduled";
}

export function useMultipleCFBTeamGames(
  teamIds: (string | number)[],
  {
    season = "2025",
    league = "2",
    fetchAll = false,
  }: UseMultipleCFBTeamGamesOptions = {}
) {
  const [allGames, setAllGames] = useState<Record<string, Game[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamsMap = teamsCFBById;

  const fetchGames = useCallback(async () => {
    if (!teamIds.length) return;

    setLoading(true);
    setError(null);

    try {
      const result: Record<string, Game[]> = {};

      await Promise.all(
        teamIds.map(async (teamId) => {
          const res = await axios.get(
            `${BASE_URL}/api/gamesCFB/team/${teamId}`,
            {
              params: {
                season,
                all: fetchAll ? 1 : 0,
              },
            }
          );

          const rawGames: Game[] = res.data.response || [];

          const enrichedGames = rawGames.map((game) => {
            const homeKey = Number(game.teams.home.id);
            const awayKey = Number(game.teams.away.id);

            const homeTeamData = teamsMap[homeKey] || {};
            const awayTeamData = teamsMap[awayKey] || {};

            return {
              ...game,
              statusText: mapCFBStatus(game.game.status),
              // Use API scores directly
              scores: { ...game.scores },
              teams: {
                home: {
                  ...game.teams.home,
                  espnID: homeTeamData.espnID,
                  name: homeTeamData.name || game.teams.home.name,
                  code: homeTeamData.code || game.teams.home.code,
                  fullName: homeTeamData.fullName || game.teams.home.fullName,
                  logo: homeTeamData.logo || game.teams.home.logo,
                  logoLight: homeTeamData.logoLight,
                  color: homeTeamData.color || Colors.midTone,
                  secondaryColor: homeTeamData.secondaryColor || Colors.midTone,
                  location: homeTeamData.location,
                },
                away: {
                  ...game.teams.away,
                  espnID: awayTeamData.espnID,
                  name: awayTeamData.name || game.teams.away.name,
                  code: awayTeamData.code || game.teams.away.code,
                  fullName: awayTeamData.fullName || game.teams.away.fullName,
                  logo: awayTeamData.logo || game.teams.away.logo,
                  logoLight: awayTeamData.logoLight,
                  color: awayTeamData.color || Colors.midTone,
                  secondaryColor: awayTeamData.secondaryColor || Colors.midTone,
                  location: awayTeamData.location,
                },
              },
            };
          });
          result[String(teamId)] = enrichedGames;
        })
      );

      setAllGames(result);
    } catch (err: any) {
      console.error(
        "Error fetching multiple CFB team games:",
        err.message || err
      );
      setError("Failed to load CFB games");
      setAllGames({});
    } finally {
      setLoading(false);
    }
  }, [teamIds, season, league, fetchAll, teamsMap]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { allGames, loading, error, refreshGames };
}
