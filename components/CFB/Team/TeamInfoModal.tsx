// components/TeamInfoBottomSheet.tsx
import ChampionshipBanner from "components/ChampionshipBanner";
import { getTeamInfo as getCFBTeamInfo, logoMap as logoMapCFB } from "constants/teamsCFB";
import { getTeamInfo as getCBBTeamInfo, logoMap as logoMapCBB } from "constants/teamsCBB";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TeamInfoCard from "./TeamInfoCard";
import { Fonts } from "constants/fonts";

type Props = {
  visible: boolean;
  onClose: () => void;
  teamId?: string | number;
  league: "CFB" | "CBB"; // ✅ added league prop
};

export default function TeamInfoBottomSheet({
  visible,
  onClose,
  teamId,
  league,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // ✅ Select correct team info source
  const team =
    league === "CFB"
      ? teamId
        ? getCFBTeamInfo(teamId)
        : undefined
      : teamId
      ? getCBBTeamInfo(teamId)
      : undefined;

  // ✅ Select correct logo map
  const logoMap = league === "CFB" ? logoMapCFB : logoMapCBB;

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
        backgroundColor: team?.color,
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
          tint={"systemThinMaterial"}
          style={StyleSheet.absoluteFill}
        />

        <View style={{ paddingHorizontal: 12, flex: 1 }}>
          {team?.name && (
            <Text
              style={{
                fontFamily: Fonts.OSSEMIBOLD,
                fontSize: 20,
                paddingTop: insets.top - 20,
                paddingBottom: 12,
                color: isDark ? "#fff" : "#1d1d1d",
                textAlign: "center",
              }}
            >
              {team.fullName}
            </Text>
          )}

          <BottomSheetScrollView
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 20,
                fontFamily: Fonts.OSMEDIUM,
                marginBottom: 8,
                paddingBottom: 4,
                borderBottomWidth: 0.5,
                borderBottomColor: isDark ? "#ccc" : "#444",
                color: isDark ? "#fff" : "#1d1d1d",
              }}
            >
              Championships
            </Text>

            <ChampionshipBanner
              years={
                team?.championships
                  ? team?.championships.map((year: string | number) => Number(year))
                  : []
              }
              logo={team?.logo ? logoMap[team.logo] : undefined}
              teamName={team?.name}
              teamId={team?.id}
              league={league} // ✅ pass dynamic league prop
            />

            <TeamInfoCard teamId={teamId} />
          </BottomSheetScrollView>
        </View>
      </View>
    </BottomSheetModal>
  );
}
