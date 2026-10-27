import {
  getNBATeam,
  getNBATeamLogo,
  getTeamBySummerId,
} from "@/constants/teams";
import { getCBTeam, getCBTeamLogo } from "@/constants/teamsCB";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
import { getGLeagueTeam, getGLeagueTeamLogo } from "@/constants/teamsGLeague";
import { getMCBBTeam, getMCBBTeamLogo } from "@/constants/teamsMCBB";
import { getMLBTeam, getMLBTeamLogo } from "@/constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "@/constants/teamsNFL";
import { getSBTeam, getSBTeamLogo } from "@/constants/teamsSB";
import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getWNBATeam, getWNBATeamLogo } from "@/constants/teamsWNBA";
import { activeOpacity, Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useScopedRouter } from "hooks/useScopedRouter";
import { Text, TouchableOpacity, View } from "react-native";
import { ChampionshipGameCardStyles } from "styles/GamecardStyles/ChampionshipGameCardStyles";
import { formatDate, formatTime, safeDate } from "utils/common/dateUtils";
import {
  formatPeriod,
  getBroadcastDisplay,
  winnerStyle,
} from "utils/games/games";

interface ChampionshipGameCardProps {
  game: any;
  isMCBB?: boolean;
  isWCBB?: boolean;
  isWNBA?: boolean;
  isSL?: boolean;
  isGLEAGUE?: boolean;
  isNFL?: boolean;
  isCFB?: boolean;
  isNHL?: boolean;
  isMLB?: boolean;
  isCB?: boolean;
  isSB?: boolean;
}

type TeamSide = {
  id?: string | number;
  name?: string;
  score?: number;
  record?: string;
  rank?: number;
  winner?: boolean;
};

export default function ChampionshipGameCard({
  game,
  isMCBB = false,
  isWCBB = false,
  isWNBA = false,
  isSL = false,
  isGLEAGUE = false,
  isNFL = false,
  isCFB = false,
  isMLB = false,
  isNHL = false,
  isCB = false,
  isSB = false,
}: ChampionshipGameCardProps) {
  const router = useScopedRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = ChampionshipGameCardStyles(isDark);
  const league = game?.league?.id;

  const home: TeamSide = game?.home ?? {};
  const away: TeamSide = game?.away ?? {};

  const homeId = home.id ?? 0;
  const awayId = away.id ?? 0;

  const getTeam = (teamId: string | number) => {
    if (isMCBB) {
      return getMCBBTeam(teamId);
    }

    if (isWCBB) {
      return getWCBBTeam(teamId);
    }

    if (isWNBA) {
      return getWNBATeam(teamId);
    }

    if (isSL) {
      return getTeamBySummerId(teamId);
    }

    if (isGLEAGUE) {
      return getGLeagueTeam(teamId);
    }

    if (isNFL) {
      return getNFLTeam(teamId);
    }

    if (isCFB) {
      return getCFBTeam(teamId);
    }

    if (isMLB) {
      return getMLBTeam(teamId);
    }
    if (isCB) {
      return getCBTeam(teamId);
    }
    if (isSB) {
      return getSBTeam(teamId);
    }
    return getNBATeam(teamId);
  };

  const getTeamLogo = (teamId?: string | number) => {
    if (isMCBB) {
      return getMCBBTeamLogo(teamId, isDark);
    }

    if (isWCBB) {
      return getWCBBTeamLogo(teamId, isDark);
    }

    if (isWNBA) {
      return getWNBATeamLogo(teamId, isDark);
    }

    if (isGLEAGUE) {
      return getGLeagueTeamLogo(teamId, isDark);
    }

    if (isNFL) {
      return getNFLTeamLogo(teamId, isDark);
    }

    if (isCFB) {
      return getCFBTeamLogo(teamId, isDark);
    }

    if (isMLB) {
      return getMLBTeamLogo(teamId, isDark);
    }
    if (isCB) {
      return getCBTeamLogo(teamId, isDark);
    }
    if (isSB) {
      return getSBTeamLogo(teamId, isDark);
    }

    return getNBATeamLogo(teamId, isDark);
  };

  const homeTeam = getTeam(homeId);
  const awayTeam = getTeam(awayId);

  const homeLogo = getTeamLogo(homeId);
  const awayLogo = getTeamLogo(awayId);

  const homeName = homeTeam?.shortName || homeTeam?.name || home.name || "Home";
  const awayName = awayTeam?.shortName || awayTeam?.name || away.name || "Away";

  const gameDate = safeDate(game?.date);

  const formattedDate = formatDate(gameDate);
  const formattedTime = formatTime(gameDate);

  const homeScore = home.score ?? 0;
  const awayScore = away.score ?? 0;

  const homeRecord = home.record ?? "0-0";
  const awayRecord = away.record ?? "0-0";

  const homeRank = home.rank;
  const awayRank = away.rank;

  const homeWins = Boolean(home.winner);
  const awayWins = Boolean(away.winner);

  const isTie = homeWins === awayWins;

  const status = game?.status ?? {};
  const headline = game.headline;

  const gameStatusDescription = status.description;
  const gameStatusDetail = status.shortDetail;
  const tbd = gameStatusDetail?.includes("TBD") ? "TBD" : null;

  const isFinal = gameStatusDescription === "Final";
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";

  const isCanceled = gameStatusDescription === "Canceled";
  const isDelayed = gameStatusDescription === "Delayed";
  const isPostponed = gameStatusDescription === "Postponed";
  const isForfeited = gameStatusDescription === "Forfeit";
  const isSuspended = gameStatusDescription === "Suspended";

  const isHalftime = gameStatusDescription === "Halftime";
  const endOfPeriod = gameStatusDescription === "End of Period";

  const period = formatPeriod({
    period: status.period,
    isMCBB: isMCBB || isWCBB,
  });

  const clock = status.displayClock;

  const broadcast = getBroadcastDisplay(game?.broadcasts);

  const showRecordAsScore =
    isScheduled || isCanceled || isPostponed || isDelayed;

  const handlePress = () => {
    let pathname:
      | "/game/basketball/[game]"
      | "/game/football/[game]"
      | "/game/baseball/[game]"
      | "/game/hockey/[game]";

    if (isNFL || isCFB) {
      pathname = "/game/football/[game]";
    } else if (isMLB) {
      pathname = "/game/baseball/[game]";
    } else if (isNHL) {
      pathname = "/game/hockey/[game]";
    } else {
      pathname = "/game/basketball/[game]";
    }

    router.push({
      pathname,
      params: {
        game: String(game.id),
        leagueId: String(league ?? ""),
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
  };

  const renderStatus = () => {
    if (inProgress) {
      return (
        <View style={styles.infoWrapper}>
          <Text style={styles.period}>{period}</Text>
          <View style={styles.statusDivider} />
          <Text style={styles.clock}>{clock}</Text>
        </View>
      );
    }

    if (isDelayed || isCanceled || isPostponed || isForfeited || isSuspended) {
      return <Text style={styles.finalText}>{gameStatusDescription}</Text>;
    }

    if (endOfPeriod) {
      return <Text style={styles.clock}>End of {period}</Text>;
    }

    if (isHalftime) {
      return <Text style={styles.clock}>Halftime</Text>;
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

  const ScoreText = ({
    score,
    record,
    isWinner,
  }: {
    score: number;
    record: string;
    isWinner: boolean;
  }) => {
    if (showRecordAsScore) {
      return <Text style={styles.teamRecord}>{record}</Text>;
    }

    return (
      <Text
        style={[
          styles.teamScore,
          winnerStyle({
            isWinner,
            isTie,
            isDark,
          }),
        ]}
      >
        {score}
      </Text>
    );
  };

  const gradientColors = isDark
    ? (["#846f4a", Colors.dark.background] as const)
    : (["#dbb145", Colors.light.background] as const);

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={handlePress}
      style={styles.container}
    >
      <LinearGradient
        colors={gradientColors}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.card}
      >
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText}>{headline}</Text>
        </View>

        <View style={styles.matchupRow}>
          {/* Away */}
          <View style={styles.teamSection}>
            <Image
              source={awayLogo}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel={`${awayName} logo`}
            />

            <Text style={styles.teamName} numberOfLines={2}>
              {awayRank ? <Text style={styles.rank}>#{awayRank} </Text> : null}
              {awayName}
            </Text>
          </View>
          {ScoreText({
            score: awayScore,
            record: awayRecord,
            isWinner: awayWins,
          })}

          {/* Center */}

          <View style={styles.info}>
            {renderStatus()}
            {!isFinal && broadcast ? (
              <Text style={styles.broadcast} numberOfLines={2}>
                {broadcast}
              </Text>
            ) : null}
          </View>

          {ScoreText({
            score: homeScore,
            record: homeRecord,
            isWinner: homeWins,
          })}
          {/* Home */}
          <View style={styles.teamSection}>
            <Image
              source={homeLogo}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel={`${homeName} logo`}
            />

            <Text style={styles.teamName} numberOfLines={2}>
              {homeRank ? <Text style={styles.rank}>#{homeRank} </Text> : null}

              {homeName}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
