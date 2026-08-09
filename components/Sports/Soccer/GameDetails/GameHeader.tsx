import { ImageSourcePropType, Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { CenterInfo } from "./CenterInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  homeRank: number | undefined | null;
  awayRank: number | undefined | null;
  homeName: string;
  awayName: string;
  homeId: number;
  awayId: number;
  homeLogo: ImageSourcePropType;
  awayLogo: ImageSourcePropType;
  homeScore: number;
  awayScore: number;
  isDark: boolean;
  isTie: boolean | undefined | null;
  homeWins: boolean | undefined | null;
  awayWins: boolean | undefined | null;
  isAwayNational: boolean | undefined | null;
  isAwayAllStar: boolean | undefined | null;
  isHomeNational: boolean | undefined | null;
  isHomeAllStar: boolean | undefined | null;
  date: string;
  headline: string | null;
  period?: number | string;
  clock?: string;
  time: string;
  broadcast?: string | undefined;
  homeRecord: string;
  awayRecord: string;
  gameStatusDescription: string;
  state?: string | null;
  gameStatusDetail: string;
  league: string;
};

export default function GameHeader({
  headline,
  homeId,
  awayId,
  homeName,
  awayName,
  homeRank,
  awayRank,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  homeWins,
  awayWins,
  isAwayNational,
  isAwayAllStar,
  isHomeNational,
  isHomeAllStar,
  isTie,
  homeRecord,
  awayRecord,
  gameStatusDetail,
  state,
  gameStatusDescription,
  isDark,
  date,
  time,
  period,
  clock,
  broadcast,
  league,
}: Props) {
  const styles = gameHeaderStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.headlineContainer}>
        <Text style={styles.headlineText}>{headline}</Text>
      </View>

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          id={awayId}
          logo={awayLogo}
          name={awayName}
          score={awayScore}
          rank={awayRank}
          isTie={isTie}
          isWinner={awayWins}
          record={awayRecord}
          isHome={false}
          isDark={isDark}
          league={league}
          state={state}
          gameStatusDescription={gameStatusDescription}
          isNational={isAwayNational}
          isAllStar={isAwayAllStar}
        />

        <CenterInfo
          date={date}
          time={time}
          isDark={isDark}
          broadcast={broadcast}
          period={period}
          clock={clock}
          state={state}
          gameStatusDescription={gameStatusDescription}
          gameStatusDetail={gameStatusDetail}
        />

        <TeamRow
          id={homeId}
          logo={homeLogo}
          name={homeName}
          rank={homeRank}
          score={homeScore}
          isTie={isTie}
          isWinner={homeWins}
          record={homeRecord}
          isHome={true}
          isDark={isDark}
          league={league}
          state={state}
          gameStatusDescription={gameStatusDescription}
          isNational={isHomeNational}
          isAllStar={isHomeAllStar}
        />
      </View>
    </View>
  );
}
