import { CBStandingsList } from "components/Sports/Baseball/Standings/CBStandingsList";
import type { CollegeConferenceLeague } from "constants/conferences/collegeConferences";
import { useConferenceStandings } from "hooks/BasketballHooks/useConferenceStandings";
import { ConferenceStandingsList } from "./ConferenceStandingsList";
import Rankings from "./Rankings";

type Props = {
  league: CollegeConferenceLeague;
  groupId: number | null;
};

export function CollegeConferenceStandings({ league, groupId }: Props) {
  const {
    conferences,
    conferencesLoading,
    ConferencesRefreshing,
    conferencesError,
    refresh,
  } = useConferenceStandings(league, groupId, { enabled: groupId !== null });

  if (groupId !== null) {
    return (
      <ConferenceStandingsList
        league={league}
        conferences={conferences}
        loading={conferencesLoading}
        refreshing={ConferencesRefreshing}
        error={conferencesError}
        onRefresh={refresh}
      />
    );
  }

  return league === "cb" || league === "sb" ? (
    <CBStandingsList league={league} />
  ) : (
    <Rankings league={league} />
  );
}
