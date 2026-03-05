import { Colors, globalStyles } from "constants/Styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import {  getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { useChampions } from "hooks/useChampions";
import { Image, Text, View, useColorScheme } from "react-native";
import { awardTableStyles } from "styles/LeagueStyles/AwardTableSyles";
import AwardSeasonTableSkeleton from "./AwardSeasonTableSkeleton";

type Props = {
  title: string;
  refreshSignal?: number;
  league: "CFB" | "CBB" | "WCBB" | "NBA" | "NFL" | "MLB";
};

export default function ChampionsTable({ title, league }: Props) {
  const isDark = useColorScheme() === "dark";
  const styles = awardTableStyles(isDark);
  const global = globalStyles(isDark);

  const { data, loading, error } = useChampions({ league });

  if (loading) {
    return (
      <View style={{ marginVertical: 12 }}>
        <AwardSeasonTableSkeleton teams={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ marginVertical: 12 }}>
        <Text style={global.errorText}>Failed to load.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginVertical: 12 }}>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerName}>{title}</Text>
        </View>

        {data.map((row, index) => {
          const logo =
            row.team && league === "CFB"
              ? getCFBTeamLogo(row.team.id, isDark)
              : row.team && league === "NBA"
                ? getTeamLogo(row.team.id, isDark)
                : row.team && league === "MLB"
                  ? getMLBTeamLogo(row.team.id, isDark)
                  : row.team && league === "CBB"
                    ? getCBBTeamLogo(row.team.id, isDark)
                    : row.team && league === "WCBB"
                      ? getCBBTeamLogo(row.team.id, isDark, true)
                      : getNFLTeamLogo(row.team?.id ?? 0, isDark);

          const isSuperBowl = league === "NFL";

          return (
            <View
              key={`${row.season}-${row.id}-${row.selector}`}
              style={[
                styles.nameRow,
                {
                  backgroundColor:
                    index % 2 === 1
                      ? isDark
                        ? Colors.dark.itemBackground
                        : Colors.light.itemBackground
                      : "transparent",
                },
              ]}
            >
              {/* LEFT */}
              <View style={styles.leftContainer}>
                <Image
                  source={logo}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />

                <View>
                  <Text style={styles.playerName}>
                    {row.team?.name ?? row.team_name}
                  </Text>
                </View>
              </View>

              {/* RIGHT */}
              <View style={styles.rightContainer}>
                <Text style={styles.playerName}>
                  {isSuperBowl ? `SB ${row.notes}` : row.season}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
