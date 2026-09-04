import CFPLogoLight from "@/assets/College_Logos/Conference_Logos/CFPLight.png";
import CFPLogo from "@/assets/College_Logos/Conference_Logos/CFPLogo.png";
import type { FootballGame } from "@/types/football/football";
import { Image, Pressable, Text, View } from "react-native";
import {
  CFPBracketStyles,
  CHAMPIONSHIP_X,
  CHAMPIONSHIP_Y,
} from "styles/PlayoffStyles/CFPBracketStyles";
import type { FootballTeam } from "types/football/cfpBracketTypes";
import { BracketTeamRow } from "./BracketTeamRow";
import { CFPTeamLogo } from "./CFPTeamLogo";

/*
|--------------------------------------------------------------------------
| Championship Card
|--------------------------------------------------------------------------
*/

export function CFPChampionshipCard({
  game,
  onPress,
  onTeamPress,
  isDark,
}: {
  game: FootballGame | null;

  onPress?: () => void;

  onTeamPress?: (team: FootballTeam) => void;

  isDark: boolean;
}) {
  const styles = CFPBracketStyles(isDark);

  const cfpLogo = isDark ? CFPLogoLight : CFPLogo;

  const winner = game?.away?.winner
    ? game.away
    : game?.home?.winner
      ? game.home
      : null;

  return (
    <Pressable
      disabled={!game || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.championshipCard,

        {
          left: CHAMPIONSHIP_X,

          top: CHAMPIONSHIP_Y,
        },

        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.cfpLogo}>
        <Image source={cfpLogo} style={styles.cfpLogo} resizeMode="contain" />
      </View>

      <Text style={styles.championshipLabel}>NATIONAL</Text>

      <Text style={styles.championshipLabel}>CHAMPIONSHIP</Text>

      <View style={styles.championshipDivider} />

      {winner ? (
        <Pressable
          disabled={!onTeamPress}
          onPress={onTeamPress ? () => onTeamPress(winner) : undefined}
          style={styles.championTeam}
        >
          <CFPTeamLogo
            team={winner}
            isDark={isDark}
            style={styles.championLogo}
          />

          <View style={styles.championTextContainer}>
            <Text numberOfLines={1} style={styles.championName}>
              {winner.name}
            </Text>

            <Text style={styles.championSubtext}>NATIONAL CHAMPION</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.championshipTeams}>
          {/*
          |--------------------------------------------------------------------------
          | Away - Top
          |--------------------------------------------------------------------------
          */}

          <BracketTeamRow
            team={game?.away ?? null}
            onPress={
              game?.away && onTeamPress
                ? () => onTeamPress(game.away)
                : undefined
            }
            isDark={isDark}
          />

          <View style={styles.divider} />

          {/*
          |--------------------------------------------------------------------------
          | Home - Bottom
          |--------------------------------------------------------------------------
          */}

          <BracketTeamRow
            team={game?.home ?? null}
            onPress={
              game?.home && onTeamPress
                ? () => onTeamPress(game.home)
                : undefined
            }
            isDark={isDark}
          />
        </View>
      )}
    </Pressable>
  );
}
