import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { Image, Text, View } from "react-native";
import { gameWidgetStyles } from "styles/ExploreStyles/GameWidgetStyles";
import { MLBGame } from "types/baseball";
import { getHolidayLabel } from "utils/dateUtils";

type BaseballGameWidgetProps = {
  game: MLBGame;
  height?: number;
  width?: number;
  isDark: boolean;
  loading?: boolean;
};

const isScheduledStatus = (shortStatus?: string, longStatus?: string) =>
  ["NS", "TBD", "POST"].includes(shortStatus ?? "") ||
  ["Not Started", "Scheduled", "Postponed"].includes(longStatus ?? "");

const isFinalStatus = (shortStatus?: string, longStatus?: string) =>
  ["FT", "AOT", "FINAL"].includes(shortStatus ?? "") ||
  String(longStatus ?? "").toLowerCase().includes("final");

export default function BaseballGameWidget({
  game,
  height = 150,
  width = 150,
  loading = false,
  isDark,
}: BaseballGameWidgetProps) {
  const styles = gameWidgetStyles(isDark, height, width);
  const global = globalStyles(isDark);

  if (loading || !game) {
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );
  }

  const homeId = game.teams.home?.id;
  const awayId = game.teams.away?.id;
  const home = getMLBTeam(homeId) ?? game.teams.home;
  const away = getMLBTeam(awayId) ?? game.teams.away;
  const homeLogo = getMLBTeamLogo(homeId, isDark);
  const awayLogo = getMLBTeamLogo(awayId, isDark);
  const gameDate = new Date(game.date);
  const holidayLabel = getHolidayLabel(gameDate);
  const statusShort = game.status?.short;
  const statusLong = game.status?.long;
  const isScheduled = isScheduledStatus(statusShort, statusLong);
  const isFinal = isFinalStatus(statusShort, statusLong);
  const homeScore = game.scores?.home?.total ?? 0;
  const awayScore = game.scores?.away?.total ?? 0;

  const formattedDate = gameDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = gameDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>{holidayLabel}</Text>
      </View>

      <View style={styles.wrapper}>
        <View style={styles.awaySection}>
          <View style={styles.teamWrapper}>
            <Image style={styles.teamLogo} source={awayLogo} />
            <Text style={styles.teamName}>{away?.code}</Text>
          </View>
          <Text style={styles.awayScore}>{isScheduled ? "" : awayScore}</Text>
        </View>

        <View style={styles.gameInfo}>
          {isScheduled ? (
            <View style={styles.infoWrapper}>
              <Text style={styles.dateTime}>{formattedDate}</Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime}>{formattedTime}</Text>
            </View>
          ) : isFinal ? (
            <Text style={styles.finalText}>{statusLong || "Final"}</Text>
          ) : (
            <Text style={styles.period}>{statusLong || statusShort}</Text>
          )}
        </View>

        <View style={styles.homeSection}>
          <Text style={styles.homeScore}>{isScheduled ? "" : homeScore}</Text>
          <View style={styles.teamWrapper}>
            <Image style={styles.teamLogo} source={homeLogo} />
            <Text style={styles.teamName}>{home?.code}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
