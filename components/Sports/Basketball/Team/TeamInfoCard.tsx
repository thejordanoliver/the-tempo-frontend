import InfoCard from "@/components/Sports/Basketball/Team/InfoCard";
import { TeamDetails } from "@/hooks/useTeams";
import { Team } from "@/types/football/football";
import { getNBATeam } from "constants/teams";
import { getCBBTeam } from "constants/teamsCBB";
import { getCFBTeam } from "constants/teamsCFB";
import { getMLBTeam } from "constants/teamsMLB";
import { getNFLTeam } from "constants/teamsNFL";
import { getNHLTeam } from "constants/teamsNHL";
import { getWNBATeam } from "constants/teamsWNBA";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeagueType } from "types/types";
import { TeamInfoModalStyles } from "./TeamInfoModal";

type Props = {
  teamId?: string | number;
  teamDetails: TeamDetails | null;
  league: LeagueType;
  isDark: boolean;
};

export default function TeamInfoCard({
  teamId,
  teamDetails,
  league,
  isDark,
}: Props) {
  const insets = useSafeAreaInsets();
  const styles = TeamInfoModalStyles(isDark, insets);

  if (!teamId) return null;

  // --------------------------------------------------
  // UNIVERSAL TEAM LOOKUP
  // --------------------------------------------------

  const team = (() => {
    switch (league) {
      case "NBA":
        return getNBATeam(teamId);

      case "CFB":
        return getCFBTeam(teamId);

      case "CBB":
        return getCBBTeam(teamId);

      case "WCBB":
        return getCBBTeam(teamId, true);

      case "NFL":
        return getNFLTeam(teamId);

      case "MLB":
        return getMLBTeam(teamId);

      case "NHL":
        return getNHLTeam(teamId);

      case "WNBA":
        return getWNBATeam(teamId);

      default:
        return null;
    }
  })();

  if (!team) return null;

  // --------------------------------------------------
  // LEAGUE RENDERING
  // --------------------------------------------------

  switch (league) {
    case "NBA": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Coach"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
        </View>
      );
    }

    case "CFB": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Coach"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
          <InfoCard
            label="Conference"
            value={teamDetails?.conference?.shortName}
            team={t}
          />
        </View>
      );
    }

    case "CBB":
    case "WCBB": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Coach"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
          <InfoCard
            label="Conference"
            value={teamDetails?.conference?.shortName}
            team={t}
          />
        </View>
      );
    }

    case "NFL": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Coach"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />
          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
        </View>
      );
    }

    case "MLB": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Manager"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
        </View>
      );
    }

    case "NHL": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Coach"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />

          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
        </View>
      );
    }
    case "WNBA": {
      const t = team as Team;

      return (
        <View style={styles.infoCardContainer}>
          <InfoCard
            label="Coach"
            value={`${teamDetails?.coach?.firstName ?? ""} ${teamDetails?.coach?.lastName ?? ""}`}
            team={t}
          />
          <InfoCard label="Location" value={teamDetails?.location} team={t} />
          <InfoCard
            label="Established"
            value={teamDetails?.established}
            team={t}
          />
          <InfoCard label="Venue" value={teamDetails?.venue?.name} team={t} />
        </View>
      );
    }

    default:
      return null;
  }
}
