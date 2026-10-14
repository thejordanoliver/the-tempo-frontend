import { snapPoints } from "@/utils/ui/modalUtils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors } from "constants/styles";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collegePollSettingsStyles } from "styles/ExploreStyles/CollegePollSettingsStyles";

type FavoriteTeamsSettingsModalProps = {
  visible: boolean;
  isDark: boolean;
  autoPlay: boolean;
  onClose: () => void;
  onChangeAutoPlay: (autoPlay: boolean) => void;
};

const favoriteTeamsSnapPoints = [snapPoints[1]];

export default function FavoriteTeamsSettingsModal({
  visible,
  isDark,
  autoPlay,
  onClose,
  onChangeAutoPlay,
}: FavoriteTeamsSettingsModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const hasPresentedRef = useRef(false);
  const { top, bottom } = useSafeAreaInsets();
  const styles = useMemo(() => collegePollSettingsStyles(isDark), [isDark]);

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

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={favoriteTeamsSnapPoints}
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
            <Text style={styles.title}>Favorite teams</Text>
            <Text style={styles.subtitle}>
              Choose how your favorite teams are displayed.
            </Text>
          </View>
        </View>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
        >
          <Text style={styles.sectionLabel}>Playback</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Autoplay teams</Text>
              <Text style={styles.settingDescription}>
                Automatically advance through your favorite teams.
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
              accessibilityLabel="Automatically advance favorite team slides"
            />
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}
