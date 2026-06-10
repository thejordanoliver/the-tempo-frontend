import { getHolidayLabel } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "constants/styles";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { gameCardStyles } from "styles/GamecardStyles/GameCardStyles";
import { BaseballGameCardProps } from "types/baseball";
import { getBroadcastDisplay } from "utils/games";
import { BasesIndicator } from "../GameDetails/BasesIndicator";

function BaseballGameCard({ game, isCB, isSB }: BaseballGameCardProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const handlePress = () => {
    router.push({
      pathname: "/game/baseball/[game]",
      params: {
        game: String(game.id),
        leagueId: String(league),
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
  };

  const gameDateObj = new Date(game.date);
  const formattedDate = gameDateObj.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const formattedTime = gameDateObj.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const league = game?.league?.id;

  const home = game?.home;
  const away = game?.away;
  const homeId = home?.id;
  const awayId = away?.id;

  const homeTeam = isSB
    ? getSBTeam(homeId)
    : isCB
      ? getCBTeam(homeId)
      : getMLBTeam(homeId);
  const awayTeam = isSB
    ? getSBTeam(awayId)
    : isCB
      ? getCBTeam(awayId)
      : getMLBTeam(awayId);

  const homeName = homeTeam?.shortName ?? homeTeam?.name;
  const awayName = awayTeam?.shortName ?? awayTeam?.name;

  const homeLogo = isSB
    ? getSBTeamLogo(homeId, isDark)
    : isCB
      ? getCBTeamLogo(homeId, isDark)
      : getMLBTeamLogo(homeId, isDark);

  const awayLogo = isSB
    ? getSBTeamLogo(awayId, isDark)
    : isCB
      ? getCBTeamLogo(awayId, isDark)
      : getMLBTeamLogo(awayId, isDark);

  const isChampionship = game?.season.slug === "championship-series";
  const styles = gameCardStyles(isDark, isChampionship);
  const broadcasts = game?.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);
  const gameStatusDescription = game.status.description ?? "";
  const gameStatusDetail = game.status.shortDetail ?? "";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isSuspended = gameStatusDescription === "Suspended";
  const isForfeited = gameStatusDescription === "Forfeited";
  const endOfInning = gameStatusDescription === "End of Inning";
  const homeScore = home?.score;
  const awayScore = away?.score;
  const homeRecord = home?.record;
  const awayRecord = away?.record;
  const homeRank = home?.homeRank;
  const awayRank = away?.awayRank;
  const isTopInning = gameStatusDetail.includes("Top");
  const holidayLabel = getHolidayLabel(gameDateObj);
  const headline = game.headline ?? holidayLabel;
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
  const homeWins = (homeScore ?? 0) > (awayScore ?? 0);
  const awayWins = (awayScore ?? 0) > (homeScore ?? 0);
  const isTie = (awayScore ?? 0) === (homeScore ?? 0);

  const winnerStyle = (teamWins: boolean) => ({
    color: isDark ? Colors.white : Colors.black,
    opacity: isFinal ? (isTie ? 1 : teamWins ? 1 : 0.5) : 1,
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
        <>
          <View style={styles.infoWrapper}>
            <Ionicons
              name={isTopInning ? "caret-up" : "caret-down"}
              size={14}
              color={isDark ? Colors.white : Colors.black}
            />
            <Text style={styles.period}>{gameStatusDetail}</Text>
            <View style={styles.statusDivider} />
            <View style={styles.outsContainer}>{getOuts}</View>
          </View>
          <View style={styles.basesContainer}>
            <BasesIndicator bases={bases} isDark={isDark} size={8} />
          </View>
        </>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;
    if (endOfInning)
      return <Text style={styles.clock}>{gameStatusDetail}</Text>;

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
      {/* Away Team */}
      <View style={styles.teamSection}>
        <Image
          source={awayLogo}
          style={styles.logo}
          accessibilityLabel={`${awayName} logo`}
        />
        <Text style={styles.teamName}>
          {awayRank && <Text style={styles.rank}>{awayRank} </Text>}
          {awayName}
        </Text>
      </View>
      {/* Away Score / Record */}
      <ScoreText score={awayScore} record={awayRecord} teamWins={awayWins} />

      {/* headlineText */}
      <View style={styles.headlineContainer}>
        <Text style={[styles.headlineText]}>{headline}</Text>
      </View>

      {/* Game Info */}
      <View style={styles.info}>
        {renderStatus()}
        {!isFinal && broadcast && (
          <Text style={styles.broadcast}>{broadcast}</Text>
        )}
      </View>

      {/* Home Score / Record */}
      <ScoreText score={homeScore} record={homeRecord} teamWins={homeWins} />

      {/* Home Team */}
      <View style={styles.teamSection}>
        <Image
          source={homeLogo}
          style={styles.logo}
          accessibilityLabel={`${homeName} logo`}
        />
        <Text style={styles.teamName}>
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

export default memo(BaseballGameCard);
