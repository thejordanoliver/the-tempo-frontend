import InfoCard from "@/components/Sports/Basketball/Team/InfoCard";
import { getSOCCTeam } from "@/constants/teamsSOCC";
import { getWCBBTeam } from "@/constants/teamsWCBB";
import { TeamDetails } from "@/hooks/useTeams";
import { Team } from "@/types/football/football";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { getNHLTeam } from "constants/teamsNHL";
import { getWNBATeam } from "constants/teamsWNBA";
import { StyleSheet, View } from "react-native";

type Props = {
  teamId?: string | number;
  teamDetails: TeamDetails | null;
  league: string;
  isDark: boolean;
};

export default function TeamInfo({ teamId, teamDetails, league }: Props) {
  if (!teamId) return null;

  const team = (() => {
    switch (league) {
      case "NBA":
        return getNBATeam(teamId);
      case "CFB":
        return getCFBTeam(teamId);
      case "CBB":
        return getCBBTeam(teamId);
      case "WCBB":
        return getWCBBTeam(teamId);
      case "NFL":
        return getNFLTeam(teamId);
      case "MLB":
        return getMLBTeam(teamId);
      case "NHL":
        return getNHLTeam(teamId);
      case "WNBA":
        return getWNBATeam(teamId);
      case "SOCCER":
        return getSOCCTeam(teamId);
      default:
        return null;
    }
  })();

  if (!team) return null;

  const t = team as Team;
  const coachName = `${teamDetails?.coach?.firstName ?? ""} ${
    teamDetails?.coach?.lastName ?? ""
  }`.trim();

  const showConference = ["CFB", "CBB", "WCBB"].includes(league);

  return (
    <View style={styles.infoCardContainer}>
      <InfoCard
        label={league === "MLB" ? "Manager" : "Coach"}
        value={coachName}
        image={teamDetails?.coach?.image}
        team={t}
      />

      <InfoCard label="Location" value={teamDetails?.location} team={t} />

      <InfoCard label="Established" value={teamDetails?.established} team={t} />

      <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />

      {showConference && (
        <InfoCard
          label="Conference"
          value={teamDetails?.conference?.shortName}
          team={t}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoCardContainer: {
    width: "100%",
  },
});
