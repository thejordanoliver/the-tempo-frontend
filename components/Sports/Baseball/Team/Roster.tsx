import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
// components/Roster.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { RefreshControl, SectionList, Text, View } from "react-native";
import { RosterStyles } from "styles/TeamStyles/RosterStyles";
import type { RosterSection, SupportedRosterLeague } from "types/roster";
import { PlayerCard } from "../../Basketball/Player/PlayerCard";
import { useMemo } from "react";
export type { SupportedRosterLeague } from "types/roster";

interface RosterProps {
  sections: RosterSection[];
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  league?: SupportedRosterLeague;
}

export default function Roster({
  sections,
  loading,
  error,
  refreshing,
  onRefresh,
  league,
}: RosterProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = RosterStyles;
  const tintColor = isDark ? Colors.white : Colors.black;

  if (loading) {
    return <PlayerCardSkeletonList />;
  }

  if (error) {
    return (
      <View style={styles.contentContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyTitle}>No players found.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(player) => String(player.id)}
      stickySectionHeadersEnabled={false}
      initialNumToRender={12}
      maxToRenderPerBatch={10}
      windowSize={7}
      contentContainerStyle={navigationContentStyle([
        styles.contentContainer,
        { gap: 0 },
      ])}
      renderSectionHeader={({ section }) => (
        <HeadingTwo isDark={isDark}>{section.title}</HeadingTwo>
      )}
      renderSectionFooter={() => <View style={{ height: 6 }} />}
      renderItem={({ item: player }) => (
        <View style={{ marginBottom: 12 }}>
          <PlayerCard
            id={player.id}
            name={player.full_name}
            position={player.position}
            headshot={player.headshot_url}
            number={player.jersey_number}
            teamId={player.team_id}
            league={league}
          />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
        />
      }
    />
  );
}
