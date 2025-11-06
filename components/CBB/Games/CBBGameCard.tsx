import { Ionicons } from "@expo/vector-icons";

import { getTeamLogo, teams } from "constants/teamsCBB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCBBGamePossession } from "hooks/CBBHooks/useCBBGamePossession";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useCBBHeadline } from "hooks/CBBHooks/useGameHeadline";
import { useGameBroadcasts } from "hooks/useBroadcasts";
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

type Props = {
  game: CBBGame; // TODO: replace with proper CBB Game type
  isDark?: boolean;
};

function CBBGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
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

  const gameDateStr = gameDate ? gameDate.toISOString().split("T")[0] : "";

  const { rankings } = useCBBRankings();
  // --- Extract AP Top 25 ---
  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];
    return apPoll.ranks.slice(0, 25).map((r) => ({
      name: r.team?.nickname, // use the same key as your game data
      rank: r.current,
    }));
  }, [rankings]);

  // --- Helper to get rank for a team ---
  const getTeamRank = (teamName: string) => {
    const found = apTop25.find((t) => t.name === teamName);
    return found ? found.rank : undefined;
  };

  // --- Get Team Info from constants ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));

  const getTeamName = (id?: number | string): string =>
    getTeamById(id)?.name ?? "Unknown";

  const getTeamShortName = (id?: number | string): string =>
    getTeamById(id)?.shortName ?? "";

  // 🏈 Use ESPN team IDs, not internal IDs
  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

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
      "quarter 1",
      "quarter 2",
      "quarter 3",
      "quarter 4",
      "q1",
      "q2",
      "q3",
      "q4",
      "overtime",
      "ot",
    ];

    const isHalftime =
      longLower.includes("halftime") ||
      statusData?.long.toLowerCase?.() === "halftime" ||
      statusData?.short.toLowerCase?.() === "halftime";

    let isFinal =
      ["final", "game finished", "ended"].some((s) => longLower.includes(s)) ||
      short.includes("ft");

    // ✅ Treat "AOT" as final
    if (longLower.includes("aot") || short.includes("aot")) {
      isFinal = true;
    }

    const isScheduled = ["not started", "scheduled", "upcoming"].some((s) =>
      longLower.includes(s)
    );

    const isLive =
      !isHalftime &&
      (livePhrases.some((p) => longLower.includes(p) || short.includes(p)) ||
        (statusData?.timer && statusData.timer !== "")) &&
      !longLower.includes("end of") &&
      !longLower.includes("final");

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

  const possession = status.isLive
    ? useCBBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr)
    : {
        gameStatusDescription: undefined,
        possessionText: undefined,
        gameStatusShortDetail: undefined,
        possessionTeamId: undefined,
        displayClock: undefined,
        period: undefined,
        score: {
          home: game?.scores?.home?.total ?? 0,
          away: game?.scores?.away?.total ?? 0,
        },
        refresh: () => {},
      };

  const { headlineText } = useCBBHeadline(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const {
    possessionTeamId,
    displayClock,
    gameStatusDescription,
    gameStatusShortDetail,
    period,
  } = possession;

  // --- Helper for score or record ---
  const getDisplayValue = (isHome: boolean) => {
    if (status.isScheduled) {
      return isHome ? homeTeam.record : awayTeam.record;
    }
    if (status.isFinal) {
      // ✅ Final: use last known static score as fallback if hook score missing
      return isHome
        ? possession?.score?.home ?? game?.scores?.home?.total ?? 0
        : possession?.score?.away ?? game?.scores?.away?.total ?? 0;
    }
    // ✅ Live: always prefer possession hook’s live score
    return isHome ? homeScore : awayScore;
  };

  const displayStatus = (() => {
    const base =
      gameStatusDescription ??
      status.long ??
      status.short ??
      game.status.long ??
      game.status.short ??
      "Scheduled";

    const lower = base.toLowerCase();

    if (status.isFinal && status.wentOT) return "Final/OT"; // ✅ NEW: Final + OT
    if (lower === "game finished") return "Final";
    if (lower.includes("postponed")) return "Postponed";
    if (lower.includes("canceled")) return "Canceled";
    if (lower.includes("overtime")) return "OT";

    return base;
  })();

  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "cbb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "cbb");

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      name: getTeamName(awayId),
      shortName: getTeamShortName(awayId),
      logo: getTeamLogo(awayId, dark),
      record: awayRecord?.overall ?? "0-0",
      hasPossession:
        status.isLive && String(possessionTeamId) === String(awayEspnId), // ONLY if live
    }),
    [
      awayId,
      awayEspnId,
      awayRecord?.overall,
      possessionTeamId,
      dark,
      status.isLive,
    ]
  );

  const homeTeam = useMemo(
    () => ({
      id: homeId,
      espnID: homeEspnId,
      name: getTeamName(homeId),
      shortName: getTeamShortName(homeId),
      logo: getTeamLogo(homeId, dark),
      record: homeRecord?.overall ?? "0-0",
      hasPossession:
        status.isLive && String(possessionTeamId) === String(homeEspnId), // ONLY if live
    }),
    [
      homeId,
      homeEspnId,
      homeRecord?.overall,
      possessionTeamId,
      dark,
      status.isLive,
    ]
  );
  // --- Broadcasts ---
  const { broadcasts } = useGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr,
    "mens-college-basketball"
  );

  const homeScore = possession.score?.home ?? game.scores?.home?.total ?? 0;
  const awayScore = possession.score?.away ?? game.scores?.away?.total ?? 0;

  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Helpers ---
  const formatQuarter = (period?: number | string, statusText?: string) => {
    if (!period) return "";

    // Handle if the period is already a descriptive string
    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) return "OT";
      if (val.includes("1")) return "1st";
      if (val.includes("2")) return "2nd";
      if (val.includes("half")) return "Halftime";
      return period;
    }

    // ✅ For NCAA: only 2 halves + possible OTs
    const p = Number(period);
    if (p === 1) return "1st";
    if (p === 2) return "2nd";
    const otNumber = p - 2;
    return otNumber === 1 ? "OT" : `OT${otNumber}`;
  };

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

  // Championship Game Detection (Jan 19, 2026)
  const isChampionshipGame =
    gameDate &&
    gameDate.getFullYear() === 2025 &&
    gameDate.getMonth() === 3 && // January = 0
    gameDate.getDate() === 7;

  const getTeamStyle = useMemo(
    () =>
      (isHome: boolean): TextStyle => {
        const homeScore = game?.scores?.home?.total ?? 0;
        const awayScore = game?.scores?.away?.total ?? 0;

        let isWinner = true;
        if (status.isFinal && homeScore !== awayScore) {
          isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
        }
        return {
          color: dark ? "#fff" : "#1d1d1d",
          opacity: isWinner ? 1 : 0.5,
        };
      },
    [dark, status, game?.scores]
  );

  // --- UI Render ---
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
router.push({
  pathname: "/game/cbb/[game]",
  params: {
    game: `${homeId}-${awayId}-${gameDateStr}`,
  },
})
      }
    >
      {isChampionshipGame ? (
        <LinearGradient
          colors={["#DFBD69", "#CDA765"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Away Team */}
          <View style={styles.teamSection}>
            <Image source={awayTeam.logo} style={styles.logo} />
            <Text
              style={[
                styles.teamName,
                { width: 100, flexDirection: "row", color: "#1d1d1d" },
              ]}
            >
              {getTeamRank(awayTeam.name) && (
                <Text style={{ fontSize: 10, color: "#444" }}>
                  {getTeamRank(awayTeam.name)}
                </Text>
              )}{" "}
              {awayTeam.shortName || awayTeam.name}
            </Text>
          </View>

          {/* Away Record / Score */}
          <Text
            style={[
              status.isScheduled ? styles.teamRecord : styles.teamScore,
              getTeamStyle(false),
              { color: "#1d1d1d" },
            ]}
          >
            {getDisplayValue(false)}
          </Text>

          {/* Game Info */}
          <View style={styles.info}>
            {status.isScheduled ? (
              <>
                <Text style={[styles.date, { color: "#1d1d1d" }]}>
                  {formattedDate}
                </Text>
                <Text style={[styles.time, { color: "#444" }]}>
                  {formattedTime}
                </Text>
              </>
            ) : status.isLive ? (
              <>
                {displayClock === "0:00" &&
                gameStatusDescription?.toLowerCase().includes("end of") ? (
                  //  ✅ Special case: end of quarter
                  <Text style={[styles.date, { color: "#1d1d1d" }]}>
                    {gameStatusShortDetail}
                  </Text>
                ) : (
                  // ✅ Normal live display
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={[styles.date, { color: "#1d1d1d" }]}>
                      {formatQuarter(status.short, displayStatus)}
                    </Text>
                    <View
                      style={{
                        height: 14,
                        width: 1,
                        backgroundColor: "#444",
                      }}
                    />
                    <Text style={[styles.clock, { color: "#cc0000" }]}>
                      {displayClock ?? "0:00"}
                    </Text>
                  </View>
                )}
              </>
            ) : status.isHalftime ? (
              <>
                <Text style={[styles.date, { color: "#1d1d1d" }]}>
                  {displayStatus}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.finalText, { color: "#cc0000" }]}>
                  {displayStatus}
                </Text>
                <Text style={[styles.finalText, { color: "#444" }]}>
                  {formattedDate}
                </Text>
              </>
            )}

            {!status.isFinal && broadcastText && (
              <Text style={[styles.broadcast, { color: "#444" }]}>
                {broadcastText}
              </Text>
            )}
          </View>

          <Text style={[styles.headlineText, { color: "#444" }]}>
            {headlineText}
          </Text>

          {/* Home Record / Score */}
          <Text
            style={[
              status.isScheduled ? styles.teamRecord : styles.teamScore,
              getTeamStyle(true),
              { color: "#1d1d1d" },
            ]}
          >
            {getDisplayValue(true)}
          </Text>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <Image source={homeTeam.logo} style={[styles.logo]} />
            <Text
              style={[
                styles.teamName,
                { width: 100, flexDirection: "row", color: "#1d1d1d" },
              ]}
            >
              {getTeamRank(homeTeam.name) && (
                <Text style={{ fontSize: 10, color: "#1d1d1d" }}>
                  {getTeamRank(homeTeam.name)}
                </Text>
              )}{" "}
              {homeTeam.shortName || homeTeam.name}
            </Text>
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
              size={20}
              color={"#1d1d1d"}
            />
          </Pressable>
          {/* ... rest of the card unchanged */}
        </LinearGradient>
      ) : (
        <View style={styles.card}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            <Image source={awayTeam.logo} style={styles.logo} />
            <Text
              style={[styles.teamName, { width: 100, flexDirection: "row" }]}
            >
              {getTeamRank(awayTeam.name) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(awayTeam.name)}
                </Text>
              )}{" "}
              {awayTeam.shortName ? awayTeam.shortName : awayTeam.name}
            </Text>
          </View>

          {/* Away Record / Score */}
          <Text
            style={[
              status.isScheduled ? styles.teamRecord : styles.teamScore,
              getTeamStyle(false),
            ]}
          >
            {getDisplayValue(false)}
          </Text>

          {/* Game Info */}
          <View style={styles.info}>
            {status.isScheduled ? (
              <View style={styles.infoWrapper}>
                <Text style={styles.date}>{formattedDate}</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.date}>{formattedTime}</Text>
              </View>
            ) : status.isLive ? (
              <View style={styles.infoWrapper}>
                {displayClock === "0:00" &&
                gameStatusDescription?.toLowerCase().includes("end of") ? (
                  //  ✅ Special case: end of quarter
                  <Text style={styles.date}>{gameStatusShortDetail}</Text>
                ) : (
                  // ✅ Normal live display
                  <View style={styles.infoWrapper}>
                    <Text style={styles.date}>
                      {formatQuarter(period ?? status.short ?? status.long)}
                    </Text>
                    <View style={styles.statusDivider} />
                    <Text style={styles.clock}>{displayClock}</Text>
                  </View>
                )}
              </View>
            ) : status.isHalftime ? (
              <>
                <Text style={styles.date}>{displayStatus}</Text>
              </>
            ) : (
              <View style={styles.infoWrapper}>
                <Text style={styles.finalText}>{displayStatus} </Text>
                <View style={styles.finalStatusDivider} />
                <Text style={styles.finalText}>{formattedDate}</Text>
              </View>
            )}

            {!status.isFinal && broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>
          <Text style={styles.headlineText}>{headlineText}</Text>

          {/* Home Record / Score */}
          <Text
            style={[
              status.isScheduled ? styles.teamRecord : styles.teamScore,
              getTeamStyle(true),
            ]}
          >
            {getDisplayValue(true)}
          </Text>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <Image source={homeTeam.logo} style={styles.logo} />
            <Text
              style={[styles.teamName, { width: 100, flexDirection: "row" }]}
            >
              {getTeamRank(homeTeam.name) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(homeTeam.name)}
                </Text>
              )}{" "}
              {homeTeam.shortName ? homeTeam.shortName : homeTeam.name}
            </Text>
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
              size={20}
              color={isDark ? "#fff" : "#1d1d1d"}
            />
          </Pressable>
        </View>
      )}
    </TouchableOpacity>
  );
}
export default memo(CBBGameCard);
