import Button from "components/Buttons/Button";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useVolleyballTable } from "hooks/VolleyballHooks/useVolleyballTable";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { StandingsStyles } from "styles/LeagueStyles/StandingsStyles";
import type { VolleyballLeagueKey } from "types/volleyball/volleyball";

export default function VolleyballTable({
  league,
  kind = "standings",
}: {
  league: VolleyballLeagueKey;
  kind?: "standings" | "rankings";
}) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = StandingsStyles(isDark);
  const global = globalStyles(isDark);
  const resource = useVolleyballTable(league, kind);
  if (resource.loading && !resource.data) return <StandingsSkeleton />;

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={resource.refreshing}
          onRefresh={resource.refresh}
        />
      }
    >
      {resource.error ? (
        <View style={global.emptyContainer}>
          <Text style={global.errorText}>Couldn’t load {kind}.</Text>
          <Button isDark={isDark} onPress={resource.refresh} variant="text">
            Try again
          </Button>
        </View>
      ) : null}
      {!resource.error && resource.groups.length === 0 ? (
        <View style={global.emptyContainer}>
          <Text style={global.emptyTitle}>No {kind} available</Text>
          <Text style={global.emptySubText}>
            Check back when coverage is available.
          </Text>
        </View>
      ) : null}
      {resource.groups.map((group) => (
        <View key={group.key}>
          <Text style={styles.heading}>{group.title}</Text>
          <ScrollView horizontal>
            <View>
              <View style={styles.statsHeaderRow}>
                <View style={{ width: 40 }}>
                  <Text style={styles.headerText}>#</Text>
                </View>
                <View style={{ width: 180 }}>
                  <Text style={styles.teamHeaderText}>Team</Text>
                </View>
                {group.columns.map((column) => (
                  <View key={column.key} style={styles.statCell}>
                    <Text style={styles.headerText}>{column.label}</Text>
                  </View>
                ))}
              </View>
              {group.rows.map((row, index) => {
                const logo =
                  (isDark ? row.team.logoDark : row.team.logo) ?? row.team.logo;
                const name = row.team.shortName ?? row.team.name ?? "Team";
                return (
                  <View key={row.key} style={styles.row}>
                    <View style={styles.rankContainer}>
                      <Text style={styles.rankText}>
                        {kind === "rankings" ? (row.rank ?? "—") : index + 1}
                      </Text>
                    </View>
                    <View style={[styles.teamInfoWrapper, { width: 180 }]}>
                      {logo ? (
                        <Image source={{ uri: logo }} style={styles.logo} />
                      ) : null}
                      <Text
                        style={[styles.teamName, { width: 140 }]}
                        numberOfLines={1}
                      >
                        {name}
                      </Text>
                    </View>
                    {group.columns.map((column) => (
                      <View key={column.key} style={styles.statCell}>
                        <Text style={styles.statText}>
                          {row.values[column.key] ?? "—"}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}
