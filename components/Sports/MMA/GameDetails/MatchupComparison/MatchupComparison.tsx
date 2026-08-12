import HeadingTwo from "@/components/Headings/HeadingTwo";
import { Colors, Fonts } from "@/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export const MATCHUP_COMPARISON_VARIANTS = [
  "corner-cards",
  "tale-of-tape",
  "stat-grid",
  "spotlight",
  "meter-board",
] as const;

export type MatchupComparisonVariant =
  (typeof MATCHUP_COMPARISON_VARIANTS)[number];

type ComparisonValue = number | string | null | undefined;

type Props = {
  firstFighterId: number;
  secondFighterId: number;
  firstFighterStance: string;
  secondFighterStance: string;
  firstFighterHeight: string | null;
  secondFighterHeight: string | null;
  firstFighterAge: number | string | null;
  secondFighterAge: number | string | null;
  firstFighterWeight: number | string | null;
  secondFighterWeight: number | string | null;
  firstFighterReach: string | null;
  secondFighterReach: string | null;
  firstFighterName: string | null;
  secondFighterName: string | null;
  firstFighterIsWinner: boolean;
  secondFighterIsWinner: boolean;
  firstFighterRecord: string;
  secondFighterRecord: string;
  firstFighterClass: string;
  secondFighterClass: string;
  firstFighterFlag: string;
  secondFighterFlag: string;
  firstFighterCountry: string | null;
  secondFighterCountry: string | null;
  firstFighterIsChampion: boolean;
  secondFighterIsChampion: boolean | null;
  gameStatusDescription: string | undefined;
  isDark: boolean;
  variant?: MatchupComparisonVariant;
};

type FighterViewModel = {
  id: number | string | null | undefined;
  stanceImage: string | null | undefined;
  name: string;
  flag: string | null | undefined;
  record: string;
  age: ComparisonValue;
  weight: ComparisonValue;
  height: ComparisonValue;
  reach: ComparisonValue;
  className: ComparisonValue;
  country: ComparisonValue;
  isWinner: boolean;
  isChampion: boolean | null;
};

type ComparisonRow = {
  label: string;
  leftValue: ComparisonValue;
  rightValue: ComparisonValue;
};

const FALLBACK_VALUE = "-";
const ROUTE = "/player/mma/[id]";

const formatComparisonValue = (value: ComparisonValue) => {
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

const getFighterId = (id: number | string | null | undefined) => {
  const fighterId = id === null || id === undefined ? "" : String(id);

  if (!fighterId || fighterId === "NaN") return "";

  return fighterId;
};

const getNumericValue = (value: ComparisonValue) => {
  const text = formatComparisonValue(value).replace(/,/g, "");
  const heightMatch = text.match(/(\d+)\s*'\s*(\d+)?/);

  if (heightMatch) {
    const feet = Number(heightMatch[1]);
    const inches = Number(heightMatch[2] ?? 0);

    return feet * 12 + inches;
  }

  const numberMatch = text.match(/-?\d+(\.\d+)?/);

  if (!numberMatch) return null;

  return Number(numberMatch[0]);
};

const getMeterShare = (value: ComparisonValue, otherValue: ComparisonValue) => {
  const currentValue = getNumericValue(value);
  const opponentValue = getNumericValue(otherValue);

  if (
    currentValue === null ||
    opponentValue === null ||
    currentValue + opponentValue <= 0
  )
    return 0.5;

  const share = currentValue / (currentValue + opponentValue);

  return Math.min(Math.max(share, 0.18), 0.82);
};

export default function MatchupComparison({
  firstFighterId,
  secondFighterId,
  firstFighterStance,
  secondFighterStance,
  firstFighterHeight,
  firstFighterAge,
  secondFighterAge,
  secondFighterHeight,
  firstFighterWeight,
  secondFighterWeight,
  firstFighterReach,
  secondFighterReach,
  firstFighterName,
  secondFighterName,
  firstFighterClass,
  secondFighterClass,
  firstFighterFlag,
  secondFighterFlag,
  firstFighterCountry,
  secondFighterCountry,
  firstFighterRecord,
  secondFighterRecord,
  firstFighterIsWinner,
  secondFighterIsWinner,
  secondFighterIsChampion,
  firstFighterIsChampion,
  isDark,
  variant = "corner-cards",
}: Props) {
  const router = useRouter();
  const styles = matchupComparisonStyles(isDark);
  const leftFighter: FighterViewModel = {
    id: secondFighterId,
    stanceImage: secondFighterStance,
    name: formatComparisonValue(secondFighterName),
    flag: secondFighterFlag,
    record: formatComparisonValue(secondFighterRecord),
    age: secondFighterAge,
    weight: secondFighterWeight,
    height: secondFighterHeight,
    reach: secondFighterReach,
    className: secondFighterClass,
    country: secondFighterCountry,
    isWinner: secondFighterIsWinner,
    isChampion: secondFighterIsChampion,
  };
  const rightFighter: FighterViewModel = {
    id: firstFighterId,
    stanceImage: firstFighterStance,
    name: formatComparisonValue(firstFighterName),
    flag: firstFighterFlag,
    record: formatComparisonValue(firstFighterRecord),
    age: firstFighterAge,
    weight: firstFighterWeight,
    height: firstFighterHeight,
    reach: firstFighterReach,
    className: firstFighterClass,
    country: firstFighterCountry,
    isWinner: firstFighterIsWinner,
    isChampion: firstFighterIsChampion,
  };
  const rows: ComparisonRow[] = [
    {
      label: "Class",
      leftValue: leftFighter.className,
      rightValue: rightFighter.className,
    },
    {
      label: "Record",
      leftValue: leftFighter.record,
      rightValue: rightFighter.record,
    },
    {
      label: "Height",
      leftValue: leftFighter.height,
      rightValue: rightFighter.height,
    },
    {
      label: "Weight",
      leftValue: leftFighter.weight,
      rightValue: rightFighter.weight,
    },
    {
      label: "Reach",
      leftValue: leftFighter.reach,
      rightValue: rightFighter.reach,
    },
    {
      label: "Age",
      leftValue: leftFighter.age,
      rightValue: rightFighter.age,
    },
    {
      label: "Country",
      leftValue: leftFighter.country,
      rightValue: rightFighter.country,
    },
  ];

  const openFighter = (fighter: FighterViewModel) => {
    const fighterId = getFighterId(fighter.id);

    if (!fighterId) return;

    router.push({
      pathname: ROUTE,
      params: {
        id: fighterId,
      },
    });
  };

  const renderBadges = (fighter: FighterViewModel) => {
    if (!fighter.isWinner && !fighter.isChampion) return null;

    return (
      <View style={styles.badgesRow}>
        {fighter.isWinner && (
          <View style={[styles.badge, styles.winnerBadge]}>
            <Text style={styles.badgeText}>WINNER</Text>
          </View>
        )}
        {fighter.isChampion && (
          <View style={[styles.badge, styles.championBadge]}>
            <Text style={styles.badgeText}>CHAMP</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStanceImage = (
    fighter: FighterViewModel,
    imageStyle: StyleProp<ImageStyle>,
    fallbackStyle: StyleProp<ViewStyle>,
    iconSize: number,
  ) => {
    if (hasImageUri(fighter.stanceImage)) {
      return (
        <Image
          source={{ uri: fighter.stanceImage ?? "" }}
          style={imageStyle}
          resizeMode="contain"
          accessibilityLabel={`${fighter.name} stance image`}
        />
      );
    }

    return (
      <View style={[fallbackStyle, styles.stanceFallback]}>
        <Ionicons
          name="person"
          size={iconSize}
          color={isDark ? Colors.lightGray : Colors.darkGray}
        />
      </View>
    );
  };

  const renderFlag = (fighter: FighterViewModel) => {
    if (!hasImageUri(fighter.flag)) return null;

    return (
      <Image
        source={{ uri: fighter.flag ?? "" }}
        style={styles.flag}
        resizeMode="contain"
        accessibilityLabel={`${fighter.name} flag`}
      />
    );
  };

  const renderFighterPressable = (
    fighter: FighterViewModel,
    content: ReactNode,
    style: StyleProp<ViewStyle>,
  ) => {
    const canOpenFighter = Boolean(getFighterId(fighter.id));

    return (
      <Pressable
        onPress={() => openFighter(fighter)}
        disabled={!canOpenFighter}
        accessibilityRole="button"
        accessibilityLabel={`View ${fighter.name} MMA fighter profile`}
        accessibilityHint="Opens the fighter profile screen"
        accessibilityState={{ disabled: !canOpenFighter }}
        style={({ pressed }) => [
          style,
          fighter.isWinner && styles.winnerBorder,
          fighter.isChampion && styles.championBorder,
          !canOpenFighter && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  };

  const getAlignmentTextStyle = (alignment: "left" | "center" | "right") => {
    if (alignment === "left") return styles.leftText;
    if (alignment === "right") return styles.rightText;

    return styles.centerText;
  };

  const renderNameBlock = (
    fighter: FighterViewModel,
    alignment: "left" | "center" | "right" = "center",
  ) => (
    <View style={styles.nameBlock}>
      <Text
        style={[styles.fighterName, getAlignmentTextStyle(alignment)]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.76}
      >
        {fighter.name}
      </Text>
      <View style={styles.metaRow}>
        {renderFlag(fighter)}
        <Text
          style={styles.recordText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
        >
          {fighter.record}
        </Text>
      </View>
    </View>
  );

  const renderCornerFighter = (
    fighter: FighterViewModel,
    alignment: "left" | "right",
  ) =>
    renderFighterPressable(
      fighter,
      <>
        {renderBadges(fighter)}
        <View style={styles.cornerImageFrame}>
          {renderStanceImage(
            fighter,
            styles.cornerImage,
            styles.cornerImageFrame,
            36,
          )}
        </View>
        {renderNameBlock(fighter, alignment)}
      </>,
      styles.cornerFighterCard,
    );

  const renderTapeFighter = (
    fighter: FighterViewModel,
    alignment: "left" | "right",
  ) =>
    renderFighterPressable(
      fighter,
      <>
        <View style={styles.tapeImageFrame}>
          {renderStanceImage(
            fighter,
            styles.tapeImage,
            styles.tapeImageFrame,
            48,
          )}
        </View>
        {renderBadges(fighter)}
        {renderNameBlock(fighter, alignment)}
      </>,
      styles.tapeFighterCard,
    );

  const renderSpotlightFighter = (
    fighter: FighterViewModel,
    alignment: "left" | "right",
  ) =>
    renderFighterPressable(
      fighter,
      <>
        <View style={styles.spotlightImageFrame}>
          {renderStanceImage(
            fighter,
            styles.spotlightImage,
            styles.spotlightImageFrame,
            58,
          )}
        </View>
        <View style={styles.spotlightNamePlate}>
          {renderBadges(fighter)}
          {renderNameBlock(fighter, alignment)}
        </View>
      </>,
      styles.spotlightFighter,
    );

  const renderIdentityPill = (
    fighter: FighterViewModel,
    alignment: "left" | "right",
  ) =>
    renderFighterPressable(
      fighter,
      <View
        style={[
          styles.identityPillInner,
          alignment === "right" && styles.identityPillRight,
        ]}
      >
        {renderFlag(fighter)}
        <View style={styles.identityTextBlock}>
          <Text
            style={[styles.identityName, getAlignmentTextStyle(alignment)]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
            {fighter.name}
          </Text>
          <Text style={[styles.identityRecord, getAlignmentTextStyle(alignment)]}>
            {fighter.record}
          </Text>
        </View>
      </View>,
      styles.identityPill,
    );

  const renderValue = (
    value: ComparisonValue,
    fighter: FighterViewModel,
    alignment: "left" | "center" | "right" = "center",
  ) => (
    <Text
      style={[
        styles.valueText,
        getAlignmentTextStyle(alignment),
        fighter.isWinner && styles.winnerText,
        fighter.isChampion && styles.championText,
      ]}
      numberOfLines={2}
      adjustsFontSizeToFit
      minimumFontScale={0.72}
    >
      {formatComparisonValue(value)}
    </Text>
  );

  const renderFullStatRows = () => (
    <View style={styles.statList}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.statRow, index === rows.length - 1 && styles.lastRow]}
        >
          <View style={styles.statValueCell}>
            {renderValue(row.leftValue, leftFighter, "left")}
          </View>
          <View style={styles.statLabelCell}>
            <Text
              style={styles.statLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {row.label}
            </Text>
          </View>
          <View style={styles.statValueCell}>
            {renderValue(row.rightValue, rightFighter, "right")}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCompactStatRail = () => (
    <View style={styles.compactStatRail}>
      {rows.map((row) => (
        <View key={row.label} style={styles.compactStatRow}>
          {renderValue(row.leftValue, leftFighter)}
          <Text style={styles.compactStatLabel}>{row.label}</Text>
          {renderValue(row.rightValue, rightFighter)}
        </View>
      ))}
    </View>
  );

  const renderStatGrid = () => (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.label} style={styles.gridCard}>
          <Text style={styles.gridLabel}>{row.label}</Text>
          <View style={styles.gridValues}>
            <View style={styles.gridValueCell}>
              {renderValue(row.leftValue, leftFighter)}
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.gridValueCell}>
              {renderValue(row.rightValue, rightFighter)}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMeterRows = () => (
    <View style={styles.meterList}>
      {rows.map((row) => {
        const leftShare = getMeterShare(row.leftValue, row.rightValue);
        const rightShare = getMeterShare(row.rightValue, row.leftValue);

        return (
          <View key={row.label} style={styles.meterRow}>
            <View style={styles.meterRowHeader}>
              <Text style={styles.meterLabel}>{row.label}</Text>
            </View>

            <View style={styles.meterValues}>
              <View style={styles.meterValueCell}>
                {renderValue(row.leftValue, leftFighter, "left")}
              </View>
              <View style={styles.meterValueCell}>
                {renderValue(row.rightValue, rightFighter, "right")}
              </View>
            </View>

            <View style={styles.meterTracks}>
              <View style={styles.meterTrack}>
                <View
                  style={[
                    styles.meterFill,
                    styles.leftMeterFill,
                    { flex: leftShare },
                  ]}
                />
                <View style={{ flex: 1 - leftShare }} />
              </View>
              <View style={styles.meterTrack}>
                <View
                  style={[
                    styles.meterFill,
                    styles.rightMeterFill,
                    { flex: rightShare },
                  ]}
                />
                <View style={{ flex: 1 - rightShare }} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderCornerCards = () => (
    <View style={styles.wrapper}>
      <View style={styles.cornerHeader}>
        {renderCornerFighter(leftFighter, "left")}
        <View style={styles.vsStack}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        {renderCornerFighter(rightFighter, "right")}
      </View>
      {renderFullStatRows()}
    </View>
  );

  const renderTaleOfTape = () => (
    <View style={[styles.wrapper, styles.tapeWrapper]}>
      <View style={styles.tapeContainer}>
        {renderTapeFighter(leftFighter, "left")}
        {renderCompactStatRail()}
        {renderTapeFighter(rightFighter, "right")}
      </View>
    </View>
  );

  const renderStatGridDesign = () => (
    <View style={[styles.wrapper, styles.gridWrapper]}>
      <View style={styles.identityRow}>
        {renderIdentityPill(leftFighter, "left")}
        <View style={styles.identityVs}>
          <Text style={styles.identityVsText}>VS</Text>
        </View>
        {renderIdentityPill(rightFighter, "right")}
      </View>
      {renderStatGrid()}
    </View>
  );

  const renderSpotlight = () => (
    <View style={[styles.wrapper, styles.spotlightWrapper]}>
      <View style={styles.spotlightStage}>
        {renderSpotlightFighter(leftFighter, "left")}
        <View style={styles.spotlightVsBadge}>
          <Text style={styles.spotlightVsText}>VS</Text>
        </View>
        {renderSpotlightFighter(rightFighter, "right")}
      </View>
      {renderFullStatRows()}
    </View>
  );

  const renderMeterBoard = () => (
    <View style={[styles.wrapper, styles.meterWrapper]}>
      <View style={styles.meterHeader}>
        {renderIdentityPill(leftFighter, "left")}
        {renderIdentityPill(rightFighter, "right")}
      </View>
      {renderMeterRows()}
    </View>
  );

  const renderVariant = () => {
    switch (variant) {
      case "tale-of-tape":
        return renderTaleOfTape();
      case "stat-grid":
        return renderStatGridDesign();
      case "spotlight":
        return renderSpotlight();
      case "meter-board":
        return renderMeterBoard();
      case "corner-cards":
      default:
        return renderCornerCards();
    }
  };

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Matchup Comparison</HeadingTwo>
      {renderVariant()}
    </View>
  );
}
export const matchupComparisonStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    wrapper: {
      width: "100%",
      padding: 10,
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
      gap: 10,
      backgroundColor: isDark
        ? Colors.dark.transparentBackground
        : Colors.light.transparentBackground,
    },
    badgesRow: {
      minHeight: 18,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
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
    winnerBorder: {
      borderColor: isDark ? Colors.dark.limeGreen : Colors.light.green,
      borderWidth: 1,
    },
    championBorder: {
      borderColor: isDark ? Colors.dark.yellow : Colors.light.gold,
    },
    pressed: {
      opacity: 0.78,
    },
    disabled: {
      opacity: 0.72,
    },
    cornerHeader: {
      minHeight: 142,
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "center",
      gap: 8,
    },
    cornerFighterCard: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
      padding: 8,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    cornerImageFrame: {
      width: "100%",
      height: 74,
      alignItems: "center",
      justifyContent: "center",
    },
    cornerImage: {
      width: "100%",
      height: "100%",
    },
    vsStack: {
      width: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    vsText: {
      minWidth: 34,
      minHeight: 34,
      borderRadius: 8,
      overflow: "hidden",
      paddingTop: 7,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      borderWidth: StyleSheet.hairlineWidth,
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      textAlign: "center",
    },
    nameBlock: {
      width: "100%",
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    fighterName: {
      width: "100%",
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      lineHeight: 16,
      textAlign: "center",
    },
    metaRow: {
      width: "100%",
      minHeight: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    flag: {
      width: 22,
      height: 15,
    },
    recordText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 11,
      lineHeight: 14,
      textAlign: "center",
    },
    stanceFallback: {
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
    statList: {
      width: "100%",
      borderRadius: 8,
      overflow: "hidden",
      borderColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderWidth: StyleSheet.hairlineWidth,
    },
    statRow: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      borderBottomColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderBottomWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    statValueCell: {
      flex: 1,
      minWidth: 0,
      minHeight: 38,
      justifyContent: "center",
      paddingHorizontal: 7,
      paddingVertical: 5,
    },
    statLabelCell: {
      width: 68,
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
      borderLeftColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderRightWidth: StyleSheet.hairlineWidth,
    },
    statLabel: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      textAlign: "center",
      textTransform: "uppercase",
    },
    valueText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
      lineHeight: 15,
      textAlign: "center",
    },
    winnerText: {
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
      fontFamily: Fonts.OSBOLD,
    },
    championText: {
      color: isDark ? Colors.dark.yellow : Colors.light.gold,
      fontFamily: Fonts.OSBOLD,
    },
    leftText: {
      textAlign: "left",
    },
    centerText: {
      textAlign: "center",
    },
    rightText: {
      textAlign: "right",
    },
    tapeWrapper: {
      padding: 8,
    },
    tapeContainer: {
      width: "100%",
      minHeight: 296,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 7,
    },
    tapeFighterCard: {
      flex: 1,
      minWidth: 0,
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
    tapeImageFrame: {
      width: "100%",
      flex: 1,
      minHeight: 160,
      alignItems: "center",
      justifyContent: "center",
    },
    tapeImage: {
      width: "100%",
      height: "100%",
    },
    compactStatRail: {
      flex: 1.08,
      minWidth: 0,
      justifyContent: "center",
      gap: 4,
    },
    compactStatRow: {
      minHeight: 35,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 3,
      borderColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    compactStatLabel: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 10,
      lineHeight: 12,
      textAlign: "center",
      textTransform: "uppercase",
    },
    gridWrapper: {
      gap: 9,
    },
    identityRow: {
      width: "100%",
      minHeight: 48,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 7,
    },
    identityPill: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    identityPillInner: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    identityPillRight: {
      flexDirection: "row-reverse",
    },
    identityTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    identityName: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 13,
      lineHeight: 16,
    },
    identityRecord: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSMEDIUM,
      fontSize: 11,
      lineHeight: 14,
    },
    identityVs: {
      width: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    identityVsText: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 12,
      textAlign: "center",
    },
    grid: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    gridCard: {
      width: "48.7%",
      minHeight: 72,
      justifyContent: "space-between",
      gap: 7,
      padding: 8,
      borderColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    gridLabel: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      lineHeight: 13,
      textAlign: "center",
      textTransform: "uppercase",
    },
    gridValues: {
      minHeight: 34,
      flexDirection: "row",
      alignItems: "stretch",
    },
    gridValueCell: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    gridDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
    },
    spotlightWrapper: {
      gap: 10,
    },
    spotlightStage: {
      minHeight: 220,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 8,
    },
    spotlightFighter: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      borderColor: isDark ? Colors.dark.icon : Colors.light.icon,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    spotlightImageFrame: {
      width: "100%",
      height: 150,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      paddingTop: 8,
    },
    spotlightImage: {
      width: "100%",
      height: "100%",
    },
    spotlightNamePlate: {
      minHeight: 68,
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderTopColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    spotlightVsBadge: {
      position: "absolute",
      zIndex: 2,
      top: 72,
      left: "50%",
      width: 42,
      height: 42,
      marginLeft: -21,
      alignItems: "center",
      justifyContent: "center",
      borderColor: Colors.midTone,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    spotlightVsText: {
      color: isDark ? Colors.dark.text : Colors.light.text,
      fontFamily: Fonts.OSBOLD,
      fontSize: 14,
      textAlign: "center",
    },
    meterWrapper: {
      gap: 9,
    },
    meterHeader: {
      width: "100%",
      minHeight: 52,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 8,
    },
    meterList: {
      width: "100%",
      gap: 8,
    },
    meterRow: {
      minHeight: 68,
      gap: 5,
      padding: 8,
      borderColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: isDark
        ? Colors.dark.transparentItemBackground
        : Colors.light.transparentItemBackground,
    },
    meterRowHeader: {
      alignItems: "center",
      justifyContent: "center",
    },
    meterLabel: {
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSBOLD,
      fontSize: 11,
      lineHeight: 13,
      textAlign: "center",
      textTransform: "uppercase",
    },
    meterValues: {
      minHeight: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    meterValueCell: {
      flex: 1,
      minWidth: 0,
    },
    meterTracks: {
      flexDirection: "row",
      gap: 8,
    },
    meterTrack: {
      flex: 1,
      height: 5,
      overflow: "hidden",
      flexDirection: "row",
      borderRadius: 4,
      backgroundColor: isDark
        ? Colors.dark.transparentBackground
        : Colors.light.transparentBackground,
    },
    meterFill: {
      height: "100%",
      borderRadius: 4,
    },
    leftMeterFill: {
      backgroundColor: isDark ? Colors.dark.transparentWhite : Colors.darkGray,
    },
    rightMeterFill: {
      backgroundColor: isDark ? Colors.dark.transparentWhite : Colors.darkGray,
    },
  });
