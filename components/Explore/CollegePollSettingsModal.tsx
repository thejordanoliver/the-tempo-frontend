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
import type { CollegePollSettingsModalProps } from "types/collegePollWidget";
import {
  EXPLORE_COLLEGE_POLL_LEAGUES,
  type ExploreCollegePollLeague,
  type ExploreCollegePollType,
} from "types/widgets";
import {
  getCollegePollOptions,
  normalizeCollegePollType,
} from "utils/collegePollWidget";

const collegePollSnapPoints = [snapPoints[1]];

export default function CollegePollSettingsModal({
  visible,
  isDark,
  selectedLeague,
  selectedPollType,
  autoPlay,
  onClose,
  onSelect,
  onChangeAutoPlay,
}: CollegePollSettingsModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const hasPresentedRef = useRef(false);
  const { top, bottom } = useSafeAreaInsets();
  const styles = useMemo(() => collegePollSettingsStyles(isDark), [isDark]);
  const pollOptions = getCollegePollOptions(selectedLeague);

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

  const handleLeagueSelect = useCallback(
    (league: ExploreCollegePollLeague) => {
      onSelect(league, normalizeCollegePollType(league, selectedPollType));
    },
    [onSelect, selectedPollType],
  );

  const handlePollSelect = useCallback(
    (pollType: ExploreCollegePollType) => {
      onSelect(selectedLeague, pollType);
      sheetRef.current?.dismiss();
    },
    [onSelect, selectedLeague],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={collegePollSnapPoints}
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
            <Text style={styles.title}>College poll</Text>
            <Text style={styles.subtitle}>
              Choose the sport and rankings shown in this widget.
            </Text>
          </View>
        </View>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
        >
          <Text style={styles.sectionLabel}>Sport</Text>
          <View style={styles.sportRow}>
            {EXPLORE_COLLEGE_POLL_LEAGUES.map((league) => {
              const config = LEAGUE_CONFIG[league];
              const selected = league === selectedLeague;

              return (
                <Pressable
                  key={league}
                  onPress={() => handleLeagueSelect(league)}
                  style={({ pressed }) => [
                    styles.sportOption,
                    selected && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${config.label} polls`}
                  accessibilityState={{ selected }}
                >
                  <Image
                    source={isDark ? config.logoLight : config.logo}
                    style={styles.logo}
                    contentFit="contain"
                  />
                  <Text style={styles.sportText}>{league.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Ranking</Text>
          {pollOptions.map((option) => {
            const selected = option.value === selectedPollType;

            return (
              <Pressable
                key={option.value}
                onPress={() => handlePollSelect(option.value)}
                style={({ pressed }) => [
                  styles.pollOption,
                  selected && styles.pollOptionSelected,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Show ${option.label}`}
                accessibilityState={{ selected }}
              >
                <Text style={styles.pollText}>{option.label}</Text>
                <Ionicons
                  name={selected ? "checkmark-circle" : "chevron-forward"}
                  size={selected ? 22 : 18}
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
              <Text style={styles.settingTitle}>Autoplay rankings</Text>
              <Text style={styles.settingDescription}>
                Automatically advance through the poll slides.
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
              accessibilityLabel="Automatically advance college poll slides"
            />
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
