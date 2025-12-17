import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { getTeamLogo, teams } from "constants/teamsCFB";
import { useRouter } from "expo-router";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
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
import {
  getTeamRankFromAPById,
  getTeamRankFromCFPById,
  useAPTop25,
  useCFPTop25,
} from "utils/CFBUtils/cfbGameUtils";
import { getBroadcastDisplay } from "utils/matchBroadcast";
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
    let long = game.game.status.long ?? "";
    const short = game.game.status.short?.toLowerCase() ?? "";
    const longLower = long.toLowerCase();

    if (longLower === "finished") long = "Final";

    const wentOT =
      longLower.includes("ot") ||
      longLower.includes("over time") ||
      longLower.includes("after over") ||
      longLower.includes("aot") ||
      short.includes("ot");

    const isFinal =
      long === "Final" ||
      longLower.includes("final") ||
      longLower.includes("after over") ||
      longLower.includes("aot") ||
      short.includes("ft");

    const live = ![
      "Not Started",
      "Final",
      "Canceled",
      "Delayed",
      "Postponed",
      "Halftime",
    ].includes(long);

    return {
      isScheduled: long === "Not Started",
      isFinal,
      wentOT,
      isCanceled: long === "Canceled",
      isDelayed: long === "Delayed",
      isPostponed: long === "Postponed",
      isHalftime: long === "Halftime",
      isLive: live && !isFinal,
      short: game.game.status.short,
      long,
      timer: game.game.status.timer,
    };
  }, [game.game.status]);

  // --- Possession hook ---
  const possession = status.isLive
    ? useCFBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr)
    : {
        gameStatusDescription: undefined,
        possessionTeamId: undefined,
        displayClock: undefined,
        shortDownDistanceText: undefined,
        downDistanceText: undefined,
        period: undefined,
        score: undefined,
        refresh: () => {},
      };

  const {
    possessionTeamId,
    displayClock,
    shortDownDistanceText,
    gameStatusDescription,
  } = possession;

  const displayStatus =
    gameStatusDescription ??
    status.long ??
    status.short ??
    game.game.status.long ??
    game.game.status.short ??
    "Scheduled";

  // --- Use possession score when live; fallback to static game scores ---
  const displayAwayScore =
    possession?.score?.away ?? game?.scores?.away?.total ?? 0;
  const displayHomeScore =
    possession?.score?.home ?? game?.scores?.home?.total ?? 0;

  // --- Helper for score or record ---
  const getDisplayValue = (isHome: boolean) => {
    if (status.isScheduled) return isHome ? homeTeam.record : awayTeam.record;
    if (status.isFinal)
      return isHome
        ? possession?.score?.home ?? game?.scores?.home?.total ?? 0
        : possession?.score?.away ?? game?.scores?.away?.total ?? 0;
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

  // --- Broadcasts ---
  const { broadcasts } = useCFBGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

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
                {" "}
                {awayEspnId && getTeamRank(String(awayEspnId)) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(String(awayEspnId))}
                  </Text>
                )}{" "}
                {awayTeam.name}
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
                {" "}
                {homeEspnId && getTeamRank(String(homeEspnId)) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(String(homeEspnId))}
                  </Text>
                )}{" "}
                {homeTeam.name}
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
          {status.isScheduled && (
            <>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text
                style={[
                  styles.time,
                  { color: dark ? "rgba(255,255,255, .5)" : "rgba(0,0,0,.5)" },
                ]}
              >
                {formattedTime}
              </Text>
            </>
          )}

          {status.isLive && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.date, { fontSize: 14 }]}>
                  {formatQuarter(status.short, displayStatus)}
                </Text>
                <View
                  style={{
                    height: 14,
                    width: 1,
                    backgroundColor: "#ccc",
                    marginHorizontal: 4,
                  }}
                />
                <Text style={styles.clock}>{displayClock}</Text>
              </View>
              {shortDownDistanceText && (
                <Text style={styles.downDistance}>{shortDownDistanceText}</Text>
              )}
            </>
          )}

          {status.isHalftime && (
            <Text style={[styles.date, { fontSize: 14 }]}>{displayStatus}</Text>
          )}
          {status.isFinal && (
            <>
              <Text style={styles.finalText}>{displayStatus}</Text>
              <Text style={styles.dateFinal}>{formattedDate}</Text>
            </>
          )}

          {status.isCanceled && <Text style={styles.finalText}>Cancelled</Text>}
          {status.isDelayed && <Text style={styles.finalText}>Delayed</Text>}
          <Text style={styles.broadcast}>{broadcastText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(CFBStackedGameCard);
