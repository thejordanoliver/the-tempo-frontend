import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  homeId: number | null;
  awayId: number | null;
  homeName: string;
  awayName: string;
  awayLogo: any;
  homeLogo: any;
  homeRank?: number;
  awayRank?: number;
  homeScore: number;
  awayScore: number;
  homeTimeouts?: number;
  awayTimeouts?: number;
  homeWins: boolean;
  awayWins: boolean;
  period: string | number;
  clock: string;
  isDark: boolean;
  date: string | undefined;
  time: string | undefined;
  headline: string;
  broadcast: string;
  homeRecord: string;
  awayRecord: string;
  gameStatusDetail: string;
  gameStatusDescription: string;
  league: string;
};

export default function GameHeader({
  headline,
  homeId,
  awayId,
  homeLogo,
  awayLogo,
  homeName,
  awayName,
  homeRank,
  awayRank,
  homeScore,
  awayScore,
  homeWins,
  awayWins,
  homeTimeouts = 0,
  awayTimeouts = 0,
  period,
  clock,
  isDark,
  date = "",
  time = "",
  broadcast,
  homeRecord,
  awayRecord,
  gameStatusDetail,
  gameStatusDescription,
  league = "NHL",
}: Props) {
  const styles = gameHeaderStyles(isDark);

  return (
    <View style={styles.container}>
      {headline && (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={2}>
            {headline}
          </Text>
        </View>
      )}

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          id={awayId}
          name={awayName}
          logo={awayLogo}
          rank={awayRank}
          score={awayScore}
          record={awayRecord}
          isWinner={awayWins}
          timeouts={awayTimeouts}
          gameStatusDescription={gameStatusDescription}
          isDark={isDark}
          isHome={false}
          league={league}
        />

        {/* Game Info */}
        <GameInfo
          date={date}
          time={time}
          clock={clock}
          period={period}
          isDark={isDark}
          broadcast={broadcast}
          gameStatusShortDescription={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
        />

        <TeamRow
          id={homeId}
          name={homeName}
          logo={homeLogo}
          rank={homeRank}
          score={homeScore}
          record={homeRecord}
          isWinner={homeWins}
          timeouts={homeTimeouts}
          gameStatusDescription={gameStatusDescription}
          isDark={isDark}
          isHome={true}
          league={league}
        />
      </View>
    </View>
  );
}
