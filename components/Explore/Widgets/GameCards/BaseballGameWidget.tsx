import CustomActivityIndicator from "components/CustomActivityIndicator";
import { globalStyles } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { Image, Text, View } from "react-native";
import {
  gameWidgetStyles,
  isSmallGameWidgetLayout,
} from "styles/ExploreStyles/GameWidgetStyles";
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
  const isSmallLayout = isSmallGameWidgetLayout(height, width);
  const showHeadline = !isSmallLayout || height >= 170;
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

  const awayTeamContent = (
    <View style={styles.teamWrapper}>
      <Image style={styles.teamLogo} source={awayLogo} />
      <Text style={styles.teamName} numberOfLines={1}>
        {away?.code}
      </Text>
    </View>
  );

  const homeTeamContent = (
    <View style={styles.teamWrapper}>
      <Image style={styles.teamLogo} source={homeLogo} />
      <Text style={styles.teamName} numberOfLines={1}>
        {home?.code}
      </Text>
    </View>
  );

  const awayScoreContent = (
    <Text
      style={styles.awayScore}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.85}
    >
      {isScheduled ? "" : awayScore}
    </Text>
  );

  const homeScoreContent = (
    <Text
      style={styles.homeScore}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.85}
    >
      {isScheduled ? "" : homeScore}
    </Text>
  );

  return (
    <View style={styles.container}>
      {showHeadline && (
        <View style={styles.headlineContainer}>
          <Text style={styles.headline} numberOfLines={1}>
            {holidayLabel}
          </Text>
        </View>
      )}

      <View style={styles.wrapper}>
        <View style={styles.awaySection}>
          {awayTeamContent}
          {awayScoreContent}
        </View>

        <View style={styles.gameInfo}>
          {isScheduled ? (
            <View style={styles.infoWrapper}>
              <Text style={styles.dateTime} numberOfLines={1}>
                {formattedDate}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime} numberOfLines={1}>
                {formattedTime}
              </Text>
            </View>
          ) : isFinal ? (
            <Text style={styles.finalText} numberOfLines={1}>
              {statusLong || "Final"}
            </Text>
          ) : (
            <Text style={styles.period} numberOfLines={1}>
              {statusLong || statusShort}
            </Text>
          )}
        </View>

        <View style={styles.homeSection}>
          {isSmallLayout ? (
            <>
              {homeTeamContent}
              {homeScoreContent}
            </>
          ) : (
            <>
              {homeScoreContent}
              {homeTeamContent}
            </>
          )}
        </View>
      </View>
    </View>
  );
}
