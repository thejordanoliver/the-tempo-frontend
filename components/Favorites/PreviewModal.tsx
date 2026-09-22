import Button from "@/components/Buttons/Button";
import { LEAGUE_CONFIG, type FavoriteSportId } from "@/constants/leagues";
import { getWCBBTeamLogo } from "@/constants/teamsWCBB";
import type { Team } from "@/types/types";
import { supportsLiquidGlass } from "@/utils/glass";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import { getNBATeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { getWNBATeamLogo } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, type RefObject } from "react";
import { Image, Text, View } from "react-native";
import { teamPreviewModalStyles } from "styles/TeamStyles/TeamPreviewModalStyles";

export type PreviewItem =
  | { type: "team"; team: Team }
  | { type: "sport"; sport: FavoriteSportId };

type Props = {
  sheetRef: RefObject<BottomSheetModal | null>;
  item: PreviewItem | null;
  onClose: () => void;
  onGo: () => void;
  onRemove?: () => void;
  currentUser?: boolean;
};

const getTeamLogo = (team: Team, isDark: boolean) => {
  if (team.id == null) {
    return null;
  }

  switch (team.league) {
    case "cbb":
      return getCBBTeamLogo(team.id, isDark);
    case "wcbb":
      return getWCBBTeamLogo(team.id, isDark);
    case "nba":
      return getNBATeamLogo(team.id, isDark);
    case "wnba":
      return getWNBATeamLogo(team.id, isDark);
    case "cfb":
      return getCFBTeamLogo(team.id, isDark);
    case "nfl":
      return getNFLTeamLogo(team.id, isDark);
    case "mlb":
      return getMLBTeamLogo(team.id, isDark);
    case "nhl":
      return getNHLTeamLogo(team.id, isDark);
    default:
      return null;
  }
};

export default function PreviewModal({
  sheetRef,
  item,
  onClose,
  onGo,
  onRemove,
  currentUser,
}: Props) {
  const liquid = supportsLiquidGlass();
  const snapPoints = useMemo(() => ["42%"], []);
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = teamPreviewModalStyles(isDark);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const isTeam = item?.type === "team";
  const team = item?.type === "team" ? item.team : null;
  const sport = item?.type === "sport" ? LEAGUE_CONFIG[item.sport] : null;
  const logo = team ? getTeamLogo(team, isDark) : sport?.logoLight;
  const name = team
    ? (team.fullName ?? team.name ?? team.shortName)
    : sport?.label;
  const established = team
    ? typeof team.established === "string" ||
      typeof team.established === "number"
      ? `EST. ${team.established}`
      : "EST. -"
    : null;
  const primaryColor = isDark
    ? (team?.secondaryColor ?? sport?.color ?? Colors.midTone)
    : (team?.color ?? sport?.color ?? Colors.midTone);
  
  const destinationLabel = isTeam ? "Team" : "Sport";

  const innerContent = (
    <>
      <View style={styles.handleContainer}>
        <View style={styles.handleIndicator} />
      </View>
      {logo ? (
        <Image source={logo} style={styles.teamLogo} resizeMode="contain" />
      ) : null}
      <Text style={styles.teamName}>{name}</Text>
      {established ? (
        <Text style={styles.establishedText}>{established}</Text>
      ) : null}
      <Button onPress={onGo} style={styles.goButton} isDark={isDark}>
        <Text style={styles.goText}>Go to {destinationLabel}</Text>
      </Button>
      {onRemove && currentUser ? (
        <Button onPress={onRemove} style={styles.removeButton} isDark={isDark}>
          <Text style={styles.removeText}>Remove from Favorites</Text>
        </Button>
      ) : null}
    </>
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleComponent={() => null}
    >
      <LinearGradient
        colors={[primaryColor, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={styles.linearGradient}
      >
        {liquid ? (
          <GlassView style={styles.blurViewWrapper} glassEffectStyle="clear">
            {innerContent}
          </GlassView>
        ) : (
          <BlurView intensity={100} style={styles.blurViewWrapper}>
            {innerContent}
          </BlurView>
        )}
      </LinearGradient>
    </BottomSheetModal>
  );
}
