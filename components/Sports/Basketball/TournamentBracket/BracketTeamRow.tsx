import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import {
  getCBBTeam,
  getCBBTeamByESPNId,
  getCBBTeamLogo,
} from "constants/teamsCBB";
import React, { memo, useMemo } from "react";
import type { ImageSourcePropType, StyleProp, TextStyle } from "react-native";
import { Image, Text, View } from "react-native";

import { tournamentBracketStyles } from "./tournamentBracket.styles";
import type {
  BracketGame,
  BracketTeam,
  TournamentBracketCompetition,
} from "./tournamentBracket.types";
import {
  getBracketTeamDisplayName,
  getPlaceholderTeamLabel,
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
  if (!team) return PlaceholderLogo;

  const isWomen = competition === "WCBB";
  const teamByLocalId = getCBBTeam(team.id, isWomen);

  const teamByEspnId =
    team.espnId != null ? getCBBTeamByESPNId(team.espnId) : undefined;
  const localTeam = teamByLocalId ?? teamByEspnId;
  const localId = isWomen ? (localTeam?.wid ?? localTeam?.id) : localTeam?.id;

  return getCBBTeamLogo(localId ?? team.id, isDark, isWomen);
};

const getScoreText = (team: BracketTeam | null) => {
  if (!team) return "TBD";
  if (team.score === null || team.score === undefined || team.score === "") {
    return "-";
  }

  return String(team.score);
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
  const styles = useMemo(() => tournamentBracketStyles(isDark), [isDark]);
  const logoSource = useMemo(
    () => getBracketTeamLogoSource(team, competition, isDark),
    [competition, isDark, team],
  );
  const name = team
    ? getBracketTeamDisplayName(team)
    : allGamesById
      ? getPlaceholderTeamLabel(game, position, allGamesById)
      : getPlaceholderTeamLabel(game, position);
  const seedText = team?.seed ? String(team.seed) : "-";
  const scoreText = getScoreText(team);
  const recordText = team?.record?.trim() || null;
  const textStyle: StyleProp<TextStyle> = [
    styles.teamName,
    !team ? styles.placeholderName : null,
    isWinner ? styles.winnerText : null,
    isLoser ? styles.loserText : null,
  ];
  const scoreStyle: StyleProp<TextStyle> = [
    styles.teamScore,
    isWinner ? styles.winnerText : null,
    isLoser ? styles.loserText : null,
  ];

  return (
    <View style={styles.teamRow}>
      <Text style={styles.seedText} selectable>
        {seedText}
      </Text>
      <Image source={logoSource} style={styles.teamLogo} resizeMode="contain" />
      <View style={styles.teamNameWrap}>
        <Text numberOfLines={1} style={textStyle} selectable>
          {name}
        </Text>
        {recordText ? (
          <Text numberOfLines={1} style={styles.teamRecord} selectable>
            {recordText}
          </Text>
        ) : null}
      </View>
      <Text numberOfLines={1} style={scoreStyle} selectable>
        {scoreText}
      </Text>
    </View>
  );
}

export const BracketTeamRow = memo(BracketTeamRowComponent);
