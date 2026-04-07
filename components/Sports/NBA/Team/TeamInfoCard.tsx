import InfoCard from "components/Sports/NBA/Team/InfoCard";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { getNHLTeam } from "constants/teamsNHL";
import { Coach } from "hooks/useTeamCoaches";
import { View } from "react-native";

import { MLBTeam } from "types/baseball";
import { Team } from "types/football";
import { CBBTeam, LeagueType, NBATeam, NHLTeam } from "types/types";

type Props = {
  teamId?: string | number;
  league: LeagueType;
  coach?: Coach;
};

export default function TeamInfoCard({ teamId, league, coach }: Props) {
  if (!teamId) return null;

  // --------------------------------------------------
  // UNIVERSAL TEAM LOOKUP
  // --------------------------------------------------

  const team = (() => {
    switch (league) {
      case "NBA":
        return getNBATeam(teamId);

      case "CFB":
        return getCFBTeam(teamId);

      case "CBB":
        return getCBBTeam(teamId);

      case "WCBB":
        return getCBBTeam(teamId, true);

      case "NFL":
        return getNFLTeam(teamId);

      case "MLB":
        return getMLBTeam(teamId);

      case "NHL":
        return getNHLTeam(teamId);

      default:
        return null;
    }
  })();

  if (!team) return null;

  // --------------------------------------------------
  // LEAGUE RENDERING
  // --------------------------------------------------

  switch (league) {
    case "NBA": {
      const t = team as NBATeam;

      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name ?? ""} ${coach?.last_name ?? ""}`}
            team={t}
          />

          <InfoCard label="Arena" value={t.venueName} team={t} />
          <InfoCard label="Location" value={t.location} team={t} />
          <InfoCard label="Established" value={t.established} team={t} />
        </View>
      );
    }

    case "CFB": {
      const t = team as Team;

      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name ?? ""} ${coach?.last_name ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={t.location} team={t} />
          <InfoCard label="Stadium" value={t.venue} team={t} />
          <InfoCard label="Established" value={t.established} team={t} />
        </View>
      );
    }

    case "CBB":
    case "WCBB": {
      const t = team as CBBTeam;

      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name ?? ""} ${coach?.last_name ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={t.location} team={t} />
          <InfoCard label="Arena" value={t.venueName} team={t} />
          <InfoCard label="Established" value={t.established} team={t} />
        </View>
      );
    }

    case "NFL": {
      const t = team as Team;

      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name ?? ""} ${coach?.last_name ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={t.location} team={t} />
          <InfoCard label="Stadium" value={t.venue} team={t} />
        </View>
      );
    }

    case "MLB": {
      const t = team as MLBTeam;

      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Manager"
            value={`${coach?.first_name ?? ""} ${coach?.last_name ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={t.city} team={t} />
          <InfoCard label="Stadium" value={t.venueName} team={t} />
          <InfoCard label="Established" value={t.established} team={t} />
        </View>
      );
    }

    case "NHL": {
      const t = team as NHLTeam;

      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name ?? ""} ${coach?.last_name ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={t.location} team={t} />
          <InfoCard label="Arena" value={t.venueName} team={t} />
          <InfoCard label="Established" value={t.established} team={t} />
        </View>
      );
    }

    default:
      return null;
  }
}
