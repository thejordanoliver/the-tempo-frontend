import HeadingTwo from "@/components/Headings/HeadingTwo";
import { Colors, Fonts } from "@/constants/styles";
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
            flag={secondFighterClass}
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
            flag={firstFighterClass}
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
    container: {},
    center: { alignItems: "center", justifyContent: "center", padding: 16 },
    wrapper: {
      padding: 12,
      justifyContent: "space-around",
      borderColor: Colors.midTone,
      borderWidth: 1,
      borderRadius: 8,
    },
    fightersContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      flex: 1,
    },
    headlineContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    headlineText: {
      position: "absolute",
      width: "100%",
      top: 0,
      fontSize: 10,
      color: isDark ? Colors.lightGray : Colors.darkGray,
      fontFamily: Fonts.OSREGULAR,
      textAlign: "center",
    },
  });
