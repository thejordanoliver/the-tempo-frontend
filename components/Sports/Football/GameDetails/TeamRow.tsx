import { Colors } from "constants/styles";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import {
  FootballTeamRowProps,
  teamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";
import Football from "../../../../assets/icons8/Football.png";
import FootballLight from "../../../../assets/icons8/FootballLight.png";

export const TeamRow = ({
  id,
  name,
  rank,
  logo,
  record,
  isDark,
  isHome = false,
  score,
  isWinner,

  gameStatusDescription,
  hasPossession = false,
  timeouts,
  league,
}: FootballTeamRowProps) => {
  const router = useRouter();
  const styles = teamRowStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = gameStatusDescription === "In Progress";
  const isFinal = gameStatusDescription === "Final";
  const showRecordInsteadOfScore = isScheduled || score == null;

  const handleTeamPress = () => {
    if (!id || league === "ufl") return;

    if (league === "nfl") {
      router.push(`/team/nfl/${id}`);
      return;
    }

    if (league === "cfb") {
      router.push(`/team/cfb/${id}`);
    }
  };

  const getScoreStyle = () => {
    if (score == null) {
      return { color: Colors.midTone, opacity: 0.5 };
    }

    if (inProgress) {
      return { color: isDark ? Colors.white : Colors.black };
    }

    if (isFinal) {
      return {
        color: isWinner
          ? isDark
            ? Colors.dark.white
            : Colors.light.black
          : Colors.midTone,
      };
    }

    return { color: Colors.midTone };
  };

  const renderTimeouts = (remaining: number) => {
    const total = 3;

    return (
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: 2,
              borderRadius: 4,
              backgroundColor: isDark ? Colors.white : Colors.black,
              opacity: i < remaining ? 1 : 0.5,
              marginHorizontal: 2,
            }}
          />
        ))}
      </View>
    );
  };

  const renderScore = () => (
    <View style={styles.scoreWrapper}>
      <Text
        style={[
          isScheduled
            ? [styles.preGameRecord]
            : [styles.score, getScoreStyle()],
        ]}
      >
        {showRecordInsteadOfScore ? (record ?? "0-0") : score}
      </Text>

      {hasPossession && (
        <Image
          source={isDark ? FootballLight : Football}
          style={styles.possessionIcon}
        />
      )}
    </View>
  );

  return (
    <View style={styles.row}>
      {isHome && renderScore()}

      <View style={styles.teamInfoContainer}>
        <Pressable onPress={handleTeamPress}>
          <Image source={logo} style={styles.logo} />
        </Pressable>

        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>
            {rank ? <Text style={styles.rank}>{rank} </Text> : null}
            {name}
          </Text>

          {!showRecordInsteadOfScore && !inProgress && (
            <Text style={styles.record}>{record}</Text>
          )}

          {inProgress && timeouts != null && (
            <View style={styles.timeoutsContainer}>
              {renderTimeouts(timeouts)}
            </View>
          )}
        </View>
      </View>

      {!isHome && renderScore()}
    </View>
  );
};
