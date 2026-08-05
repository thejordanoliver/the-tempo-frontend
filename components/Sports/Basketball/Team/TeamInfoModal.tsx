import ChampionshipBanner from "@/components/Sports/Basketball/Team/ChampionshipBanner";
import { TeamDetails } from "@/hooks/useTeams";
import { snapPoints } from "@/utils/modalUtils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors, Fonts } from "constants/styles";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeagueType } from "types/types";
import TeamInfoCard from "./TeamInfoCard";

type Props = {
  teamDetails: TeamDetails | null;
  visible: boolean;
  onClose: () => void;
  coach?: string;
  teamHistory?: string;
  teamId?: string | number;
  teamLogo?: any;
  league: LeagueType;
  isDark: boolean;
};

export default function TeamInfoModal({
  teamDetails,
  visible,
  onClose,
  teamId,
  teamLogo,
  league,
  isDark,
}: Props) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);
  const styles = TeamInfoModalStyles(isDark, insets);

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
      index={0}
      onDismiss={handleDismiss}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.backgroundStyle}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
    >
      <View style={styles.container}>
        <BlurView
          intensity={100}
          tint={"systemMaterial"}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.wrapper}>
          {teamDetails?.name && (
            <Text style={styles.teamName}>{teamDetails.name}</Text>
          )}

          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Championships</Text>

            <ChampionshipBanner
              championships={teamDetails?.championships}
              logo={teamDetails?.logo}
              teamName={teamDetails?.name ?? teamDetails?.shortName}
              teamLogo={teamLogo}
              teamId={teamId}
              league={league}
              isDark={isDark}
            />

            <TeamInfoCard
              teamId={teamId}
              teamDetails={teamDetails ?? null}
              league={league}
              isDark={isDark}
            />
          </BottomSheetScrollView>
        </View>
      </View>
    </BottomSheetModal>
  );
}

export const TeamInfoModalStyles = (isDark: boolean, insets: any) =>
  StyleSheet.create({
    backgroundStyle: { backgroundColor: "transparent", overflow: "hidden" },
    handleStyle: {
      backgroundColor: "transparent",
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      left: 8,
      right: 8,
      top: 0,
    },
    handleIndicatorStyle: {
      backgroundColor: Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
      zIndex: 9999,
      marginBottom: 4,
    },
    container: {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    wrapper: {
      paddingHorizontal: 12,
      flex: 1,
    },
    contentContainerStyle: {
      paddingTop: 20,
      paddingBottom: 40,
    },
    teamName: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      paddingBottom: 12,
      textAlign: "center",
      paddingTop: Math.max(insets?.top - 20, 12),
      color: isDark ? Colors.white : Colors.black,
    },
    sectionTitle: {
      textAlign: "center",
      fontSize: 20,
      fontFamily: Fonts.OSMEDIUM,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? Colors.lightGray : Colors.darkGray,
      color: isDark ? Colors.white : Colors.black,
    },
    infoCardContainer: { width: "100%" },
  });
