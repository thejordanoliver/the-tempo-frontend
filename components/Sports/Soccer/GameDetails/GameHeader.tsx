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
  homeWins: boolean | undefined | null;
  awayWins: boolean | undefined | null;
  date: string;
  headline: string | null;
  period?: number | string;
  clock?: string;
  time: string;
  broadcast?: string | undefined;
  homeRecord: string;
  awayRecord: string;
  gameStatusDescription: string;
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
  homeRecord,
  awayRecord,
  gameStatusDetail,
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
          key={`away`}
          id={awayId}
          logo={awayLogo}
          name={awayName}
          score={awayScore}
          rank={awayRank}
          isWinner={awayWins}
          record={awayRecord}
          gameStatusDescription={gameStatusDescription}
          isHome={false}
          isDark={isDark}
          league={league}
        />

        <CenterInfo
          gameStatusDescription={gameStatusDescription}
          gameStatusShortDescription={gameStatusDetail}
          date={date}
          time={time}
          isDark={isDark}
          broadcast={broadcast}
          period={period}
          clock={clock}
        />

        <TeamRow
          key={`home`}
          id={homeId}
          logo={homeLogo}
          name={homeName}
          rank={homeRank}
          score={homeScore}
          isWinner={homeWins}
          record={homeRecord}
          gameStatusDescription={gameStatusDescription}
          isHome={true}
          isDark={isDark}
          league={league}
        />
      </View>
    </View>
  );
}
