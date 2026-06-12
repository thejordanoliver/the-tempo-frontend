import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { squareGameCardStyles } from "@/styles/GamecardStyles/SquareGameCardStyles";
import { getHolidayLabel } from "@/utils/dateUtils";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, TextStyle, TouchableOpacity, View } from "react-native";
import { formatQuarter, getBroadcastDisplay } from "utils/games";
import { SoccerGameCardProps } from "../../../../types/soccer";
export default function SoccerSquareGameCard({ game }: SoccerGameCardProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const handlePress = () => {
    router.push({
      pathname: "/game/soccer/[game]",
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

  const home = game.home;
  const away = game.away;

  const homeTeam = getSOCCTeam(home.id);
  const awayTeam = getSOCCTeam(away.id);

  const homeName = homeTeam?.code || "TBD";
  const awayName = awayTeam?.code || "TBD";

  const homeLogo = getSOCCTeamLogo(home.id, isDark);
  const awayLogo = getSOCCTeamLogo(away.id, isDark);

  const holidayLabel = getHolidayLabel(gameDate);
  const headlineText = game?.headline;
  const headline = headlineText || holidayLabel;
  const isChampionship = headline?.includes("Finals");
  const styles = squareGameCardStyles(isDark, isChampionship);
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatQuarter(game.status.period);
  const clock = game.status.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const isFinal = gameStatusDescription === "Full Time";
  const isScheduled = gameStatusDescription === "Scheduled";
  const isSuspended = gameStatusDescription === "Suspended";
  const inProgress =
    gameStatusDescription === "In Progress" ||
    gameStatusDescription === "First Half" ||
    gameStatusDescription === "Second Half" ||
    gameStatusDescription === "End of Period";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";

  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;
  const homeRecord = game.home.record ?? "0-0-0";
  const awayRecord = game.away.record ?? "0-0-0";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = (awayScore ?? 0) > (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean): TextStyle => ({
    color: isDark ? Colors.white : Colors.black,
    opacity:
      inProgress || isHalftime || endOfPeriod
        ? 1
        : isFinal
          ? teamWins
            ? 1
            : 0.5
          : 1,
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
      showRecord || !hasScore
        ? (recordData ?? "-")
        : (score?.toString() ?? "-");
    const style =
      showRecord || !hasScore
        ? styles.teamRecord
        : [styles.teamScore, winnerStyle(teamWins)];
    return <Text style={style}>{displayValue}</Text>;
  };

  const renderStatus = () => {
    if (inProgress)
      return (
        <View>
          <Text style={styles.period}>{period}</Text>
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;

    if (endOfPeriod) return <Text style={styles.clock}>End of {period}</Text>;

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
  const renderCardContent = () => (
    <>
      <Text style={[styles.headlineText]}>{headline}</Text>
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
          <ScoreText
            score={awayScore}
            recordData={awayRecord ?? undefined}
            teamWins={awayWins}
            showRecord={isScheduled || isDelayed || isPostponed || isCanceled}
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
          <ScoreText
            score={homeScore}
            recordData={homeRecord}
            teamWins={homeWins}
            showRecord={isScheduled || isDelayed || isPostponed || isCanceled}
          />
        </View>
      </View>
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
