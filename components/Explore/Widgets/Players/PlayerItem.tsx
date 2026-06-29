import { Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  SlideInDown,
  SlideOutUp,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export type PlayerWidgetStat = {
  label: string;
  value: number | string;
};

export type PlayerWidgetProps = {
  id: number;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  team: {
    id: number;
    code: string;
    logo: any;
  };
  headshot?: string | any;
  stats: PlayerWidgetStat[];
  header?: string;
  height?: number;
  width?: number;
  isLast?: boolean;
  visible?: boolean;
};

export default function PlayerItem({
  visible = true,
  isLast = false,
  ...props
}: PlayerWidgetProps) {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerItemStyles(isDark);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        {
          scale: withTiming(visible ? 1 : 0.96, { duration: 200 }),
        },
      ],
    };
  }, [visible]);

  return (
    <Animated.View
      style={[animatedStyle]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View
        style={[styles.row, isLast && styles.lastRow]}
        entering={SlideInDown.duration(250)}
        exiting={SlideOutUp.duration(200)}
      >
        {/* PLAYER INFO */}
        <View style={styles.playerContainer}>
          <View style={styles.avatarWrapper}>
            {props.headshot && (
              <Image
                source={
                  typeof props.headshot === "string"
                    ? { uri: props.headshot }
                    : props.headshot
                }
                style={styles.avatar}
              />
            )}
          </View>

          <View style={styles.info}>
            <View style={styles.infoWrapper}>
              <Text style={styles.name} numberOfLines={1}>
                {props.firstName} {props.lastName}
              </Text>
              <Text style={styles.jerseyNumber}>#{props.jerseyNumber}</Text>
            </View>
            <Text style={styles.code}>{props.team.code}</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsColumn}>
          {props.stats.map((stat, index) => (
            <Text key={index} style={styles.statValue}>
              {stat.value}
            </Text>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const playerItemStyles = (isDark: boolean) => {
  return StyleSheet.create({
    container: {
      overflow: "hidden",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.lightGray : Colors.darkGray,
      height: 40,
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    playerContainer: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 1,
      flex: 1, // fill available space
    },

    avatarWrapper: {
      width: 32,
      height: 32,
      borderRadius: 999,
      paddingTop: 4,
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: isDark ? Colors.white : Colors.black,
    },

    avatar: {
      width: "100%",
      height: "100%",
    },

    info: {
      marginLeft: 12,
      flex: 1, // allow name to take all remaining space
    },

    infoWrapper: {
      alignItems: "baseline",
      flexDirection: "row",
    },

    name: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 14,
      color: isDark ? Colors.dark.white : Colors.light.black,
      flexShrink: 1,
    },
    code: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.midTone : Colors.midTone,
      flexShrink: 1,
    },
    jerseyNumber: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      color: isDark ? Colors.midTone : Colors.midTone,
      flexShrink: 1,
      marginLeft: 4,
    },

    statsColumn: {
      flexDirection: "column", // stack stats vertically to save horizontal space
      alignItems: "flex-end",
      justifyContent: "center",
      marginLeft: 12,
      minWidth: 36,
    },

    statValue: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 16,
      color: isDark ? Colors.dark.white : Colors.light.black,
    },
  });
};
