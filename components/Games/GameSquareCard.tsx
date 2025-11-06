import { Fonts } from "constants/fonts";
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
import { getStyles } from "styles/GamecardStyles/GameSquareCard.styles";
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

export default function GameSquareCard({
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

  const homeTeamInfo = useMemo(() => {
    return teams.find(
      (t) =>
        homeTeam.name &&
        (t.name === homeTeam.name ||
          t.code === homeTeam.name ||
          t.name.includes(homeTeam.name))
    );
  }, [homeTeam.name]);

  const awayTeamInfo = useMemo(() => {
    return teams.find(
      (t) =>
        awayTeam.name &&
        (t.name === awayTeam.name ||
          t.code === awayTeam.name ||
          t.name.includes(awayTeam.name))
    );
  }, [awayTeam.name]);

  // Memoized team data
  const homeTeamData = useMemo(
    () => ({
      id: String(homeId),
      espnID: homeEspnId ?? "",
      code: homeTeamInfo?.code,
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
      code: awayTeamInfo?.code,
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

  const { score: liveScore } = useGameScores(
    "nba",
    homeTeamData.name,
    awayTeamData.name,
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
              {/* Away score or record */}
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
                <Text style={[styles.teamName, { color: "#1d1d1d" }]}>
                  {homeTeamData?.code ?? homeTeam.code ?? homeTeam.name}
                </Text>
              </View>
              {/* Home score or record */}
              <ScoreText
                score={homeScore}
                recordData={homeRecordData ?? undefined}
                teamWins={homeWins}
                showRecord={statusText === "Scheduled"}
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

          {(gameNumberLabel || seriesSummary || holidayLabel) && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                left: 8,
                bottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  gap: 6,
                }}
              >
                {gameNumberLabel && (
                  <Text
                    style={{
                      color: "#1d1d1d",
                      fontFamily: Fonts.OSEXTRALIGHT,
                      fontSize: 8,
                      maxWidth: 50,
                      textAlign: "center",
                      opacity: 0.8,
                    }}
                    numberOfLines={1}
                  >
                    {gameNumberLabel}
                  </Text>
                )}
                {gameNumberLabel && (seriesSummary || holidayLabel) && (
                  <View
                    style={{
                      height: 10,
                      width: 1,
                      backgroundColor: "#1d1d1d",
                      opacity: 0.3,
                    }}
                  />
                )}
                {seriesSummary && (
                  <Text
                    style={{
                      color: dark ? "#1d1d1d" : "#1d1d1d",
                      fontFamily: Fonts.OSEXTRALIGHT,
                      fontSize: 8,
                      textAlign: "center",
                      maxWidth: 180,
                      opacity: 0.8,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {seriesSummary}
                  </Text>
                )}
              </View>
            </View>
          )}
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
                  {homeTeamData?.code ?? homeTeam.code ?? homeTeam.name}
                </Text>
              </View>
              {/* Home score or record */}
              <ScoreText
                score={homeScore}
                recordData={homeRecordData ?? undefined}
                teamWins={homeWins}
                showRecord={statusText === "Scheduled"}
              />
            </View>
          </View>

          {/* Game info */}
          <View style={styles.info}>
            {isCanceled ? (
              <Text style={[styles.finalText]}>Canc.</Text>
            ) : isFinal ? (
              <>
                <Text style={styles.finalText}>Final</Text>
                <Text style={[styles.dateFinal]}>
                  {new Date(game.date).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </Text>
              </>
            ) : game.status.long === "Scheduled" ? (
              <>
                <Text style={styles.date}>
                  {new Date(game.date).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.time}>{game.time}</Text>
              </>
            ) : inProgress ? (
              <>
                <Text style={styles.date}>
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

                {!game.isHalftime && !isEndOfPeriod && game.status.clock ? (
                  <Text style={[styles.clock]}>{game.status.clock}</Text>
                ) : null}
              </>
            ) : null}

            <Text style={styles.broadcast}>{broadcastText}</Text>
          </View>
          {(gameNumberLabel || seriesSummary || holidayLabel) && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                left: 12,
                bottom: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  gap: 6,
                }}
              >
                {gameNumberLabel && (
                  <Text
                    style={{
                      color: dark ? "#fff" : "#1d1d1d",
                      fontFamily: Fonts.OSEXTRALIGHT,
                      fontSize: 10,
                      maxWidth: 50,
                      textAlign: "center",
                      opacity: 0.8,
                    }}
                    numberOfLines={1}
                  >
                    {gameNumberLabel}
                  </Text>
                )}
                {gameNumberLabel && (seriesSummary || holidayLabel) && (
                  <View
                    style={{
                      height: 10,
                      width: 1,
                      backgroundColor: dark ? "#fff" : "#1d1d1d",
                      opacity: 0.3,
                    }}
                  />
                )}
                {seriesSummary && (
                  <Text
                    style={{
                      color: dark ? "#fff" : "#1d1d1d",
                      fontFamily: Fonts.OSEXTRALIGHT,
                      fontSize: 10,
                      textAlign: "center",
                      maxWidth: 180,
                      opacity: 0.8,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {seriesSummary}
                  </Text>
                )}
                {holidayLabel && (
                  <Text
                    style={{
                      color: dark ? "#fff" : "#1d1d1d",
                      fontFamily: Fonts.OSEXTRALIGHT,
                      fontSize: 10,
                      textAlign: "center",
                      maxWidth: 180,
                      opacity: 0.8,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {holidayLabel}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
