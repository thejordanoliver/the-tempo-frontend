import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teams";
import { Image, Text, View } from "react-native";
import { Team } from "../../types/types";

type TeamInfoProps = {
  team?: Team;
  teamName: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  isDark: boolean;
  isGameOver: boolean;
  isScheduled?: boolean; // scheduled games
  side?: "home" | "away";
};

export default function TeamInfo({
  team,
  teamName,
  score,
  opponentScore,
  record,
  isDark,
  isGameOver,
  isScheduled,
  side,
}: TeamInfoProps) {
  const isWinner = isGameOver && (score ?? 0) > (opponentScore ?? 0);

  // Opacity logic: scheduled or in-progress → full, game over loser → 0.5
  const displayOpacity = isScheduled || !isGameOver ? 1 : isWinner ? 1 : 0.5;

  // Display record if scheduled, otherwise score
  const displayValue =
    isScheduled ? record ?? "-" : score !== undefined ? score : "-";

  // Always prefer the light logo if available
  const logo = team ? getTeamLogo(team.id, true) : undefined;

  return (
    <View style={{ alignItems: "center", position: "relative" }}>
      <Image
        source={logo}
        style={{ width: 80, height: 80, resizeMode: "contain" }}
      />

      <Text
        style={{
          fontSize: 14,
          fontFamily: Fonts.OSREGULAR,
          color: "#fff",
          marginTop: 6,
        }}
      >
        {teamName}
      </Text>

      {/* Show score (in-progress/final) or record (scheduled) */}
      <Text
        style={{
          fontSize: 30,
          fontFamily: Fonts.OSBOLD,
          color: "#fff",
          opacity: displayOpacity,
          marginTop: isScheduled && record ? 4 : 0,
        }}
      >
        {displayValue}
      </Text>

      {/* Show record under team name if not scheduled */}
      {!isScheduled && record && (
        <Text
          style={{
            fontSize: 12,
            fontFamily: Fonts.OSREGULAR,
            color: "#fff",
            opacity: 0.7,
            marginTop: 2,
          }}
        >
          {record}
        </Text>
      )}
    </View>
  );
}
