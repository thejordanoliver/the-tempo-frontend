import { Colors } from "constants/Styles";
import { getMLBTeam } from "constants/teamsMLB";
import { useRouter } from "expo-router";
import { useTeamRecord } from "hooks/MLBHooks/useTeamRecords";
import { memo } from "react";

import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { gameSquareCardStyles } from "styles/GamecardStyles/GameSquareCardStyles";
import { MLBGame } from "types/mlb";

type Props = {
  game: MLBGame; // Your API Game shape
  isDark?: boolean;
};

// Maps MLB API status codes to readable display text
const formatMLBStatus = (statusObj: any) => {
  if (!statusObj) return "";

  const short = statusObj.short;
  const long = statusObj.long ?? "";
  const inning = statusObj.inning ?? null;

  switch (short) {
    case "NS":
      return "Not Started";

    case "FT":
      return "Final";

    case "POST":
      return "Postponed";

    case "CANC":
      return "Canceled";

    case "INTR":
      return "Delayed";

    case "ABD":
      return "Abandoned";

    default:
      break;
  }

  return long || short || "";
};

function MLBGameSquareCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const router = useRouter();

  const styles = gameSquareCardStyles(dark);

  /* ===============================
     BASIC GAME FIELDS FROM API
  =============================== */
  const home = game?.teams?.home;
  const away = game?.teams?.away;

  // Find matching internal teams using ESPN ID
  const homeTeam = getMLBTeam(home?.id);
  const awayTeam = getMLBTeam(away?.id);

  const homeEspnId = getMLBTeam(home?.espnID);
  const awayEspnId = getMLBTeam(away?.espnID);

  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "mlb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "mlb");

  const homeScore = game?.scores?.home?.total ?? 0;
  const awayScore = game?.scores?.away?.total ?? 0;

  const status = game?.status || {};
  const longStatus = status.long?.toLowerCase() || "";

  const isFinal =
    longStatus.includes("final") ||
    longStatus.includes("finished") ||
    longStatus === "ft";

  const isScheduled =
    longStatus === "not started" || longStatus.includes("scheduled");

  const isCancelled = longStatus === "cancelled";

  /* ===============================
     DATE / TIME
  =============================== */
  const timestamp = game?.date?.timestamp;
  const gameDate = timestamp ? new Date(timestamp * 1000) : null;

  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = gameDate
    ? gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  /* ===============================
     WIN/LOSS STYLE
  =============================== */
  const getTeamStyle = (isHome: boolean) => {
    if (!isFinal)
      return { color: dark ? Colors.white : Colors.black, opacity: 1 };

    const winnerIsHome = homeScore > awayScore;
    const winner = isHome ? winnerIsHome : !winnerIsHome;

    return {
      color: dark ? Colors.white : Colors.black,
      opacity: winner ? 1 : 0.5,
    };
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/mlb/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.cardWrapper}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image
                source={{ uri: dark ? awayTeam?.logoLight : awayTeam?.logo }}
                style={styles.logo}
              />
              <Text style={styles.teamName}>{awayTeam?.code}</Text>
            </View>

            {/* Away Score / Record */}
            <Text
              style={[
                isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(false),
              ]}
            >
              {isScheduled ? awayRecord.overall ?? "0-0" : awayScore}
            </Text>
          </View>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image
                source={{ uri: dark ? homeTeam?.logoLight : homeTeam?.logo }}
                style={styles.logo}
              />
              <Text style={styles.teamName}>{homeTeam?.code}</Text>
            </View>

            {/* Home Score / Record */}
            <Text
              style={[
                isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(true),
              ]}
            >
              {isScheduled ? homeRecord.overall ?? "0-0" : homeScore}
            </Text>
          </View>
        </View>

        {/* Center Game Info */}
        <View style={styles.info}>
          {isScheduled ? (
            <>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text style={styles.date}>{formattedTime}</Text>
            </>
          ) : isFinal ? (
            <>
              <Text style={styles.finalText}>{formatMLBStatus(status)}</Text>

              <Text style={styles.finalText}>{formattedDate}</Text>
            </>
          ) : isCancelled ? (
            <>
              <Text style={styles.finalText}>{formatMLBStatus(status)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.date}>{formatMLBStatus(status)}</Text>

              <Text style={styles.clock}>{formattedDate}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(MLBGameSquareCard);
