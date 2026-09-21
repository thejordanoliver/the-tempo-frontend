import { RacingDriver, RacingEventCardProps } from "@/types/racing/racing";
import { Ionicons } from "@expo/vector-icons";
import placeholderImage from "assets/Placeholders/playerPlaceholder.png";
import { activeOpacity, Colors, Fonts } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getBroadcastDisplay } from "utils/games";

export default function RacingSquareGameCard({ game }: RacingEventCardProps) {
  const router = useRouter();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  const handlePress = () => {
    router.push({
      pathname: "/game/racing/[game]",
      params: {
        game: String(game.id),
        data: encodeURIComponent(JSON.stringify(game)),
      },
    });
  };

  const safeDate = (date?: string | null) => {
    if (!date) return new Date();

    const d = new Date(date);

    return isNaN(d.getTime()) ? new Date() : d;
  };

  const gameDate = safeDate(game.date);

  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formattedTime =
    gameDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) || "";

  const drivers = game.drivers?.length ? game.drivers : game.competitors;
  const sortedDrivers = [...(drivers ?? [])].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  const topDrivers = sortedDrivers
    .slice(0, 3);
  const remainingDriverCount = Math.max(0, sortedDrivers.length - 3);

  const styles = getStyles(isDark);
  const gameStatusDescription = game?.status?.description;
  const gameStatusDetail = game?.status?.shortDetail ?? "";
  const tbd = gameStatusDetail.includes("TBD") ? "TBD" : null;
  const headline = game.shortName || game.name;

  const isCanceled = gameStatusDescription === "Canceled";
  const isFinal = gameStatusDescription === "Final";
  const isPostponed = gameStatusDescription === "Postponed";
  const isDelayed = gameStatusDescription === "Delayed";
  const inProgress = gameStatusDescription === "In Progress";

  const broadcasts = game.broadcasts;
  const broadcast = getBroadcastDisplay(broadcasts);

  const statusLabel = isCanceled
    ? "Canceled"
    : isPostponed
    ? "Postponed"
    : isDelayed
    ? "Delayed"
    : isFinal
    ? "Final"
    : inProgress
    ? game.status?.detail || "Live"
    : tbd || formattedTime;

  const renderDriverRow = (driver: RacingDriver, index: number) => {
    const isLast = index === topDrivers.length - 1;
    const position = driver.order ?? index + 1;

    return (
      <View
        key={driver.id ?? driver.uid ?? index}
        style={[styles.driverRow, isLast && styles.lastDriverRow]}
      >
        <View style={styles.positionContainer}>
          <Text
            style={[
              styles.position,
              position === 1 && styles.leaderPosition,
            ]}
          >
            {position}
          </Text>
        </View>

        <View style={styles.driverImageContainer}>
          <Image
            source={driver.flag ? { uri: driver.flag } : placeholderImage}
            style={styles.driverImage}
          />
        </View>

        <View style={styles.driverInfoWrapper}>
          <Text style={styles.driverName} numberOfLines={1}>
            {driver.shortName || driver.displayName || driver.name}
          </Text>
          {driver.country ? (
            <Text style={styles.teamName} numberOfLines={1}>
              {driver.country}
            </Text>
          ) : null}
        </View>

        {driver.winner ? (
          <Ionicons name="trophy" size={16} color={styles.leaderPosition.color} />
        ) : null}
      </View>
    );
  };

  return (
    <TouchableOpacity activeOpacity={activeOpacity} onPress={handlePress}>
      <View style={styles.card}>
        <View style={styles.headlineContainer}>
          <Text style={styles.headlineText} numberOfLines={1}>
            {headline}
          </Text>
        </View>

        <View style={styles.cardHeader}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName} numberOfLines={1}>
              {game.leagueInfo?.name}
            </Text>
            <Text style={styles.trackName} numberOfLines={1}>
              {formattedDate}
            </Text>
          </View>

          <Text
            style={
              isFinal
                ? styles.finalText
                : inProgress
                ? styles.liveText
              : styles.scheduledText
            }
            numberOfLines={1}
          >
            {statusLabel}
          </Text>
        </View>

        <View style={styles.driverList}>
          {topDrivers.map(renderDriverRow)}
        </View>

        {remainingDriverCount > 0 && (
          <Text style={styles.moreText}>+{remainingDriverCount} more</Text>
        )}

        {broadcast ? (
          <Text style={styles.broadcast} numberOfLines={1}>
            {broadcast}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (isDark: boolean) => {
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const subTextColor = isDark ? Colors.lightGray : Colors.darkGray;
  const borderColor = isDark ? Colors.darkGray : Colors.lightGray;
  const accentRed = isDark ? Colors.dark.lightRed : Colors.light.red;

  return StyleSheet.create({
    card: {
      minHeight: 144,
      padding: 10,
      borderRadius: 8,
      backgroundColor: isDark
        ? Colors.dark.itemBackground
        : Colors.light.itemBackground,
    },
    headlineContainer: { marginBottom: 4 },
    headlineText: {
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: textColor,
      textAlign: "center",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minWidth: 0,
      gap: 6,
      marginBottom: 4,
    },
    eventInfo: { flex: 1, minWidth: 0 },
    eventName: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: textColor,
    },
    trackName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
    },
    finalText: {
      flexShrink: 0,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: accentRed,
    },
    liveText: {
      flexShrink: 0,
      fontFamily: Fonts.BOLD,
      fontSize: 10,
      color: accentRed,
    },
    scheduledText: {
      flexShrink: 0,
      fontFamily: Fonts.REGULAR,
      fontSize: 10,
      color: subTextColor,
    },
    driverList: { gap: 1 },
    driverRow: {
      minHeight: 26,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
      gap: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: borderColor,
    },
    lastDriverRow: { borderBottomWidth: 0 },
    positionContainer: { width: 16, alignItems: "center" },
    position: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: subTextColor,
    },
    leaderPosition: { color: isDark ? Colors.dark.gold : Colors.light.gold },
    driverImageContainer: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      overflow: "hidden",
    },
    driverImage: { width: 22, height: 22 },
    driverInfoWrapper: { flex: 1, minWidth: 0 },
    driverName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      color: textColor,
    },
    teamName: {
      fontFamily: Fonts.REGULAR,
      fontSize: 9,
      color: subTextColor,
    },
    moreText: {
      marginTop: 2,
      fontFamily: Fonts.REGULAR,
      fontSize: 9,
      color: subTextColor,
      textAlign: "center",
    },
    broadcast: {
      marginTop: 3,
      fontFamily: Fonts.REGULAR,
      fontSize: 9,
      color: subTextColor,
      textAlign: "center",
    },
  });
};
