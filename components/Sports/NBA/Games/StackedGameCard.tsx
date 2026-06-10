import { BasketballGameCardProps } from "@/types/basketball";
import { getHolidayLabel } from "@/utils/dateUtils";
import { Colors } from "constants/styles";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { stackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { formatQuarter, getBroadcastDisplay } from "utils/games";

export default function StackedGameCard({
  game,
  isCBB,
  isWCBB,
  isWNBA,
}: BasketballGameCardProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const handlePress = () => {
    router.push({
      pathname: "/game/basketball/[game]",
      params: {
        game: String(game.id),
        leagueId: String(league),
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
  };

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);

  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime =
    gameDate?.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const league = game?.league?.id;

  const homeId = Number(game.home?.id);
  const awayId = Number(game.away?.id);

  const home = getNBATeam(homeId);
  const away = getNBATeam(awayId);

  const homeName = home?.fullName || game.home?.name;
  const awayName = away?.fullName || game.away?.name;

  const homeLogo = getTeamLogo(homeId, isDark);
  const awayLogo = getTeamLogo(awayId, isDark);

  const holidayLabel = getHolidayLabel(gameDate);
  const headlineText = game?.headline;
  const headline = headlineText || holidayLabel;
  const isChampionship = headline?.includes("NBA Finals");
  const styles = stackedGameCardStyles(isDark, isChampionship);
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatQuarter(game.status.period);
  const clock = game.status.displayClock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";

  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;
  const homeRecord = game.home.record ?? "0-0";
  const awayRecord = game.away.record ?? "0-0";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = (awayScore ?? 0) > (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: isFinal ? (teamWins ? 1 : 0.5) : 1,
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
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{formatQuarter(period ?? 0)}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (endOfPeriod)
      return (
        <Text style={styles.clock}>End of {formatQuarter(period ?? 0)}</Text>
      );

    if (isFinal)
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
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
      {/* headlineText */}
      <Text style={[styles.headlineText]}>{headline}</Text>

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>
    </>
  );

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
      <View style={styles.card}>{renderCardContent()}</View>
    </TouchableOpacity>
  );
}
