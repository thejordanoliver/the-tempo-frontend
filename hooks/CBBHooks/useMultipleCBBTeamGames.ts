import axios from "axios";
import { Colors } from "constants/Colors";
import { teamsCBBById, teamsWCBBById } from "constants/teamsCBB";
import { useCallback, useEffect, useState } from "react";
import { CBBGame } from "types/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MEN_CBB_LEAGUE = "116";
const WOMEN_CBB_LEAGUE = "423";

type UseMultipleCBBTeamGamesOptions = {
  season?: string;
  isWomen?: boolean;
  fetchAll?: boolean;
};

function mapCBBStatus(status?: { long?: string; short?: string }) {
  const long = status?.long?.toLowerCase() ?? "";
  if (long.includes("live") || long.includes("in play")) return "In Play";
  if (long.includes("finished") || long.includes("final")) return "Final";
  if (long.includes("scheduled")) return "Scheduled";
  if (long.includes("postponed")) return "Postponed";
  if (long.includes("canceled")) return "Canceled";
  return "Scheduled";
}

function getScore(scoreData: any) {
  // Handles array of periods or single points object
  if (Array.isArray(scoreData)) {
    return scoreData.reduce((sum, p) => sum + (p.points || 0), 0);
  }
  return scoreData?.points ?? 0;
}

export function useMultipleCBBTeamGames(
  teamIds: (string | number)[],
  {
    season = "2025-2026",
    isWomen = false,
    fetchAll = false,
  }: UseMultipleCBBTeamGamesOptions = {}
) {
  const [allGames, setAllGames] = useState<Record<string, CBBGame[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const league = isWomen ? WOMEN_CBB_LEAGUE : MEN_CBB_LEAGUE;
  const teamsMap = isWomen ? teamsWCBBById : teamsCBBById;

  const fetchGames = useCallback(async () => {
    if (!teamIds.length) return;

    setLoading(true);
    setError(null);

    try {
      const result: Record<string, CBBGame[]> = {};

      await Promise.all(
        teamIds.map(async (teamId) => {
          const res = await axios.get(
            `${BASE_URL}/api/gamesCBB/team/${teamId}`,
            {
              params: {
                season,
                league,
                all: fetchAll ? 1 : 0,
              },
            }
          );

          const rawGames: CBBGame[] = res.data.response || [];

          const enrichedGames = rawGames.map((game) => {
            const homeKey = Number(game.teams.home.id);
            const awayKey = Number(game.teams.away.id);

            const homeTeamData = teamsMap[homeKey] || {};
            const awayTeamData = teamsMap[awayKey] || {};

            const homeScore = getScore(game.scores.home);
            const awayScore = getScore(game.scores.away);

            return {
              ...game,
              statusText: mapCBBStatus(game.status),
              scores: {
                home: { ...game.scores.home, total: homeScore },
                away: { ...game.scores.away, total: awayScore },
              },
              teams: {
                home: {
                  ...game.teams.home,
                  wid: homeTeamData.wid,
                  espnID: homeTeamData.espnID,
                  name: homeTeamData.name || game.teams.home.name,
                  code: homeTeamData.code || game.teams.home.code,
                  fullName: homeTeamData.fullName || game.teams.home.fullName,
                  logo: homeTeamData.logo || game.teams.home.logo,
                  color: homeTeamData.color || Colors.midTone,
                  secondaryColor: homeTeamData.secondaryColor || Colors.midTone,
                  location: homeTeamData.location,
                  venueName: homeTeamData.venueName,
                },
                away: {
                  ...game.teams.away,
                  wid: awayTeamData.wid,
                  espnID: awayTeamData.espnID,
                  name: awayTeamData.name || game.teams.away.name,
                      code: awayTeamData.code || game.teams.away.code,
                  fullName: awayTeamData.fullName || game.teams.away.fullName,
                  logo: awayTeamData.logo || game.teams.away.logo,
                  color: awayTeamData.color || Colors.midTone,
                  secondaryColor: awayTeamData.secondaryColor || Colors.midTone,
                  location: awayTeamData.location,
                  venueName: awayTeamData.venueName,
                },
              },
            };
          });

          // // Full logging
          // console.log(
          //   `Team ${teamId} enriched games:`,
          //   JSON.stringify(enrichedGames, null, 2)
          // );

          result[String(teamId)] = enrichedGames;
        })
      );

      setAllGames(result);
    } catch (err: any) {
      console.error(
        "Error fetching multiple CBB team games:",
        err.message || err
      );
      setError("Failed to load college games");
      setAllGames({});
    } finally {
      setLoading(false);
    }
  }, [teamIds, season, league, fetchAll, isWomen, teamsMap]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const refreshGames = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return { allGames, loading, error, refreshGames };
}
