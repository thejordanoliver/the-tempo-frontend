import { Colors } from "constants/styles";
import { View } from "react-native";
import { NFLPlayoffBracketStyles } from "styles/PlayoffStyles/NFLPlayoffBracketStyles";
import type {
  CardLayout,
  PlayoffGame,
} from "../../../../../types/football/nflBracketTypes";
import { TeamRow } from "./TeamRow";

export const MatchupCard = ({
  game,
  layout,
  isDark,
  finals = false,
}: {
  game: PlayoffGame | null;
  layout: CardLayout;
  isDark: boolean;
  finals?: boolean;
}) => {
  const styles = NFLPlayoffBracketStyles(isDark);

  const gameCompleted = game?.status?.completed ?? false;

  return (
    <View
      style={[
        styles.cardShell,
        finals && styles.finalsShell,
        {
          left: layout.x,
          top: layout.y,
          width: layout.width,
          height: layout.height,

          borderColor:
            finals && isDark
              ? Colors.dark.gold
              : finals
                ? Colors.light.gold
                : isDark
                  ? Colors.darkGray
                  : Colors.lightGray,

          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
        },
      ]}
    >
      <TeamRow
        team={game?.away}
        gameCompleted={gameCompleted}
        isDark={isDark}
      />

      <View style={styles.divider} />

      <TeamRow
        team={game?.home}
        gameCompleted={gameCompleted}
        isDark={isDark}
      />
    </View>
  );
};
