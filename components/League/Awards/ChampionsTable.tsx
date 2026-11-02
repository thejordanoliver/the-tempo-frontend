import AwardSeasonTableSkeleton from "components/Skeletons/AwardSeasonTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { getNBATeamLogo } from "constants/teams";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMCBBTeamLogo } from "constants/teamsMCBB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWCBBTeamLogo } from "constants/teamsWCBB";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useChampions } from "hooks/LeagueHooks/useChampions";
import { useMemo } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { AwardTableStyles } from "styles/LeagueStyles/AwardTableSyles";

type Props = {
  title: string;
  refreshSignal?: number;
  league: string;
};

export default function ChampionsTable({
  title,
  league,
  refreshSignal,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = AwardTableStyles(isDark);
  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const { data, loading, error } = useChampions({
    league,
    refreshToken: refreshSignal,
  });

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

        <FlatList
          data={data}
          keyExtractor={(row) => `${row.season}-${row.id}-${row.selector}`}
          scrollEnabled={false}
          renderItem={({ item: row, index }) => {
            const logo =
              row.team && league === "cfb"
                ? getCFBTeamLogo(row.team.id, isDark)
                : row.team && league === "nba"
                  ? getNBATeamLogo(row.team.id, isDark)
                  : row.team && league === "wnba"
                    ? getWNBATeamLogo(row.team.id, isDark)
                    : row.team && league === "mlb"
                      ? getMLBTeamLogo(row.team.id, isDark)
                      : row.team && league === "nhl"
                        ? getNHLTeamLogo(row.team.id, isDark)
                        : row.team && league === "mcbb"
                          ? getMCBBTeamLogo(row.team.id, isDark)
                          : row.team && league === "wcbb"
                            ? getWCBBTeamLogo(row.team.id, isDark)
                            : getNFLTeamLogo(row.team?.id ?? 0, isDark);

            const isSuperBowl = league === "nfl";

            return (
              <View
                style={[
                  styles.nameRow,
                  index === data.length - 1 && { borderBottomWidth: 0 },
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
                      {row.team?.name ?? "Unknown team"}
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
          }}
        />
      </View>
    </View>
  );
}
