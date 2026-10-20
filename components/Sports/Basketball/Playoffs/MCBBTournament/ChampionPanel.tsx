import { Image, Text, View } from "react-native";
import type { TournamentTeam } from "hooks/BasketballHooks/useTournamentBracket";
import { getTournamentTeamLogo } from "./teamLogo";
import { MCBBTournamentBracketStyles } from "styles/PlayoffStyles/MCBBTournamentBracketStyles";

export function ChampionPanel({ champion, isDark, league }: {
  champion: TournamentTeam | null;
  isDark: boolean;
  league: string;
}) {
  const styles = MCBBTournamentBracketStyles(isDark);
  const championLogoSource = champion ? getTournamentTeamLogo(champion.id, league, isDark) : null;
  return (
    <View style={styles.championPanel}>
      {championLogoSource && (
        <Image
          source={championLogoSource}
          style={styles.championLogo}
          resizeMode="contain"
        />
      )}

      <Text style={styles.championLabel}>Champion</Text>

      <Text numberOfLines={1} style={styles.championName}>
        {champion?.shortName || champion?.name || "TBD"}
      </Text>

      {champion?.seed !== null && champion?.seed !== undefined ? (
        <Text style={styles.championMeta}>
          {`No. ${champion.seed} seed`}
        </Text>
      ) : null}
    </View>
  );
}
