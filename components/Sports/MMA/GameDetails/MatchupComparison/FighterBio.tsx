import { Colors, Fonts } from "@/constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type FighterBioProps = {
  id: string | number | null | undefined;
  stanceImage: string | null | undefined;
  name: string | null;
  flag: string | null | undefined;
  record: string | null | undefined;
  isDark: boolean;
  isChampion: boolean | null;
  isWinner: boolean;
};

const FALLBACK_VALUE = "—";

const formatTextValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return FALLBACK_VALUE;

  const text = String(value).trim();

  if (!text || text.toLowerCase() === "n/a") return FALLBACK_VALUE;

  return text;
};

const hasImageUri = (value: string | null | undefined) => {
  if (!value) return false;

  const text = value.trim();

  return Boolean(text) && text.toLowerCase() !== "n/a";
};

export const FighterBio = ({
  id,
  stanceImage,
  name,
  flag,
  record,
  isDark,
  isChampion,
  isWinner,
}: FighterBioProps) => {
  const router = useRouter();
  const styles = FighterBioStyles(isDark);
  const route = "/player/mma/[id]";
  const fighterId = id === null || id === undefined ? "" : String(id);
  const displayName = formatTextValue(name);
  const displayRecord = formatTextValue(record);
  const hasStanceImage = hasImageUri(stanceImage);
  const hasFlag = hasImageUri(flag);
  const canOpenFighter = Boolean(fighterId) && fighterId !== "NaN";

  const handleFighterPress = () => {
    if (canOpenFighter)
      router.push({
        pathname: route,
        params: {
          id: fighterId,
        },
      });
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleFighterPress}
        disabled={!canOpenFighter}
        accessibilityRole="button"
        accessibilityLabel={`View ${displayName} MMA fighter profile`}
        accessibilityHint="Opens the fighter profile screen"
        accessibilityState={{ disabled: !canOpenFighter }}
        style={({ pressed }) => [
          styles.card,
          isWinner && styles.winnerCard,
          isChampion && styles.championCard,
          !canOpenFighter && styles.disabledCard,
          pressed && styles.pressedCard,
        ]}
      >
        <View style={styles.badgeRow}>
          {isWinner && (
            <View style={[styles.badge, styles.winnerBadge]}>
              <Text style={styles.badgeText}>WINNER</Text>
            </View>
          )}
          {isChampion && (
            <View style={[styles.badge, styles.championBadge]}>
              <Text style={styles.badgeText}>CHAMP</Text>
            </View>
          )}
        </View>

        <View style={styles.stanceImageContainer}>
          {hasStanceImage ? (
            <Image
              source={{ uri: stanceImage ?? "" }}
              style={styles.stanceImage}
              resizeMode="contain"
              accessibilityLabel={`${displayName} stance image`}
            />
          ) : (
            <View style={styles.stanceFallback}>
              <Text style={styles.stanceFallbackText}>{FALLBACK_VALUE}</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomInfo}>
          <Text
            style={styles.bottomInfoText}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
            {displayName}
          </Text>

          <View style={styles.metaRow}>
            {hasFlag && (
              <Image
                source={{ uri: flag ?? "" }}
                style={styles.flag}
                resizeMode="contain"
                accessibilityLabel={`${displayName} flag`}
              />
            )}
            <Text
              style={styles.recordText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              {displayRecord}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const FighterBioStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      minWidth: 0,
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "stretch",
    },
    card: {
      flex: 1,
      minHeight: 268,
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingHorizontal: 6,
      paddingVertical: 8,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    winnerCard: {
      borderColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
      borderWidth: 1,
    },
    championCard: {
      borderColor: isDark ? Colors.dark.yellow : Colors.light.gold,
    },
    pressedCard: {
      opacity: 0.78,
    },
    disabledCard: {
      opacity: 0.72,
    },
    badgeRow: {
      minHeight: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    stanceImage: {
      width: "100%",
      height: "100%",
    },
    stanceImageContainer: {
      width: "100%",
      height: 176,
      alignItems: "center",
      justifyContent: "center",
    },
    stanceFallback: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.light.transparentBlack,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentBackground
        : Colors.light.transparentBackground,
    },
    stanceFallbackText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 28,
    },
    badge: {
      minHeight: 18,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    winnerBadge: {
      backgroundColor: isDark ? Colors.dark.green : Colors.light.green,
    },
    championBadge: {
      backgroundColor: isDark ? Colors.dark.gold : Colors.light.gold,
    },
    badgeText: {
      color: Colors.white,
      fontFamily: Fonts.OSBOLD,
      fontSize: 9,
      lineHeight: 12,
      textAlign: "center",
    },
    bottomInfo: {
      width: "100%",
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    bottomInfoText: {
      fontSize: 12,
      textAlign: "center",
      fontFamily: Fonts.OSBOLD,
      color: isDark ? Colors.dark.text : Colors.light.text,
      lineHeight: 16,
    },
    metaRow: {
      width: "100%",
      minHeight: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    flag: {
      width: 22,
      height: 16,
    },
    recordText: {
      maxWidth: "75%",
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 11,
      textAlign: "center",
    },
  });
