import { Colors } from "constants/Styles";
import { getMLBTeam } from "constants/teamsMLB";
import { useRouter } from "expo-router";
import { useBaseballGameDetails } from "hooks/MLBHooks/useBaseballGameDetails";
import { memo } from "react";

import {
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SquareGameCardStyles } from "styles/GamecardStyles/SquareGameCardStyles";
import { MLBGame } from "types/mlb";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";
import BasesIndicator from "../GameDetails/BasesIndicator";

type Props = {
  game: MLBGame; // Your API Game shape
  isDark?: boolean;
};

function MLBSquareGameCard({ game }: Props) {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  /* ===============================
       DATE / TIME
    =============================== */
  const timestamp = game?.timestamp;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(timestamp);

  /* ===============================
     BASIC GAME FIELDS FROM API
  =============================== */
  const home = game?.teams?.home;
  const away = game?.teams?.away;

  // Find matching internal teams using ESPN ID
  const homeTeam = getMLBTeam(home?.id);
  const awayTeam = getMLBTeam(away?.id);

  const homeName = homeTeam?.code;
  const awayName = awayTeam?.code;

  const homeLogo = isDark ? homeTeam?.logoLight : homeTeam?.logo;
  const awayLogo = isDark ? awayTeam?.logoLight : awayTeam?.logo;

  const homeEspnId = homeTeam?.espnID;
  const awayEspnId = awayTeam?.espnID;

  const { score: liveScore, details } = useBaseballGameDetails(
    "mlb",
    String(awayEspnId),
    String(homeEspnId),
    gameDateStr,
  );
  const isChampionship = details?.playoffRound === "World Series";
  const styles = SquareGameCardStyles(isDark, isChampionship);

  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const headline = details?.headline;
  const seriesSummary = details?.seriesSummary;
  const seasonState = details?.seasonState;
  const gameStatusDescription = liveScore?.gameStatusDescription ?? "";
  const gameStatusDetail = liveScore?.statusText ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfInning = gameStatusDescription === "End of Inning";
  const period = liveScore?.period;
  const isTopInning = gameStatusDetail.includes("Top");
  const outs = liveScore?.outs;
  const bases: { first: boolean; second: boolean; third: boolean } =
    liveScore?.bases ?? {
      first: false,
      second: false,
      third: false,
    };
  const homeScore = liveScore?.home.total ?? game?.scores?.home?.total ?? 0;
  const awayScore = liveScore?.away.total ?? game?.scores?.away?.total ?? 0;
  const homeRecord = details?.records.home.overall ?? "0-0";
  const awayRecord = details?.records.away.overall ?? "0-0";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = (awayScore ?? 0) > (homeScore ?? 0);
  const isTie = (awayScore ?? 0) === (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: isFinal ? (isTie ? 1 : teamWins ? 1 : 0.5) : 1,
  });

  const ScoreText = ({
    score,
    record,
    teamWins,
  }: {
    score: number | undefined;
    record: string | undefined;
    teamWins: boolean;
  }) => {
    const showRecord = isScheduled || isCanceled || isPostponed || isDelayed;

    return (
      <Text
        style={
          showRecord
            ? styles.teamRecord
            : [styles.teamScore, winnerStyle(teamWins)]
        }
      >
        {showRecord ? record : score}
      </Text>
    );
  };

  const renderStatus = () => {
    if (inProgress)
      return (
        <View>
          <Text style={styles.period}>{gameStatusDetail}</Text>
          <BasesIndicator bases={bases} isDark={isDark} size={8} />
          <Text style={styles.outs}>Outs: {outs}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfInning)
      return <Text style={styles.clock}>End of {formatQuarter(period)}</Text>;

    if (isFinal)
      return (
        <View>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.date}>{formattedTime}</Text>
      </View>
    );
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/game/mlb/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.cardWrapper}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image
                source={awayLogo}
                style={styles.logo}
                accessibilityLabel={`${awayName} logo`}
              />
              <Text style={styles.teamName}>{awayName}</Text>
            </View>

            {/* Away Score / Record */}
            <ScoreText
              score={awayScore}
              record={awayRecord}
              teamWins={awayWins}
            />
          </View>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <View style={styles.teamWrapper}>
              <Image
                source={homeLogo}
                style={styles.logo}
                accessibilityLabel={`${homeName} logo`}
              />
              <Text style={styles.teamName}>{homeName}</Text>
            </View>

            {/* Home Score / Record */}
            <ScoreText
              score={homeScore}
              record={homeRecord}
              teamWins={homeWins}
            />
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.info}>{renderStatus()}</View>
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default memo(MLBSquareGameCard);
