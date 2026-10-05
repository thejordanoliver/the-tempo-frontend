import { Colors } from "constants/styles";
import { useScopedRouter } from "hooks/useScopedRouter";
import { Image, Pressable, Text, View } from "react-native";
import {
  BasketballProps,
  TeamRowStyles,
} from "styles/GameDetailStyles/TeamRow.styles";

/* -----------------------------------------------------
 * Helpers
 * --------------------------------------------------- */

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
  timeouts,
  state,
  bonusState,
  league,
}: BasketballProps) => {
  const router = useScopedRouter();
  const styles = TeamRowStyles(isDark);

  /* -----------------------------------------------------
   * Game State
   * --------------------------------------------------- */
  const isScheduled = gameStatusDescription === "Scheduled";
  const inProgress = state === "in";
  const isFinal = gameStatusDescription === "Final";
  const showRecordInsteadOfScore = isScheduled || score == null;

  /* -----------------------------------------------------
   * Routing
   * --------------------------------------------------- */
  const handleTeamPress = () => {
    if (id === null || id === undefined) return;

    const normalizedLeague = String(league ?? "").toLowerCase();

    if (normalizedLeague === "nba") {
      router.push(`/team/${id}`);
    }
    if (normalizedLeague === "wnba") {
      router.push(`/team/wnba/${id}`);
    }
    if (normalizedLeague === "mcbb") {
      router.push(`/team/mcbb/${id}`);
    }
    if (normalizedLeague === "wcbb") {
      router.push(`/team/wcbb/${id}`);
    }
  };

  /* -----------------------------------------------------
   * Styles
   * --------------------------------------------------- */
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

  /* -----------------------------------------------------
   * Render Helpers
   * --------------------------------------------------- */
  const renderTimeouts = (remaining: number) => {
    const total = 7;

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

  const renderBonus = () =>
    bonusState === "DOUBLE" && !isFinal ? (
      <Text style={styles.bonus}>BONUS</Text>
    ) : null;

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
      {renderBonus()}
    </View>
  );
  /* -----------------------------------------------------
   * Render
   * --------------------------------------------------- */
  return (
    <View style={styles.row}>
      {isHome && renderScore()}

      {/* Team Info */}
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
            {rank && <Text style={styles.rank}>{rank} </Text>}
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
