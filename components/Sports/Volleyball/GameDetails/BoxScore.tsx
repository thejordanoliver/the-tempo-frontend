import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import HeadingTwo from "components/Headings/HeadingTwo";
import HomeAwayTabBar, { type HomeAwayTabValue } from "components/TabBars/HomeAwayTabBar";
import { globalStyles } from "constants/styles";
import { BoxScoreStyles } from "styles/GameDetailStyles/BoxScoreStyles";
import type { VolleyballScore } from "types/volleyball/volleyball";
import { getVolleyballTeamLogo } from "utils/teams/volleyballTeams";

export default function BoxScore({ score, isDark }: { score: VolleyballScore; isDark: boolean }) {
  const [selected, setSelected] = useState<HomeAwayTabValue>("away");
  const styles = BoxScoreStyles(isDark);
  const global = globalStyles(isDark);
  const team = selected === "home" ? score.home : score.away;
  const blocks = score.playerStats.filter((block) => block.team.id === team.id);
  if (!score.playerStats.some((block) => block.statistics.some((group) => group.athletes.length > 0))) return null;
  return <View>
    <HeadingTwo isDark={isDark}>Box Score</HeadingTwo>
    <HomeAwayTabBar selected={selected} onTabPress={setSelected} isDark={isDark} showAllTab={false}
      awayTeam={{ id: score.away.id ?? "away", name: score.away.code ?? score.away.name ?? "Away", logo: getVolleyballTeamLogo(score.away.id, score.league.code, isDark) }}
      homeTeam={{ id: score.home.id ?? "home", name: score.home.code ?? score.home.name ?? "Home", logo: getVolleyballTeamLogo(score.home.id, score.league.code, isDark) }}
    />
    <View style={styles.teamsContainer}>{blocks.flatMap((block, blockIndex) => block.statistics.filter((group) => group.athletes.length > 0).map((group, index) => <View key={`${blockIndex}:${index}`} style={styles.teamContainer}>
      {!!group.name && <View style={styles.categoryHeader}><Text style={styles.categoryLabel}>{group.name}</Text></View>}
      <ScrollView horizontal><View>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellHeader, styles.cellName]}>PLAYER</Text>
          {group.labels.map((label, column) => <Text key={column} style={[styles.cell, styles.cellHeader]}>{label}</Text>)}
        </View>
        {group.athletes.map((player, row) => <View key={`${player.athlete.id}:${row}`} style={[styles.tableRow, row % 2 === 1 && styles.rowAlt]}>
          <Text style={styles.cellName} numberOfLines={1}>{player.athlete.name ?? "Player"}</Text>
          {player.stats.map((value, column) => <Text key={column} style={styles.cell}>{value}</Text>)}
        </View>)}
      </View></ScrollView>
    </View>))}</View>
    {!blocks.some((block) => block.statistics.some((group) => group.athletes.length)) && <Text style={global.secondaryText}>Player statistics are unavailable for this team.</Text>}
  </View>;
}
