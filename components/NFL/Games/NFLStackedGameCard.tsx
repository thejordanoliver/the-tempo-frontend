import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import {
  getNFLTeamsLogo,
  getTeamAbbreviation,
  getTeamName,
} from "constants/teamsNFL";
import { useRouter } from "expo-router";
import { useNFLGameBroadcasts } from "hooks/NFLHooks/useNFLGameBroadcasts";
import { useNFLGamePossession } from "hooks/NFLHooks/useNFLGamePossession";
import { useNFLTeamRecord } from "hooks/NFLHooks/useNFLTeamRecord";
import React, { memo, useMemo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStyles } from "styles/GamecardStyles/StackedGameCard.styles";
import { getBroadcastDisplay } from "utils/matchBroadcast";

type Props = {
  game: any;
  isDark?: boolean;
};

function NFLStackedGameCard({ game, isDark }: Props) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === "dark";
  const styles = getStyles(dark);
  const router = useRouter();

  const homeId = String(game?.teams?.home?.id);
  const awayId = String(game?.teams?.away?.id);

  // --- Game date ---
  const gameDate = useMemo(
    () =>
      game?.game?.date?.timestamp
        ? new Date(game.game.date.timestamp * 1000)
        : null,
    [game?.game?.date?.timestamp]
  );
  const gameDateStr = gameDate?.toISOString();

  // --- Records ---
  const { record: awayRecord } = useNFLTeamRecord(awayId);
  const { record: homeRecord } = useNFLTeamRecord(homeId);

  // --- Status ---
  const status = useMemo(() => {
    const s = game?.game?.status ?? {};
    const long = s.long ?? "";
    const short = s.short ?? "";
    const lower = long.toLowerCase();

    const wentOT =
      lower.includes("ot") ||
      lower.includes("overtime") ||
      lower.includes("after over") ||
      lower.includes("aot") ||
      short.toLowerCase().includes("ot");

    const isFinal =
      long === "Finished" ||
      lower.includes("final") ||
      lower.includes("after over") ||
      lower.includes("aot") ||
      short.toLowerCase().includes("ft");

    const isLive =
      !["Not Started", "Finished", "Canceled", "Delayed", "Postponed"].includes(
        long
      ) && !isFinal;

    const isEndOfPeriod =
      lower.includes("end") &&
      !lower.includes("final") &&
      !lower.includes("half");

    return {
      isScheduled: long === "Not Started",
      isFinal,
      wentOT,
      isCanceled: long === "Canceled",
      isDelayed: long === "Delayed",
      isPostponed: long === "Postponed",
      isHalftime: long === "Halftime",
      isEndOfPeriod,
      isLive,
      short,
      long,
      timer: s.timer,
    };
  }, [game?.game?.status]);

  // --- Possession ---
  const possession =
    status.isLive && homeId && awayId
      ? useNFLGamePossession(
          getTeamName(homeId, "Home"),
          getTeamName(awayId, "Away"),
          gameDateStr
        )
      : {
          possessionTeamId: undefined,
          displayClock: undefined,
          shortDownDistanceText: undefined,
          downDistanceText: undefined,
          period: undefined,
          score: {
            home: { total: game?.scores?.home?.total ?? 0 },
            away: { total: game?.scores?.away?.total ?? 0 },
          },
          refresh: () => {},
        };

  const { possessionTeamId, displayClock, period, score } = possession;
  const safeScore = score ?? { home: { total: 0 }, away: { total: 0 } };

  // --- Teams ---
  const awayTeam = useMemo(
    () => ({
      logo: getNFLTeamsLogo(awayId, dark),
      name: getTeamName(awayId),
      code: getTeamAbbreviation(awayId),
      record: awayRecord?.overall ?? "0-0",
      id: awayId,
      hasPossession: String(possessionTeamId) === String(awayId),
    }),
    [awayId, awayRecord?.overall, dark, possessionTeamId]
  );

  const homeTeam = useMemo(
    () => ({
      logo: getNFLTeamsLogo(homeId, dark),
      name: getTeamName(homeId),
      code: getTeamAbbreviation(homeId),
      record: homeRecord?.overall ?? "0-0",
      id: homeId,
      hasPossession: String(possessionTeamId) === String(homeId),
    }),
    [homeId, homeRecord?.overall, dark, possessionTeamId]
  );

  // --- Broadcast ---
  const { broadcasts } = useNFLGameBroadcasts(
    homeTeam.name,
    awayTeam.name,
    gameDateStr
  );

  const broadcastText = getBroadcastDisplay(broadcasts);

  // --- Quarter formatter ---
  const formatQuarter = (period?: number | string) => {
    if (!period) return "";
    const val =
      typeof period === "string" ? period.toLowerCase() : String(period);
    if (val.includes("end")) return "End";
    if (val.includes("half")) return "Halftime";
    if (val.includes("ot")) return "OT";
    if (val.includes("q1")) return "1st";
    if (val.includes("q2")) return "2nd";
    if (val.includes("q3")) return "3rd";
    if (val.includes("q4")) return "4th";
    const num = Number(val);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 4) return ["1st", "2nd", "3rd", "4th"][num - 1];
      if (num >= 5) return `${num - 4}OT`;
    }
    return val;
  };

  // --- Winner/loser style ---
  const getTeamStyle = useMemo(
    () => (isHome: boolean) => {
      const homeScore = safeScore.home.total;
      const awayScore = safeScore.away.total;
      let isWinner = true;
      if (status.isFinal && homeScore !== awayScore) {
        isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
      }
      return {
        color: dark ? "#fff" : "#1d1d1d",
        opacity: isWinner ? 1 : 0.55,
      };
    },
    [dark, status, safeScore]
  );

  // --- Date formatting ---
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

  // --- UI ---
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/nfl/[game]",
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
              <Text style={styles.teamName}>{awayTeam.name}</Text>
              {awayTeam.hasPossession && (
                <Image
                  source={dark ? FootballLight : Football}
                  style={styles.footballIcon}
                />
              )}
            </View>
            <Text
              style={[
                status.isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(false),
              ]}
            >
              {status.isScheduled ? awayTeam.record : safeScore.away.total ?? 0}
            </Text>
          </View>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image source={homeTeam.logo} style={styles.logo} />
              <Text style={styles.teamName}>{homeTeam.name}</Text>
              {homeTeam.hasPossession && (
                <Image
                  source={dark ? FootballLight : Football}
                  style={styles.footballIcon}
                />
              )}
            </View>
            <Text
              style={[
                status.isScheduled ? styles.teamRecord : styles.teamScore,
                getTeamStyle(true),
              ]}
            >
              {status.isScheduled ? homeTeam.record : safeScore.home.total ?? 0}
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
                  { color: dark ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.6)" },
                ]}
              >
                {formattedTime}
              </Text>
            </>
          )}

          {status.isLive && (
            <>
              <Text style={styles.date}>{formatQuarter(period)}</Text>
              {status.isEndOfPeriod ? (
                <Text style={styles.finalText}>
                  End of {formatQuarter(period)}
                </Text>
              ) : (
                <Text style={styles.clock}>{displayClock}</Text>
              )}
            </>
          )}

          {status.isHalftime && <Text style={styles.date}>Halftime</Text>}

          {status.isFinal && (
            <>
              <Text style={styles.finalText}>
                {status.wentOT ? "F/OT" : "Final"}
              </Text>
              <Text style={styles.dateFinal}>{formattedDate}</Text>
            </>
          )}

          {status.isCanceled && <Text style={styles.finalText}>Canceled</Text>}
          {status.isDelayed && <Text style={styles.finalText}>Delayed</Text>}

          <Text style={styles.broadcast}>{broadcastText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(NFLStackedGameCard);
