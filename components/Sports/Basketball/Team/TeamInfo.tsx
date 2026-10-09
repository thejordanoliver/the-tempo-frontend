import InfoCard from "@/components/Sports/Basketball/Team/InfoCard";
import type { TeamDetails } from "hooks/useTeams";
import { StyleSheet, View } from "react-native";

type Props = {
  teamId?: string | number;
  teamDetails: TeamDetails | null;
  league: string;
  teamColor?: string;
};

export default function TeamInfo({
  teamId,
  teamDetails,
  league,
  teamColor,
}: Props) {
  if (!teamId) return null;

  const coachName = `${teamDetails?.coach?.firstName ?? ""} ${
    teamDetails?.coach?.lastName ?? ""
  }`.trim();

  const showConference = ["cfb", "mcbb", "wcbb", "cb", "sb"].includes(league);

  return (
    <View style={styles.infoCardContainer}>
      <InfoCard
        label={league === "mlb" ? "Manager" : "Coach"}
        value={coachName}
        image={teamDetails?.coach?.image}
        teamColor={teamColor}
      />

      <InfoCard
        label="Location"
        value={teamDetails?.location?.trim() || [teamDetails?.city, teamDetails?.state].filter(Boolean).join(", ")}
        teamColor={teamColor}
      />

      <InfoCard
        label="Established"
        value={teamDetails?.established && teamDetails.established > 0 ? teamDetails.established : null}
        teamColor={teamColor}
      />

      <InfoCard
        label="Venue"
        value={teamDetails?.venue?.name}
        teamColor={teamColor}
      />

      {showConference && (
        <InfoCard
          label="Conference"
          value={teamDetails?.conference?.shortName || teamDetails?.conference?.name}
          teamColor={teamColor}
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
