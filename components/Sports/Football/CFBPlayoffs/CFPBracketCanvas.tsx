import type { FootballGame } from "@/types/football/football";
import { ScrollView, Text, View } from "react-native";
import {
  BYE_Y,
  CFPBracketStyles,
  CHAMPIONSHIP_CARD_WIDTH,
  CHAMPIONSHIP_X,
  FIRST_ROUND_X,
  FIRST_ROUND_Y,
  QUARTERFINAL_X,
  QUARTERFINAL_Y,
  SEMIFINAL_X,
  SEMIFINAL_Y,
  snapBracketOffsets,
} from "../../../../styles/PlayoffStyles/CFPBracketStyles";
import type {
  CFPBracketData,
  CFPRoundDates,
  FootballTeam,
} from "../../../../types/football/cfpBracketTypes";
import { BracketConnectors } from "./BracketConnectors";
import { BracketGameCard } from "./BracketGameCard";
import { BracketRoundHeader } from "./BracketRoundHeader";
import { CFPByeTeamCard } from "./CFPByeTeamCard";
import { CFPChampionshipCard } from "./CFPChampionshipCard";

type CFPBracketCanvasProps = {
  data: CFPBracketData;
  roundDates: CFPRoundDates;
  refreshing?: boolean;
  onGamePress?: (game: FootballGame) => void;
  onTeamPress?: (team: FootballTeam) => void;
  isDark: boolean;
};

export function CFPBracketCanvas({
  data,
  roundDates,
  refreshing = false,
  onGamePress,
  onTeamPress,
  isDark,
}: CFPBracketCanvasProps) {
  const styles = CFPBracketStyles(isDark);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        snapToOffsets={snapBracketOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        <ScrollView
          horizontal
          snapToOffsets={snapBracketOffsets}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
        >
          <View style={styles.canvas}>
            <BracketConnectors />

            <BracketRoundHeader
              title="FIRST ROUND"
              date={roundDates.firstRound}
              x={FIRST_ROUND_X}
              isDark={isDark}
            />

            <BracketRoundHeader
              title="QUARTERFINALS"
              date={roundDates.quarterfinals}
              x={QUARTERFINAL_X}
              isDark={isDark}
            />

            <BracketRoundHeader
              title="SEMIFINALS"
              date={roundDates.semifinals}
              x={SEMIFINAL_X}
              isDark={isDark}
            />

            <BracketRoundHeader
              title="NATIONAL CHAMPIONSHIP"
              date={roundDates.championship}
              x={CHAMPIONSHIP_X}
              width={CHAMPIONSHIP_CARD_WIDTH}
              championship
              isDark={isDark}
            />

            {data.firstRound.map((game, index) => {
              if (index >= FIRST_ROUND_Y.length) {
                return null;
              }

              return (
                <BracketGameCard
                  key={`first-round-${game.id}`}
                  game={game}
                  x={FIRST_ROUND_X}
                  y={FIRST_ROUND_Y[index]}
                  onPress={onGamePress ? () => onGamePress(game) : undefined}
                  onTeamPress={onTeamPress}
                  isDark={isDark}
                />
              );
            })}

            {BYE_Y.map((y, index) => {
              const team = data.byeTeams[index] ?? null;

              return (
                <CFPByeTeamCard
                  key={`bye-slot-${index}`}
                  team={team}
                  x={FIRST_ROUND_X}
                  onPress={
                    team && onTeamPress ? () => onTeamPress(team) : undefined
                  }
                  y={y}
                  isDark={isDark}
                />
              );
            })}

            {data.quarterfinals.map((game, index) => {
              if (index >= QUARTERFINAL_Y.length) {
                return null;
              }

              return (
                <BracketGameCard
                  key={`quarterfinal-${game.id}`}
                  game={game}
                  x={QUARTERFINAL_X}
                  y={QUARTERFINAL_Y[index]}
                  onPress={onGamePress ? () => onGamePress(game) : undefined}
                  onTeamPress={onTeamPress}
                  isDark={isDark}
                />
              );
            })}

            {data.semifinals.map((game, index) => {
              if (index >= SEMIFINAL_Y.length) {
                return null;
              }

              return (
                <BracketGameCard
                  key={`semifinal-${game.id}`}
                  game={game}
                  x={SEMIFINAL_X}
                  y={SEMIFINAL_Y[index]}
                  onPress={onGamePress ? () => onGamePress(game) : undefined}
                  onTeamPress={onTeamPress}
                  isDark={isDark}
                />
              );
            })}

            <CFPChampionshipCard
              game={data.championship}
              onPress={
                data.championship && onGamePress
                  ? () => onGamePress(data.championship!)
                  : undefined
              }
              onTeamPress={onTeamPress}
              isDark={isDark}
            />

            <View style={styles.infoBadge}>
              <Text style={styles.infoIcon}>ⓘ</Text>

              <Text style={styles.infoText}>All times ET</Text>

              <View style={styles.infoDot} />

              <Text style={styles.infoText}>Higher seed hosts</Text>
            </View>

            {refreshing ? (
              <View style={styles.refreshingBadge}>
                <Text style={styles.refreshingText}>Updating...</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
