import { Ionicons } from "@expo/vector-icons";
import { HeaderTitle } from "@react-navigation/elements";
import { Fonts } from "constants/fonts";
import { teams as nbaTeams } from "constants/teams";
import { teams as nflTeams } from "constants/teamsNFL";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { useEffect, useMemo, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type CustomHeaderTitleProps = {
  title?: string;
  playerName?: string;
  tabName?: string;
  onLogout?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
  onCalendarPress?: () => void;
  onOpenLeagueModal?: () => void;
  modalVisible?: boolean;
  setModalVisible?: (v: boolean) => void;
  onToggleLayout?: () => void;
  isGrid?: boolean;
  logo?: ImageSourcePropType;
  logoLight?: ImageSourcePropType;
  teamColor?: string;
  isTeamScreen?: boolean;
  transparentColor?: string;
  onSearchToggle?: () => void;
  teamCode?: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
  teamCoach?: string;
  teamHistory?: string;
  isPlayerScreen?: boolean;
  showBackButton?: boolean;
  league?: "NBA" | "NFL" | "Leagues";
  isNeutralSite?: boolean;
  isFavorite?: boolean;
  onOpenInfo?: () => void;
  onToggleFavorite?: () => void;
};

// ---------- UTIL ----------
function hasLogoLight(team: any): team is { logoLight?: ImageSourcePropType } {
  return team?.logoLight !== undefined;
}

// ---------- SUBCOMPONENTS ----------
const TeamBackground = ({
  insets,
  isDark,
  selectedTeam,
  logo,
  teamColor,
  isTeamScreen,
  isPlayerScreen,
}: {
  insets: { top: number };
  isDark: boolean;
  selectedTeam?: any;
  logo?: ImageSourcePropType;
  teamColor?: string;
  isTeamScreen: boolean;
  isPlayerScreen?: boolean;
}) => {
  const defaultBgColor = isDark ? "#1d1d1d" : "#fff";

  if (!(isTeamScreen || isPlayerScreen)) {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: defaultBgColor,
          zIndex: -1,
        }}
      />
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top,
        height: 56,
        width: "100%",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: teamColor || defaultBgColor,
          zIndex: -1,
        }}
      />
      {(selectedTeam?.logo || logo) && (
        <Image
          source={
            selectedTeam?.logoLight
              ? selectedTeam.logoLight
              : selectedTeam?.logo ?? logo
          }
          style={styles.bgImage}
        />
      )}
    </View>
  );
};

const GameHeader = ({
  tabName,
  homeTeam,
  awayTeam,
  isNeutralSite,
}: {
  tabName?: string;
  homeTeam: any;
  awayTeam: any;
  isNeutralSite: boolean;
}) => {
  if (tabName !== "Game" || !homeTeam || !awayTeam) return null;

  const homeColor = homeTeam?.color || "#aaa";
  const awayColor = awayTeam?.color || "#666";
  const dividerText = isNeutralSite ? "vs" : "@";

  return (
    <View
      style={[StyleSheet.absoluteFillObject, { flexDirection: "row", zIndex: -10 }]}
    >
      <LinearGradient
        colors={[awayColor, awayColor, homeColor, homeColor]}
        locations={[0, 0.5, 0.5, 1]}
        start={{ x: 0, y: -2 }}
        end={{ x: 1.08, y: 1.2 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.teamHalfWrapper}>
        <View style={styles.teamHalfContent}>
          <Image
            source={hasLogoLight(awayTeam) ? awayTeam.logoLight : awayTeam.logo}
            style={styles.bgLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamCode}>{awayTeam.code}</Text>
        </View>
      </View>
      <View style={styles.dividerWrapper}>
        <Text style={styles.dividerText}>{dividerText}</Text>
      </View>
      <View style={styles.teamHalfWrapper}>
        <View style={styles.teamHalfContent}>
          <Image
            source={hasLogoLight(homeTeam) ? homeTeam.logoLight : homeTeam.logo}
            style={styles.bgLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamCode}>{homeTeam.code}</Text>
        </View>
      </View>
    </View>
  );
};

// ---------- MAIN COMPONENT ----------
export function CustomHeaderTitle({
  title,
  playerName,
  tabName,
  onLogout,
  onSettings,
  onBack,
  onCalendarPress,
  onOpenLeagueModal,
  onToggleLayout,
  isGrid,
  teamColor,
  isTeamScreen = false,
  onSearchToggle,
  teamCode,
  homeTeamCode,
  awayTeamCode,
  isFavorite,
  onToggleFavorite,
  isPlayerScreen,
  showBackButton = true,
  isNeutralSite = false,
  modalVisible = false,
  onOpenInfo,
  setModalVisible = () => {},
  league = "Leagues",
  logo,
  logoLight,
}: CustomHeaderTitleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Rotation anim for league dropdown
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: modalVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Memoized team lookups
  const selectedTeam = useMemo(
    () =>
      league === "NFL"
        ? nflTeams.find((t) => t.code === teamCode)
        : nbaTeams.find((t) => t.code === teamCode),
    [teamCode, league]
  );

  const homeTeam = useMemo(
    () =>
      league === "NFL"
        ? nflTeams.find((t) => t.code === homeTeamCode) ?? {
            code: homeTeamCode ?? "HOM",
            name: "Home",
            color: "#aaa",
            logo: null,
          }
        : nbaTeams.find((t) => t.code === homeTeamCode) ?? {
            code: homeTeamCode ?? "HOM",
            name: "Home",
            color: "#aaa",
            logo: null,
          },
    [homeTeamCode, league]
  );

  const awayTeam = useMemo(
    () =>
      league === "NFL"
        ? nflTeams.find((t) => t.code === awayTeamCode) ?? {
            code: awayTeamCode ?? "AWY",
            name: "Away",
            color: "#666",
            logo: null,
          }
        : nbaTeams.find((t) => t.code === awayTeamCode) ?? {
            code: awayTeamCode ?? "AWY",
            name: "Away",
            color: "#666",
            logo: null,
          },
    [awayTeamCode, league]
  );

  const defaultBgColor = isDark ? "#1d1d1d" : "#fff";

  const textStyle: TextStyle = {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 20,
    color: isDark ? "#fff" : "#1d1d1d",
    textAlign: "center",
  };

  const containerStyle: ViewStyle = {
    width,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  };

  return (
    <View style={{ paddingTop: insets.top, height: 56 + insets.top }}>
      {/* Status bar filler */}
      <View
        style={{
          position: "absolute",
          top: 0,
          height: insets.top,
          width: "100%",
          backgroundColor: defaultBgColor,
          zIndex: -1,
        }}
      />

      {/* Background for team/player */}
      <TeamBackground
        insets={insets}
        isDark={isDark}
        selectedTeam={selectedTeam}
        logo={logo}
        teamColor={teamColor}
        isTeamScreen={isTeamScreen}
        isPlayerScreen={isPlayerScreen}
      />

      <View style={[containerStyle, { zIndex: 2 }]}>
        {/* Left button */}
        {tabName === "Profile" ? (
          <TouchableOpacity
            onPress={onLogout}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={isDark ? "#fff" : "#1d1d1d"}
            />
          </TouchableOpacity>
        ) : showBackButton && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                tabName === "Game" || isTeamScreen
                  ? "#fff"
                  : isDark
                  ? "#fff"
                  : "#1d1d1d"
              }
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}

        {/* Center title */}
        {tabName === "Game" ? (
          <GameHeader
            tabName={tabName}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            isNeutralSite={isNeutralSite}
          />
        ) : tabName === "League" ? (
          <TouchableOpacity
            onPress={() => {
              setModalVisible(!modalVisible);
              onOpenLeagueModal?.();
            }}
            style={{ flexDirection: "row", alignItems: "center" }}
            accessibilityLabel="Select League"
            accessibilityRole="button"
          >
            <HeaderTitle style={textStyle}>{league}</HeaderTitle>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={isDark ? "#fff" : "#1d1d1d"}
              />
            </Animated.View>
          </TouchableOpacity>
        ) : title ? (
          <HeaderTitle style={textStyle}>{title}</HeaderTitle>
        ) : (
          <View style={{ width: 36, height: 36 }} />
        )}

        {/* Right buttons */}
        {isTeamScreen ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {onToggleFavorite && (
              <TouchableOpacity
                onPress={onToggleFavorite}
                style={{ padding: 8, marginRight: 8 }}
                accessibilityLabel="Toggle favorite"
                accessibilityRole="button"
              >
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
            {!isPlayerScreen && onOpenInfo && (
              <TouchableOpacity
                onPress={onOpenInfo}
                style={{ padding: 8 }}
                accessibilityLabel="Open info"
                accessibilityRole="button"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            )}
          </View>
        ) : tabName === "Profile" && onSettings ? (
          <TouchableOpacity
            onPress={onSettings}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={isDark ? "#fff" : "#1d1d1d"}
            />
          </TouchableOpacity>
        ) : tabName === "League" && onCalendarPress ? (
          <TouchableOpacity
            onPress={onCalendarPress}
            accessibilityLabel="Open calendar"
            accessibilityRole="button"
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={isDark ? "#fff" : "#1d1d1d"}
            />
          </TouchableOpacity>
        ) : tabName === "Explore" && onSearchToggle ? (
          <TouchableOpacity
            onPress={onSearchToggle}
            accessibilityLabel="Toggle search"
            accessibilityRole="button"
          >
            <Ionicons
              name="search"
              size={24}
              color={isDark ? "#fff" : "#1d1d1d"}
            />
          </TouchableOpacity>
        ) : onToggleLayout !== undefined ? (
          <TouchableOpacity
            onPress={onToggleLayout}
            accessibilityLabel="Toggle layout"
            accessibilityRole="button"
          >
            <Ionicons
              name={isGrid ? "list" : "grid"}
              size={22}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  bgImage: {
    height: 200,
    width: "100%",
    resizeMode: "contain",
    opacity: 0.25,
    position: "absolute",
    top: -70,
    zIndex: 0,
  },
  teamHalfWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  teamHalfContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  bgLogo: {
    position: "absolute",
    width: "100%",
    height: 200,
    opacity: 0.15,
    alignSelf: "center",
    marginTop: 10,
  },
  teamCode: {
    color: "#fff",
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
    zIndex: 2,
  },
  dividerWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  dividerText: {
    color: "#fff",
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
  },
});
