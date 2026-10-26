import { Colors } from "constants/styles";
import { useScopedRouter } from "hooks/useScopedRouter";
import { Image, Pressable, Text, View } from "react-native";
import {
  SoccerProps,
  TeamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

export const TeamRow = ({
  id,
  rank,
  logo,
  record,
  name,
  isActive,
  isDark,
  isHome = false,
  score,
  isWinner,
  isTie,
  isAllStar,
  isNational,
  state,
  gameStatusDescription,
  league,
}: SoccerProps) => {
  const router = useScopedRouter();
  const styles = TeamRowStyles(isDark);

  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = state === "in";
  const isFinal = state === "post";
  const showRecordInsteadOfScore = isScheduled || score == null;

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
          : isTie
            ? isDark
              ? Colors.dark.white
              : Colors.light.black
            : Colors.midTone,
      };
    }

    return { color: Colors.midTone };
  };

  const handleTeamPress = () => {
    if (!isActive) return;
    if (!id || isNational || isAllStar) return;

    router.push({
      pathname: "/team/soccer/[teamId]",
      params: {
        teamId: id,
        league,
      },
    });
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
          <Text
            style={styles.teamName}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.5}
          >
            {rank ? <Text style={styles.rank}>{rank} </Text> : null}
            {name}
          </Text>

          {!showRecordInsteadOfScore && !inProgress && (
            <Text style={styles.record}>{record}</Text>
          )}
        </View>
      </View>

      {!isHome && renderScore()}
    </View>
  );
};
