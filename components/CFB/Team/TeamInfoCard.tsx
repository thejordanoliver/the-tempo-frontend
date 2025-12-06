import InfoCard from "components/CFB/Team/InfoCard";
import { coachImages } from "constants/teams";
import { View, useColorScheme } from "react-native";

// team lists
import { teams as nbaTeams } from "constants/teams";
import { teams as cbbTeams } from "constants/teamsCBB";
import { teams as cfbTeams } from "constants/teamsCFB";
import { teams as mlbTeams } from "constants/teamsMLB";
import { teams as nflTeams } from "constants/teamsNFL";
import { CFBTeam } from "types/cfb";
import { MLBTeam } from "types/mlb";
import { NFLTeam } from "types/nfl";
import { CBBTeam, LeagueType, NBATeam } from "types/types";

type Props = {
  teamId?: string | number;
  league: LeagueType;
};

export default function TeamInfoCard({ teamId, league }: Props) {
  const isDark = useColorScheme() === "dark";

  // pick list
  let teamList: NBATeam[] | CFBTeam[] | CBBTeam[] | NFLTeam[] | MLBTeam[] = [];

  switch (league) {
    case "NBA":
      teamList = nbaTeams;
      break;
    case "CFB":
      teamList = cfbTeams;
      break;
    case "CBB":
      teamList = cbbTeams;
      break;
    case "NFL":
      teamList = nflTeams;
      break;
    case "MLB":
      teamList = mlbTeams;
      break;
  }

  const team = teamList.find((t) => String(t.id) === String(teamId));
  if (!team) return null;

  const primaryColor = (team as any).color ?? (isDark ? "#111" : "#eee");

  /* ---------------------------------------------------------
    LEAGUE-SPECIFIC RENDERING
  --------------------------------------------------------- */

  switch (league) {
    case "NBA": {
      const t = team as NBATeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Head Coach"
            value={t.coach}
            image={t.coachImage}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Arena"
            value={t.venueName}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Conference Championships"
            value={t.conferenceChampionships?.Titles}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Location"
            value={t.location}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="First Season"
            value={t.firstSeason}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "CFB": {
      const t = team as CFBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Head Coach"
            value={t.coach}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={t.location}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Stadium"
            value={t.venue}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Conference Championships"
            value={t.conference_championships}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "CBB": {
      const t = team as CBBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Location"
            value={t.location}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Arena"
            value={t.venueName}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
          <InfoCard
            label="Conference Championships"
            value={t.conference_championships}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "NFL": {
      const t = team as NFLTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Head Coach"
            value={t.coach}
            image={t.coachImage ? coachImages[t.coachImage] : undefined}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={`${t.location}`}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Stadium"
            value={t.venue}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }

    case "MLB": {
      const t = team as MLBTeam;
      return (
        <View style={{ width: "100%" }}>
          <InfoCard
            label="Stadium"
            value={t.venue}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />

          <InfoCard
            label="Location"
            value={t.city}
            isDark={isDark}
            team={t}
            backgroundColor={primaryColor}
          />
        </View>
      );
    }
  }
}
