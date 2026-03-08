import { Colors } from "constants/Styles";
import { getTeamInfo } from "constants/teamsNFL";
import { View, useColorScheme } from "react-native";
import InfoCard from "../../NBA/Team/InfoCard";

type Props = {
  teamId?: number | string;
};

function calculateWinPercentage(record?: string): string {
  if (!record) return "N/A";
  const [winsStr, lossesStr] = record.split("-");
  const wins = parseInt(winsStr, 10);
  const losses = parseInt(lossesStr, 10);

  if (isNaN(wins) || isNaN(losses) || wins + losses === 0) return "N/A";

  const winPct = (wins / (wins + losses)) * 100;
  return `${winPct.toFixed(1)}%`;
}

export default function TeamInfoCard({ teamId }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ✅ Just get the team directly
  const team = teamId !== undefined ? getTeamInfo(teamId) : undefined;

  if (!team) {
    console.warn(`TeamInfoCard: No team found for id=${teamId}`);
    return null;
  }

  const primaryColor = team.color ?? (isDark ? Colors.black : Colors.white);

  return (
    <View style={{ width: "100%" }}>
      <InfoCard
        label="Owner"
        value={team.owner ?? "N/A"}
        team={team}
        backgroundColor={primaryColor}
      />

      <InfoCard
        label="Head Coach"
        value={team.coach ?? "N/A"}
        image={team.coachImage} // Make sure coachImages is imported
        team={team}
        backgroundColor={primaryColor}
      />

      <InfoCard
        label="Location"
        value={`${team.city}`}
        team={team}
        backgroundColor={primaryColor}
      />
      <InfoCard
        label="Stadium"
        value={team.venue ?? "N/A"}
        team={team}
        backgroundColor={primaryColor}
      />

      <InfoCard
        label="First Season"
        value={team.established ?? "N/A"}
        team={team}
        backgroundColor={primaryColor}
      />
    </View>
  );
}
