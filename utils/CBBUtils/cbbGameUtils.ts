// utils/CBBUtils/BasketballGameUtils.ts

import { cbbConferences } from "@/constants/cbbConferences";
import { useCBBRankings } from "@/hooks/BasketballHooks/useCBBRankings";
import {
  getCBBTeam,
  getCBBTeamByESPNId,
  modalToMapKey,
} from "constants/teamsCBB";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useMemo } from "react";
import { BasketballGame } from "types/basketball";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/* =====================================================
   MAIN FILTER FUNCTION
===================================================== */

export function filterBasketballGames({
  games,
  selectedConference,
  top25Teams,
}: {
  games: BasketballGame[];
  selectedConference: string | number;
  top25Teams: string[]; // ESPN IDs
}): BasketballGame[] {
  if (!games?.length) return [];

  // --- Deduplicate games ---
  const seen = new Set<string>();
  const uniqueGames = games.filter((g) => {
    const key = `${g?.teams?.away?.id}-${g?.teams?.home?.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueGames.filter((game) => {
    const home = getCBBTeam(Number(game.teams.home.id));
    const away = getCBBTeam(Number(game.teams.away.id));
    const homeESPN = home?.espnId;
    const awayESPN = away?.espnId;

    if (!homeESPN && !awayESPN) return false;

    // --- TOP 25 ---
    if (selectedConference === "Top 25") {
      return (
        (homeESPN && top25Teams.includes(String(homeESPN))) ||
        (awayESPN && top25Teams.includes(String(awayESPN)))
      );
    }

    // --- CONFERENCE ---
    if (selectedConference) {
      const mapKey = modalToMapKey[selectedConference] || selectedConference;

      const conference = cbbConferences.find((c) => c.name === mapKey);

      if (!conference) return false;

      const conferenceESPNIds = conference.id;

      return conferenceESPNIds === homeESPN || conferenceESPNIds === awayESPN;
    }

    return true;
  });
}

/* =====================================================
   AP TOP 25 (LEAGUE-AWARE)
===================================================== */

export function useAPTop25(league: "CBB" | "WCBB") {
  const { rankings } = useCBBRankings(league);

  return useMemo(() => {
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];

    return apPoll.ranks
      .slice(0, 25)
      .map((r) => {
        const team = getCBBTeamByESPNId(r.team?.id ?? 0);

        if (!team) return null;

        return {
          id: String(team.espnId), // ✅ canonical ESPN ID
          name: team.fullName || team.name, // ✅ consistent naming
          rank: r.current,
          code: team.code,
          logo: team.logo,
          color: team.color,
          secondaryColor: team.secondaryColor,
        };
      })
      .filter(Boolean);
  }, [rankings]);
}
