import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import ChampionshipBanner from "components/Sports/NBA/Team/ChampionshipBanner";
import TeamInfoCard from "components/Sports/NBA/Team/TeamInfoCard";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getCBBTeam } from "constants/teamsCBB";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  coachImage?: any;
  teamHistory?: string;
  teamId?: string | number;
};

export default function CBBTeamInfoBottomSheet({
  visible,
  onClose,
  teamId,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // 🔥 local lookup like MLB
  const fetchedTeam = teamId ? getCBBTeam(teamId) : null;

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const snapPoints = useMemo(() => ["60%", "92%"], []);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
      backgroundStyle={{ backgroundColor: "transparent" }}
      handleStyle={{
        backgroundColor: "transparent",
        paddingTop: 12,
        alignItems: "center",
        position: "absolute",
        left: 0,
        right: 0,
      }}
      handleIndicatorStyle={{
        backgroundColor: fetchedTeam?.color ?? Colors.midTone,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
    >
      <View style={styles.container}>
        <BlurView
          intensity={100}
          tint={isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
          style={StyleSheet.absoluteFill}
        />

        <View style={{ paddingHorizontal: 12, flex: 1 }}>
          {/* Team Name */}
          {fetchedTeam?.fullName && (
            <Text
              style={[
                styles.teamName,
                {
                  paddingTop: insets.top - 20,
                  color: isDark ? Colors.white : Colors.black,
                },
              ]}
            >
              {fetchedTeam.fullName}
            </Text>
          )}

          <BottomSheetScrollView
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Text
              style={[
                styles.sectionTitle,
                {
                  borderBottomColor: isDark ? Colors.white : Colors.black,
                  color: isDark ? Colors.white : Colors.black,
                },
              ]}
            >
              Championships
            </Text>

            {/* Banner */}
            <ChampionshipBanner
              years={fetchedTeam?.championships ?? []}
              logo={fetchedTeam?.logo}
              teamName={fetchedTeam?.fullName}
              teamId={fetchedTeam?.id}
              league="CBB"
            />

            {/* Info Card */}
            <TeamInfoCard teamId={teamId} league="CBB" />
          </BottomSheetScrollView>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  teamName: {
    fontFamily: Fonts.OSSEMIBOLD,
    fontSize: 20,
    paddingBottom: 12,
    textAlign: "center",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: Fonts.OSMEDIUM,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
  },
});
