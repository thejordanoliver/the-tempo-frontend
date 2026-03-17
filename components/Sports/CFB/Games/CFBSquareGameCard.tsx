import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Styles";
import { getRivalryHeadline, getTeamInfo } from "constants/teamsCFB";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { memo, useMemo } from "react";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SquareGameCardStyles } from "styles/GamecardStyles/SquareGameCardStyles";
import { emptyAwayTeam, emptyHomeTeam, Game } from "types/cfb";
import { formatQuarter } from "utils/games";
type Props = {
  game: Game;
};

function CFBSquareGameCard({ game }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  // --- Team Id's ---
  const homeId = game?.teams?.home?.id;
  const awayId = game?.teams?.away?.id;

  const home = getTeamInfo(awayId);
  const away = getTeamInfo(homeId);

  const awayEspnId = away?.espnID;
  const homeEspnId = home?.espnID;

  // --- Date & Championship detection ---
  const gameDate = game?.game?.date?.timestamp
    ? new Date(game.game.date.timestamp * 1000)
    : null;
  const gameDateStr = gameDate?.toISOString();

  const isChampionship = Boolean(
    gameDate &&
    gameDate.getFullYear() === 2026 &&
    gameDate.getMonth() === 0 &&
    gameDate.getDate() === 19,
  );

  const styles = SquareGameCardStyles(isDark, isChampionship);

  const status = game.game.status;
  const finished =
    status.long === "Finished" || status.long === "After Over Time";
  const notStarted = status.long === "Not Started";

  // --- Possession & Score ---
  const possession = useFootballGamePossession(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
  );

  // --- Details ---
  const { data: details, loading } = useFootballGameDetails(
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
    "cfb",
  );

  const {
    gameStatusShortDetail,
    gameStatusDescription,
    period,
    shortDownDistanceText,
    possessionText,
    possessionTeamId,
    displayClock,
    redzone: isRedzone,
  } = possession;

  // --- Game Staus & Info ---
  const isFinal = gameStatusDescription === "Final" || finished;
  const isScheduled = notStarted || gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";
  const isForfeited = gameStatusDescription === "Forfeit";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const football = isDark ? FootballLight : Football;

  // -----------------------------------------------------
  // SCORE
  // -----------------------------------------------------
  const homeScore = isFinal
    ? game.scores.home.total
    : (possession?.score?.home ?? 0);
  const awayScore = isFinal
    ? game.scores.away.total
    : (possession?.score?.away ?? 0);

  // --- Team records ---
  const homeRecord = details?.homeRecords.total.summary;
  const awayRecord = details?.awayRecords.total.summary;

  // --- Team Rankings ---
  const homeRank = details?.homeRank;
  const awayRank = details?.awayRank;

  // --- Headline & Broadcast ---
  const broadcast = details?.broadcast;
  const headline = details?.headline;
  const rivalryHeadline = useMemo(
    () => getRivalryHeadline(Number(homeEspnId), Number(awayEspnId)),
    [homeEspnId, awayEspnId],
  );
  const headlineText = headline || rivalryHeadline || "";

  // --- Time & Date Display ---
  const formattedDate =
    gameDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" }) ||
    "";

  const formattedTime =
    gameDate?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  // --- Memoized team objects ---
  const awayTeam = useMemo(
    () => ({
      ...emptyAwayTeam,
      id: awayId ?? emptyAwayTeam.id,
      espnID: awayEspnId ?? emptyAwayTeam.espnID,
      name: away?.code ?? emptyAwayTeam.code,
      logo: isDark
        ? away?.logoLight || away?.logo || emptyAwayTeam.logo
        : away?.logo || emptyAwayTeam.logo,
      record: awayRecord ?? "0-0",
      hasPossession:
        inProgress && String(possessionTeamId) === String(awayEspnId),
    }),
    [awayId, awayEspnId, awayRecord, possessionTeamId, isDark, inProgress],
  );

  const homeTeam = useMemo(
    () => ({
      ...emptyHomeTeam,
      id: homeId ?? emptyHomeTeam.id,
      espnID: homeEspnId ?? emptyHomeTeam.espnID,
      name: home?.code || emptyHomeTeam.fullName,
      logo: isDark
        ? home?.logoLight || home?.logo || emptyHomeTeam.logo
        : home?.logo || emptyHomeTeam.logo,
      record: homeRecord ?? "0-0",
      hasPossession:
        inProgress && String(possessionTeamId) === String(homeEspnId),
    }),
    [homeId, homeEspnId, homeRecord, possessionTeamId, isDark, inProgress],
  );

  const homeTeamName = homeTeam.name;
  const awayTeamName = awayTeam.name;

  const homeTeamLogo = isDark
    ? homeTeam.logoLight || homeTeam.logo
    : homeTeam.logo;
  const awayTeamLogo = isDark
    ? awayTeam.logoLight || awayTeam.logo
    : awayTeam.logo;

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
    score: number | null;
    record: string | undefined;
    teamWins: boolean;
  }) => {
    const showRecord = isScheduled;

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

  const renderDownAndDistance = () => {
    if (!possessionText) return null;

    return (
      <>
        <Text
          style={[
            styles.downDistance,
            isRedzone && {
              color: isDark ? Colors.dark.lightRed : Colors.light.red,
            },
          ]}
        >
          {shortDownDistanceText}
        </Text>
        <Text
          style={[
            styles.downDistance,
            isRedzone && {
              color: isDark ? Colors.dark.lightRed : Colors.light.red,
            },
          ]}
        >
          {possessionText}
        </Text>
      </>
    );
  };

  const renderStatus = () => {
    if (isScheduled)
      return (
        <View>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.date}>{formattedTime}</Text>
        </View>
      );

    if (inProgress)
      return (
        <View>
          <Text style={styles.date}>{formatQuarter(period)}</Text>
          <Text style={styles.clock}>{displayClock}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>{gameStatusShortDetail}</Text>;

    if (isFinal)
      return (
        <View>
          <Text style={styles.finalText}>
            {gameStatusShortDetail || "Final"}
          </Text>
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* AWAY */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={awayTeamLogo} style={styles.logo} />
            <Text style={styles.teamName}>
              {awayRank && <Text style={styles.rank}>{awayRank} </Text>}
              {awayTeamName}
            </Text>
            {inProgress && awayTeam.hasPossession && (
              <Image source={football} style={styles.footballPossesion} />
            )}
          </View>
          <ScoreText
            score={awayScore}
            record={awayTeam.record}
            teamWins={awayWins}
          />
        </View>

        {/* HOME */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={homeTeamLogo} style={styles.logo} />
            <Text style={styles.teamName}>
              {homeRank && <Text style={styles.rank}>{homeRank} </Text>}
              {homeTeamName}
            </Text>
            {inProgress && homeTeam.hasPossession && (
              <Image source={football} style={styles.footballPossesion} />
            )}
          </View>
          <ScoreText
            score={homeScore}
            record={homeTeam.record}
            teamWins={homeWins}
          />
        </View>
      </View>
      <View style={styles.info}>
        {renderStatus()}
        {renderDownAndDistance()}
      </View>
      {!isFinal && broadcast && (
        <Text style={styles.broadcast}>{broadcast}</Text>
      )}
      <Text style={styles.headlineText}>{headline}</Text>
      <Pressable
        onPress={() => setNotifEnabled((prev) => !prev)}
        style={styles.notificationBell}
      >
        <Ionicons
          name={notifEnabled ? "notifications" : "notifications-outline"}
          size={20}
          color={isDark ? Colors.white : Colors.black}
        />
      </Pressable>
    </>
  );

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

export default memo(CFBSquareGameCard);
