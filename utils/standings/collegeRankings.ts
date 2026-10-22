import type {
  CollegePollType,
  CollegeRankingsLeague,
  CollegeRankPoll,
  CollegeTeamRank,
} from "types/collegeRankings";

type PollType = CollegePollType;

type RawPoll = {
  type?: unknown;
  shortName?: unknown;
  name?: unknown;
  displayName?: unknown;
  headline?: unknown;
  description?: unknown;
  id?: unknown;
  ranks?: unknown;
  outsideTop25?: unknown;
  droppedOut?: unknown;
};

const POLL_NAMES: Record<PollType, string> = {
  ap: "AP Poll",
  coaches: "Coaches Poll",
  cfp: "CFP Rankings",
  fcs: "FCS Coaches Poll",
};

const POLL_TYPES: PollType[] = ["ap", "coaches", "cfp", "fcs"];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toStringValue = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

const toTeamRanks = (value: unknown): CollegeTeamRank[] => {
  return Array.isArray(value) ? (value as CollegeTeamRank[]) : [];
};

const getPollSearchText = (poll: RawPoll): string => {
  return [
    poll.type,
    poll.shortName,
    poll.name,
    poll.displayName,
    poll.headline,
    poll.description,
    poll.id,
  ]
    .map(toStringValue)
    .filter(Boolean)
    .join(" ")
    .trim()
    .toLowerCase();
};

// Identify FCS by its teams because the returned poll type can be misleading.
const containsFCSTeams = (poll: RawPoll): boolean => {
  const ranks = toTeamRanks(poll.ranks);

  return ranks.some((rank) => {
    const groupShortName = rank.team?.groups?.shortName;
    const parentShortName = rank.team?.groups?.parent?.shortName;

    return (
      groupShortName?.trim().toUpperCase() === "FCS" ||
      parentShortName?.trim().toUpperCase() === "FCS"
    );
  });
};

const isFCSPoll = (poll: RawPoll): boolean => {
  const searchText = getPollSearchText(poll);

  return searchText.includes("fcs") || containsFCSTeams(poll);
};

const matchesPollType = (poll: RawPoll, type: PollType): boolean => {
  const searchText = getPollSearchText(poll);
  const rawType = toStringValue(poll.type).trim().toLowerCase();
  const fcs = isFCSPoll(poll);

  switch (type) {
    case "fcs":
      return fcs && (searchText.includes("coach") || rawType === "ap");

    case "ap":
      return (
        !fcs &&
        (rawType === "ap" ||
          searchText.includes("ap poll") ||
          searchText.includes("associated press") ||
          searchText.includes("ap top 25"))
      );

    case "coaches":
      return (
        !fcs &&
        (rawType === "coaches" ||
          rawType === "coach" ||
          searchText.includes("coaches poll") ||
          searchText.includes("coaches' poll") ||
          searchText.includes("afca coaches") ||
          searchText.includes("usa today coaches"))
      );

    case "cfp":
      return (
        !fcs &&
        (rawType === "cfp" ||
          rawType === "playoff" ||
          searchText.includes("cfp") ||
          searchText.includes("college football playoff") ||
          searchText.includes("playoff rankings"))
      );

    default:
      return false;
  }
};

const getPollCandidates = (rawValue: unknown): RawPoll[] => {
  if (Array.isArray(rawValue)) {
    return rawValue.filter(isRecord) as RawPoll[];
  }

  if (!isRecord(rawValue)) {
    return [];
  }

  if (Array.isArray(rawValue.rankings)) {
    return rawValue.rankings.filter(isRecord) as RawPoll[];
  }

  return [];
};

const normalizePoll = (
  poll: RawPoll | undefined,
  type: PollType,
): CollegeRankPoll => {
  if (!poll) {
    return {
      type,
      shortName: POLL_NAMES[type],
      ranks: [],
      outsideTop25: [],
      droppedOut: [],
    };
  }

  return {
    type,
    shortName:
      toStringValue(poll.shortName) ||
      toStringValue(poll.name) ||
      toStringValue(poll.displayName) ||
      POLL_NAMES[type],
    ranks: toTeamRanks(poll.ranks),
    outsideTop25: toTeamRanks(poll.outsideTop25),
    droppedOut: toTeamRanks(poll.droppedOut),
  };
};

const normalizeRankings = (rawValue: unknown): CollegeRankPoll[] => {
  const candidates = getPollCandidates(rawValue);

  return POLL_TYPES.map((type) => {
    const matchingPoll = candidates.find((poll) => matchesPollType(poll, type));

    return normalizePoll(matchingPoll, type);
  });
};

// These are backend poll responses; football keeps its four selector slots.
export function getCollegeRankingPolls(
  response: unknown,
  league: CollegeRankingsLeague,
): CollegeRankPoll[] {
  if (league === "cfb") return normalizeRankings(response);
  return isRecord(response) && Array.isArray(response.rankings)
    ? response.rankings as CollegeRankPoll[]
    : [];
}
