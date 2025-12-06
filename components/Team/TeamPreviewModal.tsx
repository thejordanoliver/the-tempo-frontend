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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

  const specialTeams = [
    "Brooklyn Nets",
    "Los Angeles Lakers",
    "Milwaukee Bucks",
    "Washington Wizards",
    "Golden State Warriors",
    "Denver Nuggets",
    "Indiana Pacers",
    "Memphis Grizzlies",
    "Phoenix Suns",
    "San Antonio Spurs",
    "Utah Jazz",
    "Philadelphia 76ers",
    "New York Knicks",
    "New Orleans Pelicans",
    "Oklahoma City Thunder",
    "Jacksonville Jaguars",
    "Houston Texans",
    "Cleveland Browns",
    "Chicago Bears",
    "Buffalo Bills",
    "Indianapolis Colts",
    "Denver Broncos",
    "Pittsburgh Steelers",
    "Green Bay Packers",
    "Los Angeles Rams",
    "Las Vegas Raiders",
    "Minnesota Timberwolves",
    "New England Patriots",
    "Seattle Seahawks",
    "UCF Knights",
    "California Golden Bears",
    "Cincinnati Bearcats",
    "Auburn Tigers",
  ];

  const logoLightTeams = [
    "Houston Rockets",
    "Philadelphia 76ers",
    "Toronto Raptors",
    "Utah Jazz",
    "New York Giants",
    "New York Jets",
    "California Golden Bears",
    "Alabama Crimson Tide",
    "Cincinnati Bearcats",
    "Auburn Tigers",
  ];

  const teamName = team?.fullName?.trim() ?? "";
  const useSecondary = specialTeams.includes(teamName);
  const useLogoLight = logoLightTeams.includes(teamName);
  const light = team?.logoLight ? team?.logoLight : team?.logo;
  const baseColor = useSecondary
    ? team?.secondaryColor || "#444"
    : team?.color || "#444";
  const est = team.firstSeason ?? (team as any).established ?? "—";

  function resolveLogo(source: any) {
    if (!source) return null;

    // require() → number
    if (typeof source === "number") return source;

    // { uri: string }
    if (typeof source === "object" && source.uri) return source;

    // string URL
    if (typeof source === "string") return { uri: source };

    return null;
  }
const darkPreferredLogo =
  useLogoLight && team.logoLight ? team.logoLight : team.logoLight || team.logo;

const resolvedLogo = resolveLogo(isDark ? darkPreferredLogo : team.logo);

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable onPress={onClose} style={{ flex: 1 }}>
        <BlurView
          intensity={40}
          tint="dark"
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <LinearGradient
            colors={
              isDark
                ? [baseColor, "rgba(50,50,50,0.5)"]
                : [team.color || "#444", "rgba(200,200,200,0.4)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={{
              marginTop: "auto",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 1.5,
            }}
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
                style={{
                  borderTopLeftRadius: 18.5,
                  borderTopRightRadius: 18.5,
                  paddingHorizontal: 20,
                  paddingVertical: 40,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
              <Image
  source={
    resolvedLogo ??
    require("assets/Placeholders/teamPlaceholder.png")
  }
  style={{ width: 60, height: 60, marginBottom: 10 }}
  resizeMode="contain"
/>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: Fonts.OSSEMIBOLD,
                    color: isDark ? Colors.white : Colors.black,
                  }}
                >
                  {team.fullName}
                </Text>
                <Text
                  style={{
                    marginBottom: 12,
                    fontFamily: Fonts.OSREGULAR,
                    color: isDark ? Colors.white : Colors.black,
                  }}
                >
                  EST. {est}
                </Text>
                <Text
                  style={{
                    marginVertical: 12,
                    fontFamily: Fonts.OSEXTRALIGHT,
                    color: isDark ? Colors.white : Colors.black,
                  }}
                >
                  Tap below to view team page
                </Text>

                <Pressable
                  onPress={onGo}
                  style={{
                    backgroundColor: isDark ? Colors.white : Colors.black,
                    padding: 16,
                    borderRadius: 10,
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? Colors.black : Colors.white,
                      fontFamily: Fonts.OSSEMIBOLD,
                    }}
                  >
                    Go to Team
                  </Text>
                </Pressable>

                {onRemove && currentUser && (
                  <Pressable
                    onPress={async () => {
                      if (onRemove) {
                        await onRemove(team.id.toString());
                      }
                      onClose();
                    }}
                    style={{
                      backgroundColor: "#ff3b30",
                      padding: 16,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.white,
                        fontFamily: Fonts.OSSEMIBOLD,
                      }}
                    >
                      Remove from Favorites
                    </Text>
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
