// hooks/CBBHooks/useCBBConferenceStandings.ts
import { useEffect, useState } from "react";

export type CBBTeamStanding = {
  teamId: string;
  teamName: string;
  conference: string;
  division?: string | null;
  rank: number | null;
  overall: string | null;
  confOverall: string | null;
  divisionOverall: string | null;
  homeOverall: string | null;
  awayOverall: string | null;
  streak?: number | null;
  gamesBehind?: number | null;
  vsAPTop25: string | null;
  pointsFor?: number | null;
  pointsAgainst?: number | null;
};

import { BASE_URL } from "utils/apiClient";

interface UseCBBConferenceStandingsOptions {
  women?: boolean;
}

export function useCBBConferenceStandings({
  women = false,
}: UseCBBConferenceStandingsOptions = {}) {
  const [standings, setStandings] = useState<CBBTeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        const url = `${BASE_URL}/api/cbb-standings${women ? "?women=true" : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const parsed: CBBTeamStanding[] = [];

        for (const conf of json.conferences || []) {
          const confName = conf.name || "Unknown";
          for (const div of conf.divisions || []) {
            const divName = div.name || null;
            for (const team of div.teams || []) {
              parsed.push({
                teamId: String(team.teamId),
                teamName: team.name,
                conference: confName,
                division: divName,
                rank: team.rank ?? null,
                overall: team.overall ?? null,
                confOverall: team.confOverall ?? null,
                divisionOverall: team.divisionOverall ?? null,
                homeOverall: team.homeOverall ?? null,
                awayOverall: team.awayOverall ?? null,
                streak: team.streak ?? null,
                gamesBehind: team.gamesBehind ?? null,
                vsAPTop25: team.vsAPTop25 ?? null,
                pointsFor: team.pointsFor ?? null,
                pointsAgainst: team.pointsAgainst ?? null,
              });
            }
          }
        }

        setStandings(parsed);
      } catch (err: any) {
        console.error("Error fetching standings:", err);
        setError("Failed to load standings");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [women]);

  return { standings, loading, error };
}
