import { Ionicons } from "@expo/vector-icons";
import { HeaderTitle } from "@react-navigation/elements";
import { Colors, Fonts } from "constants/Styles";
import { getNBATeam, teams as nbaTeams } from "constants/teams";
import {
  cbbTeams,
  conferenceObjectListMap,
  getCBBTeam,
} from "constants/teamsCBB";
import { cfbTeams, getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam, mlbTeams } from "constants/teamsMLB";
import { getNFLTeam, nflTeams } from "constants/teamsNFL";

import { getNHLTeam, nhlTeams } from "constants/teamsNHL";
import { LinearGradient } from "expo-linear-gradient";
import useMMAFighter from "hooks/MMAHooks/useMMAFighter";
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
  logo?: any;
  logoLight?: any;
  homeLogo?: any;
  awayLogo?: any;
  teamColor?: string;
  isTeamScreen?: boolean;
  transparentColor?: string;
  onSearchToggle?: () => void;
  onAddWidget?: () => void;
  teamCode?: string;
  teamId?: number;
  homeTeamCode?: string;
  awayTeamCode?: string;
  homeTeamId?: string | number;
  awayTeamId?: string | number;
  firstFighterId?: number;
  secondFighterId?: number;
  teamCoach?: string;
  teamHistory?: string;
  selectedConferenceName?: string;
  isPlayerScreen?: boolean;
  showBackButton?: boolean;
  league?:
    | "NBA"
    | "NFL"
    | "CFB"
    | "CBB"
    | "WCBB"
    | "MLB"
    | "NHL"
    | "MMA"
    | "Leagues";
  isNeutralSite?: boolean;
  isFavorite?: boolean;
  isNotified?: boolean;
  onOpenInfo?: () => void;
  onToggleFavorite?: () => void;
  onToggleNotifications?: () => void;
};

function resolveImage(source: any): ImageSourcePropType | undefined {
  if (!source) return undefined;

  // require("image.png")
  if (typeof source === "number") return source;

  // already { uri }
  if (typeof source === "object" && source.uri) return source;

  // plain URL string
  if (typeof source === "string") return { uri: source };

  return undefined;
}

// ---------- SUBCOMPONENTS ----------
const TeamBackground = ({
  insets,
  isDark,
  selectedTeam,
  teamId,
  logo,
  teamColor,
  isTeamScreen,
  isPlayerScreen,
}: {
  insets: { top: number };
  isDark: boolean;
  selectedTeam?: any;
  teamId?: number;
  logo?: ImageSourcePropType;
  teamColor?: string;
  isTeamScreen: boolean;
  isPlayerScreen?: boolean;
}) => {
  const defaultBgColor = isDark ? Colors.black : Colors.white;
  const styles = customHeaderStyles;
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
        <Image source={resolveImage(logo)} style={styles.bgImage} />
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
  const defaultBgColor = isDark ? Colors.black : Colors.white;
  const styles = customHeaderStyles;
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
              : (selectedTeam?.logo ?? logo)
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
  homeLogo,
  awayLogo,
  isNeutralSite,
  firstFighterId,
  secondFighterId,
  league,
}: {
  tabName?: string;
  homeTeam: any;
  awayTeam: any;
  homeLogo: any;
  awayLogo: any;
  firstFighterId?: number;
  secondFighterId?: number;
  league?: string;
  isNeutralSite: boolean;
  isWomen: boolean;
}) => {
  if (tabName !== "Game" || !homeTeam || !awayTeam) return null;
  const styles = customHeaderStyles;
  const isMMA = league === "MMA";

  const dividerText = isNeutralSite ? "vs" : "@";
  const { fighter: firstFighter } = useMMAFighter(firstFighterId ?? 0);
  const { fighter: secondFighter } = useMMAFighter(secondFighterId ?? 0);
  const homeColor = isMMA
    ? (firstFighter?.color ?? Colors.lightGray)
    : (homeTeam?.color ?? Colors.lightGray);

  const awayColor = isMMA
    ? (secondFighter?.color ?? Colors.midTone)
    : (awayTeam?.color ?? Colors.midTone);

  const awayName = secondFighter?.last_name || "UNK";
  const homeName = firstFighter?.last_name || "UNK";
  // --- Main animations ---
  const scaleHome = useRef(new Animated.Value(0.6)).current;
  const scaleAway = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0.8)).current;

  // --- Letter-level animations ---
  const awayLetters: string[] = isMMA
    ? awayName.split("")
    : (awayTeam.code ?? "AWY").split("");

  const homeLetters: string[] = isMMA
    ? homeName.split("")
    : (homeTeam.code ?? "HOM").split("");

  const awayLetterAnims: Animated.Value[] = useMemo(
    () => awayLetters.map(() => new Animated.Value(0)),
    [awayLetters.join("")],
  );

  const homeLetterAnims: Animated.Value[] = useMemo(
    () => homeLetters.map(() => new Animated.Value(0)),
    [homeLetters.join("")],
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
            awayLetterAnims.map((a) =>
              Animated.timing(a, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ),
          ),
          Animated.stagger(
            100,
            homeLetterAnims.map((a) =>
              Animated.timing(a, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ),
          ),
        ]),
      ]),
    ]).start();
  }, [awayTeam.code, homeTeam.code, firstFighter?.color, secondFighter?.color]);

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
            source={typeof awayLogo === "string" ? { uri: awayLogo } : awayLogo}
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
            source={typeof homeLogo === "string" ? { uri: homeLogo } : homeLogo}
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
  onAddWidget,
  teamId,
  teamCode,
  homeTeamCode,
  awayTeamCode,
  homeTeamId,
  awayTeamId,
  homeLogo,
  awayLogo,
  firstFighterId,
  secondFighterId,
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
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const styles = customHeaderStyles;
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
    conferenceObjectListMap.reduce(
      (acc, conf) => {
        acc[conf.name] = conf;
        return acc;
      },
      {} as Record<string, (typeof conferenceObjectListMap)[0]>,
    );

  const selectedConference = useMemo(() => {
    if (!selectedConferenceName) return null;
    const mapKey =
      modalToMapKey[selectedConferenceName] || selectedConferenceName;
    return conferenceMap[mapKey] ?? null;
  }, [selectedConferenceName]);

  const conferenceLogo = selectedConference?.logo ?? null;
  const primaryColor =
    selectedConference?.color?.primary ||
    (isDark ? Colors.black : Colors.white);
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
    if (!teamCode) return null;

    switch (league) {
      case "NFL":
        return getNFLTeam(teamId ?? 0);
      case "CFB":
        return getCFBTeam(teamId ?? 0);
      case "CBB":
        return getCBBTeam(teamId ?? 0, false);
      case "WCBB":
        return getCBBTeam(teamId ?? 0, true);
      case "MLB":
        return getMLBTeam(teamId ?? 0);
      case "NHL":
        return getNHLTeam(teamId ?? 0);
      case "NBA":
      default:
        return getNBATeam(teamId ?? 0);
    }
  }, [teamCode, league]);

  const teamsForLeague =
    league === "NFL"
      ? nflTeams
      : league === "CFB"
        ? cfbTeams
        : league === "CBB" || league === "WCBB"
          ? cbbTeams
          : league === "MLB"
            ? mlbTeams
            : league === "NHL"
              ? nhlTeams
              : nbaTeams;

  const homeTeam = useMemo(() => {
    const team =
      league === "WCBB"
        ? teamsForLeague.find((t: any) => t.wid === homeTeamId)
        : teamsForLeague.find((t: any) => t.id === homeTeamId);

    return (
      team ?? {
        id: homeTeamId,
        code: homeTeamCode ?? "HOM",
        color: Colors.lightGray,
        logo: null,
      }
    );
  }, [homeTeamId, homeTeamCode, league]);

  const awayTeam = useMemo(() => {
    const team =
      league === "WCBB"
        ? teamsForLeague.find((t: any) => t.wid === awayTeamId)
        : teamsForLeague.find((t: any) => t.id === awayTeamId);

    return (
      team ?? {
        id: awayTeamId,
        code: awayTeamCode ?? "AWY",
        color: Colors.midTone,
        logo: null,
      }
    );
  }, [awayTeamId, awayTeamCode, league]);

  const isWomenLeague = league === "WCBB";

  const textStyle: TextStyle = {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 20,
    color: isDark ? Colors.white : Colors.black,
    textAlign: "center",
  };
  const constantTextStyle: TextStyle = {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 20,
    color: Colors.white,
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
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        ) : showBackButton && onBack ? (
          <TouchableOpacity onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                tabName === "Game" || selectedConference || isTeamScreen
                  ? Colors.white
                  : isDark
                    ? Colors.white
                    : Colors.black
              }
            />
          </TouchableOpacity>
        ) : tabName === "Explore" && onAddWidget ? (
          <TouchableOpacity onPress={onAddWidget}>
            <Ionicons
              name="add"
              size={24}
              color={isDark ? Colors.white : Colors.black}
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
            homeLogo={homeLogo}
            awayLogo={awayLogo}
            isNeutralSite={isNeutralSite}
            isWomen={isWomenLeague}
            firstFighterId={firstFighterId}
            secondFighterId={secondFighterId}
            league={league}
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
                    selectedConference
                      ? Colors.white
                      : isDark
                        ? Colors.white
                        : Colors.black
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
              {title || tabName || ""}
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
                  color={Colors.white}
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
                  color={Colors.white}
                />
              </TouchableOpacity>
            )}
            {!isPlayerScreen && onOpenInfo && (
              <TouchableOpacity onPress={onOpenInfo} style={{ padding: 8 }}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : tabName === "Profile" && onSettings ? (
          <TouchableOpacity onPress={onSettings}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        ) : tabName === "League" && onCalendarPress ? (
          <TouchableOpacity onPress={onCalendarPress}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        ) : tabName === "Explore" && onSearchToggle ? (
          <TouchableOpacity onPress={onSearchToggle}>
            <Ionicons
              name="search"
              size={24}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        ) : onToggleLayout !== undefined ? (
          <TouchableOpacity onPress={onToggleLayout}>
            <Ionicons
              name={isGrid ? "list" : "grid"}
              size={22}
              color={isDark ? Colors.white : Colors.black}
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
export const customHeaderStyles = StyleSheet.create({
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
    height: 180,
    opacity: 0.25,
    alignSelf: "center",
    marginTop: 10,
  },
  teamCode: {
    color: Colors.white,
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
    color: Colors.white,
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
  },
});
