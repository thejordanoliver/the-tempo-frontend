import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import ChampionshipBanner from "components/ChampionshipBanner";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LeagueType } from "types/types";
import TeamInfoCard from "./TeamInfoCard";

type Props = {
  visible: boolean;
  onClose: () => void;
  coachName?: string;
  coachImage?: any;
  teamHistory?: string;
  teamId?: string | number;
  league: LeagueType;
};

export default function TeamInfoModal({
  visible,
  onClose,
  teamId,
  league,
  coachName,
  coachImage,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // --------------------------------------------------
  // UNIVERSAL TEAM LOOKUP
  // --------------------------------------------------
  const fetchedTeam = (() => {
    if (!teamId) return null;

    switch (league) {
      case "CBB":
        return getCBBTeam(teamId);
      case "CFB":
        return getCFBTeam(teamId);
      case "MLB":
        return getMLBTeam(teamId);
      case "NFL":
        return getNFLTeam(teamId);
      case "NBA":
        return getNBATeam(teamId);
      default:
        return null;
    }
  })();

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
          {/* TEAM NAME */}
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
            {/* HEADER */}
            <Text
              style={[
                styles.sectionTitle,
                {
                  borderBottomColor: isDark
                    ? Colors.lightGray
                    : Colors.darkGray,
                  color: isDark ? Colors.white : Colors.black,
                },
              ]}
            >
              Championships
            </Text>

            {/* CHAMPIONSHIP BANNERS */}
            <ChampionshipBanner
              years={
                Array.isArray((fetchedTeam as any)?.championships)
                  ? (fetchedTeam as any).championships
                  : []
              }
              logo={fetchedTeam?.logo}
              teamName={fetchedTeam?.fullName}
              teamId={fetchedTeam?.id}
              league={league}
            />

            {/* TEAM INFO CARD */}
            <TeamInfoCard teamId={teamId} league={league} />
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
