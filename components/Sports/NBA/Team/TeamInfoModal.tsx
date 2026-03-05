import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import ChampionshipBanner from "components/Sports/NBA/Team/ChampionshipBanner";
import { Colors, Fonts } from "constants/Styles";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { BlurView } from "expo-blur";
import { useChampions } from "hooks/useChampions";
import { useTeamCoaches } from "hooks/useTeamCoaches";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeagueType } from "types/types";
import TeamInfoCard from "./TeamInfoCard";
import { getNHLTeam } from "constants/teamsNHL";

type Props = {
  visible: boolean;
  onClose: () => void;
  coach?: string;
  teamHistory?: string;
  teamId?: string | number;
  league: LeagueType;
};

export default function TeamInfoModal({
  visible,
  onClose,
  teamId,
  league,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const isChampionsSupported =
    league === "NBA" ||
    league === "CFB" ||
    league === "NFL" ||
    league === "MLB" ||
    league === "NHL" ||
    league === "CBB" ||
    league === "WCBB";

  const { coaches } = useTeamCoaches(
    teamId != null ? Number(teamId) : 0,
    league,
  );

  const { data: champions } = useChampions({
    league: ["NBA", "CFB", "NFL", "MLB", "NHL", "CBB", "WCBB"].includes(league)
      ? league
      : "NBA",
    enabled: isChampionsSupported && !!teamId,
  });

  // --------------------------------------------------
  // UNIVERSAL TEAM LOOKUP
  // --------------------------------------------------
  const fetchedTeam = useMemo(() => {
    if (!teamId) return null;
    switch (league) {
      case "CBB":
        return getCBBTeam(teamId);
      case "WCBB":
        return getCBBTeam(teamId, true);
      case "CFB":
        return getCFBTeam(teamId);
      case "MLB":
        return getMLBTeam(teamId);
      case "NHL":
        return getNHLTeam(teamId);
      case "NFL":
        return getNFLTeam(teamId);
      case "NBA":
        return getNBATeam(teamId);
      default:
        return null;
    }
  }, [teamId, league]);

  // --------------------------------------------------
  // CHAMPIONSHIP NOTES / YEARS
  // --------------------------------------------------
const teamChampionshipNotes = useMemo(() => {
  if (!isChampionsSupported || !teamId || !champions) return [];

  return champions
    .filter((c) => Number(c.team?.id) === Number(teamId))
    .map((c) => c.notes ?? c.season)
    .filter((val) => val != null)
    .sort((a, b) => Number(a) - Number(b));
}, [champions, teamId, isChampionsSupported]);

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
        backgroundColor: Colors.midTone,
        width: 36,
        height: 4,
        borderRadius: 2,
      }}
    >
      <View style={styles.container}>
        <BlurView
          intensity={100}
          tint={"systemThinMaterial"}
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
                isChampionsSupported
                  ? teamChampionshipNotes
                  : Array.isArray((fetchedTeam as any)?.championships)
                    ? (fetchedTeam as any).championships
                    : []
              }
              logo={fetchedTeam?.logo}
              teamName={fetchedTeam?.fullName}
              teamId={fetchedTeam?.id}
              league={league}
            />

            {/* TEAM INFO CARD */}
            <TeamInfoCard teamId={teamId} league={league} coach={coaches[0]} />
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
