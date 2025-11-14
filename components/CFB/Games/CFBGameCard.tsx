import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { getTeamLogo, teams } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
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
import { Game } from "types/cfb";
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";

type Props = {
  game: Game; // TODO: replace with proper CFB Game type
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

  // ✅ Load both CFP and AP rankings
  const cfpTop25 = useCFPTop25();
  const apTop25 = useAPTop25();

  // ✅ Get ranking, falling back to AP poll if CFP is missing
  // Check if CFP rankings are active (after they’ve been released)
  const isCFPActive = cfpTop25 && cfpTop25.length > 0;

  // Main helper to get rank with conditional fallback
  const getTeamRank = (id: number | string) => {
    if (isCFPActive) {
      // ✅ Use CFP ranking if rankings are active
      return getTeamRankFromCFPById(id, cfpTop25) ?? "";
    }
    // 🕓 Early season — fallback to AP Top 25
    return getTeamRankFromAPById(id, apTop25) ?? "";
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

  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
    "cfb"
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

  const displayStatusShortDetail =
    gameStatusShortDetail ?? (status.isHalftime ? "Halftime" : undefined);

  const getGameStatusShort = () => {
    if (status.isLive) return gameStatusShortDetail ?? displayClock ?? "Live";
    if (status.isHalftime) return "Halftime";
    if (status.isFinal) return "Final";
    return undefined;
  };

  const displayShortStatus = getGameStatusShort();

  // Unified game status from possession hook
  const displayStatus =
    possession?.gameStatusDescription ??
    possession?.gameStatusShortDetail ??
    (status.isFinal
      ? "Final"
      : status.isLive
      ? "Live"
      : status.long ?? "Scheduled");

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

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
  const { broadcasts } = useCFBGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Helpers ---
  const formatQuarter = (period?: number | string, statusText?: string) => {
    if (!period) return "";

    // If period is a string like "OT" or "1st" from API
    if (typeof period === "string") {
      const val = period.toLowerCase();
      if (val.includes("ot")) return "OT";
      if (val.includes("1")) return "1st";
      if (val.includes("2")) return "2nd";
      if (val.includes("3")) return "3rd";
      if (val.includes("4")) return "4th";
      if (val.includes("half")) return "Halftime";
      return period;
    }

    // If period is a number
    const p = Number(period);
    if (p <= 4) return ["1st", "2nd", "3rd", "4th"][p - 1];
    const otNumber = p - 4;
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
          color: dark ? "#fff" : Colors.black,
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
                {
                  width: 100,
                  flexDirection: "row",
                  color: Colors.black,
                },
              ]}
            >
              {awayEspnId && getTeamRank(String(awayEspnId)) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(String(awayEspnId))}
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
              { color: Colors.black },
            ]}
          >
            {getDisplayValue(false)}
          </Text>

          {/* Game Info */}
          <View style={styles.info}>
            {status.isScheduled ? (
              <View style={styles.infoWrapper}>
                <Text style={[styles.date, { color: Colors.black }]}>
                  {formattedDate}
                </Text>
                <View
                  style={[
                    styles.statusDivider,
                    { backgroundColor: Colors.black },
                  ]}
                />
                <Text style={[styles.date, { color: Colors.black }]}>
                  {formattedTime}
                </Text>
              </View>
            ) : status.isLive ? (
              <>
                {displayClock === "0:00" &&
                gameStatusDescription?.toLowerCase().includes("end of") ? (
                  //  ✅ Special case: end of quarter
                  <Text style={[styles.clock, { color: Colors.light.red }]}>
                    {gameStatusShortDetail}
                  </Text>
                ) : (
                  // ✅ Normal live display
                  <View style={styles.infoWrapper}>
                    <Text style={[styles.date, { color: Colors.black }]}>
                      {formatQuarter(status.short, displayStatus)}
                    </Text>
                    <View style={styles.statusDivider} />
                    <Text style={[styles.clock, { color: Colors.light.red }]}>
                      {displayClock ?? "0:00"}
                    </Text>
                  </View>
                )}
                {shortDownDistanceText && (
                  <Text
                    style={[styles.downDistance, { color: Colors.darkGray }]}
                  >
                    {possessionText}
                  </Text>
                )}
              </>
            ) : status.isHalftime ? (
              <>
                <Text style={styles.clock}>{displayShortStatus}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.finalText, { color: Colors.light.red }]}>
                  {displayStatus}
                </Text>
                <Text style={[styles.date, { color: "rgba(0, 0, 0, .5)" }]}>
                  {formattedDate}
                </Text>
              </>
            )}

            {broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>

          {status.isScheduled || status.isLive ? (
            <Text style={[styles.headlineText, { color: Colors.darkGray }]}>
              {headlineText}
            </Text>
          ) : null}

          {/* Home Record / Score */}
          <Text
            style={[
              status.isScheduled ? styles.teamRecord : styles.teamScore,
              getTeamStyle(true),
              { color: Colors.black },
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
                {
                  width: 100,
                  flexDirection: "row",
                  color: Colors.black,
                },
              ]}
            >
              {homeEspnId && getTeamRank(String(homeEspnId)) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(String(homeEspnId))}
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
              color={Colors.black}
            />
          </Pressable>
        </LinearGradient>
      ) : (
        <View style={styles.card}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            {awayTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={{
                  width: 24,
                  height: 24,
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
              {awayEspnId && getTeamRank(String(awayEspnId)) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(String(awayEspnId))}
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
            ]}
          >
            {getDisplayValue(false)}
          </Text>

          {/* headlineText */}
          <Text style={[styles.headlineText]}>{headlineText}</Text>

          {/* Game Info */}
          <View style={styles.info}>
            {status.isScheduled ? (
              <View style={styles.infoWrapper}>
                <Text style={styles.date}>{formattedDate}</Text>
                <View style={styles.statusDivider} />
                <Text style={styles.date}>{formattedTime}</Text>
              </View>
            ) : status.isLive ? (
              <>
                {displayClock === "0:00" &&
                gameStatusDescription?.toLowerCase().includes("end of") ? (
                  //  ✅ Special case: end of quarter
                  <Text style={styles.clock}>{gameStatusShortDetail}</Text>
                ) : (
                  // ✅ Normal live display
                  <View style={styles.infoWrapper}>
                    <Text style={styles.date}>{formatQuarter(period)}</Text>
                    <View style={styles.statusDivider} />
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
              <View style={styles.infoWrapper}>
                <Text style={styles.finalText}>{displayStatus}</Text>
                <View style={styles.finalStatusDivider} />
                <Text style={styles.finalText}>{formattedDate}</Text>
              </View>
            )}

            {!status.isFinal && broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>

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
                  width: 24,
                  height: 24,
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
              {homeEspnId && getTeamRank(String(homeEspnId)) && (
                <Text style={{ fontSize: 10, color: "#aaa" }}>
                  {getTeamRank(String(homeEspnId))}
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
              color={isDark ? "#fff" : Colors.black}
            />
          </Pressable>
        </View>
      )}
    </TouchableOpacity>
  );
}
export default memo(CFBGameCard);
