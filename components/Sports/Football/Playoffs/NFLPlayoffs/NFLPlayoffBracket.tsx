import { snapBracketOffsets } from "@/styles/PlayoffStyles/CFPBracketStyles";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { Colors, globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useNFLBracketModel } from "hooks/FootballHooks/useNFLBracketModel";
import { useNavigationBarContentStyle } from "hooks/useNavigationBarContentStyle";
import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { NFLPlayoffBracketStyles } from "styles/PlayoffStyles/NFLPlayoffBracketStyles";
import type { BracketApiResponse } from "types/football/football";
import { NFLBracketCanvas } from "./NFLBracketCanvas";

export {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  getCenteredX,
  getColCenter,
  getX,
  SIDE_LABEL_TOP,
} from "../../../../../utils/nflBracketLayout";

type NFLPlayoffBracketProps = {
  bracket: BracketApiResponse | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
};

export function NFLPlayoffBracket({
  bracket,
  loading,
  error,
  refreshing,
  onRefresh,
}: NFLPlayoffBracketProps) {
  const { resolvedColorScheme } = usePreferences();

  const isDark = resolvedColorScheme === "dark";

  const navigationContentStyle = useNavigationBarContentStyle();
  const styles = useMemo(() => NFLPlayoffBracketStyles(isDark), [isDark]);

  const global = useMemo(() => globalStyles(isDark), [isDark]);

  const model = useNFLBracketModel(bracket);

  /* ---------------- DISPLAY STATES ---------------- */

  if (loading) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{error}</Text>
      </View>
    );
  }

  const hasPlayoffGames =
    Boolean(bracket?.games?.length) ||
    Boolean(bracket?.groups?.some((group) => group.games?.length));

  if (!hasPlayoffGames) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyText}>No NFL playoff bracket available.</Text>
      </View>
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <ScrollView
      snapToOffsets={snapBracketOffsets}
      contentContainerStyle={navigationContentStyle()}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? Colors.white : Colors.black}
        />
      }
    >
      <ScrollView
        horizontal
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        directionalLockEnabled
        contentContainerStyle={styles.container}
      >
        <NFLBracketCanvas model={model} isDark={isDark} />
      </ScrollView>
    </ScrollView>
  );
}
