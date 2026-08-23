import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet, Text, View } from "react-native";

type ComparisonValue = number | string | null | undefined;

type ComparisonBioProps = {
  firstFighterHeight: ComparisonValue;
  secondFighterHeight: ComparisonValue;
  firstFighterAge: ComparisonValue;
  secondFighterAge: ComparisonValue;
  firstFighterWeight: ComparisonValue;
  secondFighterWeight: ComparisonValue;
  firstFighterReach: ComparisonValue;
  secondFighterReach: ComparisonValue;
  firstFighterIsWinner: boolean;
  secondFighterIsWinner: boolean;
  firstFighterRecord: ComparisonValue;
  secondFighterRecord: ComparisonValue;
  firstFighterClass: ComparisonValue;
  secondFighterClass: ComparisonValue;
  firstFighterCountry: ComparisonValue;
  secondFighterCountry: ComparisonValue;
  firstFighterIsChampion: boolean;
  secondFighterIsChampion: boolean | null;
  isDark: boolean;
};

type ComparisonRow = {
  label: string;
  leftValue: ComparisonValue;
  rightValue: ComparisonValue;
};

const FALLBACK_VALUE = "—";

const formatComparisonValue = (value: ComparisonValue) => {
  if (value === null || value === undefined) return FALLBACK_VALUE;

  const text = String(value).trim();

  if (!text || text.toLowerCase() === "n/a") return FALLBACK_VALUE;

  return text;
};

export function ComparisonBio({
  firstFighterHeight,
  firstFighterAge,
  secondFighterAge,
  secondFighterHeight,
  firstFighterWeight,
  secondFighterWeight,
  firstFighterReach,
  secondFighterReach,
  firstFighterClass,
  secondFighterClass,
  firstFighterCountry,
  secondFighterCountry,
  firstFighterRecord,
  secondFighterRecord,
  firstFighterIsWinner,
  secondFighterIsWinner,
  firstFighterIsChampion,
  secondFighterIsChampion,
  isDark,
}: ComparisonBioProps) {
  const styles = comparisonBioStyles(isDark);

  const rows: ComparisonRow[] = [
    {
      label: "Class",
      leftValue: secondFighterClass,
      rightValue: firstFighterClass,
    },
    {
      label: "Record",
      leftValue: secondFighterRecord,
      rightValue: firstFighterRecord,
    },
    {
      label: "Height",
      leftValue: secondFighterHeight,
      rightValue: firstFighterHeight,
    },
    {
      label: "Weight",
      leftValue: secondFighterWeight,
      rightValue: firstFighterWeight,
    },
    {
      label: "Reach",
      leftValue: secondFighterReach,
      rightValue: firstFighterReach,
    },
    {
      label: "Age",
      leftValue: secondFighterAge,
      rightValue: firstFighterAge,
    },
    {
      label: "Country",
      leftValue: secondFighterCountry,
      rightValue: firstFighterCountry,
    },
  ];

  const renderValue = (
    value: ComparisonValue,
    isWinner: boolean,
    isChampion?: boolean | null,
  ) => {
    return (
      <View
        style={[
          styles.valueCell,
          isWinner && styles.winnerValueCell,
          isChampion && styles.championValueCell,
        ]}
      >
        <Text
          style={[
            styles.categoryText,
            isWinner && styles.winnerValueText,
            isChampion && styles.championValueText,
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {formatComparisonValue(value)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index === rows.length - 1 && styles.lastRow]}
          >
            {renderValue(
              row.leftValue,
              secondFighterIsWinner,
              secondFighterIsChampion,
            )}

            <View style={styles.centerCell}>
              <Text
                style={styles.categoryTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {row.label}
              </Text>
            </View>

            {renderValue(
              row.rightValue,
              firstFighterIsWinner,
              firstFighterIsChampion,
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export const comparisonBioStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "stretch",
      justifyContent: "center",
      minWidth: 0,
    },
    wrapper: {
      width: "100%",
      minWidth: 0,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 34,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.dark.transparentWhite
        : Colors.transparentBlack,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    valueCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
      minHeight: 34,
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    winnerValueCell: {
      backgroundColor: isDark
        ? Colors.dark.transparentGreen
        : Colors.light.transparentGreen,
    },
    championValueCell: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.dark.yellow : Colors.light.gold,
    },
    centerCell: {
      alignItems: "center",
      justifyContent: "center",
      width: 62,
      minHeight: 34,
      paddingHorizontal: 4,
    },
    categoryTitle: {
      fontFamily: Fonts.BOLD,
      fontSize: 11,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      textAlign: "center",
      textTransform: "uppercase",
    },
    categoryText: {
      fontFamily: Fonts.REGULAR,
      fontSize: 11,
      lineHeight: 15,
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: "center",
    },
    winnerValueText: {
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.dark.limeGreen : Colors.light.green,
    },
    championValueText: {
      fontFamily: Fonts.BOLD,
      color: isDark ? Colors.dark.yellow : Colors.light.gold,
    },
  });
