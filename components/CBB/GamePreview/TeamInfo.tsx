import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCBB";
import { Image, Text, View } from "react-native";
import { CBBTeam } from "types/types";

type TeamInfoProps = {
  team?: CBBTeam;
  teamName: string;
  score?: number;
  opponentScore?: number;
  record?: string;
  isDark: boolean;
  isGameOver: boolean;
  isScheduled?: boolean; // scheduled games
  side?: "home" | "away";
  rank?: number;
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
  rank,
}: TeamInfoProps) {
  const isWinner = isGameOver && (score ?? 0) > (opponentScore ?? 0);

  // Opacity logic: scheduled or in-progress → full, game over loser → 0.5
  const displayOpacity = isScheduled || !isGameOver ? 1 : isWinner ? 1 : 0.5;

  // Display record if scheduled, otherwise score
  const displayValue = isScheduled
    ? record ?? "-"
    : score !== undefined
    ? score
    : "-";

  // ✅ Safe logo handling (falls back to placeholder if team is undefined)
  const logo = getTeamLogo(team?.id ?? teamName, true);

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
          color: Colors.netural.white,
          marginTop: 6,
        }}
      >
        {rank && (
          <Text style={{ fontSize: 10, color: Colors.netural.lightGray }}>
            {rank}
          </Text>
        )}{" "}
        {teamName}
      </Text>

      {/* Show score (in-progress/final) or record (scheduled) */}
      <Text
        style={{
          fontSize: 30,
          fontFamily: Fonts.OSBOLD,
          color: Colors.netural.white,
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
            color: Colors.netural.white,
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
