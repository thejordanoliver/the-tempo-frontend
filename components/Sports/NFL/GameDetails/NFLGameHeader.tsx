import { getNFLTeamsLogo } from "constants/teamsNFL";
import { Text, View } from "react-native";
import { gameHeaderStyles } from "styles/GameDetailStyles/GameHeaderStyles";
import { NFLTeam } from "types/nfl";
import { NFLGameCenterInfo } from "./GameInfo";
import { TeamRow } from "./TeamRow";

type Props = {
  homeTeam: NFLTeam;
  awayTeam: NFLTeam;
  homeScore: number;
  awayScore:number;
  possessionTeamId?: number;
  homeTimeouts?: number;
  awayTimeouts?: number;
  period?: string;
  displayClock?: string;
  possessionText?: string;
  isDark: boolean;
  homeRecord?: string;
  awayRecord?: string;
  formattedDate?: string;
  formattedTime?: string;
  broadcast?: string;
  headlineText?: string;
  gameStatusShortDetail?: string;
  gameStatusDescription?: string;
  redzone: boolean;
};

export default function NFLGameHeader({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  possessionTeamId,
  homeTimeouts = 0,
  awayTimeouts = 0,
  period,
  displayClock,
  possessionText,
  isDark,
  homeRecord,
  awayRecord,
  broadcast = "",
  formattedDate = "",
  formattedTime = "",
  headlineText,
  gameStatusShortDetail,
  gameStatusDescription,
  redzone = false,
}: Props) {
  const styles = gameHeaderStyles(isDark);

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
        {/* Away Team */}
        <TeamRow
          team={{
            id: String(awayTeam.id),
            espnID: String(awayTeam.espnID),
            code: awayTeam.code,
            name: awayTeam.name,
            logo: getNFLTeamsLogo(awayTeam.id, isDark),
            record: awayRecord ?? "0-0",
          }}
          isDark={isDark}
          isHome={false}
          score={awayScore}
          opponentScore={homeScore}
          isWinner={awayScore > homeScore}
          possessionTeamId={possessionTeamId}
          timeouts={awayTimeouts}
          league="nfl"
          gameStatusDescription={gameStatusDescription}
        />

        <View>
          {/* Game Info */}
          <NFLGameCenterInfo
            date={formattedDate}
            time={formattedTime}
            period={period}
            clock={displayClock}
            isDark={isDark}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            broadcast={broadcast}
            downAndDistance={possessionText}
            gameStatusShortDetail={gameStatusShortDetail}
            gameStatusDescription={gameStatusDescription}
            redzone={redzone}
          />
        </View>

        {/* Home Team */}
        <TeamRow
          team={{
            id: String(homeTeam.id),
            espnID: String(homeTeam.espnID),
            code: homeTeam.code,
            name: homeTeam.name,
            logo: getNFLTeamsLogo(homeTeam.id, isDark),
            record: homeRecord ?? "0-0",
          }}
          isDark={isDark}
          isHome
          score={homeScore}
          opponentScore={awayScore}
          isWinner={homeScore > awayScore}
          possessionTeamId={possessionTeamId}
          timeouts={homeTimeouts}
          league="nfl"
          gameStatusDescription={gameStatusDescription}
        />
      </View>
    </View>
  );
}
