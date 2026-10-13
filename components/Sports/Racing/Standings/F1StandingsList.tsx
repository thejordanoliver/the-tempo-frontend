import Dropdown from "components/Dropdown";
import { StandingsSkeleton } from "components/Skeletons/StandingsSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useF1Standings } from "hooks/RacingHooks/useF1Standings";
import { useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StandingsStyles } from "styles/LeagueStyles/StandingsStyles";

function formatDriverName(name: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "Unknown";
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return `${parts[0][0].toUpperCase()}. ${parts[parts.length - 1].slice(0, 3).toUpperCase()}`;
}

export default function F1StandingsList() {
  const [year, setYear] = useState<string>();
  const { data, loading, refreshing, error, refresh } = useF1Standings(year);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const shared = StandingsStyles(isDark);
  const typography = globalStyles(isDark);
  const navigationContentStyle = useNavigationBarContentStyle();
  const seasons = (data?.availableSeasons ?? [])
    .filter((season) => season.types.some((type) => String(type.id) === "2" && type.hasStandings))
    .map((season) => ({ label: season.displayName, value: String(season.year) }));

  if (loading) return <StandingsSkeleton />;

  return (
    <ScrollView
      style={styles.container}
      alwaysBounceVertical
      contentContainerStyle={navigationContentStyle(shared.contentContainer)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.text} />}
    >
      <View style={shared.dropdownRow}>
        {seasons.length > 0 ? (
          <Dropdown options={seasons} selectedValue={year ?? String(data?.season ?? "")} onSelect={setYear} isDark={isDark} width={120} />
        ) : data?.seasonDisplayName ? <Text style={typography.subtitle}>{data.seasonDisplayName}</Text> : null}
      </View>
      {error ? (
        <View style={typography.emptyContainer}>
          <Text style={typography.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} accessibilityRole="button" style={styles.retry}>
            <Text style={typography.textMedium}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!error && !data?.conferences.some((group) => group.standings.length > 0) ? (
        <View style={typography.emptyContainer}>
          <Text style={typography.emptyTitle}>No standings available</Text>
          <Text style={typography.emptyText}>Try another season or pull down to refresh.</Text>
        </View>
      ) : null}
      {(data?.conferences ?? []).map((group, groupIndex) => {
        const races = Array.from(new Map(group.standings.flatMap((entry) => entry.races).map((race) => [race.id, race])).values());
        return (
          <View key={group.id} style={[shared.wrapper, { marginBottom: groupIndex === (data?.conferences.length ?? 0) - 1 ? 0 : 12 }]}>
            <View style={shared.header}><Text style={shared.heading}>{group.name}</Text></View>
            <View style={styles.columns}>
              <View style={styles.identityColumn}>
                <View style={shared.statsHeaderRow}>
                  <View style={shared.rankContainer}><Text style={shared.rankText}>#</Text></View>
                  <Text style={shared.teamHeaderText}>{group.code === "Driver" ? "Driver" : "Constructor"}</Text>
                </View>
                {group.standings.map((entry, index) => (
                  <View key={entry.id ?? index} style={[shared.row, index < group.standings.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray }]}>
                    <View style={shared.rankContainer}><Text style={shared.rankText}>{entry.rank ?? "—"}</Text></View>
                    <View style={styles.identity}>
                      {entry.flag || entry.logo ? <Image source={{ uri: entry.flag || entry.logo! }} style={shared.logo} accessibilityLabel={entry.country ?? entry.name ?? undefined} /> : null}
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} accessibilityLabel={entry.name ?? undefined} style={[shared.teamName, styles.name]}>{group.code === "Driver" ? formatDriverName(entry.name ?? entry.shortName) : entry.shortName ?? entry.name ?? "Unknown"}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <ScrollView horizontal style={[styles.statsViewport, group.code !== "Driver" && styles.constructorStatsViewport]} showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={shared.statsHeaderRow}>
                    <View style={shared.statCell}><Text style={shared.statText}>PTS</Text></View>
                    {races.map((race) => <View key={race.id} style={shared.statCell}><Text style={shared.statText} accessibilityLabel={race.name}>{race.code}</Text></View>)}
                  </View>
                  {group.standings.map((entry, index) => (
                    <View key={entry.id ?? index} style={[shared.row, index < group.standings.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray }]}>
                      <View style={shared.statCell}><Text style={shared.statText}>{entry.points}</Text></View>
                      {races.map((race) => {
                        const result = entry.races.find((item) => item.id === race.id);
                        return <View key={race.id} style={shared.statCell}><Text style={shared.statText} accessibilityLabel={`${race.name}: ${result?.played ? result.displayValue ?? result.points ?? "—" : "Not raced"}`}>{result?.played ? result.displayValue ?? result.points ?? "—" : "—"}</Text></View>;
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
            {group.standings.length === 0 ? <Text style={[typography.emptyText, styles.retry]}>No standings available.</Text> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  columns: { flexDirection: "row" },
  identityColumn: { flex: 1 },
  identity: { flex: 1, flexDirection: "row", alignItems: "center", paddingRight: 8 },
  name: { flex: 1, width: undefined, marginRight: 0 },
  statsViewport: { width: 200 },
  constructorStatsViewport: { width: 180 },
  retry: { padding: 12 },
});
