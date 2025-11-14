import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getTeamCode, getTeamLogo, teams } from "constants/teamsCBB";
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
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/GameSquareCard.styles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
type Props = {
  game: any;
  isDark?: boolean;
};

function CBBGameSquareCard({ game, isDark }: Props) {
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
    const short = statusData?.short?.toLowerCase() ?? "";
    const longLower = long.toLowerCase();

    const wentOT =
      longLower.includes("ot") ||
      longLower.includes("overtime") ||
      short.includes("ot");

    const isFinal =
      longLower === "final" ||
      longLower === "game finished" ||
      longLower.includes("final") ||
      longLower.includes("game finished") ||
      longLower.includes("after over") ||
      longLower.includes("aot") ||
      short.includes("ft");

    const live = ![
      "not started",
      "final",
      "finished",
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
        shortDownDistanceText: undefined,
        downDistanceText: undefined,
        period: undefined,
        score: undefined, // ✅ ADD THIS
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
      game.status.long ??
      game.status.short ??
      "Scheduled";

    const lower = base.toLowerCase();

    if (lower === "game finished") return "Final";
    if (lower.includes("after over")) return "Final/OT"; // ✅ Added
    if (lower.includes("overtime")) return "OT"; // ✅ Optional, handles ESPN variant
    if (lower.includes("postponed")) return "Postponed";
    if (lower.includes("canceled")) return "Canceled";
    return base;
  })();

  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "cbb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "cbb");

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      code: getTeamCode(awayId),
      name: getTeamName(awayId),
      shortName: getTeamShortName(awayId),
      logo: getTeamLogo(awayId, dark),
      record: awayRecord?.overall ?? "0-0",
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
      code: getTeamCode(homeId),
      name: getTeamName(homeId),
      shortName: getTeamShortName(homeId),
      logo: getTeamLogo(homeId, dark),
      record: homeRecord?.overall ?? "0-0",
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
      {isChampionshipGame ? (
        <LinearGradient
          colors={["#DFBD69", "#CDA765"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View
            style={[
              styles.cardWrapper,
              { borderRightColor: Colors.darkGray },
            ]}
          >
            {/* Away Team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image source={awayTeam.logo} style={styles.logo} />
                <Text style={[styles.teamName, { color: Colors.light.text }]}>
                  {getTeamRank(awayTeam.name) && (
                    <Text
                      style={{ fontSize: 10, color: Colors.darkGray }}
                    >
                      {getTeamRank(awayTeam.name)}
                    </Text>
                  )}{" "}
                  {awayTeam.code}
                </Text>
              </View>
              <Text
                style={[
                  status.isScheduled || status.isCanceled || status.isPostponed
                    ? styles.teamRecord
                    : styles.teamScore,
                  getTeamStyle(false),
                  { color: Colors.light.black },
                ]}
              >
                {getDisplayValue(false)}
              </Text>
            </View>

            {/* Home Team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image source={homeTeam.logo} style={styles.logo} />
                <Text style={[styles.teamName, { color: Colors.light.text }]}>
                  {getTeamRank(homeTeam.name) && (
                    <Text
                      style={{ fontSize: 10, color: Colors.darkGray }}
                    >
                      {getTeamRank(homeTeam.name)}
                    </Text>
                  )}{" "}
                  {homeTeam.code}
                </Text>
              </View>
              <Text
                style={[
                  status.isScheduled || status.isCanceled || status.isPostponed
                    ? styles.teamRecord
                    : styles.teamScore,
                  getTeamStyle(true),
                  { color: Colors.light.black },
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
                <Text style={[styles.time, { color: Colors.darkGray }]}>
                  {formattedTime}
                </Text>
              </>
            )}
            {status.isLive && (
              <>
                <Text style={[styles.date, { fontSize: 14 }]}>
                  {formatQuarter(status.short, displayStatus)}
                </Text>
                <Text style={[styles.clock, { color: Colors.light.red }]}>
                  {displayClock}
                </Text>
              </>
            )}
            {status.isHalftime && (
              <Text style={[styles.date, { fontSize: 14 }]}>
                {displayStatus}
              </Text>
            )}
            {status.isFinal && (
              <>
                <Text style={[styles.finalText, { color: Colors.light.red }]}>
                  {displayStatus}
                </Text>
                <Text style={[styles.dateFinal, { color: Colors.light.black }]}>
                  {formattedDate}
                </Text>
              </>
            )}
            {status.isCanceled && (
              <Text style={styles.finalText}>Cancelled</Text>
            )}
            {status.isDelayed && <Text style={styles.finalText}>Delayed</Text>}

            {broadcastText && !status.isFinal && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardWrapper}>
            {/* Away Team */}
            <View style={styles.teamSection}>
              <View style={styles.teamWrapper}>
                <Image source={awayTeam.logo} style={styles.logo} />
                <Text style={styles.teamName}>
                  {getTeamRank(awayTeam.name) && (
                    <Text style={{ fontSize: 10, color: "#aaa" }}>
                      {getTeamRank(awayTeam.name)}
                    </Text>
                  )}{" "}
                  {awayTeam.code}
                </Text>
              </View>
              <Text
                style={[
                  status.isScheduled || status.isCanceled || status.isPostponed
                    ? styles.teamRecord
                    : styles.teamScore,
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
                  {getTeamRank(homeTeam.name) && (
                    <Text style={{ fontSize: 10, color: "#aaa" }}>
                      {getTeamRank(homeTeam.name)}
                    </Text>
                  )}{" "}
                  {homeTeam.code}
                </Text>
              </View>
              <Text
                style={[
                  status.isScheduled || status.isCanceled || status.isPostponed
                    ? styles.teamRecord
                    : styles.teamScore,
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
                    {
                      fontFamily: Fonts.OSREGULAR,
                      color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.5)",
                    },
                  ]}
                >
                  {formattedTime}
                </Text>
              </>
            )}
            {status.isLive && (
              <>
                <Text style={[styles.date, { fontSize: 14 }]}>
                  {formatQuarter(status.short, displayStatus)}
                </Text>
                <Text style={styles.clock}>{displayClock}</Text>
              </>
            )}
            {status.isHalftime && (
              <Text style={[styles.date, { fontSize: 14 }]}>
                {displayStatus}
              </Text>
            )}
            {status.isFinal && (
              <>
                <Text style={styles.finalText}>{displayStatus}</Text>
                <Text style={styles.dateFinal}>{formattedDate}</Text>
              </>
            )}
            {status.isCanceled && (
              <Text style={styles.finalText}>Cancelled</Text>
            )}
            {status.isDelayed && <Text style={styles.finalText}>Delayed</Text>}

            {broadcastText && (
              <Text style={styles.broadcast}>{broadcastText}</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default memo(CBBGameSquareCard);
