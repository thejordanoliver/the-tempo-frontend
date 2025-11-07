import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameInfo } from "hooks/useGameInfo";
import { useGameScores } from "hooks/useGameScores";
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
  short: number | string;
  long?: string;
}): string {
  const long = apiStatus.long?.toLowerCase();

  // ✅ prioritize 'long' from API
  if (long === "in play") return "In Play";
  if (long === "finished") return "Final";
  if (long === "scheduled") return "Scheduled";
  if (long === "canceled") return "Canceled";
  if (long === "delayed") return "Delayed";
  if (long === "postponed") return "Postponed";

  // fallback using numeric 'short' codes
  const short = Number(apiStatus.short);
  switch (short) {
    case 1:
      return "Scheduled";
    case 2:
    case 3:
      return "Final"; // only if 'long' was missing
    case 4:
      return "Postponed";
    case 5:
      return "Delayed";
    case 6:
      return "Canceled";
    default:
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
  const getTeamName = (id?: number | string) =>
    getTeamById(id)?.name ?? "Unknown";

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

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);
  const gameDateStr = gameDate.toISOString();

  // ✅ Use full ESPN-style names
  const getFullTeamName = (id?: number | string) => {
    const team = teams.find((t) => String(t.id) === String(id));
    return team?.fullName ?? team?.name ?? "";
  };

  const homeFullName = getFullTeamName(homeId);
  const awayFullName = getFullTeamName(awayId);

  const { score: liveScore } = useGameScores(
    "nba",
    homeEspnId,
    awayEspnId,
    gameDateStr
  );

  const currentPeriod =
    liveScore?.period ?? Number(game.periods?.current ?? game.period);
  const endOfPeriod = Number(game.periods?.current ?? game.period);
  const homeScore =
    liveScore?.home.total ?? game.scores?.home?.points ?? game.homeScore;
  const awayScore =
    liveScore?.away.total ?? game.scores?.visitors?.points ?? game.awayScore;

  // Status
  const statusObj = game.status;
  const statusText =
    typeof game.status === "string" ? game.status : mapStatus(game.status);
  const isFinal = statusText === "Final";
  const inProgress = statusText === "In Play";
  const isCanceled = statusText === "Canceled";
  const isDelayed = statusText === "Delayed";
  const isPostponed = statusText === "Postponed";
  const isEndOfPeriod = game.periods?.endOfPeriod === true;
  // ✅ Smarter halftime detection
  const isHalftime =
    liveScore?.statusText?.toLowerCase() === "halftime" ||
    statusObj?.long?.toLowerCase() === "halftime" ||
    statusText === "Halftime";
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
    return ot === 1 ? "Final/OT" : `Final/OT${ot}`;
  }
  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const ScoreText = ({
    score,
    recordData,
    teamWins,
    showRecord,
  }: {
    score?: number;
    recordData?: string;
    teamWins: boolean;
    showRecord?: boolean;
  }) => {
    const hasScore = typeof score === "number" && !isNaN(score);
    const displayValue =
      showRecord || !hasScore ? recordData ?? "-" : score?.toString() ?? "-";
    const style =
      showRecord || !hasScore
        ? styles.teamRecord
        : [styles.teamScore, winnerStyle(teamWins)];
    return <Text style={style}>{displayValue}</Text>;
  };

  const renderCardContent = () => (
    <>
      {/* Away Team */}
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
        recordData={awayRecordData ?? undefined}
        teamWins={awayWins}
        showRecord={statusText === "Scheduled"}
      />

      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headlineText}</Text>
      
      {/* Center Info */}
      <View
        style={[
          styles.info,
          !broadcastText && {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        {/* Status / Score */}
        {isCanceled ? (
          <Text style={styles.finalText}>Canceled</Text>
        ) : isDelayed ? (
          <Text style={styles.finalText}>Delayed</Text>
        ) : isPostponed ? (
          <Text style={styles.finalText}>Postponed</Text>
        ) : isHalftime ? (
          // 🏀 Explicitly handle halftime
          <Text style={styles.date}>Halftime</Text>
        ) : isFinal ? (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>
              {getFinalWithQuarterLabel(currentPeriod)}
            </Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
          </View>
        ) : inProgress ? (
          <View style={styles.infoWrapper}>
            {liveScore?.statusText?.toLowerCase()?.startsWith("end of") ||
            isEndOfPeriod ? (
              // 🏁 Show end-of-period message (e.g. "End of 1st Quarter")
              <Text style={styles.date}>
                {liveScore?.statusText ??
                  `End of ${getQuarterLabel(endOfPeriod)}`}
              </Text>
            ) : (
              // 🕒 Show current period + live clock when game is in progress
              <View style={styles.infoWrapper}>
                <Text style={styles.date}>
                  {getQuarterLabel(currentPeriod)}
                </Text>
                {liveScore?.displayClock || statusObj?.clock ? (
                  <>
                    <View style={styles.statusDivider} />
                    <Text style={styles.clock}>
                      {liveScore?.displayClock ?? statusObj?.clock ?? ""}
                    </Text>
                  </>
                ) : null}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.date}>{game.time ?? "TBD"}</Text>
          </View>
        )}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* Home Team */}
      <ScoreText
        score={homeScore}
        recordData={homeRecordData ?? undefined}
        teamWins={homeWins}
        showRecord={statusText === "Scheduled"}
      />
      <View style={styles.teamSection}>
        <Image
          source={getLogo(homeTeamData, homeTeam)}
          style={styles.logo}
          accessibilityLabel={`${homeTeam.name} logo`}
        />
        <Text style={styles.teamName}>{getTeamName(homeId)}</Text>
      </View>

      {/* Notification Bell */}
      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
        style={({ pressed }) => [
          styles.notificationBell,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={20}
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
