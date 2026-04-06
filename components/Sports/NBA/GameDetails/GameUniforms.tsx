// components/GameDetails/GameUniforms.tsx
import HeadingTwo from "components/Headings/HeadingTwo";
import { Colors, Fonts } from "constants/styles";
import { teams } from "constants/teams";
import { Image } from "expo-image";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
type GameUniforms = {
  homeTeamId: number;
  awayTeamId: number;
  lighter?: boolean; // <-- new prop
};

export default function GameUniforms({
  homeTeamId,
  awayTeamId,
  lighter = false,
}: GameUniforms) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const homeTeam = teams.find((t) => t.id === homeTeamId);
  const awayTeam = teams.find((t) => t.id === awayTeamId);

  if (!homeTeam || !awayTeam) {
    return (
      <View style={styles.center}>
        <Text
          style={[
            styles.errorText,
            {
              color: lighter
                ? Colors.white
                : isDark
                  ? Colors.white
                  : Colors.black,
            },
          ]}
        >
          Team data not found
        </Text>
      </View>
    );
  }

  const textColor = lighter
    ? Colors.white
    : isDark
      ? Colors.white
      : Colors.black;

  return (
    <>
      <View style={styles.container}>
        <HeadingTwo isDark={isDark}>Uniform Matchup</HeadingTwo>
        <View style={styles.wrapper}>
          {/* Away Team Away uniforms */}
          <View style={styles.uniformsContainer}>
            <Image
              source={awayTeam.uniforms?.away}
              style={styles.uniformsImage}
            />
            <Text style={[styles.teamName, { color: textColor }]}>
              {awayTeam.name} Away
            </Text>
          </View>

          {/* VS Separator */}
          <Text style={[styles.vs, { color: textColor }]}>vs</Text>

          {/* Home Team Home uniforms */}
          <View style={styles.uniformsContainer}>
            <Image
              source={homeTeam.uniforms?.home}
              style={styles.uniformsImage}
            />
            <Text style={[styles.teamName, { color: textColor }]}>
              {homeTeam.name} Home
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  wrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.midTone,
    borderWidth: 1,
    borderRadius: 8,
  },

  uniformsContainer: {
    alignItems: "center",
    padding: 12,
  },
  uniformsImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  teamName: {
    fontFamily: Fonts.OSMEDIUM,
    fontSize: 14,
    marginTop: 6,
  },
  divider: {
    height: "100%",
    width: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontFamily: Fonts.OSREGULAR,
    fontSize: 14,
  },
  vs: {
    fontFamily: Fonts.OSBOLD,
    fontSize: 24,
    marginHorizontal: 8,
  },
});
