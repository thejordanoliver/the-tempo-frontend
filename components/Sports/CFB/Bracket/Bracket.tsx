// components/Bracket/Bracket.tsx
import cfpTrophy from "assets/College_Logos/cfptrophy.webp";
import ChampionTape from "assets/Placeholders/ChampionTape.png";
import { Colors } from "constants/Styles";
import { getTeamByESPNId } from "constants/teamsCFB";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { BracketData } from "types/cfb";
import { BracketColumn } from "./BracketColumn";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function getChampion(data: BracketData) {
  const game = data.championship.games?.[0];
  if (!game) return null;

  // Must be final to have a real winner
  if (game.status !== "final") return null;

  const top = game.top;
  const bottom = game.bottom;

  if (!top || !bottom) return null;

  const topScore = game.topScore ?? 0;
  const bottomScore = game.bottomScore ?? 0;

  return topScore > bottomScore ? top : bottom;
}

export function Bracket({ data }: { data: BracketData }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = bracketStyles(isDark);
  const winner = getChampion(data); // ⭐ Get winner
  const winnerTeam = getTeamByESPNId(winner?.espnID ?? 0);
  const winnerLogo = isDark
    ? winnerTeam?.logoLight || winnerTeam?.logo
    : winnerTeam?.logo;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={SCREEN_WIDTH} // 👈 Snap width
      snapToAlignment="center"
      decelerationRate="fast"
      pagingEnabled={false} // (optional) Remove if you want hard paging
    >
      <View style={[styles.outer, { height: SCREEN_HEIGHT * 0.75 }]}>
        <View style={styles.row}>
          <View style={styles.columnContainer}>
            <BracketColumn round={data.first} />
          </View>

          <View style={styles.columnContainer}>
            <BracketColumn round={data.quarterfinal} />
          </View>

          <View style={styles.columnContainer}>
            <BracketColumn round={data.semifinal} />
          </View>

          <View style={styles.columnContainer}>
            <BracketColumn round={data.championship} />
            {winner?.id && (
              <>
                <Image style={styles.championTape} source={ChampionTape} />
                <Image style={styles.winnerLogo} source={winnerLogo} />
                <Image style={styles.trophy} source={cfpTrophy} />
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const bracketStyles = (isDark: boolean) =>
  StyleSheet.create({
    outer: {
      width: "100%",
      justifyContent: "center",
      marginTop: 10,
    },

    row: {
      flexDirection: "row",
      flex: 1,
    },

    columnContainer: {
      width: SCREEN_WIDTH, // 👈 Fixed width for snapping
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    trophy: {
      position: "absolute",
      height: 250,
      top: "10%",
      left: "18%",
      resizeMode: "contain",
    },
    winnerLogo: {
      position: "absolute",
      height: 250,
      top: "10%",
      resizeMode: "contain",
      transform: [{ rotate: "-12deg" }],
      zIndex: -10,
    },
    championTape: {
      position: "absolute",
      height: 45,
      top: "32%",
      resizeMode: "contain",
      transform: [{ rotate: "-8deg" }],
      zIndex: 0,
    },
    leftVerticalLine: {
      position: "absolute",
      left: 10,
      top: 10,
      width: 1,
      height: 146,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -60 }],
      zIndex: -10,
    },
    rightVerticalLine: {
      position: "absolute",
      right: 10,
      top: 10,
      width: 1,
      height: 146,
      backgroundColor: isDark ? Colors.white : Colors.black,
      transform: [{ translateY: -60 }],
      zIndex: -10,
    },
  });
