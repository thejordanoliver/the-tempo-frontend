import { Colors, Fonts } from "@/constants/styles";
import { StyleSheet, Text, View } from "react-native";

type ComparisonBioProps = {
  firstFighterHeight: string | null;
  secondFighterHeight: string | null;
  firstFighterAge: number | string | null;
  secondFighterAge: number | string | null;
  firstFighterWeight: number | string | null;
  secondFighterWeight: number | string | null;
  firstFighterReach: string | null;
  secondFighterReach: string | null;
  firstFighterIsWinner: boolean;
  secondFighterIsWinner: boolean;
  firstFighterRecord: string;
  secondFighterRecord: string;
  firstFighterClass: string;
  secondFighterClass: string;
  firstFighterCountry: string | null;
  secondFighterCountry: string | null;
  firstFighterIsChampion: boolean;
  secondFighterIsChampion: boolean | null;
  isDark: boolean;
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
  isDark,
}: ComparisonBioProps) {
  const styles = comparisonBioStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.leftColumn}>
          <Text style={styles.categoryText}>{secondFighterClass}</Text>
          <Text style={styles.categoryText}>{secondFighterRecord}</Text>
          <Text style={styles.categoryText}>{secondFighterHeight}</Text>
          <Text style={styles.categoryText}>{secondFighterWeight}</Text>
          <Text style={styles.categoryText}>{secondFighterReach}</Text>
          <Text style={styles.categoryText}>{secondFighterAge}</Text>
          <Text style={styles.categoryText}>{secondFighterCountry}</Text>
        </View>

        <View style={styles.centerColumn}>
          <Text style={styles.categoryTitle}>Class</Text>
          <Text style={styles.categoryTitle}>Record</Text>
          <Text style={styles.categoryTitle}>Height</Text>
          <Text style={styles.categoryTitle}>Weight</Text>
          <Text style={styles.categoryTitle}>Reach</Text>
          <Text style={styles.categoryTitle}>Age</Text>
          <Text style={styles.categoryTitle}>Country</Text>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.categoryText}>{firstFighterClass}</Text>
          <Text style={styles.categoryText}>{firstFighterRecord}</Text>
          <Text style={styles.categoryText}>{firstFighterHeight}</Text>
          <Text style={styles.categoryText}>{firstFighterWeight}</Text>
          <Text style={styles.categoryText}>{firstFighterReach}</Text>
          <Text style={styles.categoryText}>{firstFighterAge}</Text>
          <Text style={styles.categoryText}>{firstFighterCountry}</Text>
        </View>
      </View>
    </View>
  );
}

export const comparisonBioStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "space-around",
      flex: 1,
    },
    wrapper: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    centerColumn: {
      flex: 0.5,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    leftColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    rightColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    categoryTitle: {
      fontFamily: Fonts.OSSEMIBOLD,
      fontSize: 12,
      color: isDark ? Colors.white : Colors.black,
    },
    categoryText: {
      color: isDark ? Colors.white : Colors.black,
      fontFamily: Fonts.OSREGULAR,
      fontSize: 12,
    },
  });
