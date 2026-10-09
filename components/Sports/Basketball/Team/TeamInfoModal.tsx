import Button from "@/components/Buttons/Button";
import CenteredHeader from "@/components/Headings/CenteredHeader";
import ChampionshipBanner from "@/components/Sports/Basketball/Team/ChampionshipBanner";
import { usePreferences } from "@/contexts/PreferencesContext";
import { TeamDetails } from "@/hooks/useTeams";
import { TeamInfoModalStyles } from "@/styles/ModalsStyles/TeamInfoModalStyles";
import { snapPoints } from "@/utils/modalUtils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import SeasonStatCardSkeleton from "components/Skeletons/SeasonStatCardSkeleton";
import { globalStyles } from "constants/styles";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TeamInfo from "./TeamInfo";

type Props = {
  teamDetails: TeamDetails | null;
  visible: boolean;
  onClose: () => void;
  coach?: string;
  teamHistory?: string;
  teamId?: string | number;
  teamLogo?: any;
  teamColor?: string;
  league: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => Promise<void>;
};

export default function TeamInfoModal({
  teamDetails,
  visible,
  onClose,
  teamId,
  teamLogo,
  teamColor,
  league,
  loading = false,
  error,
  onRetry,
}: Props) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);
  const styles = TeamInfoModalStyles(isDark, insets);
  const global = globalStyles(isDark);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        isPresentedRef.current = true;
        sheetRef.current?.present();
      }, 0);

      return () => clearTimeout(timeout);
    }

    if (isPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    isPresentedRef.current = false;
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={1}
      onDismiss={handleDismiss}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundStyle={styles.backgroundStyle}
    >
      <View style={styles.container}>
        <BlurView intensity={100} style={styles.blurViewContainer}>
          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
          >
            {!teamDetails && (loading || !error) ? (
              <SeasonStatCardSkeleton />
            ) : error ? (
              <>
                <Text style={global.errorText}>
                  Could not load team information.
                </Text>
                {onRetry && (
                  <Button
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading team information"
                    onPress={() => void onRetry()}
                    isDark={isDark}
                    variant="outline"
                  >
                    Try again
                  </Button>
                )}
              </>
            ) : (
              <>
                <CenteredHeader isDark={isDark}>Championships</CenteredHeader>

                <ChampionshipBanner
                  championships={teamDetails?.championships}
                  teamName={teamDetails?.name ?? teamDetails?.shortName}
                  teamLogo={teamLogo}
                  teamColor={teamColor}
                  teamId={teamId}
                  league={league}
                />

                <TeamInfo
                  teamId={teamId}
                  teamDetails={teamDetails ?? null}
                  league={league}
                  teamColor={teamColor}
                />
              </>
            )}
          </BottomSheetScrollView>
        </BlurView>
      </View>
    </BottomSheetModal>
  );
}
