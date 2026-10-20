import { Image, Text, View } from "react-native";
import type { TournamentTeam } from "hooks/BasketballHooks/useTournamentBracket";
import { getTournamentTeamLogo } from "./teamLogo";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

type TeamRowProps = {
  team: TournamentTeam | null;
  winner: boolean;
  gameHasWinner: boolean;
  isDark: boolean;
  league: string;
  showScore?: boolean;
};
const getTeamName = (team: TournamentTeam | null): string =>
  team?.code || team?.shortName || team?.name || "TBD";
export function TeamRow({
  team,
  winner,
  gameHasWinner: hasWinner,
  isDark,
  league,
  showScore = true,
}: TeamRowProps) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const isPlaceholder = team === null;

  const teamLogo = getTournamentTeamLogo(team?.id, league, isDark);

  return (
    <View
      style={[
        styles.teamRow,
        hasWinner && !winner && !isPlaceholder ? styles.loserText : undefined,
      ]}
    >
      <View style={styles.teamInfo}>
        {team?.seed !== null && team?.seed !== undefined ? (
          <View style={styles.seedContainer}>
            <Text style={styles.seedText}>{team.seed}</Text>
          </View>
        ) : (
          <View style={styles.seedPlaceholder} />
        )}

        <Image source={teamLogo} style={styles.teamLogo} resizeMode="contain" />

        <View style={styles.teamNameWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.teamName,
              isPlaceholder ? styles.placeholderName : undefined,
              winner ? styles.winnerText : undefined,
            ]}
          >
            {getTeamName(team)}
          </Text>
        </View>
      </View>

      <Text style={[styles.score, winner ? styles.winnerText : undefined]}>
        {showScore ? (team?.score ?? "") : ""}
      </Text>
    </View>
  );
}
