import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { Team } from "types/types";
import { GameInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  home: Team | null;
  away: Team | null;
  awayLogo: any;
  homeLogo: any;
  rankHome?: number;
  rankAway?: number;
  homeScore: number;
  awayScore: number;
  homeBonusState?: string | null;
  awayBonusState?: string | null;
  homeTimeouts?: number;
  awayTimeouts?: number;
  period?: number;
  displayClock?: string;
  isDark: boolean;
  formattedDate?: string;
  headlineText?: string;
  time?: string;
  networkString?: string;
  seriesSummary?: string;
  homeRecord?: string;
  awayRecord?: string;
  halftime?: boolean;
  league?: "nba";
  gameStatusDetail: string;
  gameStatusDescription: string | undefined;
};

export default function GameHeader({
  headlineText,
  home,
  away,
  awayLogo,
  homeLogo,
  rankHome,
  rankAway,
  homeScore,
  homeBonusState,
  awayBonusState,
  awayScore,
  homeTimeouts = 0,
  awayTimeouts = 0,
  period,
  displayClock,
  isDark,
  formattedDate = "",
  time = "",
  networkString = "",
  homeRecord,
  awayRecord,
  halftime,
  league = "nba",
  gameStatusDetail,
  gameStatusDescription,
}: Props) {
  const styles = gameHeaderStyles(isDark);

  const awayIsWinner =
    gameStatusDescription === "Final" && (awayScore ?? 0) > (homeScore ?? 0);
  const homeIsWinner =
    gameStatusDescription === "Final" && (homeScore ?? 0) > (awayScore ?? 0);

  return (
    <View style={styles.container}>
      {headlineText ? (
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={2}>
            {headlineText}
          </Text>
        </View>
      ) : null}

      <View style={styles.teamsContainer}>
        {/* Away Team Row */}
        <TeamRow
          key={`away`}
          team={{
            id: away?.id,
            code: away?.code,
            name: away?.name,
            record: awayRecord,
            logo: awayLogo,
          }}
          isDark={isDark}
          bonusState={awayBonusState}
          rank={rankAway}
          score={awayScore}
          isWinner={awayIsWinner}
          timeouts={awayTimeouts}
          gameStatusDescription={gameStatusDescription}
        />

        {/* Game Info */}
        <GameInfo
          date={formattedDate || new Date().toISOString()}
          time={time}
          clock={displayClock}
          period={period}
          isDark={isDark}
          broadcastNetworks={networkString}
          gameStatusShortDescription={gameStatusDetail}
          gameStatusDescription={gameStatusDescription}
        />

        {/* Home Team Row */}
        <TeamRow
          key={`home`}
          team={{
            id: home?.id,
            code: home?.code,
            name: home?.name,
            record: homeRecord,
            logo: homeLogo,
          }}
          isDark={isDark}
          rank={rankHome}
          isHome
          score={homeScore}
          bonusState={homeBonusState}
          isWinner={homeIsWinner}
          timeouts={league === "nba" ? homeTimeouts : undefined}
          gameStatusDescription={gameStatusDescription}
        />
      </View>
    </View>
  );
}
