import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import ChampionshipBanner from "components/Team/ChampionshipBanner";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getMLBTeam } from "constants/teamsMLB";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TeamInfoCard from "./TeamInfoCard";

type Props = {
  visible: boolean;
  onClose: () => void;
  coachImage?: any;
  teamHistory?: string;
  teamId?: string | number;
};

export default function TeamInfoBottomSheet({
  visible,
  onClose,

  coachImage,
  teamHistory,
  teamId,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // 🔥 New: use local lookup ONLY
  const fetchedTeam = teamId ? getMLBTeam(teamId) : null;

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
      backgroundStyle={{
        backgroundColor: "transparent",
      }}
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
      <View
        style={{
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        }}
      >
        <BlurView
          intensity={100}
          tint={isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
          style={StyleSheet.absoluteFill}
        />

        <View style={{ paddingHorizontal: 12, flex: 1 }}>
          {/* Team Name Header */}
          {fetchedTeam?.fullName && (
            <Text
              style={{
                fontFamily: Fonts.OSSEMIBOLD,
                fontSize: 20,
                paddingTop: insets.top - 20,
                paddingBottom: 12,
                color: isDark ? Colors.white : Colors.black,
                textAlign: "center",
              }}
            >
              {fetchedTeam.fullName}
            </Text>
          )}

          <BottomSheetScrollView
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Championships Header */}
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                fontFamily: Fonts.OSMEDIUM,
                marginBottom: 8,
                paddingBottom: 4,
                borderBottomWidth: 0.5,
                borderBottomColor: isDark ? Colors.darkGray : Colors.lightGray,
                color: isDark ? Colors.white : Colors.black,
              }}
            >
              Championships
            </Text>

            {/* Championship Banner */}
            <ChampionshipBanner
              years={fetchedTeam?.championships ?? []}
              logo={fetchedTeam?.logo}
              teamName={fetchedTeam?.fullName}
              teamId={fetchedTeam?.id}
              league="MLB"
            />

            {/* Additional team info */}
            <TeamInfoCard teamId={teamId} />
          </BottomSheetScrollView>
        </View>
      </View>
    </BottomSheetModal>
  );
}
