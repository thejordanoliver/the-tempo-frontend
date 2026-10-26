import { Text, View } from "react-native";
import type { TournamentGame } from "hooks/BasketballHooks/useTournamentBracket";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
} from "utils/brackets/tournamentBracketLayout";
import {
  gameHasWinner,
  isTeamWinner,
  type DisplayTeamPair,
} from "utils/brackets/tournamentBracket.utils";
import { isGameFinalStatus } from "utils/games/gameStatus";
import { TeamRow } from "./TeamRow";
import { GameStatus } from "./GameStatus";

type MatchupCardProps = {
  game?: TournamentGame | null;
  displayTeams?: DisplayTeamPair;
  isDark: boolean;
  championship?: boolean;
  league: string;
};

export function MatchupCard({
  game,
  displayTeams,
  isDark,
  championship = false,
  league,
}: MatchupCardProps) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const teams = displayTeams ?? [
    game?.homeTeam ?? null,
    game?.awayTeam ?? null,
  ];
  const hasWinner = game ? gameHasWinner(game) : false;
  const showScore = Boolean(
    game && (game.status.state === "in" || isGameFinalStatus(game.status)),
  );
  const renderTeam = (team: DisplayTeamPair[number]) => (
    <TeamRow
      team={team}
      winner={game ? isTeamWinner(game, team) : false}
      gameHasWinner={hasWinner}
      showScore={showScore}
      isDark={isDark}
      league={game?.league?.code || league}
    />
  );

  return (
    <View
      style={[
        styles.matchupCard,
        styles.matchupCardCompact,
        championship ? styles.championshipCard : undefined,
        !game ? styles.cardDisabled : undefined,
        { width: CARD_WIDTH, height: CARD_HEIGHT },
      ]}
    >
      {renderTeam(teams[0])}
      <View style={styles.divider} />
      {renderTeam(teams[1])}
      {game && (
        <View style={styles.statusContainer}>
          {game.broadcast ? (
            <Text numberOfLines={1} style={styles.broadcast}>
              {game.broadcast}
            </Text>
          ) : null}
          <GameStatus game={game} isDark={isDark} league={league} />
        </View>
      )}
    </View>
  );
}
