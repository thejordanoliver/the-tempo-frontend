import InfoCard from "components/Sports/CFB/Team/InfoCard";
import { Colors } from "constants/Colors";
import { teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as mlbTeams } from "constants/teamsMLB";
import { teams as nflTeams } from "constants/teamsNFL";
import { Coach } from "hooks/useTeamCoaches";
import { View, useColorScheme } from "react-native";
import { CFBTeam } from "types/cfb";
import { MLBTeam } from "types/mlb";
import { NFLTeam } from "types/nfl";
import { CBBTeam, LeagueType, NBATeam } from "types/types";
type Props = {
  teamId?: string | number;
  league: LeagueType;
  coach?: Coach;
};

export default function TeamInfoCard({ teamId, league, coach }: Props) {
  const isDark = useColorScheme() === "dark";

  // pick list
  let teamList: NBATeam[] | CFBTeam[] | CBBTeam[] | NFLTeam[] | MLBTeam[] = [];

  switch (league) {
    case "NBA":
      teamList = nbaTeams;
      break;
    case "CFB":
      teamList = cfbTeams;
      break;
    case "CBB":
      teamList = cbbTeams;
      break;
    case "WCBB":
      teamList = cbbTeams;
      break;
    case "NFL":
      teamList = nflTeams;
      break;
    case "MLB":
      teamList = mlbTeams;
      break;
  }

  const team = teamList.find((t) => String(t.id) === String(teamId));
  if (!team) return null;

  const primaryColor =
    (team as any).color ?? (isDark ? Colors.black : Colors.white);

  /* ---------------------------------------------------------
    LEAGUE-SPECIFIC RENDERING
  --------------------------------------------------------- */

  switch (league) {
    case "NBA": {
      const t = team as NBATeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name} ${coach?.last_name}`}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Arena"
            value={t.venueName}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={t.location}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Established"
            value={t.established}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "CFB": {
      const t = team as CFBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name} ${coach?.last_name}`}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={t.location}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Stadium"
            value={t.venue}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Established"
            value={t.established}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "CBB": {
      const t = team as CBBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name} ${coach?.last_name}`}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={t.location}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Arena"
            value={t.venueName}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Established"
            value={t.established}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }
    case "WCBB": {
      const t = team as CBBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name} ${coach?.last_name}`}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={t.location}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Arena"
            value={t.venueName}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Established"
            value={t.established}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "NFL": {
      const t = team as NFLTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Coach"
            value={`${coach?.first_name} ${coach?.last_name}`}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={`${t.location}`}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Stadium"
            value={t.venue}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "MLB": {
      const t = team as MLBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Location"
            value={t.city}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Stadium"
            value={t.venue}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }
  }
}
