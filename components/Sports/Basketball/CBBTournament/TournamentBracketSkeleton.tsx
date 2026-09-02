import React, { memo, useMemo } from "react";
import { View } from "react-native";

import { CBBTournamentBracketStyles } from "../../../../styles/PlayoffStyles/CBBTournamentBracketStyles";

type TournamentBracketSkeletonProps = {
  isDark: boolean;
};

function TournamentBracketSkeletonComponent({
  isDark,
}: TournamentBracketSkeletonProps) {
  const styles = useMemo(() => CBBTournamentBracketStyles(isDark), [isDark]);
  const regionKeys = ["left-top", "right-top", "left-bottom", "right-bottom"];
  const roundWidths = [190, 170, 150, 130];

  return (
    <View style={styles.skeletonCanvas}>
      {regionKeys.map((regionKey) => (
        <View key={regionKey} style={styles.skeletonRegion}>
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <View key={`${regionKey}-${rowIndex}`} style={styles.skeletonRow}>
              {roundWidths.map((width, index) => (
                <View
                  key={`${regionKey}-${rowIndex}-${index}`}
                  style={[
                    styles.skeletonBlock,
                    {
                      width,
                      height: 54,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export const TournamentBracketSkeleton = memo(
  TournamentBracketSkeletonComponent,
);
