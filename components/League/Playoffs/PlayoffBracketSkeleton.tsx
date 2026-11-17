import { SkeletonBlock, SkeletonCircle } from "components/Skeletons/primitives";
import { Colors } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import type { PlayoffLeague } from "types/playoffs";
import {
  BRACKET_CARD_HEIGHT,
  BRACKET_CARD_WIDTH,
  BRACKET_HEADER_HEIGHT,
} from "utils/playoffs/bracketLayout";
import { getBracketSkeletonLayout } from "utils/playoffs/bracketSkeletonLayout";
import BracketConnections from "./BracketConnections";

function TeamRowSkeleton() {
  return (
    <View style={styles.teamRow}>
      <SkeletonBlock width={13} height={9} />
      <SkeletonCircle size={25} />
      <View style={styles.teamCode}>
        <SkeletonBlock width={44} height={14} />
      </View>
      <SkeletonBlock width={24} height={20} />
    </View>
  );
}

function MatchupSkeleton({
  isBye,
  borderColor,
}: {
  isBye: boolean;
  borderColor: string;
}) {
  return (
    <>
      {isBye ? (
        <View style={styles.bye}>
          <TeamRowSkeleton />
        </View>
      ) : (
        <>
          <TeamRowSkeleton />
          <TeamRowSkeleton />
        </>
      )}
      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <SkeletonBlock width={isBye ? 72 : 112} height={9} />
      </View>
    </>
  );
}

export default function PlayoffBracketSkeleton({
  league,
}: {
  league: PlayoffLeague;
}) {
  const { resolvedColorScheme } = usePreferences();
  const colors = resolvedColorScheme === "dark" ? Colors.dark : Colors.light;
  const layout = useMemo(() => getBracketSkeletonLayout(league), [league]);

  return (
    <View
      testID="playoff-bracket-skeleton"
      accessibilityRole="progressbar"
      accessibilityLabel="Loading playoff bracket"
    >
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={{ width: layout.width, height: layout.height }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <BracketConnections
            nodes={layout.nodes}
            width={layout.width}
            height={layout.height}
            color={colors.transparentGray}
          />
          {layout.headers.map(({ key, x }) => (
            <View
              key={key}
              testID={`bracket-skeleton-heading-${key}`}
              style={[styles.heading, { left: x }]}
            >
              <SkeletonBlock width={48} height={9} />
              <SkeletonBlock width={128} height={16} />
            </View>
          ))}
          {layout.nodes.map((node) => (
            <View
              key={node.key}
              style={[
                styles.card,
                {
                  left: node.x,
                  top: node.y + BRACKET_HEADER_HEIGHT,
                  backgroundColor: colors.background,
                  borderColor: colors.transparentGray,
                },
              ]}
            >
              <MatchupSkeleton
                isBye={node.isBye}
                borderColor={colors.transparentGray}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  heading: {
    position: "absolute",
    top: 0,
    width: BRACKET_CARD_WIDTH,
    height: BRACKET_HEADER_HEIGHT,
    alignItems: "center",
    gap: 8,
  },
  card: {
    position: "absolute",
    width: BRACKET_CARD_WIDTH,
    height: BRACKET_CARD_HEIGHT,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  teamRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  teamCode: { flex: 1 },
  bye: { height: 76, justifyContent: "center" },
  footer: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
