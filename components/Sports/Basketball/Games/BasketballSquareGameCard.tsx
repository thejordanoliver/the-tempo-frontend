import { getMCBBRivalry, getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { getWNBATeamLogo } from "@/constants/teamsWNBA";
import { SquareGameCardStyles } from "@/styles/GamecardStyles/SquareGameCardStyles";
import { BasketballGameCardProps } from "@/types/basketball/basketball";
import { activeOpacity } from "constants/styles";
import { getNBATeamLogo } from "constants/teams";
import { getWCBBRivalry, getWCBBTeamLogo } from "constants/teamsWCBB";
import { usePreferences } from "contexts/PreferencesContext";
import { getGameAccessibilityLabel } from "utils/games/gameAccessibility";

import { getGLeagueTeamLogo } from "@/constants/teamsGLeague";
import { LinearGradient } from "expo-linear-gradient";
import { useScopedRouter } from "hooks/useScopedRouter";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { emptyAwayTeam, emptyHomeTeam } from "types/team";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
} from "utils/common/dateUtils";
import {
  formatPeriod,
  getBroadcastDisplay,
  winnerStyle,
} from "utils/games/games";
import { getTeamCardGradientColors } from "utils/games/teamCardGradient";

export default function BasketballSquareGameCard({
  game,
  isMCBB,
  isWCBB,
  isWNBA,
  isGLEAGUE,
}: BasketballGameCardProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const awayColor =
    game.away?.primaryColor ?? game.away?.secondaryColor ?? undefined;
  const homeColor =
    game.home?.primaryColor ?? game.home?.secondaryColor ?? undefined;

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
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);

  const league = game?.league?.id;
  const home = game?.home;
  const away = game?.away;
  const homeId = home?.id;
  const awayId = away?.id;

  const homeName = game.home?.code;
  const awayName = game.away?.code;

  const homeLogo =
    homeId === emptyHomeTeam.id
      ? emptyHomeTeam.logo
      : isMCBB
        ? getMCBBTeamLogo(homeId, isDark)
        : isWCBB
          ? getWCBBTeamLogo(homeId, isDark)
          : isWNBA
            ? getWNBATeamLogo(homeId, isDark)
            : isGLEAGUE
              ? getGLeagueTeamLogo(homeId, isDark)
              : getNBATeamLogo(homeId, isDark);

  const awayLogo =
    awayId === emptyAwayTeam.id
      ? emptyAwayTeam.logo
      : isMCBB
        ? getMCBBTeamLogo(awayId, isDark)
        : isWCBB
          ? getWCBBTeamLogo(awayId, isDark)
          : isWNBA
            ? getWNBATeamLogo(awayId, isDark)
            : isGLEAGUE
              ? getGLeagueTeamLogo(awayId, isDark)
              : getNBATeamLogo(awayId, isDark);

  const rivalry = isMCBB
    ? getMCBBRivalry(homeId, awayId)?.name
    : isMCBB
      ? getWCBBRivalry(homeId, awayId)?.name
      : null;

  const headline = game?.headline || rivalry || holidayLabel;
  const isChampionship =
    headline?.includes("NBA Summer League - Final") ||
    headline?.includes("NBA Finals") ||
    headline?.includes(
      "Men's Basketball Championship - National Championship",
    ) ||
    headline?.includes(
      "Women's Basketball Championship - National Championship",
    );

  const styles = SquareGameCardStyles(isDark, isChampionship);

  const homeScore = game.home.score ?? 0;
  const awayScore = game.away.score ?? 0;

  const period = formatPeriod({
    period: game.status.period,
    isMCBB: isMCBB,
  });

  const clock = game.status.displayClock;
  const gameStatusDescription = game.status?.description;
  const gameStatusDetail = game.status.shortDetail;
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const broadcast = getBroadcastDisplay(game?.broadcasts, true);

  const homeRecord = game.home.record ?? "0-0";
  const awayRecord = game.away.record ?? "0-0";

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = game.home.winner;
  const awayWins = game.away.winner;
  const isTie = game.home.winner === game.away.winner;

  const ScoreText = ({
    score,
    record,
    isWinner,
  }: {
    score: number | undefined;
    record: string | undefined;
    isWinner: boolean;
  }) => {
    const showRecord = isScheduled || isCanceled || isPostponed || isDelayed;

    return (
      <Text
        style={
          showRecord
            ? styles.teamRecord
            : [
                styles.teamScore,
                winnerStyle({
                  isWinner: isWinner,
                  isTie: isTie,
                  isDark: isDark,
                }),
              ]
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
          <Text style={styles.period}>{period}</Text>
          <View style={styles.divider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;

    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;

    if (endOfPeriod)
      return <Text style={styles.clock}>{gameStatusDetail}</Text>;

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
        <Text style={styles.date}>{tbd || formattedTime}</Text>
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
              resizeMode="contain"
              accessibilityLabel={`${awayName} logo`}
            />
            <Text
              style={styles.teamName}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.5}
            >
              {awayName}
            </Text>
          </View>
          {/* Away Score / Record */}
          <ScoreText
            score={awayScore}
            record={awayRecord}
            isWinner={awayWins}
          />
        </View>

        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
            <Image
              source={homeLogo}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel={`${homeName} logo`}
            />
            <Text
              style={styles.teamName}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.5}
            >
              {homeName}
            </Text>
          </View>

          {/* Home Score / Record */}
          <ScoreText
            score={homeScore}
            record={homeRecord}
            isWinner={homeWins}
          />
        </View>
      </View>
      {/* headlineText */}
      <Text style={styles.headlineText} numberOfLines={1}>
        {headline}
      </Text>

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
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={getGameAccessibilityLabel(game, {
        homeName,
        awayName,
        date: formattedDate,
        time: formattedTime,
      })}
      accessibilityHint="Opens game details"
    >
      <LinearGradient
        colors={getTeamCardGradientColors(
          isDark,
          awayColor,
          homeColor,
          isChampionship ? (isDark ? "#50412a" : "#CDA765") : undefined,
        )}
        locations={[0, 0.4, 0.5, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.card}
      >
        {renderCardContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
}
