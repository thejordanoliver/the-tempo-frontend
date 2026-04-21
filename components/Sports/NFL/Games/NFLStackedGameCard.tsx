import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import { Colors } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useGameDetails } from "hooks/NFLHooks/useGameDetails";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { StackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { FootballGameCardProps } from "types/football";
import { getHolidayLabel } from "utils/dateUtils";
import { formatQuarter } from "utils/games";
import { getBroadcastDisplay } from "utils/matchBroadcast";
import { getGameDate } from "utils/nflGameCardUtils";

function NFLStackedGameCard({ game }: FootballGameCardProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  // -----------------------------------------------------
  // TEAM + DATE
  // -----------------------------------------------------
  const homeId = game?.teams?.home?.id ?? 0;
  const awayId = game?.teams?.away?.id ?? 0;

  const home = getNFLTeam(homeId);
  const away = getNFLTeam(awayId);

  const homeName = home?.fullName || home?.name;
  const awayName = away?.fullName || away?.name;

  const homeLogo = getNFLTeamLogo(homeId, isDark);
  const awayLogo = getNFLTeamLogo(awayId, isDark);

  const homeEspnId = home?.espnID;
  const awayEspnId = away?.espnID;

  const {
    date: gameDate,
    iso: gameDateStr,
    formattedDate,
    formattedTime,
  } = getGameDate(game?.game?.date?.timestamp);

  const { details, score } = useGameDetails(
    "nfl",
    homeEspnId,
    awayEspnId,
    gameDateStr,
  );

  const gameStatusDescription = score?.gameStatusDescription ?? "";
  const gameStatusDetail = score?.gameStatusDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const displayClock = score?.displayClock;
  const period = score?.period;
  const redzone = score?.possession.isRedZone;
  const isRedzone = redzone;
  const broadcasts = details?.broadcasts;
  const broadcastText = getBroadcastDisplay(broadcasts);
  const downDistanceText = score?.possession.downDistanceText;
  const headlineText = details?.headline;
  const holidayLabel = getHolidayLabel(gameDate);
  const headline = headlineText ?? holidayLabel ?? "";
  const possessionTeamId = score?.possession.teamId;
  const homeRecord = details?.records?.home?.total?.summary;
  const awayRecord = details?.records?.away?.total?.summary;
  const homeScore = score?.home.total ?? 0;
  const awayScore = score?.away.total ?? 0;
  const football = isDark ? FootballLight : Football;
  const isChampionship = game.game.week === "Super Bowl";
  const styles = StackedGameCardStyles(isDark, isChampionship);
  const homeHasPossession = inProgress && possessionTeamId === home?.espnID;
  const awayHasPossession = inProgress && possessionTeamId === away?.espnID;
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

  const renderStatus = () => {
    if (inProgress)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{formatQuarter(Number(period))}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{displayClock ?? "0:00"}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>{gameStatusDetail}</Text>;

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail || "Final"}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );

    return (
      <View style={styles.infoWrapper}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.statusDivider} />
        <Text style={styles.date}>{formattedTime}</Text>
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.cardWrapper}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={awayLogo}
              style={[styles.logo]}
              accessibilityLabel={`${awayName} logo`}
            />
            <Text style={styles.teamName}>{awayName}</Text>
            {inProgress && awayHasPossession && (
              <Image source={football} style={styles.footballPossesion} />
            )}
          </View>
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
              style={[styles.logo]}
              accessibilityLabel={`${homeName} logo`}
            />
            <Text style={styles.teamName}>{homeName}</Text>
            {inProgress && homeHasPossession && (
              <Image source={football} style={styles.footballPossesion} />
            )}
          </View>
          <ScoreText
            score={homeScore}
            record={homeRecord}
            teamWins={homeWins}
          />
        </View>
      </View>

      <Text style={styles.headlineText}>{headline}</Text>
      <View style={styles.info}>
        {renderStatus()}
        {renderDownAndDistance()}
        {!isFinal && broadcastText && (
          <Text style={styles.broadcast}>{broadcastText}</Text>
        )}
      </View>
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
