// hooks/CFBHooks/useCFBConferenceStandings.ts
import { useEffect, useState } from "react";
import { apiClient } from "utils/apiClient";

export type CFBTeamStanding = {
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

export function useCFBConferenceStandings() {
  const [standings, setStandings] = useState<CFBTeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(`api/standings/cfb/conference`);

        const parsed: CFBTeamStanding[] = [];

        for (const conf of res.data.conferences || []) {
          const confName = conf.name || "Unknown";

          for (const div of conf.divisions || []) {
            const divName = div.name || null;

            for (const team of div.teams || []) {
              parsed.push({
                teamId: team.teamId,
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
        setError(err.response?.data?.message || "Failed to load standings");
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  return { standings, loading, error };
}
