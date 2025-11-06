import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Fonts } from "constants/fonts";
import { getTeamLogo } from "constants/teamsCFB";
import { Image, Text, View } from "react-native";
import { CFBTeam } from "types/cfb";
import { Colors } from "constants/Colors";
type TeamInfoProps = {
  team: CFBTeam;
  teamName: string;
  rank?: number;
  score: number;
  opponentScore: number;
  record: string;
  isDark: boolean;
  isGameOver: boolean;
  hasStarted: boolean;
  possessionTeamId?: string;
  side: "home" | "away";
  timeouts: number;
  lighter?: boolean;
};

export default function TeamInfo({
  team,
  teamName,
  rank,
  score,
  opponentScore,
  record,
  isDark,
  isGameOver,
  hasStarted,
  possessionTeamId,
  side,
  timeouts,
  lighter,
}: TeamInfoProps) {
  const isTie = isGameOver && score === opponentScore;
  const isWinner = isGameOver && !isTie && score > opponentScore;
  const scoreOpacity = !isGameOver ? 1 : isTie ? 1 : isWinner ? 1 : 0.5;

  const teamCode = team?.abbreviation || team?.code || team?.id;

  // ✅ Prefer light logo first, fallback to normal logo
  let logo = getTeamLogo(teamCode, true); // try light logo first
  if (!logo) {
    logo = getTeamLogo(teamCode, false); // fallback to normal logo
  }

  const displayValue = !hasStarted ? record ?? "-" : score ?? "-";
  const hasPossession =
    hasStarted && String(possessionTeamId) === String(team?.id);

  const renderTimeouts = (remaining: number) => {
    const totalTimeouts = 3;
    const dots = [];
    for (let i = 0; i < totalTimeouts; i++) {
      dots.push(
        <View
          key={i}
          style={{
            width: 8,
            height: 4,
            borderRadius: 4,
            backgroundColor: lighter ? "#fff" : isDark ? "#fff" : "#000",
            opacity: i < remaining ? 1 : 0.3,
            marginHorizontal: 2,
          }}
        />
      );
    }
    return <View style={{ flexDirection: "row", marginTop: 2 }}>{dots}</View>;
  };

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

      <View style={{ flexDirection: "column", alignItems: "center" }}>
        <View style={{ flexDirection: "row" }}>
          {side === "home" && hasPossession && (
            <Image
              source={isDark ? FootballLight : Football}
              style={{
                position: "absolute",
                right: 40,
                bottom: "10%",
                width: 36,
                height: 36,
                resizeMode: "contain",
              }}
            />
          )}

          <Text
            style={{
              fontSize: 30,
              fontFamily: Fonts.OSBOLD,
              color: "#fff",
              opacity: hasStarted ? scoreOpacity : 1,
            }}
          >
            {displayValue}
          </Text>

          {side === "away" && hasPossession && (
            <Image
              source={isDark ? FootballLight : Football}
              style={{
                position: "absolute",
                left: 40,
                bottom: "10%",
                width: 36,
                height: 36,
                resizeMode: "contain",
              }}
            />
          )}
        </View>

        {isGameOver && record && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.OSREGULAR,
              color: "#fff",
            }}
          >
            {record}
          </Text>
        )}

        {hasStarted && !isGameOver && (
          <View style={{ width: "100%", alignItems: "center", marginTop: 4 }}>
            {renderTimeouts(timeouts)}
          </View>
        )}
      </View>
    </View>
  );
}
