import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Fonts } from "constants/fonts";
import {
  getTeamCode,
  getTeamLogo,
  getTeamName,
  teams,
} from "constants/teamsCFB";
import { useRouter } from "expo-router";
import { useCFBGameBroadcasts } from "hooks/CFBHooks/useCFBGameBroadcasts";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBRankings } from "hooks/CFBHooks/useCFBRankings";
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
import { getStyles } from "styles/GamecardStyles/GameSquareCard.styles";
import { getBroadcastDisplay } from "utils/matchBroadcast";

type Props = {
  game: any;
  isDark?: boolean;
};

function CFBGameSquareCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();

  const homeId = String(game?.teams?.home?.id);
  const awayId = String(game?.teams?.away?.id);
  const gameId = game?.game?.id;

  // --- Rankings ---
  const { rankings } = useCFBRankings();
  const apTop25 = useMemo(() => {
    if (!rankings) return [];
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    return (
      apPoll?.ranks.slice(0, 25).map((r) => ({
        name: r.team?.nickname,
        rank: r.current,
      })) ?? []
    );
  }, [rankings]);

  const getTeamRank = (teamName: string) =>
    apTop25.find((t) => t.name === teamName)?.rank;

  // --- Game date ---
  const gameDate = useMemo(
    () =>
      game?.game?.date?.timestamp
        ? new Date(game.game.date.timestamp * 1000)
        : null,
    [game?.game?.date?.timestamp]
  );
  const gameDateStr = gameDate?.toISOString();

  // --- Team records ---
  const getTeamById = (id?: number | string) =>
    teams.find((t) => String(t.id) === String(id));
  const awayEspnId = getTeamById(awayId)?.espnID;
  const homeEspnId = getTeamById(homeId)?.espnID;

  const { record: awayRecord } = useCFBTeamRecord(Number(awayEspnId));
  const { record: homeRecord } = useCFBTeamRecord(Number(homeEspnId));

  // --- Game status ---
  const status = useMemo(() => {
    const { long = "", short = "", timer } = game.game.status;
    const l = long.toLowerCase();
    const s = short.toLowerCase();

    const isFinal =
      long === "Final" ||
      l.includes("final") ||
      s.includes("ft") ||
      l.includes("after over");
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
      wentOT: l.includes("ot") || l.includes("over time") || s.includes("ot"),
      isCanceled: long === "Canceled",
      isDelayed: long === "Delayed",
      isPostponed: long === "Postponed",
      isHalftime: long === "Halftime",
      isLive: live && !isFinal,
      short,
      long: long === "Finished" ? "Final" : long,
      timer,
    };
  }, [game.game.status]);

  // --- Possession ---
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

  const { possessionTeamId, displayClock, gameStatusDescription } = possession;
  const displayStatus =
    gameStatusDescription ?? status.long ?? status.short ?? "Scheduled";

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

  // --- Teams ---
  const awayTeam = useMemo(
    () => ({
      id: awayId,
      espnID: awayEspnId,
      code: getTeamCode(awayId),
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
      code: getTeamCode(homeId),
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

  // --- Formatting ---
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
    const val = short?.trim() || long || "";
    const q = val.toLowerCase();
    if (!val) return "";
    if (q.includes("1")) return "1st";
    if (q.includes("2")) return "2nd";
    if (q.includes("3")) return "3rd";
    if (q.includes("4")) return "4th";
    if (q.includes("ot") || q.includes("overtime")) return "OT";
    if (q.includes("half")) return "Halftime";
    if (q.includes("end")) return "End";
    const asNumber = Number(val);
    if (!isNaN(asNumber)) return asNumber > 5 ? `${asNumber - 4}OT` : "OT";
    return val;
  };

  const getTeamStyle = (isHome: boolean): TextStyle => {
    const homeScore = game.scores.home?.total ?? 0;
    const awayScore = game.scores.away?.total ?? 0;
    let isWinner = true;
    if (status.isFinal && homeScore !== awayScore)
      isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
    return { color: dark ? "#fff" : "#1d1d1d", opacity: isWinner ? 1 : 0.5 };
  };

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
                {getTeamRank(awayTeam.name) && (
                  <Text style={{ fontSize: 10, color: "#aaa" }}>
                    {getTeamRank(awayTeam.name)}
                  </Text>
                )}{" "}
                {awayTeam.code}
              </Text>
              {awayTeam.hasPossession && (
                <Image
                  source={dark ? FootballLight : Football}
                  style={{
                    width: 28,
                    height: 28,
                    resizeMode: "contain",
                    position: "absolute",
                    right: -18,
                    top: 0,
                  }}
                />
              )}
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
              {homeTeam.hasPossession && (
                <Image
                  source={dark ? FootballLight : Football}
                  style={{
                    width: 28,
                    height: 28,
                    resizeMode: "contain",
                    position: "absolute",
                    right: -18,
                    top: 0,
                  }}
                />
              )}
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

          {broadcastText && (
            <Text style={styles.broadcast}>{broadcastText}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(CFBGameSquareCard);
