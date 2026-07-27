import HeadingTwo from "@/components/Headings/HeadingTwo";
import { Colors } from "@/constants/styles";
import { StyleSheet, View } from "react-native";
import { ComparisonBio } from "./ComparisonBio";
import { FighterBio } from "./FighterBio";

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
}: Props) {
  const styles = matchupComparisonStyles(isDark);

  return (
    <View style={styles.container}>
      <HeadingTwo isDark={isDark}>Matchup Comparison</HeadingTwo>
      <View style={styles.wrapper}>
        <View style={styles.fightersContainer}>
          <FighterBio
            id={secondFighterId}
            stanceImage={secondFighterStance}
            name={secondFighterName}
            record={secondFighterRecord}
            flag={secondFighterFlag}
            isWinner={secondFighterIsWinner}
            isChampion={secondFighterIsChampion}
            isDark={isDark}
          />

          <ComparisonBio
            firstFighterAge={firstFighterAge}
            secondFighterAge={secondFighterAge}
            firstFighterWeight={firstFighterWeight}
            secondFighterWeight={secondFighterWeight}
            firstFighterHeight={firstFighterHeight}
            secondFighterHeight={secondFighterHeight}
            firstFighterRecord={firstFighterRecord}
            secondFighterRecord={secondFighterRecord}
            firstFighterReach={firstFighterReach}
            secondFighterReach={secondFighterReach}
            firstFighterCountry={firstFighterCountry}
            secondFighterCountry={secondFighterCountry}
            firstFighterClass={firstFighterClass}
            secondFighterClass={secondFighterClass}
            secondFighterIsWinner={secondFighterIsWinner}
            firstFighterIsWinner={firstFighterIsWinner}
            firstFighterIsChampion={firstFighterIsChampion}
            secondFighterIsChampion={secondFighterIsChampion}
            isDark={isDark}
          />

          <FighterBio
            id={firstFighterId}
            stanceImage={firstFighterStance}
            name={firstFighterName}
            record={firstFighterRecord}
            flag={firstFighterFlag}
            isWinner={firstFighterIsWinner}
            isChampion={firstFighterIsChampion}
            isDark={isDark}
          />
        </View>
      </View>
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
      backgroundColor: isDark
        ? Colors.dark.transparentBackground
        : Colors.light.transparentBackground,
    },
    fightersContainer: {
      width: "100%",
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "center",
      gap: 8,
    },
  });
