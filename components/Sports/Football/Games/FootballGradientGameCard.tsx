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
import { LinearGradient } from "expo-linear-gradient";
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
import { getTeamCardGradientColors } from "utils/games/teamCardGradient";

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

  // =====================================================
  // GAME INFORMATION
  // =====================================================

  const league = game?.league?.id;

  const gameDate = safeDate(game.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);

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

  // =====================================================
  // TEAMS
  // =====================================================

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

  // =====================================================
  // GAME STATUS
  // =====================================================

  const rivalry = isCFB ? getCFBRivalry(homeId, awayId)?.name : null;

  const headline = game.headline ?? rivalry ?? holidayLabel;

  const gameStatusDescription = game?.status?.description ?? "";
  const gameStatusDetail = game?.status?.shortDetail ?? "";

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

  const period = formatPeriod({
    period: game.status.period,
  });

  const isOT = isCFB ? gameStatusDetail.includes("OT") : false;

  const isRedzone = game?.situation?.isRedZone;

  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);

  const downDistanceText = game.situation?.downDistanceText;

  // =====================================================
  // SCORES AND POSSESSION
  // =====================================================

  const homeRecord = game?.home?.record ?? "0-0";
  const awayRecord = game?.away?.record ?? "0-0";

  const homeScore = game?.home?.score ?? 0;
  const awayScore = game?.away?.score ?? 0;

  const homeRank = game?.home?.rank ?? null;
  const awayRank = game?.away?.rank ?? null;

  const homeWins = game.home?.winner ?? false;
  const awayWins = game.away?.winner ?? false;

  const isTie = homeWins === awayWins;

  const possessionTeamId = game.situation?.possession;

  // Normalize IDs to handle string/number differences.
  const homeHasPossession =
    inProgress &&
    possessionTeamId != null &&
    String(possessionTeamId) === String(homeId);

  const awayHasPossession =
    inProgress &&
    possessionTeamId != null &&
    String(possessionTeamId) === String(awayId);

  const footballIcon = isDark ? FootballLight : Football;

  // =====================================================
  // CHAMPIONSHIP
  // =====================================================

  const headlineMatch = game?.headline?.toLowerCase();

  const isChampionship =
    headlineMatch?.includes("super bowl") ||
    headlineMatch?.includes("national championship");

  const styles = GradientGameCardStyles(isDark, isChampionship);

  // =====================================================
  // TEAM SCORE COMPONENT
  // =====================================================

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
  }) => {
    const showRecord = isScheduled;

    return (
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
            showRecord
              ? [styles.teamRecord, styles.footballRecordText]
              : [
                  styles.teamScore,
                  styles.footballScoreText,
                  winnerStyle({
                    isWinner,
                    isTie,
                    isDark,
                  }),
                ]
          }
        >
          {showRecord ? record : score}
        </Text>

        {/* Football directly beneath the team's score */}
        {hasPossession && (
          <Image
            source={footballIcon}
            style={styles.footballBelowScore}
            resizeMode="contain"
            accessible={false}
          />
        )}
      </View>
    );
  };

  // =====================================================
  // DOWN AND DISTANCE
  // =====================================================

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

  // =====================================================
  // GAME STATUS RENDERING
  // =====================================================

  const renderStatus = () => {
    if (inProgress) {
      return (
        <>
          {!isOT ? (
            <View style={styles.infoWrapper}>
              <Text style={styles.date}>{period}</Text>

              <View style={styles.statusDivider} />

              <Text style={styles.clock}>{clock}</Text>
            </View>
          ) : (
            <Text style={styles.clock}>{period}</Text>
          )}

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

  // =====================================================
  // CARD CONTENT
  // =====================================================

  const renderCardContent = () => (
    <>
      {/* ===========================================
          AWAY TEAM
      =========================================== */}

      <View style={styles.teamSection}>
        <Image source={awayLogo} style={styles.awayLogo} resizeMode="contain" />

        {awayRank != null && awayRank > 0 && (
          <BlurView style={styles.awayRankContainer}>
            <Text style={styles.rank}>#{awayRank}</Text>
          </BlurView>
        )}

        <Text
          style={styles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {awayName}
        </Text>
      </View>

      {/* ===========================================
          AWAY SCORE + POSSESSION BELOW
      =========================================== */}

      <ScoreColumn
        score={awayScore}
        record={awayRecord}
        isWinner={awayWins}
        hasPossession={awayHasPossession}
      />

      {/* ===========================================
          CENTER GAME INFORMATION
      =========================================== */}

      <View style={styles.info}>
        {renderStatus()}

        {!isFinal && Boolean(broadcast) && (
          <Text style={styles.broadcast} numberOfLines={1} adjustsFontSizeToFit>
            {broadcast}
          </Text>
        )}
      </View>

      {/* ===========================================
          HOME SCORE + POSSESSION BELOW
      =========================================== */}

      <ScoreColumn
        score={homeScore}
        record={homeRecord}
        isWinner={homeWins}
        hasPossession={homeHasPossession}
      />

      {/* ===========================================
          HOME TEAM
      =========================================== */}

      <View style={styles.teamSection}>
        <Image source={homeLogo} style={styles.homeLogo} resizeMode="contain" />

        {homeRank != null && homeRank > 0 && (
          <BlurView style={styles.homeRankContainer}>
            <Text style={styles.rank}>#{homeRank}</Text>
          </BlurView>
        )}

        <Text
          style={styles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {homeName}
        </Text>
      </View>

      {/* ===========================================
          HEADLINE OVERLAY
      =========================================== */}

      {Boolean(headline) && (
        <View style={styles.headlineContainer} pointerEvents="none">
          <Text style={styles.headlineText} numberOfLines={1}>
            {headline}
          </Text>
        </View>
      )}
    </>
  );

  // =====================================================
  // MAIN CARD
  // =====================================================

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
        locations={[0, 0.28, 0.5, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.card}
      >
        {renderCardContent()}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default memo(FootballGradientGameCard);
