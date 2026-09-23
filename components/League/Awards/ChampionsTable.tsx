import AwardSeasonTableSkeleton from "components/Skeletons/AwardSeasonTableSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { getNBATeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWCBBTeamLogo } from "constants/teamsWCBB";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { useChampions } from "hooks/LeagueHooks/useChampions";
import { Image, Text, View } from "react-native";
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
  const global = globalStyles(isDark);

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

        {data.map((row, index) => {
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
                      : row.team && league === "cbb"
                        ? getCBBTeamLogo(row.team.id, isDark)
                        : row.team && league === "wcbb"
                          ? getWCBBTeamLogo(row.team.id, isDark)
                          : getNFLTeamLogo(row.team?.id ?? 0, isDark);

          const isSuperBowl = league === "nfl";

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
