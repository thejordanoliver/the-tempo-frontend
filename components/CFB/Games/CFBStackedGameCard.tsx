import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { getTeamLogo, teams } from "constants/teamsCFB";
import { useRouter } from "expo-router";
import { useCFBGameDetails } from "hooks/CFBHooks/useCFBGameDetails";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { memo, useMemo } from "react";
import {
  Image,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { stackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/cfb";
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";

type Props = {
  game: any;
  isDark?: boolean;
  broadcasts?: string[];
  loadingBroadcasts?: boolean;
};

function CFBStackedGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";

  const router = useRouter();

  const homeId = String(game?.teams?.home?.id);
  const awayId = String(game?.teams?.away?.id);
  const gameId = game?.game?.id;

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

  const gameDate = useMemo(() => {
    return game?.game?.date?.timestamp
      ? new Date(game.game.date.timestamp * 1000)
      : null;
  }, [game?.game?.date?.timestamp]);
  const gameDateStr = gameDate?.toISOString();

  const isChampionship = Boolean(
    gameDate &&
      gameDate.getFullYear() === 2026 &&
      gameDate.getMonth() === 0 &&
      gameDate.getDate() === 19
  );

  const styles = stackedGameCardStyles(dark, isChampionship);

  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));
  const getTeamName = (id?: number | string): string =>
    getTeamById(id)?.name ?? "Unknown";

  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

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
  const displayStatus =
    gameStatusDescription ??
    status.long ??
    status.short ??
    game.game.status.long ??
    game.game.status.short ??
    "Scheduled";

  const isLive = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isHalftime = gameStatusShortDetail === "Halftime";

  // --- Use possession score when live; fallback to static game scores ---
  const displayAwayScore = score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore = score?.home ?? game?.scores?.home?.total ?? 0;

  // --- Helper for score or record ---
  const getDisplayValue = (isHome: boolean) => {
    if (status.isScheduled) return isHome ? homeTeam.record : awayTeam.record;
    if (status.isFinal)
      return isHome
        ? score?.home ?? game?.scores?.home?.total ?? 0
        : score?.away ?? game?.scores?.away?.total ?? 0;
    return isHome ? displayHomeScore : displayAwayScore;
  };

  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      name: getTeamName(awayId),
      logo: getTeamLogo(awayId, dark),
      record: awayRecord?.overall ?? "0-0",
      hasPossession:
        status.isLive && String(possessionTeamId) === String(awayEspnId),
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
        status.isLive && String(possessionTeamId) === String(homeEspnId),
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

  const formatQuarter = (
    short?: string | null,
    long?: string | null
  ): string => {
    const val = short && short.trim() !== "" ? short : long ?? "";
    if (!val) return "";
    const q = val.toLowerCase();

    if (q.includes("1")) return "1st";
    if (q.includes("2")) return "2nd";
    if (q.includes("3")) return "3rd";
    if (q.includes("4")) return "4th";
    if (q.includes("ot") || q.includes("overtime")) return "OT";
    if (q.includes("half")) return "Halftime";
    if (q.includes("end")) return "End";

    const asNumber = Number(val);
    if (!isNaN(asNumber)) {
      if (asNumber === 5) return "OT";
      if (asNumber > 5) return `${asNumber - 4}OT`;
    }

    return val;
  };

  const getTeamStyle = useMemo(
    () =>
      (isHome: boolean): TextStyle => {
        const homeScore = game.scores.home?.total ?? 0;
        const awayScore = game.scores.away?.total ?? 0;
        let isWinner = true;

        if (status.isFinal) {
          if (homeScore !== awayScore)
            isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
        }

        return {
          color: dark ? "#fff" : "#1d1d1d",
          opacity: isWinner ? 1 : 0.5,
        };
      },
    [dark, status, game.scores]
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
      <View style={styles.card}>
        <View style={styles.cardWrapper}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image source={awayTeam.logo} style={styles.logo} />
              <Text style={styles.teamName}>
                {(() => {
                  const rank = awayEspnId
                    ? getTeamRank(String(awayEspnId))
                    : "";
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
                  style={{ width: 28, height: 28, resizeMode: "contain" }}
                />
              )}
            </View>
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
                  const rank = homeEspnId
                    ? getTeamRank(String(homeEspnId))
                    : "";
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
                  style={{ width: 28, height: 28, resizeMode: "contain" }}
                />
              )}
            </View>
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
            <View style={styles.infoWrapper}>
              <Text style={styles.date}>{formattedDate}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.date}>{formattedTime}</Text>
            </View>
          ) : isLive ? (
            <>
              {displayClock === "0:00" &&
              gameStatusShortDetail?.toLowerCase().includes("end of") ? (
                <Text style={styles.clock}>{gameStatusShortDetail}</Text>
              ) : (
                <View style={styles.infoWrapper}>
                  <Text style={styles.period}>{formatQuarter(period)}</Text>
                  <View style={styles.statusDivider} />
                  <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
                </View>
              )}
              {shortDownDistanceText && (
                <Text style={styles.downDistance}>{downDistanceText}</Text>
              )}
            </>
          ) : isHalftime ? (
            <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
          ) : status.isFinal ? (
            // ✅ FINAL: show "Final" + date
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText}>{gameStatusShortDetail}</Text>
              <View style={styles.finalStatusDivider} />
              <Text style={styles.finalText}>{formattedDate}</Text>
            </View>
          ) : null}

          {!status.isFinal && broadcast && (
            <Text style={styles.broadcast}>{broadcast}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(CFBStackedGameCard);
