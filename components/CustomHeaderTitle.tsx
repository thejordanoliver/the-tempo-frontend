import { Ionicons } from "@expo/vector-icons";
import { HeaderTitle } from "@react-navigation/elements";
import { Fonts } from "constants/fonts";
import { Colors } from "constants/Colors";
import { teams as nbaTeams } from "constants/teams";
import { teams as cfbTeams, } from "constants/teamsCFB";
import { teams as cbbTeams, conferenceObjectListMap  } from "constants/teamsCBB";
import { teams as nflTeams } from "constants/teamsNFL";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
  selectedConferenceName?: string;
  isPlayerScreen?: boolean;
  showBackButton?: boolean;
  league?: "NBA" | "NFL" | "CFB" | "CBB" | "Leagues";
  isNeutralSite?: boolean;
  isFavorite?: boolean;
  isNotified?: boolean;
  onOpenInfo?: () => void;
  onToggleFavorite?: () => void;
  onToggleNotifications?: () => void;
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
  const defaultBgColor = isDark ? Colors.netural.black : Colors.netural.white;

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
const ConferenceBackground = ({
  insets,
  isDark,
  selectedTeam,
  logo,
  conferenceColor,
  isConferenceScreen,
}: {
  insets: { top: number };
  isDark: boolean;
  selectedTeam?: any;
  logo?: ImageSourcePropType | null;
  conferenceColor?: string;
  isConferenceScreen: boolean;
}) => {
  const defaultBgColor = isDark ? Colors.netural.black : Colors.netural.white;

  if (!isConferenceScreen) {
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
          backgroundColor: conferenceColor || defaultBgColor,
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
  const awayColor = awayTeam?.color || "#777";
  const dividerText = isNeutralSite ? "vs" : "@";

  // --- Main animations ---
  const scaleHome = useRef(new Animated.Value(0.6)).current;
  const scaleAway = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0.8)).current;

  // --- Letter-level animations ---
  const awayLetters: string[] = awayTeam.code.split("");
  const homeLetters: string[] = homeTeam.code.split("");
const awayLetterAnims: Animated.Value[] = useMemo(
  () => awayTeam.code.split("").map(() => new Animated.Value(0)),
  [awayTeam.code]
);

const homeLetterAnims: Animated.Value[] = useMemo(
  () => homeTeam.code.split("").map(() => new Animated.Value(0)),
  [homeTeam.code]
);

useEffect(() => {
  Animated.sequence([
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(dividerScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]),
    Animated.parallel([
      Animated.parallel([
        Animated.timing(scaleAway, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(scaleHome, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.stagger(
          100,
          awayLetterAnims.map(a =>
            Animated.timing(a, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            })
          )
        ),
        Animated.stagger(
          100,
          homeLetterAnims.map(a =>
            Animated.timing(a, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            })
          )
        ),
      ]),
    ]),
  ]).start();
}, [awayTeam.code, homeTeam.code]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { flexDirection: "row", zIndex: -10, opacity },
      ]}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={[awayColor, awayColor, homeColor, homeColor]}
        locations={[0, 0.5, 0.5, 1]}
        start={{ x: 0, y: -2 }}
        end={{ x: 1.08, y: 1.2 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Away team */}
      <View style={styles.teamHalfWrapper}>
        <Animated.View
          style={[
            styles.teamHalfContent,
            { transform: [{ scale: scaleAway }] },
          ]}
        >
          <Image
            source={hasLogoLight(awayTeam) ? awayTeam.logoLight : awayTeam.logo}
            style={styles.bgLogo}
            resizeMode="contain"
          />
          <View style={{ flexDirection: "row" }}>
            {awayLetters.map((char: string, i: number) => (
              <Animated.Text
                key={i}
                style={[
                  styles.teamCode,
                  {
                    opacity: awayLetterAnims[i],
                    transform: [
                      {
                        scale: awayLetterAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                      {
                        translateY: awayLetterAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {char}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Divider */}
      <Animated.View
        style={[
          styles.dividerWrapper,
          { opacity, transform: [{ scale: dividerScale }] },
        ]}
      >
        <Text style={styles.dividerText}>{dividerText}</Text>
      </Animated.View>

      {/* Home team */}
      <View style={styles.teamHalfWrapper}>
        <Animated.View
          style={[
            styles.teamHalfContent,
            { transform: [{ scale: scaleHome }] },
          ]}
        >
          <Image
            source={hasLogoLight(homeTeam) ? homeTeam.logoLight : homeTeam.logo}
            style={styles.bgLogo}
            resizeMode="contain"
          />
          <View style={{ flexDirection: "row" }}>
            {homeLetters.map((char: string, i: number) => (
              <Animated.Text
                key={i}
                style={[
                  styles.teamCode,
                  {
                    opacity: homeLetterAnims[i],
                    transform: [
                      {
                        scale: homeLetterAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                      {
                        translateY: homeLetterAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {char}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
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
  isNotified,
  selectedConferenceName,
  onToggleFavorite,
  onToggleNotifications,
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

  const modalToMapKey: Record<string, string> = {
    SEC: "SEC",
    "Big Ten": "Big Ten",
    "Big 12": "Big 12",
    ACC: "ACC",
    "Pac-12": "Pac-12",
    AAC: "AAC",
    MWC: "MWC",
    "Sun Belt": "Sun Belt",
    CUSA: "CUSA",
    MAC: "MAC",
   "Atlantic 10": "Atlantic 10",
    "FBS Independents": "FBS Independents",
  };

  const conferenceMap: Record<string, (typeof conferenceObjectListMap)[0]> =
    conferenceObjectListMap.reduce((acc, conf) => {
      acc[conf.name] = conf;
      return acc;
    }, {} as Record<string, (typeof conferenceObjectListMap)[0]>);

  const selectedConference = useMemo(() => {
    if (!selectedConferenceName) return null;
    const mapKey =
      modalToMapKey[selectedConferenceName] || selectedConferenceName;
    return conferenceMap[mapKey] ?? null;
  }, [selectedConferenceName]);

  const conferenceLogo = selectedConference?.logo ?? null;
  const primaryColor =
    selectedConference?.color?.primary || (isDark ? Colors.netural.black : Colors.netural.white);
  const secondaryColor = selectedConference?.color?.secondary || primaryColor;

  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: modalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const selectedTeam = useMemo(() => {
    if (league === "NFL") return nflTeams.find((t) => t.code === teamCode);
    if (league === "CFB") return cfbTeams.find((t) => t.code === teamCode);
    if (league === "CBB") return cbbTeams.find((t) => t.code === teamCode);
    return nbaTeams.find((t) => t.code === teamCode);
  }, [teamCode, league]);

  const homeTeam = useMemo(() => {
    const teams =
      league === "NFL" ? nflTeams : league === "CFB" ? cfbTeams : league === "CBB" ? cbbTeams : nbaTeams;
    return (
      teams.find((t) => t.code === homeTeamCode) ?? {
        code: homeTeamCode ?? "HOM",
        color: "#aaa",
        logo: null,
      }
    );
  }, [homeTeamCode, league]);

  const awayTeam = useMemo(() => {
    const teams =
      league === "NFL" ? nflTeams : league === "CFB" ? cfbTeams : league === "CBB" ? cbbTeams : nbaTeams;
    return (
      teams.find((t) => t.code === awayTeamCode) ?? {
        code: awayTeamCode ?? "AWY",
        color: "#777",
        logo: null,
      }
    );
  }, [awayTeamCode, league]);

  const defaultBgColor = isDark ? Colors.netural.black : Colors.netural.white;

  const textStyle: TextStyle = {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 20,
    color: isDark ? Colors.netural.white : Colors.netural.black,
    textAlign: "center",
  };
  const constantTextStyle: TextStyle = {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 20,
    color: Colors.netural.white,
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
      {/* Background */}
      {tabName === "League" ? (
        <ConferenceBackground
          insets={insets}
          isDark={isDark}
          selectedTeam={selectedConference}
          logo={conferenceLogo}
          conferenceColor={primaryColor}
          isConferenceScreen={true}
        />
      ) : (
        <TeamBackground
          insets={insets}
          isDark={isDark}
          selectedTeam={selectedTeam}
          logo={logo}
          teamColor={teamColor}
          isTeamScreen={isTeamScreen}
          isPlayerScreen={isPlayerScreen}
        />
      )}

      <View style={[containerStyle, { zIndex: 2 }]}>
        {/* Left button */}
        {tabName === "Profile" ? (
          <TouchableOpacity onPress={onLogout}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={isDark ? Colors.netural.white : Colors.netural.black}
            />
          </TouchableOpacity>
        ) : showBackButton && onBack ? (
          <TouchableOpacity onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                tabName === "Game" || selectedConference || isTeamScreen
                  ? Colors.netural.white
                  : isDark
                  ? Colors.netural.white
                  : Colors.netural.black
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
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: 56,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              onPress={() => onOpenLeagueModal?.()}
              style={{ flexDirection: "row", alignItems: "center", zIndex: 2 }}
            >
              <HeaderTitle
                style={selectedConference ? constantTextStyle : textStyle}
              >
                {selectedConferenceName || league}
              </HeaderTitle>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={
                    selectedConference ? Colors.netural.white : isDark ? Colors.netural.white : Colors.netural.black
                  }
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <HeaderTitle style={textStyle}>
              {title  || tabName || ""}
            </HeaderTitle>
          </View>
        )}

        {/* Right buttons */}
        {isTeamScreen ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {onToggleFavorite && (
              <TouchableOpacity
                onPress={onToggleFavorite}
                style={{ padding: 8, marginRight: 8 }}
              >
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={24}
                  color={Colors.netural.white}
                />
              </TouchableOpacity>
            )}
            {onToggleNotifications && (
              <TouchableOpacity
                onPress={onToggleNotifications}
                style={{ padding: 8, marginRight: 8 }}
              >
                <Ionicons
                  name={isNotified ? "notifications" : "notifications-outline"}
                  size={24}
                  color={Colors.netural.white}
                />
              </TouchableOpacity>
            )}
            {!isPlayerScreen && onOpenInfo && (
              <TouchableOpacity onPress={onOpenInfo} style={{ padding: 8 }}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={Colors.netural.white}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : tabName === "Profile" && onSettings ? (
          <TouchableOpacity onPress={onSettings}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={isDark ? Colors.netural.white : Colors.netural.black}
            />
          </TouchableOpacity>
        ) : tabName === "League" && onCalendarPress ? (
          <TouchableOpacity onPress={onCalendarPress}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={isDark ? Colors.netural.white : Colors.netural.black}
            />
          </TouchableOpacity>
        ) : tabName === "Explore" && onSearchToggle ? (
          <TouchableOpacity onPress={onSearchToggle}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? Colors.netural.white : Colors.netural.black}
            />
          </TouchableOpacity>
        ) : onToggleLayout !== undefined ? (
          <TouchableOpacity onPress={onToggleLayout}>
            <Ionicons
              name={isGrid ? "list" : "grid"}
              size={22}
              color={isDark ? Colors.netural.white : Colors.netural.black}
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
    color: Colors.netural.white,
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
    color: Colors.netural.white,
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
  },
});
