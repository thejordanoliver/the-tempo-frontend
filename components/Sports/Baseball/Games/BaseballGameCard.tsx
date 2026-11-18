import { BaseballGameCardProps } from "@/types/baseball/baseball";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/common/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { Colors, activeOpacity } from "constants/styles";
import { getCBTeamLogo } from "constants/teamsCB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getSBTeamLogo } from "constants/teamsSB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useScopedRouter } from "hooks/useScopedRouter";
import { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import { emptyAwayTeam, emptyHomeTeam } from "types/team";
import { getGameAccessibilityLabel } from "utils/games/gameAccessibility";
import { getBroadcastDisplay, winnerStyle } from "utils/games/games";
import { BasesIndicator } from "../GameDetails/BasesIndicator";
import { BlurView } from "expo-blur";

function BaseballGameCard({
  game,
  isCB,
  isSB,
  onNavigate,
}: BaseballGameCardProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const handlePress = () => {
    onNavigate?.();
    router.push({
      pathname: "/game/baseball/[game]",
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

  const home = game?.home;
  const away = game?.away;
  const homeId = home?.id;
  const awayId = away?.id;

  const homeName = game.home?.shortName ?? game.home?.name;
  const awayName = game.away?.shortName ?? game.away?.name;

  const homeColor = game.home?.primaryColor ?? game.home?.secondaryColor;
  const awayColor = game.away?.primaryColor ?? game.away?.secondaryColor;

  const homeLogo =
    homeId === emptyHomeTeam.id
      ? emptyHomeTeam.logo
      : isSB
        ? getSBTeamLogo(homeId, isDark)
        : isCB
          ? getCBTeamLogo(homeId, isDark)
          : getMLBTeamLogo(homeId, isDark);

  const awayLogo =
    awayId === emptyAwayTeam.id
      ? emptyAwayTeam.logo
      : isSB
        ? getSBTeamLogo(awayId, isDark)
        : isCB
          ? getCBTeamLogo(awayId, isDark)
          : getMLBTeamLogo(awayId, isDark);

  const league = game?.league?.code ?? "mlb";
  const headline = game.headline ?? holidayLabel;
  const isChampionship =
    game?.season.slug === "championship-series" ||
    headline?.includes("World Series");

  const styles = GameCardStyles(isDark, isChampionship, awayColor, homeColor);
  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const gameStatusDescription = game.status.description ?? "";
  const gameStatusDetail = game.status.shortDetail ?? "";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isDelayed =
    gameStatusDescription === "Delayed" ||
    gameStatusDescription === "Rain Delay";
  const isEndOfInning = gameStatusDetail.includes("End");
  const homeScore = home?.score ?? 0;
  const awayScore = away?.score ?? 0;
  const homeRecord = home?.record;
  const awayRecord = away?.record;
  const homeRank = home?.rank;
  const awayRank = away?.rank;
  const outs = game?.situation.outs;
  const countOuts = Math.min(Math.max(outs ?? 0, 0), 3);
  const getOuts = [1, 2, 3].map((i) => (
    <Ionicons
      key={i}
      size={8}
      name={i <= countOuts ? "ellipse" : "ellipse-outline"}
      color={isDark ? Colors.dark.lightRed : Colors.light.red}
    />
  ));
  const bases = {
    onFirst: game?.situation?.onFirst,
    onSecond: game?.situation?.onSecond,
    onThird: game?.situation?.onThird,
  };

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
    const showRecord = isScheduled || isCanceled || isPostponed;

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
    return (
      <View>
        {/* Scheduled */}
        {isScheduled && (
          <>
            <View style={styles.infoWrapper}>
              <Text style={styles.date}>{formattedDate}</Text>
              <View style={styles.statusDivider} />
              <Text style={styles.date}>{tbd || formattedTime}</Text>
            </View>
            <Text style={styles.broadcast}>{broadcast}</Text>
          </>
        )}

        {/* In Progress */}
        {inProgress && !isDelayed && !isEndOfInning && (
          <>
            <View style={styles.infoWrapper}>
              <Text style={styles.date}>{gameStatusDetail}</Text>
              <View style={styles.statusDivider} />
              <View style={styles.outsContainer}>{getOuts}</View>
            </View>
            <View style={styles.basesContainer}>
              <BasesIndicator size={8} bases={bases} isDark={isDark} />
            </View>
            <Text style={styles.broadcast}>{broadcast}</Text>
          </>
        )}

        {/* End of Inning */}
        {isEndOfInning && (
          <>
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText}>{gameStatusDetail}</Text>
            </View>
            <Text style={styles.broadcast}>{broadcast}</Text>
          </>
        )}

        {/* Final */}
        {isFinal && (
          <View style={styles.infoWrapper}>
            <Text style={styles.finalText}>{gameStatusDetail}</Text>
            <View style={styles.finalStatusDivider} />
            <Text style={styles.finalText}>{formattedDate}</Text>
          </View>
        )}

        {(isDelayed ||
          isCanceled ||
          isPostponed ||
          isForfeited ||
          isSuspended) && (
          <Text style={styles.finalText}>{gameStatusDescription}</Text>
        )}
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <View style={styles.teamSection}>
        {!isChampionship && <View style={styles.leftCircle} />}
        <Image
          source={awayLogo}
          style={styles.logo}
          accessibilityLabel={`${awayName} logo`}
        />
        <Text
          style={styles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.5}
        >
          {awayRank && <Text style={styles.rank}>{awayRank} </Text>}
          {awayName}
        </Text>
      </View>

      <ScoreText score={awayScore} record={awayRecord} isWinner={awayWins} />

      <View style={styles.headlineContainer}>
        <Text style={[styles.headlineText]}>{headline}</Text>
      </View>

      <View style={styles.info}>{renderStatus()}</View>

      <ScoreText score={homeScore} record={homeRecord} isWinner={homeWins} />

      <View style={styles.teamSection}>
        {!isChampionship && <View style={styles.rightCircle} />}
        <Image
          source={homeLogo}
          style={styles.logo}
          accessibilityLabel={`${homeName} logo`}
        />
        <Text
          style={styles.teamName}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.5}
        >
          {homeRank && <Text style={styles.rank}>{homeRank} </Text>}
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
        <BlurView intensity={100} tint="systemMaterial" style={styles.card}>{renderCardContent()}</BlurView>
      )}
    </TouchableOpacity>
  );
}

export default memo(BaseballGameCard);
