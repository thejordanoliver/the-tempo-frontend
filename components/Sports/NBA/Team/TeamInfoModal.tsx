import { snapPoints } from "@/utils/modalUtils";
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
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const isPresentedRef = useRef(false);

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
    league,
  });

  const team = useMemo(() => {
    if (teamId == null) return null;

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

  const getTeamId = useCallback((teamData: any, leagueType: LeagueType) => {
    if (!teamData) return undefined;

    if (leagueType === "WCBB" && "wid" in teamData) {
      return teamData.wid;
    }

    return teamData.id;
  }, []);

  const teamChampionshipNotes = useMemo(() => {
    if (!isChampionsSupported || teamId == null || !champions) return [];

    return champions
      .filter((c) => Number(c.team?.id) === Number(teamId))
      .map((c) => c.notes ?? c.season)
      .filter((val) => val != null)
      .sort((a, b) => Number(a) - Number(b));
  }, [champions, teamId, isChampionsSupported]);

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
          {team?.fullName && (
            <Text style={styles.teamName}>{team.fullName}</Text>
          )}

          <BottomSheetScrollView
            contentContainerStyle={styles.contentContainerStyle}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Championships</Text>

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

            <TeamInfoCard
              teamId={getTeamId(team, league)}
              league={league}
              coach={coaches?.[0]}
            />
          </BottomSheetScrollView>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const TeamInfoModalStyles = (isDark: boolean, insets: any) =>
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
      paddingTop: Math.max(insets.top - 20, 12),
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
