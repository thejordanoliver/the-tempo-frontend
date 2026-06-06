import { cfbConferences } from "@/constants/cfbConferences";
import { cbbTeams, getCBBTeam } from "@/constants/teamsCBB";
import { Ionicons } from "@expo/vector-icons";
import { HeaderTitle } from "@react-navigation/elements";
import { Colors, Fonts } from "constants/styles";
import { getNBATeam, teams as nbaTeams } from "constants/teams";
import { cbTeams } from "constants/teamsCB";
import { cfbTeams, getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam, mlbTeams } from "constants/teamsMLB";
import { getNFLTeam, nflTeams } from "constants/teamsNFL";
import { getNHLTeam, nhlTeams } from "constants/teamsNHL";
import { sbTeams } from "constants/teamsSB";
import { getWNBATeam, wnbaTeams } from "constants/teamsWNBA";
import { usePreferences } from "contexts/PreferencesContext";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const FALLBACK_MESSAGE_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

type CustomHeaderTitleProps = {
  title?: string;
  playerName?: string;
  tabName?: string;
  onLogout?: () => void;
  onSettings?: () => void;
  onMessages?: () => void;
  onCreateMessage?: () => void;
  onBack?: () => void;
  onCalendarPress?: () => void;
  onOpenLeagueModal?: () => void;
  modalVisible?: boolean;
  setModalVisible?: (v: boolean) => void;
  onToggleLayout?: () => void;
  isGrid?: boolean;
  logo?: any;
  homeLogo?: any;
  awayLogo?: any;
  homeColor?: string | null;
  awayColor?: string | null;
  teamColor?: string;
  isTeamScreen?: boolean;
  onSearchToggle?: () => void;
  onAddWidget?: () => void;
  teamCode?: string;
  teamId?: number;
  homeTeamCode?: string;
  awayTeamCode?: string;
  homeTeamId?: string | number;
  awayTeamId?: string | number;
  teamCoach?: string;
  teamHistory?: string;
  selectedConferenceName?: string;
  isPlayerScreen?: boolean;
  showBackButton?: boolean;
  league?: string | "Leagues";
  isNeutralSite?: boolean;
  isFavorite?: boolean;
  isNotified?: boolean;
  onOpenInfo?: () => void;
  onToggleFavorite?: () => void;
  onToggleNotifications?: () => void;

  // Message thread header props
  messageAvatar?: string;
  messageUsername?: string;
  messageFullName?: string;
  messageIsOnline?: boolean;
  messageIsVerified?: boolean;
};

function resolveImage(source: any): ImageSourcePropType | undefined {
  if (!source) return undefined;

  if (typeof source === "number") return source;

  if (typeof source === "object" && source.uri) return source;

  if (typeof source === "string") return { uri: source };

  return undefined;
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
  logo?: ImageSourcePropType | string | null;
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

const MessageThreadHeader = ({
  avatar,
  username,
  fullName,
  isOnline,
  isVerified,
  isDark,
}: {
  avatar?: string;
  username?: string;
  fullName?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isDark: boolean;
}) => {
  const styles = customHeaderStyles;
  const avatarSource = resolveImage(avatar) ?? { uri: FALLBACK_MESSAGE_AVATAR };
  const displayUsername = username || fullName || "New Message";
  const displayFullName =
    fullName && fullName !== displayUsername ? fullName : "";

  return (
    <View style={styles.messageHeaderContainer}>
      <View style={styles.messageAvatarWrap}>
        <Image source={avatarSource} style={styles.messageAvatar} />

        {isOnline && (
          <View
            style={[
              styles.messageOnlineDot,
              {
                borderColor: isDark ? Colors.black : Colors.white,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.messageHeaderTextWrap}>
        <View style={styles.messageUsernameRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.messageUsername,
              { color: isDark ? Colors.white : Colors.black },
            ]}
          >
            {displayUsername}
          </Text>

          {isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.dark.blue}
            />
          )}
        </View>

        {!!displayFullName && (
          <Text
            numberOfLines={1}
            style={[
              styles.messageFullName,
              { color: isDark ? Colors.lightGray : Colors.darkGray },
            ]}
          >
            {displayFullName}
          </Text>
        )}
      </View>
    </View>
  );
};

const ProfileHeaderMenu = ({
  visible,
  isDark,
  onSettings,
  onLogout,
}: {
  visible: boolean;
  isDark: boolean;
  onSettings?: () => void;
  onLogout?: () => void;
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(visible);
  const styles = customHeaderStyles;
  useEffect(() => {
    if (visible) {
      setShouldRender(true);

      Animated.spring(progress, {
        toValue: 1,
        damping: 16,
        stiffness: 230,
        mass: 0.8,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 130,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setShouldRender(false);
    });
  }, [progress, visible]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        styles.profileSubmenu,
        {
          backgroundColor: isDark
            ? Colors.dark.itemBackground
            : Colors.light.itemBackground,
          borderColor: isDark ? Colors.darkGray : Colors.lightGray,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
              }),
            },
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
          ],
        },
      ]}
    >
      {onSettings && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.profileSubmenuItem}
          onPress={onSettings}
        >
          <View
            style={[
              styles.profileSubmenuIconWrap,
              { backgroundColor: isDark ? Colors.black : Colors.white },
            ]}
          >
            <Ionicons
              name="settings-outline"
              size={16}
              color={isDark ? Colors.white : Colors.black}
            />
          </View>

          <Text
            style={[
              styles.profileSubmenuText,
              { color: isDark ? Colors.dark.text : Colors.light.text },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      )}

      {onLogout && (
        <>
          {onSettings && (
            <View
              style={[
                styles.profileSubmenuSeparator,
                {
                  backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
                },
              ]}
            />
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.profileSubmenuItem}
            onPress={onLogout}
          >
            <View
              style={[
                styles.profileSubmenuIconWrap,
                { backgroundColor: isDark ? Colors.black : Colors.white },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={16}
                color={isDark ? Colors.dark.lightRed : Colors.light.red}
              />
            </View>

            <Text
              style={[
                styles.profileSubmenuText,
                { color: isDark ? Colors.dark.lightRed : Colors.light.red },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

const GameHeader = ({
  tabName,
  homeTeam,
  awayTeam,
  homeCode,
  awayCode,
  homeLogo,
  awayLogo,
  homeColor,
  awayColor,
  isNeutralSite,
}: {
  tabName?: string;
  homeTeam: any;
  awayTeam: any;
  homeCode: string | undefined;
  awayCode: string | undefined;
  homeLogo: any;
  awayLogo: any;
  homeColor: any;
  awayColor: any;
  isNeutralSite: boolean;
}) => {
  const styles = customHeaderStyles;
  const dividerText = isNeutralSite ? "vs" : "@";

  const scaleHome = useRef(new Animated.Value(0.6)).current;
  const scaleAway = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0.8)).current;

  const getTeamCodeLetters = (value: any, fallback: string) => {
    const code =
      typeof value === "string"
        ? value
        : value?.code ||
          value?.abbreviation ||
          value?.shortDisplayName ||
          value?.name ||
          fallback;

    return String(code || fallback)
      .toUpperCase()
      .slice(0, 4)
      .split("");
  };

  const awayLetters = useMemo(
    () => getTeamCodeLetters(awayCode, "AWY"),
    [awayCode],
  );

  const homeLetters = useMemo(
    () => getTeamCodeLetters(homeCode, "HOM"),
    [homeCode],
  );

  const awayLetterAnims: Animated.Value[] = useMemo(
    () => awayLetters.map(() => new Animated.Value(0)),
    [awayLetters],
  );

  const homeLetterAnims: Animated.Value[] = useMemo(
    () => homeLetters.map(() => new Animated.Value(0)),
    [homeLetters],
  );

  useEffect(() => {
    if (tabName !== "Game" || !homeTeam || !awayTeam) return;

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
  }, [awayTeam?.code, homeTeam?.code, tabName]);

  if (tabName !== "Game" || !homeTeam || !awayTeam) return null;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { flexDirection: "row", zIndex: -10, opacity },
      ]}
    >
      <LinearGradient
        colors={[awayColor, awayColor, homeColor, homeColor]}
        locations={[0, 0.5, 0.5, 1]}
        start={{ x: 0, y: -2 }}
        end={{ x: 1.08, y: 1.2 }}
        style={StyleSheet.absoluteFillObject}
      />

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

      <Animated.View
        style={[
          styles.dividerWrapper,
          { opacity, transform: [{ scale: dividerScale }] },
        ]}
      >
        <Text style={styles.dividerText}>{dividerText}</Text>
      </Animated.View>

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
  tabName,
  onLogout,
  onSettings,
  onMessages,
  onCreateMessage,
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
  homeColor,
  awayColor,
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
  messageAvatar,
  messageUsername,
  messageFullName,
  messageIsOnline,
  messageIsVerified,
}: CustomHeaderTitleProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const insets = useSafeAreaInsets();
  const styles = customHeaderStyles;
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuVisible((current) => !current);
  }, []);

  const closeProfileMenu = useCallback(() => {
    setProfileMenuVisible(false);
  }, []);

  const handleProfileMessages = useCallback(() => {
    closeProfileMenu();
    onMessages?.();
  }, [closeProfileMenu, onMessages]);

  const handleProfileSettings = useCallback(() => {
    closeProfileMenu();
    onSettings?.();
  }, [closeProfileMenu, onSettings]);

  const handleProfileLogout = useCallback(() => {
    closeProfileMenu();
    onLogout?.();
  }, [closeProfileMenu, onLogout]);

  useEffect(() => {
    if (tabName !== "Profile") {
      setProfileMenuVisible(false);
    }
  }, [tabName]);

  const selectedConference = useMemo(() => {
    if (!selectedConferenceName) return null;

    return (
      cfbConferences.find(
        (conf) =>
          conf.shortName === selectedConferenceName ||
          conf.name === selectedConferenceName ||
          String(conf.groupId) === String(selectedConferenceName),
      ) ?? null
    );
  }, [selectedConferenceName]);

  const conferenceLogo = selectedConference?.logoLight ?? null;

  const primaryColor = selectedConference
    ? Colors.black
    : isDark
      ? Colors.black
      : Colors.white;

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
      case "WNBA":
        return getWNBATeam(teamId ?? 0);
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
  }, [teamCode, league, teamId]);

  const teamsForLeague =
    league === "NFL"
      ? nflTeams
      : league === "CFB"
        ? cfbTeams
        : league === "CBB" || league === "WCBB"
          ? cbbTeams
          : league === "MLB"
            ? mlbTeams
            : league === "CB"
              ? cbTeams
              : league === "SB"
                ? sbTeams
                : league === "NHL"
                  ? nhlTeams
                  : league === "WNBA"
                    ? wnbaTeams
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
      }
    );
  }, [homeTeamId, homeTeamCode, league, teamsForLeague]);

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
      }
    );
  }, [awayTeamId, awayTeamCode, league, teamsForLeague]);

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

  const headerIconColor =
    tabName === "Game" || selectedConference || isTeamScreen || isPlayerScreen
      ? Colors.white
      : isDark
        ? Colors.white
        : Colors.black;

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: 56 + insets.top,
        zIndex: tabName === "Profile" ? 50 : 1,
        overflow: "visible",
      }}
    >
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

      <View style={[containerStyle, { zIndex: 2, overflow: "visible" }]}>
        {tabName === "Profile" ? (
          onMessages ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleProfileMessages}
              style={styles.profileHeaderActionButton}
              hitSlop={8}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={21}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )
        ) : showBackButton && onBack ? (
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={headerIconColor} />
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

        {tabName === "Game" ? (
          <GameHeader
            tabName={tabName}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeCode={homeTeamCode}
            awayCode={awayTeamCode}
            homeLogo={homeLogo}
            awayLogo={awayLogo}
            homeColor={homeColor}
            awayColor={awayColor}
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
        ) : tabName === "Message" ? (
          <MessageThreadHeader
            avatar={messageAvatar}
            username={messageUsername || title}
            fullName={messageFullName}
            isOnline={messageIsOnline}
            isVerified={messageIsVerified}
            isDark={isDark}
          />
        ) : (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <HeaderTitle style={textStyle}>
              {title || tabName || ""}
            </HeaderTitle>
          </View>
        )}

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
        ) : tabName === "Profile" ? (
          <View style={styles.profileMenuAnchor}>
            <ProfileHeaderMenu
              visible={profileMenuVisible}
              isDark={isDark}
              onSettings={handleProfileSettings}
              onLogout={handleProfileLogout}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleProfileMenu}
              style={[
                styles.profileHeaderActionButton,
                {
                  borderColor: profileMenuVisible
                    ? Colors.lightGray
                    : isDark
                      ? Colors.darkGray
                      : Colors.lightGray,
                  backgroundColor: profileMenuVisible
                    ? isDark
                      ? Colors.black
                      : Colors.white
                    : "transparent",
                },
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color={isDark ? Colors.white : Colors.black}
              />
            </TouchableOpacity>
          </View>
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
        ) : title === "Messages" && onCreateMessage ? (
          <TouchableOpacity onPress={onCreateMessage}>
            <Ionicons
              name="create-outline"
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

  messageHeaderContainer: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  messageAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 9,
  },

  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.darkGray,
  },

  messageOnlineDot: {
    position: "absolute",
    right: -1,
    bottom: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    backgroundColor: Colors.dark.leafGreen,
  },

  messageHeaderTextWrap: {
    maxWidth: width * 0.54,
    justifyContent: "center",
  },

  messageUsernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  messageUsername: {
    flexShrink: 1,
    fontSize: 15,
    fontFamily: Fonts.OSBOLD,
  },

  messageFullName: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Fonts.OSREGULAR,
  },

  profileMenuAnchor: {
    position: "relative",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    elevation: 50,
  },

  profileHeaderActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  profileSubmenu: {
    position: "absolute",
    top: 38,
    right: 0,
    width: 150,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: Colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 18,
    overflow: "hidden",
  },

  profileSubmenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },

  profileSubmenuIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  profileSubmenuText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.OSBOLD,
  },

  profileSubmenuSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },
});
