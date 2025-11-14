import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { getTeamLogo, teams } from "constants/teamsCBB";
import { useRouter } from "expo-router";
import { useCBBGameBroadcasts } from "hooks/CBBHooks/useCBBGameBroadcasts";
import { useCBBGamePossession } from "hooks/CBBHooks/useCBBGamePossession";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useTeamRecord } from "hooks/useTeamRecords";
import { memo, useMemo } from "react";
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
      ["final", "ended"].some((s) => longLower.includes(s)) ||
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

  // --- Possession hook ---
  const possession = status.isLive
    ? useCBBGamePossession(Number(homeEspnId), Number(awayEspnId), gameDateStr)
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

  const { possessionTeamId, displayClock, gameStatusDescription } = possession;

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
                {getTeamRank(awayTeam.name) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(awayTeam.name)}
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
                {getTeamRank(homeTeam.name) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(homeTeam.name)}
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

export default memo(CBBStackedGameCard);
