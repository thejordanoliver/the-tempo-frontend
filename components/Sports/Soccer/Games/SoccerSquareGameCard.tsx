import { getSOCCTeam, getSOCCTeamLogo } from "@/constants/teamsSOCC";
import { squareGameCardStyles } from "@/styles/GamecardStyles/SquareGameCardStyles";
import { getHolidayLabel } from "@/utils/dateUtils";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { formatPeriod, getBroadcastDisplay } from "utils/games";
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
  const isChampionship = Boolean(headline?.includes("Final"));

  const styles = squareGameCardStyles(isDark, isChampionship);

  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const period = formatPeriod({ period: game?.status.period, isSOCC: true });
  const clock = game.status?.clock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status?.shortDetail;
  const inProgress = game.status.state === "in";
  const isFinal = game.status.state === "post";
  const isScheduled = game.status.state === "pre";
  const isSuspended = gameStatusDescription === "Suspended";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";

  const homeScore = Number(game?.home?.score ?? 0);
  const awayScore = Number(game?.away?.score ?? 0);
  const homeRecord = game?.home?.record ?? "0-0-0";
  const awayRecord = game?.away?.record ?? "0-0-0";
  const homeWins = Boolean(game?.home?.winner);
  const awayWins = Boolean(game?.away?.winner);

  const isTie = isFinal && !homeWins && !awayWins && homeScore === awayScore;

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: !isFinal || isTie ? 1 : teamWins ? 1 : 0.35,
    fontWeight: isFinal && teamWins ? ("700" as const) : ("500" as const),
  });

  const ScoreText = ({
    score,
    record,
    teamWins = false,
  }: {
    score: number;
    record: string;
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
    if (inProgress && !isDelayed)
      return (
        <View>
          <Text style={styles.period}>{period}</Text>
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
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
              source={{ uri: awayLogo }}
              style={styles.logo}
              accessibilityLabel={`${homeName} logo`}
            />
            <Text style={styles.teamName}>{awayName}</Text>
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
              source={{ uri: homeLogo }}
              style={styles.logo}
              accessibilityLabel={`${homeName} logo`}
            />
            <Text style={styles.teamName}>{homeName}</Text>
          </View>
          <ScoreText
            score={homeScore}
            record={homeRecord}
            teamWins={homeWins}
          />
        </View>
      </View>
      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal &&
          !isPostponed &&
          !isCanceled &&
          !isForfeited &&
          broadcast && <Text style={styles.broadcast}>{broadcast}</Text>}
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
