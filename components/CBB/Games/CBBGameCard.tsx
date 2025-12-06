import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/Colors";
import { getTeamLogo, teams } from "constants/teamsCBB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useGameBroadcasts } from "hooks/useBroadcasts";
import { useGameScores } from "hooks/useGameScores";
import { useTeamRecord } from "hooks/useTeamRecords";
import { memo, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/GameCard.styles";
import { CBBGame } from "types/types";
import { getBroadcastDisplay } from "utils/matchBroadcast";



function normalizeGameStatus(gameStatus: any, liveScore: any) {
  const long = (gameStatus?.long ?? "").toLowerCase();
  const short = (gameStatus?.short ?? "").toString().toLowerCase();
  const statusText = (liveScore?.statusText ?? "").toLowerCase();
  const detail = (liveScore?.detail ?? "").toLowerCase();
  const raw = statusText || detail || long;

  // Explicit outcomes
  if (raw.includes("canceled") || raw.includes("cancelled")) return "Canceled";
  if (raw.includes("postponed")) return "Postponed";
  if (raw.includes("delayed")) return "Delayed";

  // Halftime
  if (raw.includes("halftime")) return "Halftime";

  // Final (including Final/OT or AOT)
  if (raw.includes("final") || raw.includes("aot") || short === "ft")
    return "Final";

  // Live indicators
  const livePhrases = [
    "in progress",
    "in play",
    "playing",
    "live",
    "1st",
    "2nd",
    "ot",
    "quarter",
  ];
  if (livePhrases.some((p) => raw.includes(p))) return "In Play";

  // Default
  return "Scheduled";
}


function CBBGameCard({
  game,
  isDark,
  lighter = false,
}: {
  game: CBBGame;
  isDark?: boolean;
  lighter: boolean;
}) {
  const colorScheme = useColorScheme();
const dark = Boolean(isDark ?? (colorScheme === "dark"));
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);
  
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

  const styles = getStyles(dark, isChampionship);


  const gameDateStr = gameDate ? gameDate.toISOString().split("T")[0] : "";

  const { rankings } = useCBBRankings();

  // --- Extract AP Top 25 ---
  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];
    return apPoll.ranks.slice(0, 25).map((r) => ({
      id: r.team?.id, // <-- use team id
      rank: r.current,
    }));
  }, [rankings]);

  const getTeamRank = (teamId: string | number) => {
    const idStr = String(teamId);
    const found = apTop25.find((t) => t.id === idStr);
    return found ? found.rank : undefined;
  };

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  const getTeamName = (id?: number | string): string =>
    getTeamById(id)?.name ?? "Unknown";

  const getTeamShortName = (id?: number | string): string =>
    getTeamById(id)?.shortName ?? "";

  // --- helper: shortName → fallback to full name
  const getTeamPreferredName = (id?: number | string) => {
    const short = getTeamShortName(id);
    return short && short.trim() !== "" ? short : getTeamName(id);
  };

  // 🏈 Use ESPN team IDs, not internal IDs
  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  const { headlineText } = useCBBHeadline(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const { score: liveScore } = useGameScores(
    "mens-college-basketball",
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
    if (!period && !statusText) return "Live";

    // handle strings from API
    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) return val.toUpperCase(); // OT or OT2
      if (val.includes("halftime")) return "Halftime";
      return val;
    }

    const p = Number(period);

    if (p === 1) return "1st";
    if (p === 2) return "2nd";

    // OT handling
    const ot = p - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  };

  // Final with OT label
  function getFinalWithQuarterLabel(period?: number, statusText?: string) {
    if (!period && !statusText) return "Final";

    // Use statusText if it contains OT info
    if (statusText?.toLowerCase().includes("ot")) {
      return `Final/${statusText.match(/OT\d*/i)?.[0]?.toUpperCase() ?? "OT"}`;
    }

    // Otherwise fallback to period number
    if (!period || period <= 2) return "Final";
    const ot = period - 2;
    return ot === 1 ? "Final/OT" : `Final/${ot}OT`;
  }

const effectiveStatus = useMemo(() => {
  return normalizeGameStatus(game.status, liveScore);
}, [game.status, liveScore]);

const isFinal = effectiveStatus === "Final";
const isCanceled = effectiveStatus === "Canceled";
const isDelayed = effectiveStatus === "Delayed";
const isPostponed = effectiveStatus === "Postponed";
const isHalftime = effectiveStatus === "Halftime";
const inProgress = effectiveStatus === "In Play";


  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "cbb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "cbb");
  const homeScore = liveScore?.home.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores?.away?.total ?? 0;

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      name: getTeamName(awayId),
      shortName: getTeamShortName(awayId),
      logo: getTeamLogo(awayId, dark),
      record: awayRecord?.overall ?? "0-0",
    }),
    [awayId, awayEspnId, awayRecord?.overall, dark, status.isLive]
  );

  const homeTeam = useMemo(
    () => ({
      id: homeId,
      espnID: homeEspnId,
      name: getTeamName(homeId),
      shortName: getTeamShortName(homeId),
      logo: getTeamLogo(homeId, dark),
      record: homeRecord?.overall ?? "0-0",
    }),
    [homeId, homeEspnId, homeRecord?.overall, dark, status.isLive]
  );

  // --- Broadcasts ---
  const { broadcasts } = useGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr,
    "mens-college-basketball"
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const formattedTime = gameDate
    ? gameDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";


  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: dark ? Colors.white : Colors.black,
    opacity: inProgress || isHalftime ? 1 : isFinal ? (teamWins ? 1 : 0.5) : 1,
  });

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
          source={awayTeam.logo}
          style={[styles.logo]}
          accessibilityLabel={`${awayTeam.name} logo`}
        />
        <Text style={styles.teamName}>
          {" "}
          {awayEspnId && getTeamRank(String(awayEspnId)) && (
            <Text
              style={{
                fontSize: 10,
                color: isDark ? Colors.lightGray : Colors.darkGray,
              }}
            >
              {getTeamRank(String(awayEspnId))}{" "}
            </Text>
          )}
          {getTeamPreferredName(awayId)}
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
          <Text style={styles.finalText}>Halftime</Text>
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
            {liveScore?.statusText?.toLowerCase().includes("end of") ||
            liveScore?.statusText?.toLowerCase().includes("final") ? (
              <Text style={styles.finalText}>{liveScore.statusText}</Text>
            ) : (
              <>
                <Text style={styles.date}>{formatQuarter(currentPeriod)}</Text>
                {liveScore?.displayClock && (
                  <>
                    <View style={styles.statusDivider} />
                    <Text style={styles.clock}>{liveScore.displayClock}</Text>
                  </>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.infoWrapper}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.statusDivider} />
            <Text style={styles.date}>{formattedTime ?? "TBD"}</Text>
          </View>
        )}

        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>

      {/* Home Team */}
      <ScoreText
        score={homeScore}
        recordData={homeTeam.record ?? undefined}
        teamWins={homeWins}
        showRecord={
            effectiveStatus === "Scheduled" || isCanceled || isPostponed
        }
      />

      <View style={styles.teamSection}>
        <Image
          source={homeTeam.logo}
          style={[styles.logo]}
          accessibilityLabel={`${homeTeam.name} logo`}
        />
        <Text style={styles.teamName}>
          {" "}
          {homeEspnId && getTeamRank(String(homeEspnId)) && (
            <Text
              style={{
                fontSize: 10,
                color: isDark ? Colors.lightGray : Colors.darkGray,
              }}
            >
              {getTeamRank(String(homeEspnId))}{" "}
            </Text>
          )}
          {getTeamPreferredName(homeId)}
        </Text>
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
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
    </>
  );

  return (
   <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/cbb/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
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
export default memo(CBBGameCard);
