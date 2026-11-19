import {
  getCFBRivalry,
  getCFBTeam,
  getCFBTeamLogo,
} from "@/constants/teamsCFB";
import { getUFLTeam, getUFLTeamLogo } from "@/constants/teamsUFL";
import { FootballGameCardProps } from "@/types/football/football";
import { Colors, activeOpacity } from "constants/styles";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import GradientGameCardBackground from "components/Sports/GradientGameCardBackground";
import { useScopedRouter } from "hooks/useScopedRouter";
import { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GradientGameCardStyles } from "styles/GamecardStyles/GradientGameCardStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/team";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "utils/common/dateUtils";
import { getGameAccessibilityLabel } from "utils/games/gameAccessibility";
import {
  formatPeriod,
  getBroadcastDisplay,
  winnerStyle,
} from "utils/games/games";
import Football from "../../../../assets/icons/Football.png";
import FootballLight from "../../../../assets/icons/FootballLight.png";

function FootballGradientGameCard({
  game,
  isCFB = false,
  isNFL = false,
}: FootballGameCardProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const handlePress = () => {
    router.push({
      pathname: "/game/football/[game]",
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

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;

  const homeName = game.home?.code ?? game.home?.name;
  const awayName = game.away?.code ?? game.away?.name;

  const homeColor = game.home?.primaryColor ?? game.home?.secondaryColor;
  const awayColor = game.away?.primaryColor ?? game.away?.secondaryColor;

  const home =
    (isNFL
      ? getNFLTeam(homeId)
      : isCFB
        ? getCFBTeam(homeId)
        : getUFLTeam(homeId)) ?? emptyHomeTeam;
  const away =
    (isNFL
      ? getNFLTeam(awayId)
      : isCFB
        ? getCFBTeam(awayId)
        : getUFLTeam(awayId)) ?? emptyAwayTeam;

  const homeLogo =
    home.id === emptyHomeTeam.id
      ? emptyHomeTeam.logo
      : isNFL
        ? getNFLTeamLogo(homeId, isDark)
        : isCFB
          ? getCFBTeamLogo(homeId, isDark)
          : getUFLTeamLogo(homeId, isDark);
  const awayLogo =
    away.id === emptyAwayTeam.id
      ? emptyAwayTeam.logo
      : isNFL
        ? getNFLTeamLogo(awayId, isDark)
        : isCFB
          ? getCFBTeamLogo(awayId, isDark)
          : getUFLTeamLogo(awayId, isDark);

  const rivalry = isCFB ? getCFBRivalry(homeId, awayId)?.name : null;
  const headline = game.headline ?? rivalry ?? holidayLabel;
  const gameStatusDescription = game?.status.description ?? "";
  const gameStatusDetail = game?.status.shortDetail ?? "";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isHalftime = gameStatusDescription === "Halftime";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isSuspended = gameStatusDescription === "Suspended";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const clock = game.status?.displayClock;
  const period = formatPeriod({ period: game.status.period });
  const isOT = isCFB ? gameStatusDetail.includes("OT") : false;
  const redzone = game?.situation?.isRedZone;
  const isRedzone = redzone;
  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const downDistanceText = game.situation?.downDistanceText;
  const possessionTeamId = game.situation?.possession;
  const homeRecord = game?.home?.record ?? "0-0";
  const awayRecord = game?.away?.record ?? "0-0";
  const homeScore = game?.home?.score ?? 0;
  const awayScore = game?.away?.score ?? 0;
  const homeRank = game?.home?.rank ?? null;
  const awayRank = game?.away?.rank ?? null;

  const headlineMatch = game?.headline?.toLowerCase();
  const isChampionship =
    headlineMatch?.includes("super bowl") ||
    headlineMatch?.includes("national championship");
  const styles = GradientGameCardStyles(isDark, isChampionship);
  const homeHasPossession =
    inProgress && possessionTeamId != null && String(possessionTeamId) === String(homeId);
  const awayHasPossession =
    inProgress && possessionTeamId != null && String(possessionTeamId) === String(awayId);

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = game.home.winner;
  const awayWins = game.away.winner;
  const isTie = game.home.winner === game.away.winner;

  const ScoreColumn = ({
    score,
    record,
    isWinner,
    hasPossession,
  }: {
    score: number;
    record: string | undefined;
    isWinner: boolean;
    hasPossession: boolean;
  }) => (
    <View
      style={[
        styles.footballScoreColumn,
        hasPossession && styles.footballScoreColumnActive,
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={
          isScheduled
            ? [styles.teamRecord, styles.footballRecordText]
            : [
                styles.teamScore,
                styles.footballScoreText,
                winnerStyle({ isWinner, isTie, isDark }),
              ]
        }
      >
        {isScheduled ? record : score}
      </Text>
      {hasPossession && (
        <Image
          source={isDark ? FootballLight : Football}
          style={styles.footballBelowScore}
          resizeMode="contain"
          accessible={false}
        />
      )}
    </View>
  );

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
    if (inProgress) {
      return (
        <>
          <>
            {!isOT && (
              <>
                <View style={styles.infoWrapper}>
                  <Text style={styles.date}>{period}</Text>
                  <View style={styles.statusDivider} />
                  <Text style={styles.clock}>{clock}</Text>
                </View>
              </>
            )}

            {isOT && <Text style={styles.clock}>{period}</Text>}
          </>
          {renderDownAndDistance()}
        </>
      );
    }

    if (endOfPeriod) {
      return <Text style={styles.clock}>End of {period}</Text>;
    }

    if (
      isHalftime ||
      isDelayed ||
      isCanceled ||
      isPostponed ||
      isForfeited ||
      isSuspended
    ) {
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;
    }

    if (isFinal) {
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.finalText}>{gameStatusDetail}</Text>
          <View style={styles.finalStatusDivider} />
          <Text style={styles.finalText}>{formattedDate}</Text>
        </View>
      );
    }

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
      <View style={styles.teamSection}>

        {awayRank && (
          <BlurView style={styles.awayRankContainer}>
            <Text style={styles.rank}>#{awayRank} </Text>
          </BlurView>
        )}
        <Text
          style={styles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.5}
        >
          {awayName}
        </Text>
      </View>

      <ScoreColumn score={awayScore} record={awayRecord} isWinner={awayWins} hasPossession={awayHasPossession} />

      

      <View style={styles.headlineContainer}>
        <Text style={[styles.headlineText]}>{headline}</Text>
      </View>

      <View style={styles.info}>
        {renderStatus()}

        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>

      <ScoreColumn score={homeScore} record={homeRecord} isWinner={homeWins} hasPossession={homeHasPossession} />
      

      <View style={styles.teamSection}>
        {homeRank && (
          <BlurView style={styles.homeRankContainer}>
            <Text style={styles.rank}>#{homeRank} </Text>
          </BlurView>
        )}
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

export default memo(FootballGradientGameCard);
