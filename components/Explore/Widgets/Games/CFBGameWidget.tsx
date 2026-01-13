import Football from "assets/icons8/Football.png";
import FootballLight from "assets/icons8/FootballLight.png";
import CustomActivityIndicator from "components/CustomActivityIndicator";
import { getRivalryHeadline } from "constants/teamsCFB";
import { useCFBGameDetails } from "hooks/CFBHooks/useCFBGameDetails";
import { useCFBGamePossession } from "hooks/CFBHooks/useCFBGamePossession";
import { useCFBTeamRecord } from "hooks/CFBHooks/useCFBTeamRecord";
import { Image, Text, View, useColorScheme } from "react-native";
import { gameWidgetStyles } from "styles/Explore/GameWidgetStyles";
import displayeValue from "utils/widgetUtils";
import { FootballGameWidgetProps } from "./NFLGameWidget";
export default function CFBGameWidget({
  height = 150,
  width = 150,
  loading,
  ...props
}: FootballGameWidgetProps) {
  const isDark = useColorScheme() === "dark";
  const styles = gameWidgetStyles(isDark, height, width);

  const gameDateStr = props.gameDateISO;

  const gameDate = new Date(props.gameDateISO); // parse ISO date
  // Format local date with short month
  const localDate = gameDate.toLocaleString(undefined, {
    month: "short", // Jan, Feb, etc.
    day: "numeric", // day of month
  });
  const localTime = gameDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const homeId = props.homeTeam?.id;
  const awayId = props.awayTeam?.id;
  const homeEspnId = props.homeTeam?.espnID;
  const awayEspnId = props.awayTeam?.espnID;

  const possession = useCFBGamePossession(homeEspnId, awayEspnId, gameDateStr);

  const homeRecord = useCFBTeamRecord(homeEspnId).record.overall ?? "0-0";
  const awayRecord = useCFBTeamRecord(awayEspnId).record.overall ?? "0-0";

  const { broadcast, headline } = useCFBGameDetails(
    String(props.homeTeam?.espnID),
    String(props.awayTeam?.espnID),
    gameDateStr
  );
  const headlineText = headline
    ? headline
    : getRivalryHeadline(homeEspnId, awayEspnId);

  const scoreLoading = possession.loading;
  const period = possession.period;
  const displayClock = possession.displayClock;
  const downAndDistance = possession.downDistanceText;
  const isScheduled = possession.gameStatusDescription === "Scheduled";
  const isFinal = possession.gameStatusDescription === "Final";
  const inProgress =
    possession.gameStatusDescription === "In Progress" ||
    possession.gameStatusDescription === "End of Period";
  const isHalftime = possession.gameStatusDescription === "Halftime";
  const endOfPeriod = possession.gameStatusDescription === "End of Period";
  const possessingTeamId = possession.possessionTeamId;

  const homeHasPossession =
    possessingTeamId != null &&
    String(possessingTeamId) === String(props.homeTeam?.espnID);
  const awayHasPossession =
    possessingTeamId != null &&
    String(possessingTeamId) === String(props.awayTeam?.espnID);

  const homeScore = isFinal
    ? props.homeScore ?? 0
    : possession.score?.home ?? 0;
  const awayScore = isFinal
    ? props.awayScore ?? 0
    : possession.score?.away ?? 0;

  const homeIsWinner = isFinal && homeScore > awayScore;
  const awayIsWinner = isFinal && awayScore > homeScore;

  const awayDisplay = displayeValue(
    false,
    isScheduled,
    isFinal,
    awayIsWinner,
    awayRecord,
    awayScore,
    isDark
  );
  const homeDisplay = displayeValue(
    true,
    isScheduled,
    isFinal,
    homeIsWinner,
    homeRecord,
    homeScore,
    isDark
  ); // fixed: used correct winner

  function formatQuarter(period: string) {
    if (period === "1") return "1st";
    if (period === "2") return "2nd";
    if (period === "3") return "3rd";
    if (period === "4") return "4th";
  }

  if (loading && scoreLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {headlineText && (
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>{headlineText}</Text>
        </View>
      )}
      <View style={styles.wrapper}>
        {/* Away Team */}
        <View style={styles.awaySection}>
          <View style={styles.teamWrapper}>
            <Image
              style={styles.teamLogo}
              source={isDark ? props.awayTeam.logoLight : props.awayTeam.logo}
            />
            <Text style={styles.teamName}>{props.awayTeam.code}</Text>
          </View>
          <View style={styles.scorePossession}>
            {awayDisplay}
            {awayHasPossession && (
              <Image
                style={styles.awayPossession}
                source={isDark ? FootballLight : Football}
              />
            )}
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.gameInfo}>
          {isScheduled && (
            <View style={styles.infoWrapper}>
              <Text style={styles.dateTime}>{localDate}</Text>
              <View style={styles.divider} />
              <Text style={styles.dateTime}>{localTime}</Text>
            </View>
          )}
          {isFinal && (
            <View style={styles.infoWrapper}>
              <Text style={styles.finalText}>
                {possession.gameStatusShortDetail}
              </Text>
            </View>
          )}
          {inProgress && !isHalftime && endOfPeriod && (
            <>
              <Text style={styles.finalText}>
                End of {formatQuarter(period ?? "")}
              </Text>
            </>
          )}
          {inProgress && !isHalftime && !endOfPeriod && (
            <>
              <View style={styles.infoWrapper}>
                <Text style={styles.period}>{formatQuarter(period ?? "")}</Text>
                <View style={styles.divider} />
                <Text style={styles.finalText}>{displayClock}</Text>
              </View>
              <Text style={styles.downAndDistance}>{downAndDistance}</Text>
            </>
          )}
          {inProgress && isHalftime && (
            <>
              <Text style={styles.finalText}>Halftime</Text>
            </>
          )}
          {broadcast && <Text style={styles.broadcast}>{broadcast}</Text>}
        </View>

        {/* Home Team */}
        <View style={styles.homeSection}>
          <View style={styles.homeSection}>
            <View style={styles.scorePossession}>
              {homeDisplay}
              {/* Home Team */}
              {homeHasPossession && (
                <Image
                  style={styles.homePossession}
                  source={isDark ? FootballLight : Football}
                />
              )}
            </View>
          </View>
          <View style={styles.teamWrapper}>
            <Image
              style={styles.teamLogo}
              source={isDark ? props.homeTeam.logoLight : props.homeTeam.logo}
            />
            <Text style={styles.teamName}>{props.homeTeam.code}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
