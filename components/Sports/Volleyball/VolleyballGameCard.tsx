import { activeOpacity } from "@/constants/styles";
import { getMCVBTeam, getMCVBTeamLogo } from "@/constants/teamsMCVB";
import { getWCVBTeam, getWCVBTeamLogo } from "@/constants/teamsWCVB";
import { GameCardStyles } from "@/styles/GamecardStyles/GameCardStyles";
import { emptyAwayTeam, emptyHomeTeam } from "@/types/team";
import type { VolleyballGameCardProps } from "@/types/volleyball/volleyball";
import {
  formatDate,
  formatTime,
  getHolidayLabel,
  safeDate,
} from "@/utils/common/dateUtils";
import {
  formatPeriod,
  getBroadcastDisplay,
  winnerStyle,
} from "@/utils/games/games";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useScopedRouter } from "hooks/useScopedRouter";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { getVolleyballGameRoute } from "utils/navigation/volleyballGame";
import VolleyballSquareGameCard from "./VolleyballSquareGameCard";

function VolleyballGameCard({
  game,
  compact = false,
}: VolleyballGameCardProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const isMCVB = game.league.code === "mcvb";
  const isWCVB = game.league.code === "wcvb";
  const handlePress = () => {
    router.push(getVolleyballGameRoute(game));
  };

  const gameDate = safeDate(game.date);
  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);
  const holidayLabel = getHolidayLabel(gameDate);

  const homeId = game?.home?.id ?? 0;
  const awayId = game?.away?.id ?? 0;

  const home = isMCVB
    ? getMCVBTeam(homeId)
    : isWCVB
      ? getWCVBTeam(homeId)
      : emptyHomeTeam;

  const away = isMCVB
    ? getMCVBTeam(awayId)
    : isWCVB
      ? getWCVBTeam(awayId)
      : emptyAwayTeam;

  const homeName = home?.shortName ?? home?.name ?? game?.home?.name;
  const awayName = away?.shortName ?? away?.name ?? game?.away?.name;

  const homeLogo =
    home?.id === emptyHomeTeam.id
      ? emptyHomeTeam.logo
      : isMCVB
        ? getMCVBTeamLogo(homeId, isDark)
        : isWCVB
          ? getWCVBTeamLogo(homeId, isDark)
          : emptyAwayTeam;

  const awayLogo =
    away?.id === emptyAwayTeam.id
      ? emptyAwayTeam.logo
      : isMCVB
        ? getMCVBTeamLogo(awayId, isDark)
        : isWCVB
          ? getWCVBTeamLogo(awayId, isDark)
          : emptyAwayTeam;

  const headline = game.headline ?? holidayLabel;
  const state = game?.status?.state;
  const gameStatusDescription = game?.status.description ?? "";
  const gameStatusDetail = game?.status.shortDetail ?? "";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const isScheduled = state === "pre";
  const inProgress = state === "in";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeited";
  const isSuspended = gameStatusDescription === "Suspended";
  const endOfPeriod = gameStatusDescription === "End of Period";
  const period = formatPeriod({ period: game.status.period });
  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const homeRecord = game?.home?.record ?? "0-0";
  const awayRecord = game?.away?.record ?? "0-0";
  const homeScore = game?.home?.score ?? 0;
  const awayScore = game?.away?.score ?? 0;
  const homeRank = game?.home?.rank ?? null;
  const awayRank = game?.away?.rank ?? null;
  const headlineMatch = game?.headline?.toLowerCase();
  const isChampionship = headlineMatch?.includes("national championship");
  const styles = GameCardStyles(isDark, isChampionship);

  // -----------------------------------------------------
  // SCORE TEXT COMPONENT
  // -----------------------------------------------------
  const homeWins = game.home.winner ?? false;
  const awayWins = game.away.winner ?? false;
  const isTie = game.home.winner === game.away.winner;

  const ScoreText = ({
    score,
    record,
    isWinner,
  }: {
    score: number;
    record: string | undefined;
    isWinner: boolean;
  }) => {
    const showRecord = isScheduled;

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
    if (inProgress) {
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.date}>{period}</Text>
        </View>
      );
    }

    if (endOfPeriod) {
      return <Text style={styles.clock}>End of {period}</Text>;
    }

    if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended) {
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
        <Image source={awayLogo} style={styles.logo} contentFit="contain" />

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

      <View style={styles.teamSection}>
        <ScoreText score={awayScore} record={awayRecord} isWinner={awayWins} />
      </View>

      <View style={styles.headlineContainer}>
        <Text style={[styles.headlineText]}>{headline}</Text>
      </View>

      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>

      <View style={styles.teamSection}>
        <ScoreText score={homeScore} record={homeRecord} isWinner={homeWins} />
      </View>

      <View style={styles.teamSection}>
        <Image source={homeLogo} style={styles.logo} contentFit="contain" />
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

  if (compact)
    return (
      <VolleyballSquareGameCard game={game} isMCVB={isMCVB} isWCVB={isWCVB} />
    );
  return (
    <TouchableOpacity activeOpacity={activeOpacity} onPress={handlePress}>
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
export default memo(VolleyballGameCard);
