import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import ChampionshipBanner from "components/Sports/NBA/Team/ChampionshipBanner";
import { Colors, Fonts } from "constants/styles";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { getNHLTeam } from "constants/teamsNHL";
import { getWNBATeam } from "constants/teamsWNBA";
import { BlurView } from "expo-blur";
import { useChampions } from "hooks/LeagueHooks/useChampions";
import { useTeamCoaches } from "hooks/useTeamCoaches";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeagueType } from "types/types";
import TeamInfoCard from "./TeamInfoCard";

type Props = {
  visible: boolean;
  onClose: () => void;
  coach?: string;
  teamHistory?: string;
  teamId?: string | number;
  league: LeagueType;
  isDark: boolean;
};

export default function TeamInfoModal({
  visible,
  onClose,
  teamId,
  league,
  isDark,
}: Props) {
  const insets = useSafeAreaInsets(); // ✅ MOVE HERE
  const sheetRef = useRef<BottomSheetModal>(null);
  const styles = TeamInfoModalStyles(isDark, insets);

  const isChampionsSupported =
    league === "NBA" ||
    league === "WNBA" ||
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
    league: league,
  });

  // --------------------------------------------------
  // UNIVERSAL TEAM LOOKUP
  // --------------------------------------------------
  const team = useMemo(() => {
    if (!teamId) return null;
    switch (league) {
      case "CBB":
        return getCBBTeam(teamId);
      case "WNBA":
        return getWNBATeam(teamId);
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

  function getTeamId(team: any, league: LeagueType) {
    if (!team) return undefined;

    if (league === "WCBB" && "wid" in team) {
      return team.wid;
    }

    return team.id;
  }

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
      backgroundStyle={styles.backgroundStyle}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}
    >
      <View style={styles.container}>
        <BlurView
          intensity={100}
          tint={"systemThinMaterial"}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.wrapper}>
          {/* TEAM NAME */}
          {team?.fullName && (
            <Text style={styles.teamName}>{team.fullName}</Text>
          )}

          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <Text style={styles.sectionTitle}>Championships</Text>

            {/* CHAMPIONSHIP BANNERS */}
            <ChampionshipBanner
              years={
                isChampionsSupported
                  ? teamChampionshipNotes
                  : Array.isArray((team as any)?.championships)
                    ? (team as any).championships
                    : []
              }
              logo={team?.logo}
              teamName={team?.fullName}
              teamId={getTeamId(team, league)}
              league={league}
              isDark={isDark}
            />

            {/* TEAM INFO CARD */}
            <TeamInfoCard
              teamId={getTeamId(team, league)}
              league={league}
              coach={coaches[0]}
            />
          </BottomSheetScrollView>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const TeamInfoModalStyles = (isDark: boolean, insets: any) =>
  StyleSheet.create({
    backgroundStyle: { backgroundColor: "transparent" },
    handleStyle: {
      backgroundColor: "transparent",
      paddingTop: 12,
      alignItems: "center",
      position: "absolute",
      left: 0,
      right: 0,
    },
    handleIndicatorStyle: {
      backgroundColor: Colors.midTone,
      width: 36,
      height: 4,
      borderRadius: 2,
    },
    container: {
      flex: 1,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    wrapper: { paddingHorizontal: 12, flex: 1 },
    contentContainerStyle: { paddingTop: 20, paddingBottom: 40 },
    teamName: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 20,
      paddingBottom: 12,
      textAlign: "center",
      paddingTop: insets.top - 20,
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
  });
