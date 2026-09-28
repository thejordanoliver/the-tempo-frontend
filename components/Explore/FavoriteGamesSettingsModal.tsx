import { snapPoints } from "@/utils/modalUtils";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { LEAGUE_CONFIG } from "constants/leagues";
import { Colors } from "constants/styles";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collegePollSettingsStyles } from "styles/ExploreStyles/CollegePollSettingsStyles";
import {
  EXPLORE_WIDGET_LEAGUES,
  type ExploreWidgetLeague,
} from "types/widgets";

type FavoriteGamesSettingsModalProps = {
  visible: boolean;
  isDark: boolean;
  selectedLeagues: readonly ExploreWidgetLeague[];
  autoPlay: boolean;
  favoriteLeagues: readonly ExploreWidgetLeague[];
  onClose: () => void;
  onChangeLeagues: (leagues: ExploreWidgetLeague[]) => void;
  onChangeAutoPlay: (autoPlay: boolean) => void;
};

const favoriteGamesSnapPoints = [snapPoints[2]];

export default function FavoriteGamesSettingsModal({
  visible,
  isDark,
  selectedLeagues,
  autoPlay,
  favoriteLeagues,
  onClose,
  onChangeLeagues,
  onChangeAutoPlay,
}: FavoriteGamesSettingsModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const hasPresentedRef = useRef(false);
  const { top, bottom } = useSafeAreaInsets();
  const styles = useMemo(() => collegePollSettingsStyles(isDark), [isDark]);
  const orderedLeagues = useMemo(
    () => [
      ...EXPLORE_WIDGET_LEAGUES.filter((league) =>
        favoriteLeagues.includes(league),
      ),
      ...EXPLORE_WIDGET_LEAGUES.filter(
        (league) => !favoriteLeagues.includes(league),
      ),
    ],
    [favoriteLeagues],
  );

  useEffect(() => {
    if (!visible) {
      if (hasPresentedRef.current) sheetRef.current?.dismiss();
      return;
    }

    if (hasPresentedRef.current) return;

    const frame = requestAnimationFrame(() => {
      hasPresentedRef.current = true;
      sheetRef.current?.present();
    });

    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const handleDismiss = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={isDark ? 0.58 : 0.34}
        pressBehavior="close"
      />
    ),
    [isDark],
  );

  const toggleLeague = useCallback(
    (league: ExploreWidgetLeague) => {
      if (selectedLeagues.length === 1 && selectedLeagues[0] === league) return;

      const nextLeagues = selectedLeagues.includes(league)
        ? selectedLeagues.filter((selected) => selected !== league)
        : EXPLORE_WIDGET_LEAGUES.filter(
            (candidate) =>
              selectedLeagues.includes(candidate) || candidate === league,
          );

      onChangeLeagues([...nextLeagues]);
    },
    [onChangeLeagues, selectedLeagues],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={favoriteGamesSnapPoints}
      stackBehavior="push"
      topInset={top}
      enableDynamicSizing={false}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Favorite team games</Text>
            <Text style={styles.subtitle}>
              Choose which sports appear in this widget.
            </Text>
          </View>
        </View>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>
              Sports · {selectedLeagues.length} selected
            </Text>
            <Pressable
              onPress={() => onChangeLeagues([...EXPLORE_WIDGET_LEAGUES])}
              disabled={selectedLeagues.length === EXPLORE_WIDGET_LEAGUES.length}
              accessibilityRole="button"
              accessibilityLabel="Select all sports"
            >
              <Text
                style={[
                  styles.sectionAction,
                  selectedLeagues.length === EXPLORE_WIDGET_LEAGUES.length &&
                    styles.sectionActionDisabled,
                ]}
              >
                Select all
              </Text>
            </Pressable>
          </View>
          {orderedLeagues.map((league) => {
            const config = LEAGUE_CONFIG[league];
            const selected = selectedLeagues.includes(league);
            const isOnlySelection = selected && selectedLeagues.length === 1;
            const hasFavoriteTeam = favoriteLeagues.includes(league);
            const isDisabled = isOnlySelection || (!hasFavoriteTeam && !selected);

            return (
              <Pressable
                key={league}
                onPress={() => toggleLeague(league)}
                disabled={isDisabled}
                style={({ pressed }) => [
                  styles.pollOption,
                  selected && styles.pollOptionSelected,
                  isDisabled && styles.optionDisabled,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="checkbox"
                accessibilityLabel={`Show ${config.label} favorite-team games`}
                accessibilityHint={
                  !hasFavoriteTeam
                    ? "Add a favorite team from this league to enable it"
                    : isOnlySelection
                    ? "At least one league must remain selected"
                    : undefined
                }
                accessibilityState={{ checked: selected, disabled: isDisabled }}
              >
                <Image
                  source={isDark ? config.logoLight : config.logo}
                  style={styles.logo}
                  contentFit="contain"
                />
                <View style={styles.pollCopy}>
                  <Text style={styles.pollText}>{config.label}</Text>
                  {!hasFavoriteTeam && (
                    <Text style={styles.optionMeta}>No favorite teams</Text>
                  )}
                </View>
                <Ionicons
                  name={selected ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={
                    selected
                      ? isDark
                        ? Colors.white
                        : Colors.black
                      : Colors.midTone
                  }
                />
              </Pressable>
            );
          })}

          <Text style={styles.sectionLabel}>Playback</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Autoplay games</Text>
              <Text style={styles.settingDescription}>
                Automatically advance through favorite-team game slides.
              </Text>
            </View>
            <Switch
              value={autoPlay}
              onValueChange={onChangeAutoPlay}
              trackColor={{
                false: isDark ? Colors.darkGray : Colors.lightGray,
                true: isDark ? Colors.dark.blue : Colors.light.blue,
              }}
              thumbColor={Colors.white}
              ios_backgroundColor={isDark ? Colors.darkGray : Colors.lightGray}
              accessibilityLabel="Automatically advance favorite-team game slides"
            />
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
