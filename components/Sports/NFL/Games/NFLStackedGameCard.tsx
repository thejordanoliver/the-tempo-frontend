import { Ionicons } from "@expo/vector-icons";
import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/Colors";
import { getNFLTeam } from "constants/teamsNFL";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFootballGameDetails } from "hooks/NFLHooks/useFootballGameDetails";
import { useFootballGamePossession } from "hooks/NFLHooks/useFootballGamePossesion";
import { memo, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { stackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { emptyNFLAwayTeam, emptyNFLHomeTeam, Game } from "types/nfl";
import { formatQuarter } from "utils/games";
import { getGameDate } from "utils/nflGameCardUtils";
type NFLGameCardProps = {
  game: Game;
};

function NFLStackedGameCard({ game }: NFLGameCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [notifEnabled, setNotifEnabled] = useState(false);

  // -----------------------------------------------------
  // TEAM + DATE
  // -----------------------------------------------------
  const homeId = game?.teams?.home?.id ?? emptyNFLHomeTeam.id;
  const awayId = game?.teams?.away?.id ?? emptyNFLAwayTeam.id;

  const homeTeamObj = getNFLTeam(homeId);
  const awayTeamObj = getNFLTeam(awayId);

  const homeEspnId = homeTeamObj?.espnID;
  const awayEspnId = awayTeamObj?.espnID;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(game?.game?.date?.timestamp);

  const status = game.game.status;
  const finished =
    status.long === "Finished" || status.long === "After Over Time";
  const notStarted = status.long === "Not Started";

  // --- Possession & Score ---
  const possession = useFootballGamePossession(
    Number(homeEspnId),
    Number(awayEspnId),
    gameDateStr,
    "nfl"
  );

  const {
    gameStatusShortDetail,
    gameStatusDescription,
    period,
    downDistanceText,
    possessionTeamId,
    displayClock,
    redzone: isRedzone,
  } = possession;

  // --- Game Staus & Info ---
  const isFinal = gameStatusDescription === "Final" || finished;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isHalftime = gameStatusDescription === "Halftime";
  const isForfeited = gameStatusDescription === "Forfeit";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const football = isDark ? FootballLight : Football;

  const isChampionship = game.game.week === "Super Bowl";

  const styles = stackedGameCardStyles(isDark, isChampionship);

  const homeScore = isFinal
    ? game.scores.home.total
    : possession?.score?.home ?? 0;
  const awayScore = isFinal
    ? game.scores.away.total
    : possession?.score?.away ?? 0;

  const { data: details, loading } = useFootballGameDetails(
    String(homeEspnId),
    String(awayEspnId),
    gameDateStr,
    "nfl"
  );

  // --- Team records ---
  const homeRecord = details?.homeRecords.total.summary;
  const awayRecord = details?.awayRecords.total.summary;

  // -----------------------------------------------------
  // TEAM DATA
  // -----------------------------------------------------
  const awayTeam = useMemo(() => {
    const team = getNFLTeam(awayId) ?? emptyNFLAwayTeam;
    return {
      ...team,
      record: awayRecord ?? "0-0",
      hasPossession: inProgress && possessionTeamId === team.espnID,
    };
  }, [awayId, awayRecord, inProgress, possession]);

  const homeTeam = useMemo(() => {
    const team = getNFLTeam(homeId) ?? emptyNFLHomeTeam;
    return {
      ...team,
      record: homeRecord ?? "0-0",
      hasPossession: inProgress && possessionTeamId === team.espnID,
    };
  }, [homeId, homeRecord, inProgress, possession]);

  const homeTeamName = homeTeam.fullName;
  const awayTeamName = awayTeam.fullName;
  const homeTeamLogo = isDark
    ? homeTeam.logoLight || homeTeam.logo
    : homeTeam.logo;
  const awayTeamLogo = isDark
    ? awayTeam.logoLight || awayTeam.logo
    : awayTeam.logo;
  const headlineText = details?.headline;
  const broadcast = details?.broadcast;

  const isChristmasDay =
    gameDate?.getMonth() === 11 && gameDate.getDate() === 25;
  const isNewYearsDay = gameDate?.getMonth() === 0 && gameDate.getDate() === 1;
  const holidayLabel = isChristmasDay
    ? "Christmas Day"
    : isNewYearsDay
    ? "New Year's Day"
    : null;

  const headline = headlineText ?? holidayLabel ?? "";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = homeScore > awayScore;
  const awayWins = awayScore > homeScore;
  const isTie = awayScore === homeScore;

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: isFinal ? (isTie ? 1 : teamWins ? 1 : 0.5) : 1,
  });

  const ScoreText = ({
    score,
    record,
    teamWins,
  }: {
    score: number;
    record: string;
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

  const renderStatus = () => {
    if (isScheduled)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formattedDate}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.date}>{formattedTime}</Text>
        </View>
      );

    if (inProgress)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{formatQuarter(period)}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Cancelled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>{gameStatusShortDetail}</Text>;

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>
            {gameStatusShortDetail || "Final"}
          </Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );
  };

  const renderDownAndDistance = () => {
    if (!downDistanceText) return null;
    const [beforeAt, afterAt] = downDistanceText.split(" at ");
    return (
      <Text style={styles.downDistance}>
        {beforeAt}
        {afterAt && (
          <>
            {" at "}
            <Text
              style={[
                styles.downDistance,
                isRedzone && {
                  color: isDark ? Colors.dark.lightRed : Colors.light.red,
                },
              ]}
            >
              {afterAt}
            </Text>
          </>
        )}
      </Text>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* AWAY */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image source={awayTeamLogo} style={styles.logo} />
            <Text style={styles.teamName}>{awayTeamName}</Text>
          </View>
          {inProgress && awayTeam.hasPossession && (
            <Image source={football} style={styles.footballPossesion} />
          )}
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
            <Text style={styles.teamName}>{homeTeamName}</Text>
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
        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>
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
          pathname: "/game/nfl/[game]",
          params: { game: JSON.stringify(game) },
        })
      }
    >
      {isChampionship ? (
        <LinearGradient
          colors={
            isDark
              ? ["#846f4a", "#50412a"]
              : (["#dbb145ff", "#CDA765"] as [string, string])
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

export default memo(NFLStackedGameCard);
