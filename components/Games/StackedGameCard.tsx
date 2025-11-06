import { getStyles } from "styles/GamecardStyles/StackedGameCard.styles";

import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameScores } from "hooks/useGameScores";
import { useTeamRecord } from "hooks/useTeamRecords";
import { useMemo, useState } from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getTeamLogo, teams } from "../../constants/teams";
import { useFetchPlayoffGames } from "../../hooks/usePlayoffSeries";
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
export default function StackedGameCard({
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

  // Status
  const statusObj = game.status;
  const statusText =
    typeof game.status === "string" ? game.status : mapStatus(game.status);
  const isFinal = statusText === "Final";
  const inProgress = statusText === "In Play";
  const isCanceled = statusText === "Canceled";
  const isDelayed = statusText === "Delayed";
  const isPostponed = statusText === "Postponed";
  const isHalftime = statusObj?.halftime ?? false;
  const isEndOfPeriod = game.periods?.endOfPeriod === true;

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
    homeFullName,
    awayFullName,
    gameDateStr
  );

  const currentPeriod =
    liveScore?.period ?? Number(game.periods?.current ?? game.period);
  const homeScore =
    liveScore?.home.total ?? game.scores?.home?.points ?? game.homeScore;
  const awayScore =
    liveScore?.away.total ?? game.scores?.visitors?.points ?? game.awayScore;
  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

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

  if (!game) {
    console.warn("StackedGameCard received no game prop");
  }

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
          colors={["#DFBD69", "#CDA765"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardWrapper}>
            {/* Away team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image
                  source={getLogo(awayTeamData, awayTeam)}
                  style={styles.logo}
                  accessibilityLabel={`${awayTeam.name} logo`}
                />
                <Text
                  style={[
                    styles.teamName,
                    { color: dark ? "#1d1d1d" : "#1d1d1d" },
                  ]}
                >
                  {awayTeamData?.name ?? awayTeam.code ?? awayTeam.fullName}
                </Text>
              </View>
              <ScoreText
                score={awayScore}
                recordData={awayRecordData ?? undefined}
                teamWins={awayWins}
                showRecord={statusText === "Scheduled"}
              />
            </View>

            {/* Home team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image
                  source={getLogo(homeTeamData, homeTeam)}
                  style={styles.logo}
                  accessibilityLabel={`${homeTeam.name} logo`}
                />
                <Text
                  style={[
                    styles.teamName,
                    { color: dark ? "#1d1d1d" : "#1d1d1d" },
                  ]}
                >
                  {homeTeamData?.name ?? homeTeam.code ?? homeTeam.fullName}
                </Text>
              </View>
              <ScoreText
                score={homeScore}
                recordData={homeRecordData ?? undefined}
                teamWins={homeWins}
                showRecord={statusText === "Scheduled"}
              />
            </View>
          </View>

          {/* Game Info */}
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isHalftime && <Text style={styles.date}>Halftime</Text>}
                {!isHalftime && isEndOfPeriod && (
                  <Text style={styles.date}>
                    End of {getQuarterLabel(currentPeriod)}
                  </Text>
                )}
                {!isHalftime && !isEndOfPeriod && (
                  <>
                    <Text style={styles.date}>
                      {getQuarterLabel(currentPeriod)}
                    </Text>
                    <View style={styles.statusDivider} />
                    <Text style={styles.clock}>
                      {liveScore?.displayClock ?? statusObj?.clock ?? ""}
                    </Text>
                  </>
                )}
              </View>
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
            {!isFinal && broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardWrapper}>
            {/* Away team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image
                  source={getLogo(awayTeamData, awayTeam)}
                  style={styles.logo}
                  accessibilityLabel={`${awayTeam.name} logo`}
                />
                <Text style={styles.teamName}>
                  {awayTeamData?.name ?? awayTeam.code ?? awayTeam.fullName}
                </Text>
              </View>
              <ScoreText
                score={awayScore}
                recordData={awayRecordData ?? undefined}
                teamWins={awayWins}
                showRecord={statusText === "Scheduled"}
              />
            </View>

            {/* Home team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image
                  source={getLogo(homeTeamData, homeTeam)}
                  style={styles.logo}
                  accessibilityLabel={`${homeTeam.name} logo`}
                />
                <Text style={styles.teamName}>
                  {homeTeamData?.name ?? homeTeam.code ?? homeTeam.fullName}
                </Text>
              </View>
              <ScoreText
                score={homeScore}
                recordData={homeRecordData ?? undefined}
                teamWins={homeWins}
                showRecord={statusText === "Scheduled"}
              />
            </View>
          </View>

          {/* Game Info */}
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isHalftime && <Text style={styles.date}>Halftime</Text>}
                {!isHalftime && isEndOfPeriod && (
                  <Text style={styles.date}>
                    End of {getQuarterLabel(currentPeriod)}
                  </Text>
                )}
                {!isHalftime && !isEndOfPeriod && (
                  <>
                    <Text style={styles.date}>
                      {getQuarterLabel(currentPeriod)}
                    </Text>
                    <View style={styles.statusDivider} />
                    <Text style={styles.clock}>
                      {liveScore?.displayClock ?? statusObj?.clock ?? ""}
                    </Text>
                  </>
                )}
              </View>
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
            {!isFinal && broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
