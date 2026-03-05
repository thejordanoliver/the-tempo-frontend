import { Colors, Fonts } from "constants/Styles";
import { getTeamLogo } from "constants/teams";
import { getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeamLogo } from "constants/teamsNHL";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";

import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
} from "react-native";

import { LeagueType, Team } from "types/types";

type TeamWithLeague = Team & { league: LeagueType };

type Props = {
  visible: boolean;
  team: TeamWithLeague;
  onClose: () => void;
  onGo: () => void;
  onRemove?: (team: TeamWithLeague) => void;
  currentUser?: boolean;
};

export default function TeamPreviewModal({
  visible,
  team,
  onClose,
  onGo,
  onRemove,
  currentUser,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const isDark = useColorScheme() === "dark";
  const styles = teamPreviewModalStyles(isDark);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.85);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const isNBA = team.league === "NBA";
  const isWCBB = team.league === "WCBB";
  const isCBB = team.league === "CBB";
  const isMLB = team.league === "MLB";
  const isNFL = team.league === "NFL";
  const isCFB = team.league === "CFB";
  const isNHL = team.league === "NHL";

  const logo = isCBB
    ? getCBBTeamLogo(team.id, isDark, false)
    : isWCBB
      ? getCBBTeamLogo((team as any).wid, isDark, true)
      : isNBA
        ? getTeamLogo(team.id, isDark)
        : isCFB
          ? getCFBTeamLogo(team.id, isDark)
          : isNFL
            ? getNFLTeamLogo(team.id, isDark)
            : isMLB
              ? getMLBTeamLogo(team.id, isDark)
              : isNHL
                ? getNHLTeamLogo(team.id, isDark)
                : null;

  const baseColor = isDark
    ? team?.secondaryColor || Colors.midTone
    : team?.color || Colors.midTone;

  const est = team.firstSeason ?? (team as any).established ?? "—";

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.container}>
        <BlurView intensity={40} tint="dark" style={styles.blurViewContainer}>
          <LinearGradient
            colors={
              isDark
                ? [baseColor, "rgba(50,50,50,0.5)"]
                : [team.color || "#444", "rgba(200,200,200,0.4)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={styles.linearGradient}
          >
            <Animated.View
              style={{
                borderTopLeftRadius: 18.5,
                borderTopRightRadius: 18.5,
                overflow: "hidden",
                transform: [{ scale: scaleAnim }],
                backgroundColor: "transparent",
              }}
            >
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={styles.blurViewWrapper}
              >
                {logo && (
                  <Image
                    source={logo}
                    style={styles.teamLogo}
                    resizeMode="contain"
                  />
                )}

                <Text style={styles.teamName}>{team.fullName}</Text>

                <Text style={styles.establishedText}>EST. {est}</Text>

                <Text style={styles.subText}>Tap below to view team page</Text>

                {/* Go To Team */}
                <Pressable onPress={onGo} style={styles.goButton}>
                  <Text style={styles.goText}>Go to Team</Text>
                </Pressable>

                {/* Remove Favorite */}
                {onRemove && currentUser && (
                  <Pressable
                    onPress={() => onRemove(team)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeText}>Remove from Favorites</Text>
                  </Pressable>
                )}
              </BlurView>
            </Animated.View>
          </LinearGradient>
        </BlurView>
      </Pressable>
    </Modal>
  );
}

export const teamPreviewModalStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1 },

    blurViewContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },

    linearGradient: {
      marginTop: "auto",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 1.5,
    },

    blurViewWrapper: {
      borderTopLeftRadius: 18.5,
      borderTopRightRadius: 18.5,
      paddingHorizontal: 20,
      paddingVertical: 40,
      backgroundColor: "rgba(255,255,255,0.05)",
      alignItems: "center",
    },

    teamLogo: {
      width: 60,
      height: 60,
      marginBottom: 10,
    },

    teamName: {
      fontSize: 20,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
    },

    establishedText: {
      marginBottom: 12,
      fontFamily: Fonts.OSREGULAR,
      color: isDark ? Colors.white : Colors.black,
    },

    subText: {
      marginVertical: 12,
      fontFamily: Fonts.OSEXTRALIGHT,
      color: isDark ? Colors.white : Colors.black,
    },

    goButton: {
      backgroundColor: isDark ? Colors.white : Colors.black,
      padding: 16,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 12,
      width: "100%",
    },

    goText: {
      color: isDark ? Colors.black : Colors.white,
      fontFamily: Fonts.OSSEMIBOLD,
    },

    removeButton: {
      backgroundColor: isDark ? Colors.dark.lightRed : Colors.light.red,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      width: "100%",
    },

    removeText: {
      color: Colors.white,
      fontFamily: Fonts.OSSEMIBOLD,
    },
  });
