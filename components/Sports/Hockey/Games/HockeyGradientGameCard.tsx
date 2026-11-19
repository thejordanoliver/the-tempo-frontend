import { HockeyGameCardProps } from "@/types/hockey/hockey";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/common/dateUtils";
import { activeOpacity } from "constants/styles";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { usePreferences } from "contexts/PreferencesContext";
import GradientGameCardBackground from "components/Sports/GradientGameCardBackground";
import { useScopedRouter } from "hooks/useScopedRouter";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GradientGameCardStyles } from "styles/GamecardStyles/GradientGameCardStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/team";
import { getGameAccessibilityLabel } from "utils/games/gameAccessibility";
import {
  formatPeriod,
  getBroadcastDisplay,
  winnerStyle,
} from "utils/games/games";

function HockeyGradientGameCard({ game, isNHL, isMCH }: HockeyGameCardProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const handlePress = () => {
    router.push({
      pathname: "/game/hockey/[game]",
      params: {
        game: String(game.id),
        leagueId: String(league),
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
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

  const homeName = game.home?.code ?? game.home?.shortName ?? game.home?.name;
  const awayName = game.away?.code ?? game.away?.shortName ?? game.away?.name;

  const homeColor = game.home?.primaryColor ?? game.home?.secondaryColor;
  const awayColor = game.away?.primaryColor ?? game.away?.secondaryColor;

  const homeLogo =
    homeId === emptyHomeTeam.id
      ? emptyHomeTeam.logo
      : getNHLTeamLogo(homeId, isDark);

  const awayLogo =
    awayId === emptyAwayTeam.id
      ? emptyAwayTeam.logo
      : getNHLTeamLogo(awayId, isDark);

  const headlineText = game?.headline ?? holidayLabel;
  const broadcast = getBroadcastDisplay(game?.broadcasts);
  const state = game.status.state ?? "";
  const gameStatusDescription = game.status.description ?? "";
  const gameStatusDetail = game.status.shortDetail ?? "";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const isFinal = state === "post";
  const isScheduled = state === "pre";
  const inProgress = state === "in";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isHalftime = gameStatusDescription === "Halftime";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const period = formatPeriod({ period: game.status.period, isNHL: true });
  const homeScore = game?.home?.score ?? 0;
  const awayScore = game?.away?.score ?? 0;
  const homeRecord = game?.home?.record ?? "0-0";
  const awayRecord = game?.away?.record ?? "0-0";
  const clock = game.status?.clock;
  const isChampionship = headlineText?.includes("Stanley Cup Final");
  const styles = GradientGameCardStyles(isDark, isChampionship);

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
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );

    if (isDelayed) return <Text style={styles.finalText}>Delayed</Text>;
    if (isHalftime) return <Text style={styles.finalText}>Halftime</Text>;
    if (isCanceled) return <Text style={styles.finalText}>Canceled</Text>;
    if (isPostponed) return <Text style={styles.finalText}>Postponed</Text>;
    if (isForfeited) return <Text style={styles.finalText}>Forfeited</Text>;

    if (endOfPeriod) return <Text style={styles.clock}>End of {period}</Text>;

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
        <Text style={styles.date}>{tbd || formattedTime}</Text>
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      {/* Away Team */}
      <View style={styles.teamSection}>
                
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
      <ScoreText score={awayScore} record={awayRecord} isWinner={awayWins} />

      {/* headlineText */}
      <View style={styles.headlineContainer}>
        <Text style={[styles.headlineText]}>{headlineText}</Text>
      </View>

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>

      {/* Home Score / Record */}
      <ScoreText score={homeScore} record={homeRecord} isWinner={homeWins} />

      {/* Home Team */}
      <View style={styles.teamSection}>
                
        <Text
          style={styles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.5}
        >
          {homeName}
        </Text>
      </View>
    </>
  );

  /* ===============================
     RENDER
  =============================== */
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
      <GradientGameCardBackground
        isDark={isDark}
        isChampionship={Boolean(isChampionship)}
        awayColor={awayColor}
        homeColor={homeColor}
        awayLogo={awayLogo}
        homeLogo={homeLogo}
      >
        {renderCardContent()}
      </GradientGameCardBackground>
    </TouchableOpacity>
  );
}

export default memo(HockeyGradientGameCard);
