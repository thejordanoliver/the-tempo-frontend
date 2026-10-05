import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { getCFBTeam, getCFBTeamLogo } from "@/constants/teamsCFB";
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
} from "styles/PlayoffStyles/CFPBracketStyles";
import type {
  CFPBracketData,
  CFPRoundDates,
  FootballTeam,
} from "types/football/cfpBracketTypes";
import { BracketConnectors } from "./BracketConnectors";
import { ByeTeamCard } from "./ByeTeamCard";
import { CFPChampionshipCard } from "./CFPChampionshipCard";
import { MatchupCard } from "./MatchupCard";
import { RoundLabel } from "./RoundLabel";

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
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = CFPBracketStyles(isDark);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        snapToOffsets={snapBracketOffsets}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={navigationContentStyle(styles.scrollContent)}
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

            <RoundLabel title="FIRST ROUND" x={FIRST_ROUND_X} isDark={isDark} />

            <RoundLabel
              title="QUARTERFINALS"
              x={QUARTERFINAL_X}
              isDark={isDark}
            />

            <RoundLabel title="SEMIFINALS" x={SEMIFINAL_X} isDark={isDark} />

            <RoundLabel
              title="NATIONAL CHAMPIONSHIP"
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
                <MatchupCard
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
              const byeTeam = data.byeTeams[index] ?? null;
              const teamRank = byeTeam?.rank;
              const teamId = byeTeam?.id ?? 0;
              const team = getCFBTeam(teamId);
              const teamName = team?.code ?? "TBD";
              const teamLogo = getCFBTeamLogo(teamId, isDark);

              return (
                <ByeTeamCard
                  key={`bye-slot-${index}`}
                  name={teamName}
                  logo={teamLogo}
                  rank={teamRank}
                  x={FIRST_ROUND_X}
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
                <MatchupCard
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
                <MatchupCard
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
              isDark={isDark}
            />

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
