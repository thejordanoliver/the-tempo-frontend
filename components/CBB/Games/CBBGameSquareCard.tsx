import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { teams } from "constants/teamsCBB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameDetails } from "hooks/useGameDetails";
import { useTeamRecord } from "hooks/useTeamRecords";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { gameSquareCardStyles } from "styles/GamecardStyles/GameSquareCardStyles";
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";

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

function CBBGameSquareCard({
  game,
  isDark,
  isWomen = false,
}: {
  game: CBBGame;
  isDark?: boolean;
  isWomen?: boolean; // 👈 NEW
}) {
  const colorScheme = useColorScheme();
  const dark = Boolean(isDark ?? colorScheme === "dark");
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const leagueKey = isWomen
    ? "womens-college-basketball"
    : "mens-college-basketball";

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  // --- Date ---
  const gameDate = game?.timestamp
    ? new Date(game.timestamp * 1000)
    : game?.date
    ? new Date(game.date)
    : null;

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2025 &&
      gameDate.getMonth() === 3 &&
      gameDate.getDate() === 7
  );

  const styles = gameSquareCardStyles(dark, isChampionship);

  const gameDateStr = gameDate ? gameDate.toISOString().split("T")[0] : "";

  const rankingsLeague = isWomen ? "423" : "116"; // 👈 ESPN league IDs

  const {
    getTeamRankingById,
    rankedTeamIds,
    loading: rankingsLoading,
  } = useCBBRankings(rankingsLeague);

  // --- Get Team Info from constants ---
  const getTeamById = useCallback(
    (id?: number | string) => {
      if (!id) return undefined;

      return teams.find((t) =>
        isWomen ? String(t.wid) === String(id) : String(t.id) === String(id)
      );
    },
    [isWomen]
  );

  const canNavigate = getTeamById(homeId) && getTeamById(awayId);

  const getTeamCode = useCallback(
    (id?: number | string) => getTeamById(id)?.code ?? "Unknown",
    [getTeamById]
  );

  const getTeamLogoResolved = useCallback(
    (id?: number | string) => {
      const team = getTeamById(id);
      if (!team) return undefined;

      // 👩‍🦰 Women: prefer wlogo
      if (isWomen) {
        return team.wLogo || (dark ? team.logoLight || team.logo : team.logo);
      }

      // 👨 Men
      return dark ? team.logoLight || team.logo : team.logo;
    },
    [getTeamById, isWomen, dark]
  );

  // Use ESPN team IDs, not internal IDs
  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  const headlineLeague = isWomen ? "wcbb" : "cbb";

  const { headlineText } = useCBBHeadline(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
    headlineLeague
  );

  const { score: liveScore } = useGameDetails(
    leagueKey,
    homeEspnId?.toString(),
    awayEspnId?.toString(),
    gameDateStr
  );
  // --- Game status ---
  const statusData = game?.status ?? game?.status ?? {};

  const status = useMemo(() => {
    const long = statusData?.long ?? "";
    const short = String(statusData?.short ?? "").toLowerCase();
    const longLower = long.toLowerCase();

    const livePhrases = [
      "in play",
      "playing",
      "live",
      "in progress",
      "1st half",
      "2nd half",
      "q1",
      "q2",
      "q3",
      "q4",
      "over time",
    ];

    const isHalftime =
      longLower.includes("halftime") ||
      statusData?.long?.toLowerCase?.() === "halftime" ||
      statusData?.short?.toLowerCase?.() === "halftime";

    let isFinal =
      ["final"].some((s) => longLower.includes(s)) || short.includes("ft");

    // ✅ Treat "AOT" as final
    if (longLower.includes("aot") || short.includes("aot")) {
      isFinal = true;
    }

    const isScheduled = ["scheduled"].some((s) => longLower.includes(s));

    // ✅ Live only if not final
    const isLive =
      !isFinal &&
      !isHalftime &&
      (livePhrases.some((p) => longLower.includes(p) || short.includes(p)) ||
        (statusData?.timer && statusData.timer !== "")) &&
      !longLower.includes("end of");

    return {
      isScheduled,
      isFinal,
      wentOT:
        longLower.includes("ot") ||
        longLower.includes("overtime") ||
        short.includes("ot"),
      isCanceled: longLower.includes("canceled"),
      isDelayed: longLower.includes("delayed"),
      isPostponed: longLower.includes("postponed"),
      isHalftime,
      isLive,
      short: statusData?.short,
      long,
      timer: statusData?.timer,
    };
  }, [statusData]);

  const currentPeriod = liveScore?.period;

  // --- Helpers ---
  const formatQuarter = (period?: number | string, statusText?: string) => {
    if (!period && !statusText) return "";

    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) return val.toUpperCase();
      if (val.includes("halftime")) return "Halftime";
      return val;
    }

    const p = Number(period);

    // ✅ WOMEN: 4 quarters
    if (isWomen) {
      if (p === 1) return "1st";
      if (p === 2) return "2nd";
      if (p === 3) return "3rd";
      if (p === 4) return "4th";

      const ot = p - 4;
      return ot === 1 ? "OT" : `${ot}OT`;
    }

    // ✅ MEN: 2 halves
    if (p === 1) return "1st";
    if (p === 2) return "2nd";

    const ot = p - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  };

  // Final with OT label
  function getFinalWithQuarterLabel(period?: number, statusText?: string) {
    if (!period && !statusText) return "Final";

    // Prefer API OT text if present
    if (statusText?.toLowerCase().includes("ot")) {
      return `Final/${statusText.match(/OT\d*/i)?.[0]?.toUpperCase() ?? "OT"}`;
    }

    const regulationPeriods = isWomen ? 4 : 2;

    // ✅ Regulation final → just "Final"
    if (!period || period <= regulationPeriods) {
      return "Final";
    }

    // ✅ Overtime
    const ot = period - regulationPeriods;
    return ot === 1 ? "Final/OT" : `Final/${ot}OT`;
  }

  const baseStatus =
    typeof game.status === "string" ? game.status : mapStatus(game.status);

  const liveStatusText = liveScore?.statusText?.toLowerCase().trim() ?? "";
  const clock = liveScore?.displayClock ?? "";
  const hasRunningClock = clock !== "" && clock !== "0:00";
  const period = Number(liveScore?.period);

  const isLiveHalftime =
    liveStatusText === "halftime" ||
    liveStatusText === "end of 1st" ||
    (clock === "0:00" && period === 1);

  const isLiveGame =
    !isLiveHalftime &&
    !liveStatusText.includes("final") &&
    (hasRunningClock || period >= 2);

  const effectiveStatus = liveStatusText.includes("final")
    ? "Final"
    : isLiveHalftime
    ? "Halftime"
    : isLiveGame
    ? "In Play"
    : baseStatus;

  // Now derive booleans reactively
  const isFinal = effectiveStatus === "Final";
  const inProgress = effectiveStatus === "In Play";
  const isCanceled = effectiveStatus === "Canceled";
  const isDelayed = effectiveStatus === "Delayed";
  const isPostponed = effectiveStatus === "Postponed";
  const isHalftime = effectiveStatus === "Halftime";

  const recordLeague = isWomen ? "wcbb" : "cbb";

  const { record: homeRecord } = useTeamRecord(
    Number(homeEspnId),
    recordLeague
  );

  const { record: awayRecord } = useTeamRecord(
    Number(awayEspnId),
    recordLeague
  );

  const homeScore = liveScore?.home.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores?.away?.total ?? 0;

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      name: getTeamCode(awayId),
      logo: getTeamLogoResolved(awayId),
      record: awayRecord?.overall ?? "0-0",
    }),
    [awayId, awayEspnId, awayRecord?.overall, dark, status.isLive]
  );

  const homeTeam = useMemo(
    () => ({
      id: homeId,
      espnID: homeEspnId,
      name: getTeamCode(homeId),
      logo: getTeamLogoResolved(homeId),
      record: homeRecord?.overall ?? "0-0",
    }),
    [homeId, homeEspnId, homeRecord?.overall, dark, status.isLive]
  );

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/game/cbb/[game]",
      params: { game: JSON.stringify(game) },
    });
  }, [router, game]);

  // --- Broadcasts ---
  const { broadcasts } = useGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr,
    leagueKey
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

  const { formattedDate, formattedTime } = useMemo(() => {
    if (!gameDate) return { formattedDate: "", formattedTime: "" };

    return {
      formattedDate: gameDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      formattedTime: gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  }, [gameDate]);

  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: dark ? Colors.white : Colors.black,
    opacity: inProgress || isHalftime ? 1 : isFinal ? (teamWins ? 1 : 0.5) : 1,
  });

  const ScoreText = useCallback(
    ({
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
    },
    [styles, winnerStyle]
  );

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={awayTeam.logo}
              style={[styles.logo]}
              accessibilityLabel={`${awayTeam.name} logo`}
            />
            <Text style={styles.teamName}>
              {(() => {
                if (!awayEspnId) return null;

                const ranking = getTeamRankingById(String(awayEspnId));

                if (!ranking || !rankedTeamIds.has(String(awayEspnId))) {
                  return null;
                }

                return <Text style={styles.rank}>{ranking.current} </Text>;
              })()}

              {getTeamCode(awayId)}
            </Text>
          </View>
          <ScoreText
            score={awayScore}
            recordData={awayTeam.record ?? undefined}
            teamWins={awayWins}
            showRecord={
              effectiveStatus === "Scheduled" || isCanceled || isPostponed
            }
          />
        </View>

        <View style={styles.teamSection}>
          {/* Home Team */}
          <View style={styles.teamWrapper}>
            <Image
              source={homeTeam.logo}
              style={[styles.logo]}
              accessibilityLabel={`${homeTeam.name} logo`}
            />
            <Text style={styles.teamName}>
              {(() => {
                if (!homeEspnId) return null;

                const ranking = getTeamRankingById(String(homeEspnId));

                if (!ranking || !rankedTeamIds.has(String(homeEspnId))) {
                  return null;
                }

                return <Text style={styles.rank}>{ranking.current} </Text>;
              })()}

              {getTeamCode(homeId)}
            </Text>
          </View>
          <ScoreText
            score={homeScore}
            recordData={homeTeam.record ?? undefined}
            teamWins={homeWins}
            showRecord={
              effectiveStatus === "Scheduled" || isCanceled || isPostponed
            }
          />
        </View>
      </View>

      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headlineText}</Text>

      {/* Center Info */}
      <View style={styles.info}>
        {/* Status / Score */}
        {isCanceled ? (
          <Text style={styles.finalText}>Canceled</Text>
        ) : isDelayed ? (
          <Text style={styles.finalText}>Delayed</Text>
        ) : isPostponed ? (
          <Text style={styles.finalText}>Postponed</Text>
        ) : isHalftime ? (
          <Text style={styles.finalText}>Halftime</Text>
        ) : isFinal ? (
          <>
            <Text style={styles.finalText}>
              {getFinalWithQuarterLabel(currentPeriod)}
            </Text>
          </>
        ) : inProgress ? (
          <>
            {liveScore?.statusText?.toLowerCase().includes("end of") ||
            liveScore?.statusText?.toLowerCase().includes("final") ? (
              <Text style={styles.finalText}>{liveScore.statusText}</Text>
            ) : (
              <>
                <Text style={styles.period}>
                  {formatQuarter(currentPeriod)}
                </Text>
                {liveScore?.displayClock && (
                  <>
                    <Text style={styles.clock}>{liveScore.displayClock}</Text>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.date}>{formattedDate}</Text>

            <Text style={styles.date}>{formattedTime ?? "TBD"}</Text>
          </>
        )}

        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* Notification Bell */}
      <Pressable
        onPress={() => {
          if (!canNavigate) return;

          router.push({
            pathname: "/game/cbb/[game]",
            params: { game: JSON.stringify(game) },
          });
        }}
        style={({ pressed }) => [
          styles.notificationBell,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : (["#dbb145ff", "#CDA765"] as [string, string])
          }
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
export default memo(CBBGameSquareCard);
