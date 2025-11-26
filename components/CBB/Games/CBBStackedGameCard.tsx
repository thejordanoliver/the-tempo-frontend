import { useGameScores } from "hooks/useGameScores";
import { getTeamLogo, teams } from "constants/teamsCBB";
import { useRouter } from "expo-router";
import { useCBBGameBroadcasts } from "hooks/CBBHooks/useCBBGameBroadcasts";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useTeamRecord } from "hooks/useTeamRecords";
import { memo, useMemo } from "react";
import { Colors } from "constants/Colors";
import {
  Image,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/StackedGameCard.styles";
import { getBroadcastDisplay } from "utils/matchBroadcast";
type Props = {
  game: any;
  isDark?: boolean;
  broadcasts?: string[];
  loadingBroadcasts?: boolean;
};


// --- Helper function to normalize API status ---
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

function CBBStackedGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();

  const homeId = String(game?.teams?.home?.id);
  const awayId = String(game?.teams?.away?.id);
  const gameId = game?.game?.id;

  const { rankings } = useCBBRankings();
  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];
    return apPoll.ranks.slice(0, 25).map((r) => ({
      name: r.team?.nickname,
      rank: r.current,
    }));
  }, [rankings]);

  const getTeamRank = (teamName: string) => {
    const found = apTop25.find((t) => t.name === teamName);
    return found ? found.rank : undefined;
  };

  const gameDate = useMemo(() => {
    return game?.game?.date?.timestamp
      ? new Date(game.game.date.timestamp * 1000)
      : null;
  }, [game?.game?.date?.timestamp]);
  const gameDateStr = gameDate?.toISOString();

  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));
  const getTeamName = (id?: number | string): string =>
    getTeamById(id)?.name ?? "Unknown";

  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  const { record: homeRecord } = useTeamRecord(Number(homeEspnId), "cbb");
  const { record: awayRecord } = useTeamRecord(Number(awayEspnId), "cbb");

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
    ];

    const isHalftime =
      longLower.includes("halftime") ||
      statusData?.long?.toLowerCase?.() === "halftime" ||
      statusData?.short?.toLowerCase?.() === "halftime";

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


      const { score: liveScore, isLive } = useGameScores(
        "mens-college-basketball",
        homeEspnId?.toString(),
        awayEspnId?.toString(),
        gameDateStr
      );
    const currentPeriod = liveScore?.period;

  // Dynamically resolve final state from live data
const effectiveStatus = useMemo(() => {
  const liveText = liveScore?.statusText?.toLowerCase() ?? "";
  const base = mapStatus(game.status);

  if (liveText.includes("final")) return "Final";
  if (liveText.includes("halftime")) return "Halftime";
  if (
    liveText.includes("in progress") ||
    liveText.includes("in play") ||
    liveText.includes("qtr") ||
    liveText.includes("quarter")
  )
    return "In Play";

  return base;
}, [game.status, liveScore]);


  // Now derive booleans reactively
  const isFinal = effectiveStatus === "Final";
  const inProgress = effectiveStatus === "In Play";
  const isCanceled = effectiveStatus === "Canceled";
  const isDelayed = effectiveStatus === "Delayed";
  const isPostponed = effectiveStatus === "Postponed";
  const isHalftime = effectiveStatus === "Halftime";


   const homeScore = liveScore?.home.total ?? game.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game.scores?.away?.total ?? 0;


  const homeWins = isFinal && (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = isFinal && (awayScore ?? 0) > (homeScore ?? 0);

    const displayStatus = (() => {
    const base =
      liveScore?.statusText ??
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


  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      name: getTeamName(awayId),
      logo: getTeamLogo(awayId, dark),
      record: awayRecord?.overall ?? "0-0",
   
    }),
    [
      awayId,
      awayEspnId,
      awayRecord?.overall,

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

    }),
    [
      homeId,
      homeEspnId,
      homeRecord?.overall,
      dark,
      status.isLive,
    ]
  );

  // --- Broadcasts ---
  const { broadcasts } = useCBBGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );
  const broadcastText = getBroadcastDisplay(broadcasts);

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
                {getTeamRank(awayTeam.name) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(awayTeam.name)}
                  </Text>
                )}{" "}
                {awayTeam.name}
              </Text>

     
            </View>
          {/* Away Record / Score */}
         <ScoreText
        score={awayScore}
        recordData={awayTeam.record ?? undefined}
        teamWins={awayWins}
        showRecord={effectiveStatus === "Scheduled"}
      />

          </View>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image source={homeTeam.logo} style={styles.logo} />
              <Text style={styles.teamName}>
                {" "}
                {getTeamRank(homeTeam.name) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(homeTeam.name)}
                  </Text>
                )}{" "}
                {homeTeam.name}
              </Text>
       
            </View>
         {/* Home Record / Score */}
         <ScoreText
        score={homeScore}
        recordData={homeTeam.record ?? undefined}
        teamWins={homeWins}
        showRecord={effectiveStatus === "Scheduled"}
      />

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
                <Text style={styles.clock}>{liveScore?.displayClock}</Text>
              </View>
            </>
          )}

          {status.isHalftime && (
            <Text style={[styles.date, { fontSize: 14 }]}>Halftime</Text>
          )}
          {status.isFinal && (
            <>
              <Text style={styles.finalText}>Final</Text>
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

export default memo(CBBStackedGameCard);
