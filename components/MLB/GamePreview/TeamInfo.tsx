import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { Image, Text, View } from "react-native";
import { MLBTeam } from "types/mlb";

type TeamInfoProps = {
  team: MLBTeam;
  teamName: string;
  score: number;
  opponentScore: number;
  record: string;
  isGameOver: boolean;
  hasStarted: boolean;
  side: "home" | "away";
  possessionTeamId?: string;
  lighter?: boolean;
};

export default function TeamInfo({
  team,
  teamName,
  score,
  opponentScore,
  record,
  isGameOver,
  hasStarted,
}: TeamInfoProps) {
  const isTie = isGameOver && score === opponentScore;
  const isWinner = isGameOver && !isTie && score > opponentScore;

  const scoreOpacity = !isGameOver ? 1 : isTie ? 1 : isWinner ? 1 : 0.5;

  // Display score if started, record if not
  const displayValue = !hasStarted ? record ?? "-" : score ?? "-";

  return (
    <View style={{ alignItems: "center", position: "relative" }}>
      {/* Team Logo */}
      <Image
        source={{ uri: team.logoLight || team.logo }}
        style={{ width: 80, height: 80, resizeMode: "contain" }}
      />

      <Text
        style={{
          fontSize: 14,
          fontFamily: Fonts.OSREGULAR,
          color: Colors.white,
          marginTop: 6,
        }}
      >
        {teamName}
      </Text>

      {/* Score + Record */}
      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              fontSize: 30,
              fontFamily: Fonts.OSBOLD,
              color: Colors.white,
              opacity: hasStarted ? scoreOpacity : 1,
            }}
          >
            {displayValue}
          </Text>
        </View>

        {/* Record only shows after game is final */}
        {isGameOver && record && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.OSREGULAR,
              color: Colors.white,
            }}
          >
            {record}
          </Text>
        )}
      </View>
    </View>
  );
}
