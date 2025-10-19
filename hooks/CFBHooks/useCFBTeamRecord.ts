import { useEffect, useState } from "react";

type TeamRecord = {
  overall: string | null;
};

export function useCFBTeamRecord(teamId?: string | number) {
  const [record, setRecord] = useState<TeamRecord>({ overall: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    const fetchRecord = async () => {
      try {
        setLoading(true);

        const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${teamId}`;
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(`⚠️ Failed to fetch record for team ${teamId}`);
          setRecord({ overall: null });
          return;
        }

        const data = await res.json();
        const teamName = data?.team?.displayName || data?.team?.name || `Team ${teamId}`;

      

      

        const recordSummary =
          data?.team?.record?.items?.find(
            (r: any) => r.type === "total" || r.name === "overall"
          )?.summary ?? null;


        setRecord({ overall: recordSummary });
      } catch (err) {
        console.error(`❌ Error fetching record for team ${teamId}:`, err);
        setRecord({ overall: null });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [teamId]);

  return { record, loading };
}
