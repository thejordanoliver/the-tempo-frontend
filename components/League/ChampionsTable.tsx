import { Colors, globalStyles } from "constants/styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { useChampions } from "hooks/useChampions";
import { Image, Text, View } from "react-native";
import { awardTableStyles } from "styles/LeagueStyles/AwardTableSyles";
import AwardSeasonTableSkeleton from "./AwardSeasonTableSkeleton";
import { usePreferences } from "contexts/PreferencesContext";

type Props = {
  title: string;
  refreshSignal?: number;
  league: "CFB" | "CBB" | "WCBB" | "NBA" | "WNBA" | "NFL" | "NHL" | "MLB";
};

export default function ChampionsTable({ title, league }: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = awardTableStyles(isDark);
  const global = globalStyles(isDark);

  const { data, loading, error } = useChampions({ league });

  if (loading) {
    return (
      <View style={styles.container}>
        <AwardSeasonTableSkeleton teams={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={global.errorText}>Failed to load.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                : row.team && league === "WNBA"
                  ? getWNBATeamLogo(row.team.id, isDark)
                  : row.team && league === "MLB"
                    ? getMLBTeamLogo(row.team.id, isDark)
                    : row.team && league === "NHL"
                      ? getNHLTeamLogo(row.team.id, isDark)
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
