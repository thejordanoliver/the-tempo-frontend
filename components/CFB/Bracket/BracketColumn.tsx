// components/Bracket/BracketColumn.tsx

import CFPLogoLight from "assets/College_Logos/CFPLight.png";
import CFPLogo from "assets/College_Logos/CFPLogo.png";
import { Colors } from "constants/Colors";
import { Fonts } from "constants/fonts";
import { Image, StyleSheet, Text, useColorScheme, View } from "react-native";
import { BracketRound } from "types/cfb";
import { GameCard } from "./GameCard";

export function BracketColumn({ round }: { round: BracketRound }) {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);

  const isChampionship = round.title === "National Championship";
  const isFirstRound = round.title === "First Round";
  const isQuarterfinals = round.title === "Quarterfinals";
  const isSemifinal = round.title === "Semifinals"; // safer than checking game count

  const logo = isDark ? CFPLogoLight : CFPLogo;

  return (
    <View style={styles.column}>
      {/* Title always at top */}
      {isChampionship ? (
        <View style={styles.rowTitle}>
          <Image source={logo} style={styles.cfpLogo} resizeMode="contain" />
          <Text style={styles.title}>{round.title}</Text>
        </View>
      ) : (
        <Text style={styles.title}>{round.title}</Text>
      )}

      <View
        style={[styles.gameContainer, isSemifinal && styles.semifinalContainer]}
      >
        {round.games.map((game, idx) => (
          <View
            key={game.id}
            style={[
              styles.gameWrapper,
              isSemifinal && idx === 0 ? styles.semifinalTop : null,
              isSemifinal && idx === 1 ? styles.semifinalBottom : null,
            ]}
          >
            {/* FIRST ROUND */}
            {isFirstRound && <View style={styles.horizontalConnector} />}

            {/* QUARTERFINALS */}
            {isQuarterfinals && <View style={styles.qfHorizontalLine} />}

            {isQuarterfinals && (idx === 0 || idx === 2) && (
              <>
                <View style={styles.qfVerticalLine} />
                <View style={styles.qfHorizontalConnector} />
              </>
            )}

            {/* SEMIFINALS — only 2 games */}
            {isSemifinal && (
              <>
                {/* Horizontal line for each game */}
                <View style={styles.semiHorizontalLine} />

                {/* Only draw vertical + connector on top game */}
                {idx === 0 && (
                  <>
                    <View style={styles.semiVerticalLine} />
                    <View style={styles.semiHorizontalConnector} />
                  </>
                )}
              </>
            )}

            <GameCard game={game} round={round.title} />
          </View>
        ))}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    column: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      height: "100%"
    },

    rowTitle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    title: {
      fontFamily: Fonts.OSBOLD,
      fontSize: 18,
      color: isDark ? Colors.white : Colors.black,
      textAlign: "center",
      marginTop: 5,
    },

    gameContainer: {
      flex: 1,
      justifyContent: "center",
      width: "100%",
    },

    gameWrapper: {
      width: "100%",
      alignItems: "center",
      marginVertical: 10,
    },

    // SEMIFINAL spacing (2-game column)
    semifinalContainer: {
      justifyContent: "space-between",
    },
    semifinalTop: {
      marginTop: 140,
    },
    semifinalBottom: {
      marginBottom: 140,
    },

    //----------------------------
    // FIRST ROUND
    //----------------------------
    horizontalConnector: {
      position: "absolute",
      right: -110,
      top: "50%",
      width: 220,
      height: 0.4,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -1 }],
      zIndex: -1,
    },

    //----------------------------
    // QUARTERFINALS
    //----------------------------
    qfHorizontalLine: {
      position: "absolute",
      right: 0,
      top: "50%",
      width: 120,
      height: 0.4,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -1 }],
      zIndex: -1,
    },

    qfVerticalLine: {
      position: "absolute",
      right: 0,
      top: 122,
      width: 0.5,
      height: 146,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -60 }],
      zIndex: -1,
    },

    qfHorizontalConnector: {
      position: "absolute",
      right: -120,
      top: "110%",
      width: 120,
      height: 0.5,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -1 }],
      zIndex: -1,
    },

    //----------------------------
    // SEMIFINALS (2 games)
    //----------------------------
    semiHorizontalLine: {
      position: "absolute",
      right: 0,
      top: "50%",
      width: 110,
      height: 0.2,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -1 }],
      zIndex: -1,
    },

    semiVerticalLine: {
      position: "absolute",
      right: 0,
      top: 122,
      width: 0.5,
      height: 278,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -60 }],
      zIndex: -1,
    },

    semiHorizontalConnector: {
      position: "absolute",
      right: -110,
      top: "160%",
      width: 110,
      height: 0.2,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -1 }],
      zIndex: -1,
    },
    cfpLogo: {
      width: 28,
      height: 28,
      marginRight: 6,
    },
  });

export default BracketColumn;
