import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { CenterInfo } from "./CenterInfo";
import { TeamRow } from "./TeamRow";

type GameHeaderProps = {
  homeId: number;
  awayId: number;
  awayLogo: any;
  homeLogo: any;
  homeName: string;
  awayName: string;
  homeRank: number | null | undefined;
  awayRank: number | null | undefined;
  homeScore: number;
  awayScore: number;
  homeTimeouts?: number | null;
  awayTimeouts?: number | null;
  period?: number | string | null;
  clock: string;
  downDistance: string | undefined | null;
  awayPossesion: boolean | null;
  homePossesion: boolean | null;
  homeWins: boolean | null;
  awayWins: boolean | null;
  isDark: boolean;
  homeRecord: string | undefined;
  awayRecord: string | undefined;
  date: string;
  time: string;
  broadcast: string;
  headline: string | null;
  gameStatusShortDetail: string;
  gameStatusDescription: string;
  league: string;
  redzone: boolean | undefined;
};

export default function GameHeader({
  homeId,
  awayId,
  awayLogo,
  homeLogo,
  homeName,
  awayName,
  homeRank,
  awayRank,
  homeWins,
  awayWins,
  homeScore,
  awayScore,
  awayPossesion,
  homePossesion,
  homeTimeouts = 0,
  awayTimeouts = 0,
  period,
  clock,
  downDistance,
  isDark,
  homeRecord,
  awayRecord,
  broadcast = "",
  date = "",
  time = "",
  headline,
  gameStatusShortDetail,
  gameStatusDescription,
  league,
  redzone = false,
}: GameHeaderProps) {
  const styles = gameHeaderStyles(isDark);

  return (
    <View style={styles.container}>
      {headline ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={2}>
            {headline}
          </Text>
        </View>
      ) : null}
      <View style={styles.teamsContainer}>
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
          hasPossession={awayPossesion}
          isDark={isDark}
          league={league}
          isHome={false}
        />

        <CenterInfo
          date={date}
          time={time}
          period={period}
          clock={clock}
          isDark={isDark}
          broadcast={broadcast}
          downDistance={downDistance}
          gameStatusShortDetail={gameStatusShortDetail}
          gameStatusDescription={gameStatusDescription}
          redzone={redzone}
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
          hasPossession={homePossesion}
          isDark={isDark}
          league={league}
          isHome={true}
        />
      </View>
    </View>
  );
}
