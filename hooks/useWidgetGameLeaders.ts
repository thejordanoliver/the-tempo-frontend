// hooks/useWidgetGameLeaders.ts
import { getTeamLogo } from "constants/teams";
import { useEffect, useState } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export function useWidgetGameLeaders(
  nbaGames: any[],
  topN = 2,
) {
  const [leadersMap, setLeadersMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!nbaGames || !nbaGames.length) return; // skip until games exist

    const fetchAllLeaders = async () => {
      const map: Record<string, any[]> = {};

      for (const game of nbaGames) {
        try {
          const res = await fetch(
            `${API_URL}/api/player-stats/${game.id}/widget?topN=${topN}`
          );

          if (!res.ok) {
            console.error(
              `Failed to fetch leaders for game ${game.id}: ${res.status}`
            );
            map[game.id] = [];
            continue;
          }

          const data = await res.json();
          if (!data?.leaders) {
            console.warn(`No leaders returned for game ${game.id}`);
            map[game.id] = [];
            continue;
          }

          const statTypes = [
            { key: "points", label: "PTS" },
            { key: "rebounds", label: "REB" },
            { key: "assists", label: "AST" },
          ];

          const statLeaders: Record<string, any[]> = {};

          for (const stat of statTypes) {
            const teamEntries = Object.values<any>(
              data.leaders[stat.key] ?? []
            );
            const players: any[] = [];

            teamEntries.forEach((teamEntry) => {
              teamEntry.leaders.slice(0, topN).forEach((p: any) => {
                players.push({
                  id: p.player_id,
                  firstName: p.first_name,
                  lastName: p.last_name,
                  headshot_url: p.headshot_url,
                  jersey_number: p.jersey_number,
                  team: {
                    id: teamEntry.team.id,
                    code: teamEntry.team.code,
                
                  },
                  leaderStat: {
                    name: stat.label,
                    value: p.value,
                  },
                });
              });
            });

            statLeaders[stat.label] = players;
          }

          const allLeaders = Object.values(statLeaders).flat();
          map[game.id] = allLeaders;
        } catch (err: any) {
          console.error(
            `Failed to fetch leaders for game ${game.id}:`,
            err.message || err
          );
          map[game.id] = [];
        }
      }

      setLeadersMap(map);

      // ---------- Log actual leaders ----------
      console.groupCollapsed("🏀 NBA Widget Leaders");
      Object.entries(map).forEach(([gameId, leaders]) => {
        if (!leaders.length) {
          console.warn(`⚠️ No leaders for game ${gameId}`);
          return;
        }

        const tableData = leaders.map((p, idx) => ({
          GameID: gameId,
          Rank: idx + 1,
          PlayerID: p.id,
          Name: `${p.firstName} ${p.lastName}`,
          Jersey: p.jersey_number,
          TeamID: p.team?.id,
          TeamCode: p.team?.code,
          StatName: p.leaderStat?.name,
          StatValue: p.leaderStat?.value,
          Headshot: p.headshot_url,
        }));

        console.table(tableData);
      });
      console.groupEnd();
    };

    fetchAllLeaders();
  }, [nbaGames, topN]);

  return leadersMap;
}
