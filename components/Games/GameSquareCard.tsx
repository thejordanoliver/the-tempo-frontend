import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameInfo } from "hooks/useGameInfo";
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
import { getStyles } from "styles/GamecardStyles/GameSquareCardStyles";
import { getShortBroadcastDisplay } from "utils/matchBroadcast";
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
  const getTeamCode = (id?: number | string) =>
    getTeamById(id)?.code ?? "Unknown";

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
      code: getTeamCode(homeId),
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
      code: getTeamCode(awayId),
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
  // 🧠 Smarter reactive status
  const statusObj = game.status;
  const baseStatus =
    typeof game.status === "string" ? game.status : mapStatus(game.status);

  // Prefer live status text when available
  const liveStatusText = liveScore?.statusText?.toLowerCase() ?? "";

  // Dynamically resolve final state from live data
  const effectiveStatus = liveStatusText.includes("final")
    ? "Final"
    : liveStatusText.includes("halftime")
    ? "Halftime"
    : liveStatusText.includes("in progress") ||
      liveStatusText.includes("in play") ||
      liveStatusText.includes("qtr") ||
      liveStatusText.includes("quarter")
    ? "In Play"
    : baseStatus;

  // Now derive booleans reactively
  const isFinal = effectiveStatus === "Final";
  const inProgress = effectiveStatus === "In Play";
  const isCanceled = effectiveStatus === "Canceled";
  const isDelayed = effectiveStatus === "Delayed";
  const isPostponed = effectiveStatus === "Postponed";
  const isHalftime = effectiveStatus === "Halftime";

  const isEndOfPeriod = game.periods?.endOfPeriod === true;
  // ✅ Smarter halftime detection

  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);
  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: dark ? Colors.white : Colors.black,
    opacity: inProgress || isHalftime ? 1 : isFinal ? (teamWins ? 1 : 0.5) : 1,
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
  const broadcastText = getShortBroadcastDisplay(broadcasts);

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
                <Text style={[styles.teamName, { color: "#1d1d1d" }]}>
                  {awayTeamData?.code ?? awayTeam.code ?? awayTeam.name}
                </Text>
              </View>
              {/* Home Team */}
              <ScoreText
                score={awayScore}
                recordData={awayRecordData ?? undefined}
                teamWins={awayWins}
                showRecord={effectiveStatus === "Scheduled"}
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
                <Text style={[styles.teamName, { color: "#1d1d1d" }]}>
                  {homeTeamData?.code ?? homeTeam.code ?? homeTeam.name}
                </Text>
              </View>
              {/* Home score or record */}
              <ScoreText
                score={homeScore}
                recordData={homeRecordData ?? undefined}
                teamWins={homeWins}
                showRecord={effectiveStatus === "Scheduled"}
              />
            </View>
          </View>

          {/* Game info */}
          <View style={styles.info}>
            {isCanceled ? (
              <Text style={styles.finalText}>Canc.</Text>
            ) : isFinal ? (
              <>
                <Text style={styles.finalText}>Final</Text>
                <Text style={[styles.dateFinal, { color: "#1d1d1d" }]}>
                  {new Date(game.date).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </Text>
              </>
            ) : game.status.long === "Scheduled" ? (
              <>
                <Text style={[styles.date, { color: "#1d1d1d" }]}>
                  {new Date(game.date).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </Text>
                <Text style={[styles.time, { color: "#1d1d1d" }]}>
                  {game.time}
                </Text>
              </>
            ) : inProgress ? (
              <>
                <Text
                  style={[
                    styles.date,
                    {
                      fontFamily: Fonts.OSMEDIUM,
                      color: "#1d1d1d",
                    },
                  ]}
                >
                  {(() => {
                    const periodNum = Number(currentPeriod) || 0;

                    if (game.isHalftime) {
                      return "Halftime";
                    }

                    if (isEndOfPeriod) {
                      if (periodNum > 4) {
                        return periodNum === 5
                          ? "End of OT"
                          : `End of ${periodNum - 4}OT`;
                      }
                      return `End of Q${periodNum}`;
                    }

                    if (periodNum > 4) {
                      return periodNum === 5 ? "OT" : `${periodNum - 4}OT`;
                    }

                    return `Q${periodNum || "Live"}`;
                  })()}
                </Text>
              </>
            ) : null}
          </View>
          {/* Only show broadcast if exists */}
          {broadcastText ? (
            <Text style={styles.broadcast}>{broadcastText}</Text>
          ) : null}

          {/* headlineText */}
          <Text style={[styles.headlineText]}>{headlineText}</Text>
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
                  {awayTeamData?.code ?? awayTeam.code ?? awayTeam.name}
                </Text>
              </View>
              {/* Away score or record */}
              <ScoreText
                score={awayScore}
                recordData={awayRecordData ?? undefined}
                teamWins={awayWins}
                showRecord={effectiveStatus === "Scheduled"}
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
                  {homeTeamData?.code ?? homeTeam.code ?? homeTeam.name}
                </Text>
              </View>
              {/* Home Team */}
              <ScoreText
                score={homeScore}
                recordData={homeRecordData ?? undefined}
                teamWins={homeWins}
                showRecord={effectiveStatus === "Scheduled"}
              />
            </View>
          </View>

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
              <Text style={styles.finalText}>CANC</Text>
            ) : isDelayed ? (
              <Text style={styles.finalText}>DLY</Text>
            ) : isPostponed ? (
              <Text style={styles.finalText}>PPD</Text>
            ) : isHalftime ? (
              <Text style={styles.finalText}>HT</Text>
            ) : isFinal ? (
              <View>
                <Text style={styles.finalText}>
                  {getFinalWithQuarterLabel(currentPeriod)}
                </Text>
                <Text style={styles.finalText}>{formattedDate}</Text>
              </View>
            ) : inProgress ? (
              <View>
                {liveScore?.statusText?.toLowerCase().includes("end of") ||
                liveScore?.statusText?.toLowerCase().includes("final") ? (
                  <Text style={styles.clock}>{liveScore.statusText}</Text>
                ) : (
                  <>
                    <Text style={styles.date}>
                      {getQuarterLabel(currentPeriod)}
                    </Text>
                    {liveScore?.displayClock && (
                      <>
                        <Text style={styles.clock}>
                          {liveScore.displayClock}
                        </Text>
                      </>
                    )}
                  </>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.date}>{formattedDate}</Text>
                <Text style={styles.date}>{game.time ?? "TBD"}</Text>
              </View>
            )}

            {!isFinal && broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>
          {/* headlineText */}
          <Text style={[styles.headlineText]}>{headlineText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
