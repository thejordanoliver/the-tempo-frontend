import { PlayerCard } from "@/components/Player/PlayerCard";
import HeadingTwo from "components/Headings/HeadingTwo";
import PlayerCardSkeletonList from "components/Skeletons/PlayerCardListSkeleton";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { RosterStyles } from "styles/TeamStyles/RosterStyles";
import type {
  RosterPlayer,
  RosterSection,
  SupportedRosterLeague,
} from "types/roster";
export type { SupportedRosterLeague } from "types/roster";

interface BaseRosterProps {
  loading: boolean;
  error?: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

type RosterProps = BaseRosterProps &
  (
    | {
        sections: RosterSection[];
        players?: never;
        league?: SupportedRosterLeague;
      }
    | { players: RosterPlayer[]; sections?: never; league?: string }
  );

export default function Roster(props: RosterProps) {
  const { loading, error, refreshing, onRefresh, league } = props;
  const isSectioned = props.sections !== undefined;
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const global = useMemo(() => globalStyles(isDark), [isDark]);
  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = RosterStyles;
  const tintColor = isDark ? Colors.white : Colors.black;

  if (loading) {
    return isSectioned ? (
      <PlayerCardSkeletonList />
    ) : (
      <PlayerCardSkeletonList count={15} showHeader={false} />
    );
  }

  if (error) {
    return (
      <View
        style={isSectioned ? styles.contentContainer : global.emptyContainer}
      >
        <Text style={global.errorText}>Couldn’t load roster</Text>
      </View>
    );
  }

  const renderPlayer = (player: RosterPlayer) => (
    <PlayerCard
      id={player.id}
      name={player.full_name}
      position={player.position}
      headshot={player.headshot_url}
      number={player.jersey_number}
      teamId={player.team_id}
      league={league}
    />
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      colors={isSectioned ? [tintColor] : undefined}
    />
  );

  const emptyState = (
    <View style={global.emptyContainer}>
      <Text style={global.emptyTitle}>No players found</Text>
    </View>
  );

  if (props.sections === undefined) {
    return (
      <FlatList
        data={props.players}
        keyExtractor={(player) => String(player.id)}
        contentContainerStyle={navigationContentStyle(styles.contentContainer)}
        contentInsetAdjustmentBehavior="automatic"
        renderItem={({ item: player }) => renderPlayer(player)}
        ListEmptyComponent={emptyState}
        refreshControl={refreshControl}
      />
    );
  }

  const { sections } = props;

  if (sections.length === 0) {
    return emptyState;
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
      renderSectionFooter={() => <View style={styles.sectionFooter} />}
      renderItem={({ item: player }) => (
        <View style={styles.itemContainer}>{renderPlayer(player)}</View>
      )}
      refreshControl={refreshControl}
    />
  );
}
