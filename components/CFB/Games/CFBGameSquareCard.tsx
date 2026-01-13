import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import {
  getRivalryHeadline,
  getTeamCode,
  getTeamLogo,
  teams,
} from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCFBGameDetails } from "hooks/CFBHooks/useCFBGameDetails";
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
import { gameSquareCardStyles } from "styles/GamecardStyles/GameSquareCardStyles";
import { emptyAwayTeam, emptyHomeTeam, emptyTeam, Game } from "types/cfb";
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";
import { getShortBroadcastDisplay } from "utils/matchBroadcast";
type Props = {
  game: Game; // TODO: replace with proper CFB Game type
  isDark?: boolean;
};

function CFBGameSquareCard({ game, isDark }: Props) {
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

  const styles = gameSquareCardStyles(dark, isChampionship);

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
  const half = status.isHalftime ? "HT" : "Half";
  const {
    possessionTeamId,
    shortDownDistanceText,
    downDistanceText,
    possessionText,
    displayClock,
    period,
    score,

    gameStatusDescription,
    gameStatusShortDetail,
  } = useCFBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr);

  const { broadcast } = useCFBGameDetails(
    String(awayEspnId || emptyAwayTeam.espnID),
    String(homeEspnId || emptyHomeTeam.espnID),
    gameDateStr
  );
  const { headlineText } = useGameInfo(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
    "cfb"
  );


  // Determine fallback rivalry name
  const rivalryHeadline = useMemo(() => {
    return getRivalryHeadline(Number(homeEspnId), Number(awayEspnId));
  }, [homeEspnId, awayEspnId]);

  // Choose headline → rivalry → empty string
  const headLine =
    headlineText && headlineText.trim().length > 0
      ? headlineText
      : rivalryHeadline ?? "";

  // --- Use possession score when live; fallback to static game scores ---
  const displayAwayScore = score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore = score?.home ?? game?.scores?.home?.total ?? 0;

  // --- Helper for score or record ---
  const getDisplayValue = (isHome: boolean) => {
    if (status.isScheduled) {
      return isHome ? homeTeam.record : awayTeam.record;
    }
    if (status.isFinal) {
      // ✅ Final: use last known static score as fallback if hook score missing
      return isHome
        ? score?.home ?? game?.scores?.home?.total ?? 0
        : score?.away ?? game?.scores?.away?.total ?? 0;
    }
    // ✅ Live: always prefer possession hook’s live score
    return isHome ? displayHomeScore : displayAwayScore;
  };

  // Unified game status from possession hook
  const displayStatus =
    gameStatusDescription ??
    gameStatusShortDetail ??
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
      name: getTeamCode(awayId) ?? emptyAwayTeam.name,
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
      name: getTeamCode(homeId) ?? emptyHomeTeam.name,
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
          color: dark ? Colors.white : Colors.black,
          opacity: isWinner ? 1 : 0.5,
        };
      },
    [dark, status, game?.scores]
  );

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={awayTeam.logo} style={styles.logo} />
            <Text style={[styles.teamName]}>
              {(() => {
                const rank = awayEspnId ? getTeamRank(String(awayEspnId)) : "";
                return (
                  <>
                    {rank ? <Text style={styles.rank}>{rank} </Text> : null}
                    {awayTeam.name}
                  </>
                );
              })()}
            </Text>
            {awayTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={styles.footballPossesion}
              />
            )}
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
        </View>

        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={homeTeam.logo} style={styles.logo} />
            <Text style={styles.teamName}>
              {(() => {
                const rank = homeEspnId ? getTeamRank(String(homeEspnId)) : "";
                return (
                  <>
                    {rank ? <Text style={styles.rank}>{rank} </Text> : null}
                    {homeTeam.name}
                  </>
                );
              })()}
            </Text>
            {homeTeam.hasPossession && (
              <Image
                source={dark ? FootballLight : Football}
                style={styles.footballPossesion}
              />
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
        </View>
      </View>
      {/* Game Info */}
      <View style={styles.info}>
        {status.isScheduled ? (
          <>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.date}>{formattedTime}</Text>
          </>
        ) : status.isLive ? (
          <>
            {displayClock === "0:00" &&
            gameStatusDescription?.toLowerCase().includes("end of") ? (
              //  ✅ Special case: end of quarter
              <Text style={styles.clock}>{gameStatusShortDetail}</Text>
            ) : (
              // ✅ Normal live display
              <>
                <Text style={styles.date}>{formatQuarter(period)}</Text>
                <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
              </>
            )}
            {shortDownDistanceText && (
              <Text style={styles.downDistance}>{shortDownDistanceText}</Text>
            )}
          </>
        ) : status.isHalftime ? (
          <>
            <Text style={styles.finalText}>{half}</Text>
          </>
        ) : (
          <>
            <Text style={styles.finalText}>{displayStatus}</Text>
            <Text style={styles.finalText}>{formattedDate}</Text>
          </>
        )}

      
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
        {!status.isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
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
export default memo(CFBGameSquareCard);
