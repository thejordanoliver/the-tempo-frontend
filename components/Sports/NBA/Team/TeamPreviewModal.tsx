import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
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
import { Team } from "types/types";

type Props = {
  visible: boolean;
  team: Team;
  onClose: () => void;
  onGo: () => void;
  onRemove?: (teamId: string) => void; // optional remove callback
  currentUser?: boolean; // add currentUser id or username
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

  const logo = isDark ? team.logoLight || team.logo : team.logo;
  const imageSource = typeof logo === "number" ? logo : { uri: logo };

  const baseColor = isDark
    ? team?.secondaryColor || Colors.midTone
    : team?.color || Colors.midTone;
  const est = team.firstSeason ?? (team as any).established ?? "—";

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.constainer}>
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
                <Image
                  source={logo}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />

                <Text style={styles.teamName}>{team.fullName}</Text>
                <Text style={styles.establishedText}>EST. {est}</Text>
                <Text style={styles.subText}>Tap below to view team page</Text>

                <Pressable onPress={onGo} style={styles.goButton}>
                  <Text style={styles.goText}>Go to Team</Text>
                </Pressable>

                {onRemove && currentUser && (
                  <Pressable
                    onPress={async () => {
                      if (onRemove) {
                        await onRemove(team.id.toString());
                      }
                      onClose();
                    }}
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
    constainer: { flex: 1 },
    blurViewContainer: { flex: 1, justifyContent: "flex-end" },
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
    },
    teamLogo: { width: 60, height: 60, marginBottom: 10 },
    teamName: {
      fontSize: 20,
      fontFamily: Fonts.OSSEMIBOLD,
      color: isDark ? Colors.white : Colors.black,
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
    },
    removeText: {
      color: Colors.white,
      fontFamily: Fonts.OSSEMIBOLD,
    },
  });
