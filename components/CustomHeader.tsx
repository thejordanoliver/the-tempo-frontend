import { cfbConferences } from "@/constants/cfbConferences";
import { cbbTeams, getCBBTeam } from "@/constants/teamsCBB";
import { getWCBBTeam, wcbbTeams } from "@/constants/teamsWCBB";
import { Ionicons } from "@expo/vector-icons";
import { HeaderTitle } from "@react-navigation/elements";
import { Colors, Fonts, activeOpacity } from "constants/styles";
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
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "reicon-react-native";

const { width } = Dimensions.get("window");

export type RacingLeague =
  | "f1"
  | "nascarpremier"
  | "nascarsecondary"
  | "nascartruck";

type RacingLeagueDisplayConfig = {
  label: string;
  shortLabel: string;
  eventLabel: string;
  accentColor: string;
};

const RACING_LEAGUE_CONFIG: Record<RacingLeague, RacingLeagueDisplayConfig> = {
  f1: {
    label: "FORMULA 1",
    shortLabel: "F1",
    eventLabel: "GRAND PRIX",
    accentColor: "#E10600",
  },

  nascarpremier: {
    label: "NASCAR CUP SERIES",
    shortLabel: "CUP",
    eventLabel: "RACE DAY",
    accentColor: "#F5C400",
  },

  nascarsecondary: {
    label: "NASCAR XFINITY SERIES",
    shortLabel: "XFINITY",
    eventLabel: "RACE DAY",
    accentColor: "#7B2CBF",
  },

  nascartruck: {
    label: "NASCAR TRUCK SERIES",
    shortLabel: "TRUCK",
    eventLabel: "RACE DAY",
    accentColor: "#1E88E5",
  },
};

const resolveRacingLeague = (
  ...values: (string | null | undefined)[]
): RacingLeague | null => {
  for (const value of values) {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    switch (normalized) {
      case "f1":
        return "f1";

      case "nascar":
      case "nascarpremier":
        return "nascarpremier";

      case "nascarsecondary":
        return "nascarsecondary";

      case "nascartruck":
        return "nascartruck";
    }
  }

  return null;
};

const FALLBACK_MESSAGE_AVATAR =
  "https://res.cloudinary.com/dm3qtdhag/image/upload/v1776393743/ProfilePlaceholder_nmzv2o.png";

type CustomHeaderProps = {
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
  setModalVisible?: (value: boolean) => void;

  onToggleLayout?: () => void;
  isGrid?: boolean;

  logo?: any;
  homeLogo?: any;
  awayLogo?: any;

  homeColor?: string | null;
  awayColor?: string | null;
  teamColor?: string;

  isTeamScreen?: boolean;
  isPlayerScreen?: boolean;

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

  showBackButton?: boolean;

  league?: string | "Leagues";
  racingLeague?: RacingLeague;

  isEvent?: boolean;
  isNeutralSite?: boolean;

  isFavorite?: boolean;
  isNotified?: boolean;

  onOpenInfo?: () => void;
  onToggleFavorite?: () => void;
  onToggleNotifications?: () => void;

  messageAvatar?: string;
  messageUsername?: string;
  messageFullName?: string;
  messageIsOnline?: boolean;
  messageIsVerified?: boolean;
};

function resolveImage(source: any): ImageSourcePropType | undefined {
  if (!source) {
    return undefined;
  }

  if (typeof source === "number") {
    return source;
  }

  if (typeof source === "string") {
    return {
      uri: source,
    };
  }

  if (Array.isArray(source)) {
    return resolveImage(source[0]);
  }

  if (typeof source === "object") {
    if (source.uri) {
      return source;
    }

    if (typeof source.href === "string") {
      return {
        uri: source.href,
      };
    }

    if (typeof source.url === "string") {
      return {
        uri: source.url,
      };
    }

    if (typeof source.src === "string") {
      return {
        uri: source.src,
      };
    }
  }

  return undefined;
}

// ---------- TEAM BACKGROUND ----------

const TeamBackground = ({
  insets,
  isDark,
  selectedTeam,
  logo,
  teamColor,
  isTeamScreen,
  isPlayerScreen,
}: {
  insets: {
    top: number;
  };
  isDark: boolean;
  selectedTeam?: any;
  teamId?: number;
  logo?: ImageSourcePropType;
  teamColor?: string;
  isTeamScreen: boolean;
  isPlayerScreen?: boolean;
}) => {
  const defaultBackgroundColor = isDark ? Colors.black : Colors.white;
  const styles = customHeaderStyles;

  if (!(isTeamScreen || isPlayerScreen)) {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: defaultBackgroundColor,
          zIndex: -1,
        }}
      />
    );
  }

  const selectedTeamLogo = resolveImage(
    selectedTeam?.logoLight ?? selectedTeam?.logo ?? logo,
  );

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
          backgroundColor: teamColor || defaultBackgroundColor,
          zIndex: -1,
        }}
      />

      {selectedTeamLogo ? (
        <Image source={selectedTeamLogo} style={styles.bgImage} />
      ) : null}
    </View>
  );
};

// ---------- CONFERENCE BACKGROUND ----------

const ConferenceBackground = ({
  insets,
  isDark,
  selectedTeam,
  logo,
  conferenceColor,
  isConferenceScreen,
}: {
  insets: {
    top: number;
  };
  isDark: boolean;
  selectedTeam?: any;
  logo?: ImageSourcePropType | string | null;
  conferenceColor?: string;
  isConferenceScreen: boolean;
}) => {
  const defaultBackgroundColor = isDark ? Colors.black : Colors.white;
  const styles = customHeaderStyles;

  if (!isConferenceScreen) {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: defaultBackgroundColor,
          zIndex: -1,
        }}
      />
    );
  }

  const conferenceLogoSource = resolveImage(
    selectedTeam?.logoLight ?? selectedTeam?.logo ?? logo,
  );

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
          backgroundColor: conferenceColor || defaultBackgroundColor,
          zIndex: -1,
        }}
      />

      {conferenceLogoSource ? (
        <Image source={conferenceLogoSource} style={styles.bgImage} />
      ) : null}
    </View>
  );
};

// ---------- MESSAGE THREAD HEADER ----------

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

  const avatarSource = resolveImage(avatar) ?? {
    uri: FALLBACK_MESSAGE_AVATAR,
  };

  const displayUsername = username || fullName || "New Message";

  const displayFullName =
    fullName && fullName !== displayUsername ? fullName : "";

  return (
    <View style={styles.messageHeaderContainer}>
      <View style={styles.messageAvatarWrap}>
        <Image source={avatarSource} style={styles.messageAvatar} />

        {isOnline ? (
          <View
            style={[
              styles.messageOnlineDot,
              {
                borderColor: isDark ? Colors.black : Colors.white,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.messageHeaderTextWrap}>
        <View style={styles.messageUsernameRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.messageUsername,
              {
                color: isDark ? Colors.white : Colors.black,
              },
            ]}
          >
            {displayUsername}
          </Text>

          {isVerified ? (
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.dark.blue}
            />
          ) : null}
        </View>

        {displayFullName ? (
          <Text
            numberOfLines={1}
            style={[
              styles.messageFullName,
              {
                color: isDark ? Colors.lightGray : Colors.darkGray,
              },
            ]}
          >
            {displayFullName}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ---------- PROFILE MENU ----------

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
      if (finished) {
        setShouldRender(false);
      }
    });
  }, [progress, visible]);

  if (!shouldRender) {
    return null;
  }

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
      {onSettings ? (
        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={styles.profileSubmenuItem}
          onPress={onSettings}
        >
          <View
            style={[
              styles.profileSubmenuIconWrap,
              {
                backgroundColor: isDark ? Colors.black : Colors.white,
              },
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
              {
                color: isDark ? Colors.dark.text : Colors.light.text,
              },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      ) : null}

      {onLogout ? (
        <>
          {onSettings ? (
            <View
              style={[
                styles.profileSubmenuSeparator,
                {
                  backgroundColor: isDark ? Colors.darkGray : Colors.lightGray,
                },
              ]}
            />
          ) : null}

          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={styles.profileSubmenuItem}
            onPress={onLogout}
          >
            <View
              style={[
                styles.profileSubmenuIconWrap,
                {
                  backgroundColor: isDark ? Colors.black : Colors.white,
                },
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
                {
                  color: isDark ? Colors.dark.lightRed : Colors.light.red,
                },
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </>
      ) : null}
    </Animated.View>
  );
};

// ---------- GAME AND RACING HEADER ----------

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
  isEvent,
  racingLeague,
  eventTitle,
  eventLogo,
}: {
  tabName?: string;
  homeTeam?: any;
  awayTeam?: any;
  homeCode?: string;
  awayCode?: string;
  homeLogo?: any;
  awayLogo?: any;
  homeColor?: string | null;
  awayColor?: string | null;
  isEvent: boolean;
  isNeutralSite: boolean;
  racingLeague?: RacingLeague | null;
  eventTitle?: string;
  eventLogo?: any;
}) => {
  const styles = customHeaderStyles;
  const dividerText = isNeutralSite ? "vs" : "@";

  const scaleHome = useRef(new Animated.Value(0.6)).current;
  const scaleAway = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0.8)).current;

  const getTeamCodeLetters = useCallback(
    (value: any, fallback: string): string[] => {
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
    },
    [],
  );

  const resolvedRacingLeague = useMemo(
    () => resolveRacingLeague(racingLeague, tabName),
    [racingLeague, tabName],
  );

  const racingConfig = resolvedRacingLeague
    ? RACING_LEAGUE_CONFIG[resolvedRacingLeague]
    : null;

  const isRacingHeader = Boolean(isEvent && racingConfig);

  const isTeamGameHeader = Boolean(
    tabName === "Game" && homeTeam && awayTeam && !isRacingHeader,
  );

  const awayLetters = useMemo(
    () => getTeamCodeLetters(awayCode, "AWY"),
    [awayCode, getTeamCodeLetters],
  );

  const homeLetters = useMemo(
    () => getTeamCodeLetters(homeCode, "HOM"),
    [getTeamCodeLetters, homeCode],
  );

  const eventLetters = useMemo(
    () =>
      String(racingConfig?.shortLabel ?? "RACE")
        .toUpperCase()
        .split(""),
    [racingConfig?.shortLabel],
  );

  const awayLetterAnims = useMemo(
    () => awayLetters.map(() => new Animated.Value(0)),
    [awayLetters],
  );

  const homeLetterAnims = useMemo(
    () => homeLetters.map(() => new Animated.Value(0)),
    [homeLetters],
  );

  const eventLetterAnims = useMemo(
    () => eventLetters.map(() => new Animated.Value(0)),
    [eventLetters],
  );

  useEffect(() => {
    opacity.setValue(0);
    dividerScale.setValue(0.8);
    scaleHome.setValue(0.6);
    scaleAway.setValue(0.6);

    awayLetterAnims.forEach((animation) => {
      animation.setValue(0);
    });

    homeLetterAnims.forEach((animation) => {
      animation.setValue(0);
    });

    eventLetterAnims.forEach((animation) => {
      animation.setValue(0);
    });

    if (isRacingHeader) {
      const racingAnimation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.spring(scaleHome, {
          toValue: 1,
          damping: 14,
          stiffness: 130,
          mass: 0.8,
          useNativeDriver: true,
        }),

        Animated.stagger(
          70,
          eventLetterAnims.map((animation) =>
            Animated.timing(animation, {
              toValue: 1,
              duration: 450,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ),
      ]);

      racingAnimation.start();

      return () => {
        racingAnimation.stop();
      };
    }

    if (!isTeamGameHeader) {
      return;
    }

    const gameAnimation = Animated.sequence([
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
            awayLetterAnims.map((animation) =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ),
          ),

          Animated.stagger(
            100,
            homeLetterAnims.map((animation) =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ),
          ),
        ]),
      ]),
    ]);

    gameAnimation.start();

    return () => {
      gameAnimation.stop();
    };
  }, [
    awayLetterAnims,
    dividerScale,
    eventLetterAnims,
    homeLetterAnims,
    isRacingHeader,
    isTeamGameHeader,
    opacity,
    scaleAway,
    scaleHome,
  ]);

  if (!isRacingHeader && !isTeamGameHeader) {
    return null;
  }

  // ---------- RACING HEADER ----------

  if (isRacingHeader && racingConfig) {
    const eventColor = racingConfig.accentColor;
    const eventLogoSource = resolveImage(eventLogo ?? homeLogo);

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.racingHeader,
          {
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={[eventColor, "#171717", Colors.black]}
          locations={[0, 0.48, 1]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0.8,
          }}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          style={[
            styles.racingAccent,
            {
              backgroundColor: eventColor,
            },
          ]}
        />

        <View style={styles.racingCheckeredPattern}>
          {Array.from({
            length: 24,
          }).map((_, index) => {
            const columns = 6;
            const row = Math.floor(index / columns);
            const column = index % columns;
            const isFilled = (row + column) % 2 === 0;

            return (
              <View
                key={`checkered-cell-${index}`}
                style={[
                  styles.racingCheckeredCell,
                  isFilled
                    ? styles.racingCheckeredCellFilled
                    : styles.racingCheckeredCellEmpty,
                ]}
              />
            );
          })}
        </View>

        {eventLogoSource ? (
          <Animated.View
            style={[
              styles.racingLogoWrapper,
              {
                transform: [
                  {
                    scale: scaleHome,
                  },
                ],
              },
            ]}
          >
            <Image
              source={eventLogoSource}
              style={styles.racingLogo}
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}

        <View style={styles.racingHeaderContent}>
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.racingEventTitle,
              {
                opacity,
                transform: [
                  {
                    scale: scaleHome,
                  },
                ],
              },
            ]}
          >
            {eventTitle}
          </Animated.Text>
        </View>
      </Animated.View>
    );
  }

  // ---------- NORMAL TEAM GAME HEADER ----------

  const resolvedAwayColor = awayColor || Colors.midTone;
  const resolvedHomeColor = homeColor || Colors.darkGray;

  const awayLogoSource = resolveImage(awayLogo);
  const homeLogoSource = resolveImage(homeLogo);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        {
          flexDirection: "row",
          zIndex: -10,
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={[
          resolvedAwayColor,
          resolvedAwayColor,
          resolvedHomeColor,
          resolvedHomeColor,
        ]}
        locations={[0, 0.5, 0.5, 1]}
        start={{
          x: 0,
          y: -2,
        }}
        end={{
          x: 1.08,
          y: 1.2,
        }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.teamHalfWrapper}>
        <Animated.View
          style={[
            styles.teamHalfContent,
            {
              transform: [
                {
                  scale: scaleAway,
                },
              ],
            },
          ]}
        >
          {awayLogoSource ? (
            <Image
              source={awayLogoSource}
              style={styles.bgLogo}
              resizeMode="contain"
            />
          ) : null}

          <View style={styles.teamCodeRow}>
            {awayLetters.map((character, index) => {
              const animation = awayLetterAnims[index];

              return (
                <Animated.Text
                  key={`away-${character}-${index}`}
                  style={[
                    styles.teamCode,
                    {
                      opacity: animation,
                      transform: [
                        {
                          scale: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {character}
                </Animated.Text>
              );
            })}
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.dividerWrapper,
          {
            opacity,
            transform: [
              {
                scale: dividerScale,
              },
            ],
          },
        ]}
      >
        <Text style={styles.dividerText}>{dividerText}</Text>
      </Animated.View>

      <View style={styles.teamHalfWrapper}>
        <Animated.View
          style={[
            styles.teamHalfContent,
            {
              transform: [
                {
                  scale: scaleHome,
                },
              ],
            },
          ]}
        >
          {homeLogoSource ? (
            <Image
              source={homeLogoSource}
              style={styles.bgLogo}
              resizeMode="contain"
            />
          ) : null}

          <View style={styles.teamCodeRow}>
            {homeLetters.map((character, index) => {
              const animation = homeLetterAnims[index];

              return (
                <Animated.Text
                  key={`home-${character}-${index}`}
                  style={[
                    styles.teamCode,
                    {
                      opacity: animation,
                      transform: [
                        {
                          scale: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {character}
                </Animated.Text>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ---------- MAIN COMPONENT ----------

export function CustomHeader({
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
  isEvent = false,
  isNeutralSite = false,
  modalVisible = false,
  onOpenInfo,
  league = "Leagues",
  racingLeague,
  logo,
  messageAvatar,
  messageUsername,
  messageFullName,
  messageIsOnline,
  messageIsVerified,
}: CustomHeaderProps) {
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
    if (!selectedConferenceName) {
      return null;
    }

    return (
      cfbConferences.find(
        (conference) =>
          conference.shortName === selectedConferenceName ||
          conference.name === selectedConferenceName ||
          String(conference.groupId) === String(selectedConferenceName),
      ) ?? null
    );
  }, [selectedConferenceName]);

  const conferenceLogo = selectedConference?.logoLight ?? null;

  const primaryColor = selectedConference?.color
    ? selectedConference.color
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
  }, [modalVisible, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const selectedTeam = useMemo(() => {
    if (!teamCode) {
      return null;
    }

    switch (league) {
      case "WNBA":
        return getWNBATeam(teamId ?? 0);

      case "NFL":
        return getNFLTeam(teamId ?? 0);

      case "CFB":
        return getCFBTeam(teamId ?? 0);

      case "CBB":
        return getCBBTeam(teamId ?? 0);

      case "WCBB":
        return getWCBBTeam(teamId ?? 0);

      case "MLB":
        return getMLBTeam(teamId ?? 0);

      case "NHL":
        return getNHLTeam(teamId ?? 0);

      case "NBA":
      default:
        return getNBATeam(teamId ?? 0);
    }
  }, [league, teamCode, teamId]);

  const teamsForLeague = useMemo(() => {
    switch (league) {
      case "NFL":
        return nflTeams;

      case "CFB":
        return cfbTeams;

      case "CBB":
        return cbbTeams;

      case "WCBB":
        return wcbbTeams;

      case "MLB":
        return mlbTeams;

      case "CB":
        return cbTeams;

      case "SB":
        return sbTeams;

      case "NHL":
        return nhlTeams;

      case "WNBA":
        return wnbaTeams;

      case "NBA":
      default:
        return nbaTeams;
    }
  }, [league]);

  const homeTeam = useMemo(() => {
    const team = teamsForLeague.find(
      (currentTeam: any) => String(currentTeam.id) === String(homeTeamId),
    );

    return (
      team ?? {
        id: homeTeamId,
        code: homeTeamCode ?? "HOM",
        color: Colors.lightGray,
      }
    );
  }, [homeTeamCode, homeTeamId, teamsForLeague]);

  const awayTeam = useMemo(() => {
    const team = teamsForLeague.find(
      (currentTeam: any) => String(currentTeam.id) === String(awayTeamId),
    );

    return (
      team ?? {
        id: awayTeamId,
        code: awayTeamCode ?? "AWY",
        color: Colors.midTone,
      }
    );
  }, [awayTeamCode, awayTeamId, teamsForLeague]);

  const resolvedRacingLeague = useMemo(
    () => resolveRacingLeague(racingLeague, tabName, league),
    [league, racingLeague, tabName],
  );

  const isRacingHeader = Boolean(isEvent && resolvedRacingLeague);

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
    tabName === "Game" ||
    isRacingHeader ||
    selectedConference ||
    isTeamScreen ||
    isPlayerScreen
      ? Colors.white
      : isDark
        ? Colors.white
        : Colors.black;

  const isMessagesListScreen = tabName === "Messages" || title === "Messages";

  const shouldRenderGameHeader = tabName === "Game" || isRacingHeader;

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
          isConferenceScreen
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

      <View
        style={[
          containerStyle,
          {
            zIndex: 2,
            overflow: "visible",
          },
        ]}
      >
        {/* LEFT HEADER ACTION */}

        {tabName === "Profile" ? (
          onMessages ? (
            <TouchableOpacity
              activeOpacity={activeOpacity}
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
            <View style={styles.profileHeaderPlaceholder} />
          )
        ) : showBackButton && onBack ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onBack}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={24} color={headerIconColor} />
          </TouchableOpacity>
        ) : tabName === "Explore" && onAddWidget ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onAddWidget}
            hitSlop={8}
          >
            <Ionicons
              name="add"
              size={24}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSidePlaceholder} />
        )}

        {/* CENTER HEADER CONTENT */}

        {shouldRenderGameHeader ? (
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
            isEvent={isEvent}
            isNeutralSite={isNeutralSite}
            racingLeague={resolvedRacingLeague}
            eventTitle={title}
            eventLogo={logo ?? homeLogo}
          />
        ) : tabName === "League" ? (
          <View style={styles.leagueHeaderContainer}>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={onOpenLeagueModal}
              style={styles.leagueHeaderButton}
            >
              <HeaderTitle
                style={selectedConference ? constantTextStyle : textStyle}
              >
                {selectedConferenceName || league}
              </HeaderTitle>

              <Animated.View
                style={{
                  transform: [
                    {
                      rotate,
                    },
                  ],
                }}
              >
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
          <View style={styles.defaultHeaderTitleContainer}>
            <HeaderTitle style={textStyle}>
              {title || tabName || ""}
            </HeaderTitle>
          </View>
        )}

        {/* RIGHT HEADER ACTION */}

        {isTeamScreen ? (
          <View style={styles.teamHeaderActions}>
            {onToggleFavorite ? (
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={onToggleFavorite}
                style={styles.teamHeaderActionButton}
              >
                <Ionicons
                  name={isFavorite ? "star" : "star-outline"}
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            ) : null}

            {onToggleNotifications ? (
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={onToggleNotifications}
                style={styles.teamHeaderActionButton}
              >
                <Ionicons
                  name={isNotified ? "notifications" : "notifications-outline"}
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            ) : null}

            {!isPlayerScreen && onOpenInfo ? (
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={onOpenInfo}
                style={styles.teamHeaderActionButton}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            ) : null}
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
              activeOpacity={activeOpacity}
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
        ) : tabName === "Explore" && onSearchToggle ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onSearchToggle}
            hitSlop={8}
          >
            <Search size={20} color={isDark ? Colors.white : Colors.black} />
          </TouchableOpacity>
        ) : isMessagesListScreen && onCreateMessage ? (
          <Pressable
            onPressIn={onCreateMessage}
            accessibilityRole="button"
            accessibilityLabel="Create message"
            hitSlop={{
              top: 14,
              right: 14,
              bottom: 14,
              left: 14,
            }}
            pressRetentionOffset={{
              top: 16,
              right: 16,
              bottom: 16,
              left: 16,
            }}
            style={({ pressed }) => [
              styles.headerActionButton,
              pressed && styles.headerActionButtonPressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={24}
              color={isDark ? Colors.white : Colors.black}
            />
          </Pressable>
        ) : onToggleLayout ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={onToggleLayout}
            hitSlop={8}
          >
            <Ionicons
              name={isGrid ? "list" : "grid"}
              size={22}
              color={isDark ? Colors.white : Colors.black}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSidePlaceholder} />
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

  headerSidePlaceholder: {
    width: 24,
  },

  profileHeaderPlaceholder: {
    width: 32,
  },

  defaultHeaderTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  leagueHeaderContainer: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  leagueHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },

  teamHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  teamHeaderActionButton: {
    padding: 8,
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

  teamCodeRow: {
    flexDirection: "row",
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

  racingHeader: {
    zIndex: -10,
    overflow: "hidden",
    backgroundColor: Colors.black,
  },

  racingAccent: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 5,
    zIndex: 3,
  },

  racingHeaderContent: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 54,
  },

  racingCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  racingCode: {
    color: Colors.white,
    fontFamily: Fonts.OSBOLD,
    fontSize: 12,
  },

  racingTextWrapper: {
    flexShrink: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  racingSeriesLabel: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: Fonts.OSBOLD,
    fontSize: 8,
    letterSpacing: 1.1,
  },

  racingEventTitle: {
    color: Colors.white,
    fontFamily: Fonts.OSBOLD,
    fontSize: 14,
    maxWidth: width * 0.48,
  },

  racingLogoWrapper: {
    position: "absolute",
    right: 34,
    top: -26,
    width: 116,
    height: 116,
    opacity: 0.18,
    zIndex: 1,
  },

  racingLogo: {
    width: "100%",
    height: "100%",
  },

  racingLargeText: {
    position: "absolute",
    right: -4,
    bottom: -22,
    fontFamily: Fonts.OSBOLD,
    fontSize: 70,
    lineHeight: 78,
    letterSpacing: -3,
    opacity: 0.09,
    zIndex: 1,
  },

  racingCheckeredPattern: {
    position: "absolute",
    top: -14,
    right: -12,
    width: 108,
    flexDirection: "row",
    flexWrap: "wrap",
    opacity: 0.08,
    transform: [
      {
        rotate: "12deg",
      },
    ],
  },

  racingCheckeredCell: {
    width: 18,
    height: 18,
  },

  racingCheckeredCellFilled: {
    backgroundColor: Colors.white,
  },

  racingCheckeredCellEmpty: {
    backgroundColor: "transparent",
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
    shadowOffset: {
      width: 0,
      height: 6,
    },
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

  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActionButtonPressed: {
    opacity: 0.65,
  },
});
