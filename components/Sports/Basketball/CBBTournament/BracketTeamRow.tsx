import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { getCBBTeamByESPNId, getCBBTeamLogo } from "constants/teamsCBB";
import { getWCBBTeamByESPNId, getWCBBTeamLogo } from "constants/teamsWCBB";
import React, { memo, useMemo } from "react";
import type { ImageSourcePropType, StyleProp, TextStyle } from "react-native";
import { Image, Text, View } from "react-native";

import { CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";
import type {
  BracketGame,
  BracketTeam,
  TournamentBracketCompetition,
} from "./tournamentBracket.types";
import {
  getPlaceholderTeamLabel,
  getRenderableBracketTeam,
  getTeamCode,
} from "./tournamentBracket.utils";

type BracketTeamRowProps = {
  game: BracketGame;
  team: BracketTeam | null;
  position: "top" | "bottom";
  isDark: boolean;
  competition: TournamentBracketCompetition;
  allGamesById?: ReadonlyMap<string, BracketGame>;
  isWinner?: boolean;
  isLoser?: boolean;
};

export const getBracketTeamLogoSource = (
  team: BracketTeam | null,
  competition: TournamentBracketCompetition,
  isDark: boolean,
): ImageSourcePropType => {
  const displayTeam = getRenderableBracketTeam(team);
  if (!displayTeam) return PlaceholderLogo;

  const isWCBB = competition === "wcbb";


  const localTeam = isWCBB
    ? getWCBBTeamByESPNId(displayTeam.id)
    : getCBBTeamByESPNId(displayTeam.id);

  if (localTeam) {
    return isWCBB
      ? getWCBBTeamLogo(localTeam.id, isDark)
      : getCBBTeamLogo(localTeam.id, isDark);
  }

  return displayTeam.logo ? { uri: displayTeam.logo } : PlaceholderLogo;
};

const getScoreText = (team: BracketTeam | null) => {
  const displayTeam = getRenderableBracketTeam(team);
  if (
    !displayTeam ||
    displayTeam.score === null ||
    displayTeam.score === undefined
  ) {
    return "";
  }

  const score = Number(displayTeam.score);

  return Number.isFinite(score) ? String(displayTeam.score) : "";
};

function BracketTeamRowComponent({
  game,
  team,
  position,
  isDark,
  competition,
  allGamesById,
  isWinner = false,
  isLoser = false,
}: BracketTeamRowProps) {
  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);
  const displayTeam = getRenderableBracketTeam(team);
  const logoSource = useMemo(
    () => getBracketTeamLogoSource(displayTeam, competition, isDark),
    [competition, displayTeam, isDark],
  );
  const name = displayTeam
    ? getTeamCode(displayTeam)
    : allGamesById
      ? getPlaceholderTeamLabel(game, position, allGamesById)
      : getPlaceholderTeamLabel(game, position);
  const seedText =
    displayTeam?.seed !== null && displayTeam?.seed !== undefined
      ? String(displayTeam.seed)
      : "";
  const scoreText = getScoreText(displayTeam);
  const textStyle: StyleProp<TextStyle> = [
    styles.teamName,
    !displayTeam ? styles.placeholderName : null,
    isWinner ? styles.winnerText : null,
    isLoser ? styles.loserText : null,
  ];
  const scoreStyle: StyleProp<TextStyle> = [
    styles.score,
    isWinner ? styles.winnerText : null,
    isLoser ? styles.loserText : null,
  ];

  return (
    <View style={styles.teamRow}>
      <View style={styles.teamInfo}>
        <View style={styles.seedContainer}>
          <Text style={styles.seedText} selectable>
            {seedText}
          </Text>
        </View>
        <Image
          source={logoSource}
          style={styles.teamLogo}
          resizeMode="contain"
        />
        <View style={styles.teamNameWrap}>
          <Text numberOfLines={1} style={textStyle} selectable>
            {name}
          </Text>
        </View>
      </View>
      <Text style={scoreStyle} selectable>
        {scoreText}
      </Text>
    </View>
  );
}

export const BracketTeamRow = memo(BracketTeamRowComponent);
