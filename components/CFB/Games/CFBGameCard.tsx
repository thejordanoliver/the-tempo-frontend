import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { getTeamLogo, teams } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { useGameInfo } from "hooks/CFBHooks/useGameInfo";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossession";
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
import { emptyAwayTeam, emptyHomeTeam, Game } from "types/cfb";
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { emptyTeam } from "types/cfb";
type Props = {
  game: Game; // TODO: replace with proper CFB Game type
  isDark?: boolean;
};

function CFBGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);
  
  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;
  
  // --- Date ---
  const gameDate = game?.game?.date?.timestamp
  ? new Date(game.game.date.timestamp * 1000)
  : null;
  const gameDateStr = gameDate?.toISOString();
  
  
  // Championship Game Detection (Jan 19, 2026)
   const isChampionship = Boolean(
  gameDate &&
    gameDate.getFullYear() === 2026 &&
    gameDate.getMonth() === 0 &&
    gameDate.getDate() === 19
);

  const styles = getStyles(dark, isChampionship);

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
    getTeamById(id)?.name ?? emptyTeam.name;

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
    ? useFootballGamePossession(
        "cfb",
        Number(homeEspnId),
        Number(awayEspnId),
        gameDateStr
      )
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
  const awayTeam = useMemo(() => {
    const base = {
      ...emptyAwayTeam,
      id: awayId ?? emptyAwayTeam.id,
      espnID: awayEspnId ?? emptyAwayTeam.espnID,
      name: getTeamName(awayId) ?? emptyAwayTeam.name,
      shortName: getTeamShortName(awayId) ?? emptyAwayTeam.shortName,
      logo: getTeamLogo(awayId, dark) || emptyAwayTeam.logo,
      record: awayRecord?.overall ?? "0-0",
      hasPossession:
        status.isLive && String(possessionTeamId) === String(awayEspnId),
    };

    return base;
  }, [
    awayId,
    awayEspnId,
    awayRecord?.overall,
    possessionTeamId,
    dark,
    status.isLive,
  ]);

  const homeTeam = useMemo(() => {
    const base = {
      ...emptyHomeTeam,
      id: homeId ?? emptyHomeTeam.id,
      espnID: homeEspnId ?? emptyHomeTeam.espnID,
      name: getTeamName(homeId) ?? emptyHomeTeam.name,
      shortName: getTeamShortName(homeId) ?? emptyHomeTeam.shortName,
      logo: getTeamLogo(homeId, dark) ?? emptyHomeTeam.logo,
      record: homeRecord?.overall ?? "0-0",
      hasPossession:
        status.isLive && String(possessionTeamId) === String(homeEspnId),
    };

    return base;
  }, [
    homeId,
    homeEspnId,
    homeRecord?.overall,
    possessionTeamId,
    dark,
    status.isLive,
  ]);

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

  const renderCardContent = () => (
    <>
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
        <Text style={[styles.teamName, { width: 100, flexDirection: "row" }]}>
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
            <Text style={styles.finalText}>{displayStatus}</Text>
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
        <Text style={[styles.teamName, { width: 100, flexDirection: "row" }]}>
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
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
    </>
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
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
           ? ["#846f4a", "#50412a"]
              : (["#DFBD69", "#CDA765"] as [string, string])
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
export default memo(CFBGameCard);
