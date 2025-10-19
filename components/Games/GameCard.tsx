import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getTeamLogo, teams } from "../../constants/teams";
import { useFetchPlayoffGames } from "../../hooks/usePlayoffSeries";
import { getStyles } from "../../styles/GamecardStyles/GameCard.styles";
import { Game, Team } from "../../types/types";
// --- Helper function to normalize API status ---
function mapStatus(apiStatus: {
  short: number;
  long?: string;
}): Game["status"] {
  switch (apiStatus.short) {
    case 1:
      return "Scheduled";
    case 2:
    case 3: // finished
      return "Final";
    case 4:
      return "Postponed";
    case 5:
      return "Delayed";
    case 6:
      return "Canceled";
    default:
      if (apiStatus.long?.toLowerCase() === "finished") return "Final";
      return "Scheduled";
  }
}

export default function GameCard({
  game,
  isDark,
}: {
  game: Game;
  isDark?: boolean;
}) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const homeTeam =
    game.home ?? ({ name: "Unknown", logo: "", record: "-" } as Team);
  const awayTeam =
    game.away ?? ({ name: "Unknown", logo: "", record: "-" } as Team);

  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  const getTeamName = (id?: number | string): string => {
    const team = getTeamById(id);
    return team?.name ?? "Unknown";
  };

  // IDs
  const homeId = Number(game.home?.id ?? (game as any).homeTeamId ?? 0);
  const awayId = Number(game.away?.id ?? (game as any).awayTeamId ?? 0);

  // ESPN IDs
  const homeEspnId = getTeamById(homeId)?.espnID;
  const awayEspnId = getTeamById(awayId)?.espnID;

  // Team records
  const { record: homeRecord } = useTeamRecord(homeEspnId);
  const { record: awayRecord } = useTeamRecord(awayEspnId);

  // Memoized team data
  const homeTeamData = useMemo(
    () => ({
      id: String(homeId),
      espnID: homeEspnId ?? "",
      name: getTeamName(homeId),
      logo: getTeamLogo(homeId, dark),
      record: homeRecord?.overall ?? "0-0",
    }),
    [homeId, homeEspnId, homeRecord?.overall, dark]
  );

  const awayTeamData = useMemo(
    () => ({
      id: String(awayId),
      espnID: awayEspnId ?? "",
      name: getTeamName(awayId),
      logo: getTeamLogo(awayId, dark),
      record: awayRecord?.overall ?? "0-0",
    }),
    [awayId, awayEspnId, awayRecord?.overall, dark]
  );

  const homeRecordData = homeRecord?.overall;
  const awayRecordData = awayRecord?.overall;

  const currentPeriod = Number(game.periods?.current ?? game.period);

  const status = mapStatus(game.status as any);
  const isFinal = status === "Final";
  const inProgress = status === "In Progress";
  const isCanceled = status === "Canceled";
  const isDelayed = status === "Delayed";
  const isPostponed = status === "Postponed";
  const isEndOfPeriod = game.periods?.endOfPeriod === true;

  const homeScore = game.scores?.home?.points ?? game.homeScore;
  const awayScore = game.scores?.visitors?.points ?? game.awayScore;

  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: dark ? "#fff" : "#1d1d1d",
    opacity: inProgress ? 1 : teamWins ? 1 : 0.5,
  });

  const getLogo = (teamData?: Team, fallback?: Team) => {
    if (!teamData)
      return (
        fallback?.logo ??
        require("../../assets/Placeholders/teamPlaceholder.png")
      );
    return getTeamLogo(teamData.id, dark);
  };

  function safeDate(date?: string | null) {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  const gameDate = safeDate(game.date);
  const gameDateStr = gameDate.toISOString();

  const playoffGames =
    homeId && awayId ? useFetchPlayoffGames(homeId, awayId, 2024).games : [];
  const currentPlayoffGame = playoffGames.find((g) => g.id === game.id);
  const gameNumberLabel = currentPlayoffGame?.gameNumber
    ? `Game ${currentPlayoffGame.gameNumber}`
    : null;
  const seriesSummary = currentPlayoffGame?.seriesSummary;

  const isNBAFinals =
    gameDate.getMonth() === 5 &&
    gameDate.getDate() >= 5 &&
    gameDate.getDate() <= 22;
  const isChristmasDay =
    gameDate.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYearsDay = gameDate.getMonth() === 0 && gameDate.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
    ? "New Year's Day"
    : null;

  const { broadcasts } = useGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  function getQuarterLabel(period?: number) {
    if (!period) return "Live";
    if (period <= 4) return ["1st", "2nd", "3rd", "4th"][period - 1] ?? "";
    const ot = period - 4;
    return ot === 1 ? "OT" : `OT${ot}`;
  }

  function getFinalWithQuarterLabel(period?: number) {
    if (!period) return "Final";
    if (period <= 4) return `Final`;
    const ot = period - 4;
    return ot === 1 ? "Final OT" : `Final OT${ot}`;
  }

  const ScoreText = ({
    score,
    recordData,
    teamWins,
  }: {
    score?: number;
    recordData?: string;
    teamWins: boolean;
  }) => {
    const hasScore = score != null;
    const style = hasScore
      ? [styles.teamScore, winnerStyle(teamWins)]
      : styles.teamRecord;
    const displayValue = hasScore ? score : recordData ?? "-";
    return <Text style={style}>{displayValue}</Text>;
  };

  const renderCardContent = () => (
    <>
      <View style={styles.teamSection}>
        <Image
          source={getLogo(awayTeamData, awayTeam)}
          style={styles.logo}
          accessibilityLabel={`${awayTeam.name} logo`}
        />
        <Text style={styles.teamName}>{getTeamName(awayId)}</Text>
      </View>
      <ScoreText
        score={awayScore}
        recordData={awayRecordData ?? undefined} // <-- coerce null to undefined
        teamWins={awayWins}
      />

      <View
        style={[
          styles.info,
          !broadcastText && {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {(gameNumberLabel || seriesSummary || holidayLabel) && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 6,
              paddingHorizontal: 4,
              width: "100%",
              position: "absolute",
              top: -20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {gameNumberLabel && (
                <Text style={styles.seriesStatus}>{gameNumberLabel}</Text>
              )}
              {gameNumberLabel && (seriesSummary || holidayLabel) && (
                <View style={styles.seriesDivider} />
              )}
              {seriesSummary && (
                <Text style={styles.seriesStatus}>{seriesSummary}</Text>
              )}
              {holidayLabel && (
                <Text style={styles.seriesStatus}>{holidayLabel}</Text>
              )}
            </View>
          </View>
        )}

        {isCanceled ? (
          <Text style={styles.finalText}>Canceled</Text>
        ) : isDelayed ? (
          <Text style={styles.finalText}>Delayed</Text>
        ) : isPostponed ? (
          <Text style={styles.finalText}>Postponed</Text>
        ) : isFinal ? (
          <>
            <Text style={styles.finalText}>
              {getFinalWithQuarterLabel(currentPeriod)}
            </Text>
            <Text style={styles.dateFinal}>
              {gameDate.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
              })}
            </Text>
          </>
        ) : inProgress ? (
          <>
            <Text style={styles.date}>
              {game.isHalftime
                ? "Halftime"
                : isEndOfPeriod
                ? `End of ${getQuarterLabel(currentPeriod)}`
                : getQuarterLabel(currentPeriod)}
            </Text>
            {!game.isHalftime && !isEndOfPeriod && game.clock && (
              <Text style={styles.clock}>{game.clock}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.date}>
              {gameDate.toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
              })}
            </Text>
            <Text style={styles.time}>{game.time ?? "TBD"}</Text>
          </>
        )}

        {broadcastText ? (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        ) : null}
      </View>

      <ScoreText
        score={homeScore}
        recordData={homeRecordData ?? undefined} // <-- coerce null to undefined
        teamWins={homeWins}
      />
      <View style={styles.teamSection}>
        <Image
          source={getLogo(homeTeamData, homeTeam)}
          style={styles.logo}
          accessibilityLabel={`${homeTeam.name} logo`}
        />
        <Text style={styles.teamName}>{getTeamName(homeId)}</Text>
      </View>

      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
        style={({ pressed }) => [
          styles.notificationBell,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={16}
          color={dark ? "#fff" : "#1d1d1d"}
        />
      </Pressable>
    </>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      {isNBAFinals ? (
        <LinearGradient
          colors={["#DFBD69", "#CDA765"] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          {renderCardContent()}
        </LinearGradient>
      ) : (
        <View style={styles.card}>{renderCardContent()}</View>
      )}
    </TouchableOpacity>
  );
}
