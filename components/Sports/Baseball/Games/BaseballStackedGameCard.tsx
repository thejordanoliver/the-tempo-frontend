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
import { stackedGameCardStyles } from "styles/GamecardStyles/StackedGameCardStyles";
import { BaseballGameCardProps } from "types/baseball";
import { getBroadcastDisplay } from "utils/games";
import { BasesIndicator } from "../GameDetails/BasesIndicator";

function BaseballStackedGameCard({ game, isSB, isCB }: BaseballGameCardProps) {
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
    ? getSBTeam(home?.id)
    : isCB
      ? getCBTeam(home?.id)
      : getMLBTeam(home?.id);

  const awayTeam = isSB
    ? getSBTeam(away?.id)
    : isCB
      ? getCBTeam(away?.id)
      : getMLBTeam(away?.id);

  const homeTeamId = homeTeam?.id ?? 0;
  const awayTeamId = awayTeam?.id ?? 0;
  const homeName = homeTeam?.fullName;
  const awayName = awayTeam?.fullName;

  const homeLogo = isSB
    ? getSBTeamLogo(homeId, isDark)
    : isCB
      ? getCBTeamLogo(homeId, isDark)
      : getMLBTeamLogo(homeTeamId, isDark);

  const awayLogo = isSB
    ? getSBTeamLogo(awayId, isDark)
    : isCB
      ? getCBTeamLogo(awayId, isDark)
      : getMLBTeamLogo(awayTeamId, isDark);

  const isChampionship = game?.season.slug === "championship-series";
  const styles = stackedGameCardStyles(isDark, isChampionship);
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
  const homeScore = game?.home?.score;
  const awayScore = game?.away?.score;
  const homeRecord = game.home.record;
  const awayRecord = game.away.record;
  const homeRank = game.home.homeRank;
  const awayRank = game.away.awayRank;
  const isTopInning = gameStatusDetail.includes("Top");
  const headline = game.headline;
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
        <View>
          <View style={styles.outsContainer}>
            <Ionicons
              size={10}
              name={isTopInning ? "caret-up" : "caret-down"}
              color={isDark ? Colors.white : Colors.black}
            />
            <Text style={styles.period}>{gameStatusDetail}</Text>
          </View>
          <View style={styles.basesContainer}>
            <BasesIndicator bases={bases} isDark={isDark} size={8} />
          </View>
          <View style={styles.outsContainer}>{getOuts}</View>
        </View>
      );

    if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended)
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;
    if (endOfInning)
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
        <Text style={styles.date}>{formattedTime}</Text>
      </View>
    );
  };

  const renderCardContent = () => (
    <>
      <Text style={styles.headlineText}>{headline}</Text>
      <View style={styles.cardWrapper}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamWrapper}>
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
            <Text style={styles.teamName}>
              {homeRank && <Text style={styles.rank}>{homeRank} </Text>}
              {homeName}
            </Text>
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

export default memo(BaseballStackedGameCard);
