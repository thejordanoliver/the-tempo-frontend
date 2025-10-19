import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { getTeamLogo, teams } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBRankings } from "hooks/CFBHooks/useCFBRankings";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useCFBGameInfo } from "hooks/CFBHooks/useGameInfo";
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
import { getBroadcastDisplay } from "utils/matchBroadcast";

type Props = {
  game: any; // TODO: replace with proper CFB Game type
  isDark?: boolean;
};

function CFBGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  // --- Date ---
  const gameDate = game?.game?.date?.timestamp
    ? new Date(game.game.date.timestamp * 1000)
    : null;
  const gameDateStr = gameDate?.toISOString();

  const { rankings } = useCFBRankings();
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

  // 🏈 Use ESPN team IDs, not internal IDs
  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  // --- Game status ---
  const status = useMemo(() => {
    const long = game.game.status.long ?? "";
    const short = game.game.status.short?.toLowerCase() ?? "";
    const longLower = long.toLowerCase();

    const wentOT =
      longLower.includes("ot") ||
      longLower.includes("overtime") ||
      short.includes("ot");

    const isFinal =
      longLower === "final" ||
      longLower === "finished" || // ✅ Added
      longLower.includes("final") ||
      longLower.includes("finished") || // ✅ Added
      longLower.includes("after over") ||
      longLower.includes("aot") ||
      short.includes("ft");

    const live = ![
      "not started",
      "final",
      "finished", // ✅ Added
      "canceled",
      "delayed",
      "postponed",
      "halftime",
    ].includes(longLower);

    return {
      isScheduled: longLower === "not started",
      isFinal,
      wentOT,
      isCanceled: longLower === "canceled",
      isDelayed: longLower === "delayed",
      isPostponed: longLower === "postponed",
      isHalftime: longLower === "halftime",
      isLive: live && !isFinal,
      short: game.game.status.short,
      long,
      timer: game.game.status.timer,
    };
  }, [game.game.status]);

  const possession = status.isLive
    ? useCFBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr)
    : {
        gameStatusDescription: undefined,
        possessionText: undefined,
        gameStatusShortDetail: undefined,
        possessionTeamId: undefined,
        displayClock: undefined,
        shortDownDistanceText: undefined,
        downDistanceText: undefined,
        period: undefined,
        score: undefined, // ✅ ADD THIS
        refresh: () => {},
      };

  const { headlineText } = useCFBGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr
  );

  const {
    possessionTeamId,
    displayClock,
    shortDownDistanceText,
    possessionText,
    gameStatusDescription,
    gameStatusShortDetail,
    period,
  } = possession;

  // --- Use possession score when live; fallback to static game scores ---
  const displayAwayScore =
    possession?.score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore =
    possession?.score?.home ?? game?.scores?.home?.total ?? 0;

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
    return isHome ? displayHomeScore : displayAwayScore;
  };

  const displayStatus = (() => {
    const base =
      gameStatusDescription ??
      status.long ??
      status.short ??
      game.game.status.long ??
      game.game.status.short ??
      "Scheduled";

    const lower = base.toLowerCase();

    if (lower === "finished") return "Final";
    if (lower.includes("after over")) return "Final/OT"; // ✅ Added
    if (lower.includes("overtime")) return "OT"; // ✅ Optional, handles ESPN variant
    if (lower.includes("postponed")) return "Postponed";
    if (lower.includes("canceled")) return "Canceled";
    return base;
  })();

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      name: getTeamName(awayId),
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
  const { broadcasts } = useCFBGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Helpers ---
const formatQuarter = (
  short?: string | number | null,
  long?: string | number | null
): string => {
  const shortStr = typeof short === "string" ? short.trim() : String(short ?? "");
  const longStr = typeof long === "string" ? long.trim() : String(long ?? "");

  const val = shortStr !== "" ? shortStr : longStr;
  if (!val) return "";

  const q = val.toLowerCase();
  if (q.includes("1")) return "1st";
  if (q.includes("2")) return "2nd";
  if (q.includes("3")) return "3rd";
  if (q.includes("4")) return "4th";
  if (q.includes("ot")) return "OT";
  if (q.includes("half")) return "Halftime";
  return val;
};


  const formattedDate = gameDate
    ? gameDate.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
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
    gameDate.getFullYear() === 2026 &&
    gameDate.getMonth() === 0 && // January = 0
    gameDate.getDate() === 19;

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
          pathname: "/game/cfb/[game]",
          params: { game: JSON.stringify(game) },
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
            {awayTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={{
                    width: 20,
                  height: 20,
                  resizeMode: "contain",
                  position: "absolute",
                  right: -70,
                  top: 24,
                }}
              />
            )}
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
              {awayTeam.name}
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
                <Text style={[styles.time, { color: "#555" }]}>
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
                {shortDownDistanceText && (
                  <Text style={[styles.downDistance, { color: "#555" }]}>
                    {possessionText}
                  </Text>
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
                <Text
                  style={[styles.dateFinal, { color: "rgba(0, 0, 0, .5)" }]}
                >
                  {formattedDate}
                </Text>
              </>
            )}

            {broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>

          {status.isScheduled || status.isLive ? (
            <Text style={[styles.headlineText, { color: "#444" }]}>
              {headlineText}
            </Text>
          ) : null}

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
            {homeTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={{
                   width: 20,
                  height: 20,
                  resizeMode: "contain",
                  position: "absolute",
                  left: -70,
                  top: 24,
                }}
              />
            )}
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
              {homeTeam.name}
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
            {awayTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={{
                width: 20,
                  height: 20,
                  resizeMode: "contain",
                  position: "absolute",
                  right: -70,
                  top: 24,
                }}
              />
            )}
            <Image source={awayTeam.logo} style={styles.logo} />
            <Text
              style={[styles.teamName, { width: 100, flexDirection: "row" }]}
            >
              {getTeamRank(awayTeam.name) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(awayTeam.name)}
                </Text>
              )}{" "}
              {awayTeam.name}
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
              <>
                <Text style={styles.date}>{formattedDate}</Text>
                <Text style={styles.time}>{formattedTime}</Text>
              </>
            ) : status.isLive ? (
              <>
                {displayClock === "0:00" &&
                gameStatusDescription?.toLowerCase().includes("end of") ? (
                  //  ✅ Special case: end of quarter
                  <Text style={styles.clock}>{gameStatusShortDetail}</Text>
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
                    <Text style={styles.date}>
                      {formatQuarter(period)}
                    </Text>
                    <View
                      style={{
                        height: 14,
                        width: 1,
                        backgroundColor: dark ? "#fff" : "#333",
                      }}
                    />
                    <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
                  </View>
                )}
                {shortDownDistanceText && (
                  <Text style={styles.downDistance}>{possessionText}</Text>
                )}
              </>
            ) : status.isHalftime ? (
              <>
                <Text style={styles.date}>{displayStatus}</Text>
              </>
            ) : (
              <>
                <Text style={styles.finalText}>{displayStatus}</Text>
                <Text style={styles.dateFinal}>{formattedDate}</Text>
              </>
            )}

            {broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>

          {status.isScheduled ? (
            <Text style={styles.headlineText}>{headlineText}</Text>
          ) : null}

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
            {homeTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={{
                  width: 20,
                  height: 20,
                  resizeMode: "contain",
                  position: "absolute",
                  left: -70,
                  top: 24,
                }}
              />
            )}
            <Image source={homeTeam.logo} style={styles.logo} />
            <Text
              style={[styles.teamName, { width: 100, flexDirection: "row" }]}
            >
              {getTeamRank(homeTeam.name) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(homeTeam.name)}
                </Text>
              )}{" "}
              {homeTeam.name}
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
size={16}
              color={isDark ? "#fff" : "#1d1d1d"}
            />
          </Pressable>
        </View>
      )}
    </TouchableOpacity>
  );
}
export default memo(CFBGameCard);
