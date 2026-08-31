import { useCallback, useEffect, useState } from "react";

import { apiClient } from "utils/apiClient";

/* ----------------------------- Types ----------------------------- */

export type CFBTeamRank = {
  current: number;
  previous: number;
  points: number;
  firstPlaceVotes: number;
  trend: string;
  recordSummary: string;
  team: {
    id: string;
    nickname?: string;
    name?: string;
    code?: string;
    abbreviation?: string;
    shortDisplayName?: string;
    location?: string;
    logos?: { href: string }[];
    groups?: {
      id: string;
      shortName: string;
      parent?: {
        id: string;
        shortName: string;
        isConference: boolean;
      };
      isConference: boolean;
    };
  } | null;
  date: string;
  lastUpdated: string;
};

export type CFBRankPoll = {
  type: "ap" | "coaches" | "cfp" | "fcs";
  shortName: string;
  ranks: CFBTeamRank[];
  droppedOut: CFBTeamRank[];
};

type PollType = CFBRankPoll["type"];

type RawRankingsResponse = {
  ap?: unknown;
  associatedPress?: unknown;
  apTop25?: unknown;
  coaches?: unknown;
  coachesPoll?: unknown;
  cfp?: unknown;
  playoff?: unknown;
  cfpRankings?: unknown;
  fcs?: unknown;
  fcsCoaches?: unknown;
  fcsCoachesPoll?: unknown;
  fcsPoll?: unknown;
  all?: unknown;
};

/* ----------------------------- Config ----------------------------- */

const RANKINGS_ENDPOINT = "/api/standings/cfb/rankings";

const POLL_NAMES: Record<PollType, string> = {
  ap: "AP Poll",
  coaches: "Coaches Poll",
  cfp: "CFP Rankings",
  fcs: "FCS Coaches Poll",
};

/* ----------------------------- Helpers ----------------------------- */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toStringValue = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

const getPollSearchText = (poll: Record<string, unknown>): string => {
  return [
    poll.type,
    poll.name,
    poll.shortName,
    poll.displayName,
    poll.headline,
    poll.description,
    poll.id,
  ]
    .map(toStringValue)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const containsFCSTeams = (poll: Record<string, unknown>): boolean => {
  if (!Array.isArray(poll.ranks)) {
    return false;
  }

  return poll.ranks.some((rank) => {
    if (!isRecord(rank) || !isRecord(rank.team)) {
      return false;
    }

    const groups = rank.team.groups;

    if (!isRecord(groups)) {
      return false;
    }

    const parent = groups.parent;

    if (!isRecord(parent)) {
      return false;
    }

    return toStringValue(parent.shortName).trim().toUpperCase() === "FCS";
  });
};

const matchesPollType = (
  poll: Record<string, unknown>,
  type: PollType,
): boolean => {
  const searchText = getPollSearchText(poll);

  const isFCS = searchText.includes("fcs") || containsFCSTeams(poll);

  switch (type) {
    case "fcs":
      return isFCS;

    case "ap":
      return (
        !isFCS &&
        (searchText.includes("associated press") || /\bap\b/.test(searchText))
      );

    case "coaches":
      return !isFCS && searchText.includes("coaches");

    case "cfp":
      return (
        searchText.includes("cfp") ||
        searchText.includes("college football playoff") ||
        searchText.includes("playoff rankings")
      );

    default:
      return false;
  }
};

const hasPollData = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  if (Array.isArray(value.ranks)) {
    return true;
  }

  if (!Array.isArray(value.polls)) {
    return false;
  }

  return value.polls.some(
    (poll) => isRecord(poll) && Array.isArray(poll.ranks),
  );
};

const getAllPollCandidates = (
  raw: RawRankingsResponse,
): Record<string, unknown>[] => {
  if (Array.isArray(raw.all)) {
    return raw.all.filter(isRecord);
  }

  if (isRecord(raw.all)) {
    return Object.values(raw.all).filter(isRecord);
  }

  return [];
};

const getDirectPollCandidates = (
  raw: RawRankingsResponse,
  type: PollType,
): unknown[] => {
  switch (type) {
    case "ap":
      return [raw.ap, raw.associatedPress, raw.apTop25];

    case "coaches":
      return [raw.coaches, raw.coachesPoll];

    case "cfp":
      return [raw.cfp, raw.playoff, raw.cfpRankings];

    case "fcs":
      return [raw.fcs, raw.fcsCoaches, raw.fcsCoachesPoll, raw.fcsPoll];

    default:
      return [];
  }
};

const findPollData = (raw: RawRankingsResponse, type: PollType): unknown => {
  const directMatch = getDirectPollCandidates(raw, type).find(hasPollData);

  if (directMatch) {
    return directMatch;
  }

  return getAllPollCandidates(raw).find(
    (poll) => hasPollData(poll) && matchesPollType(poll, type),
  );
};

const toTeamRanks = (value: unknown): CFBTeamRank[] => {
  return Array.isArray(value) ? (value as CFBTeamRank[]) : [];
};

/* ----------------------------- Hook ----------------------------- */

export const useCFBRankings = () => {
  const [rankings, setRankings] = useState<CFBRankPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Normalize ---------------- */

  const normalizePoll = useCallback(
    (rawValue: unknown, type: PollType): CFBRankPoll => {
      if (!isRecord(rawValue)) {
        return {
          type,
          shortName: POLL_NAMES[type],
          ranks: [],
          droppedOut: [],
        };
      }

      let pollData = rawValue;

      if (Array.isArray(rawValue.polls)) {
        const matchingNestedPoll = rawValue.polls.find(
          (poll) => isRecord(poll) && matchesPollType(poll, type),
        );

        const firstNestedPoll = rawValue.polls.find(isRecord);

        if (isRecord(matchingNestedPoll)) {
          pollData = matchingNestedPoll;
        } else if (isRecord(firstNestedPoll)) {
          pollData = firstNestedPoll;
        }
      }

      const shortName =
        toStringValue(pollData.shortName) ||
        toStringValue(pollData.name) ||
        toStringValue(rawValue.shortName) ||
        toStringValue(rawValue.name) ||
        POLL_NAMES[type];

      return {
        // The API currently labels the FCS poll as "ap".
        // Always use the frontend's normalized poll type.
        type,
        shortName,
        ranks: toTeamRanks(pollData.ranks),
        droppedOut: toTeamRanks(pollData.droppedOut),
      };
    },
    [],
  );

  const normalizeRankings = useCallback(
    (rawValue: unknown): CFBRankPoll[] => {
      const raw: RawRankingsResponse = isRecord(rawValue) ? rawValue : {};

      return (["ap", "coaches", "cfp", "fcs"] as const).map((type) =>
        normalizePoll(findPollData(raw, type), type),
      );
    },
    [normalizePoll],
  );

  /* ---------------- Request ---------------- */

  const requestRankings = useCallback(async () => {
    const response = await apiClient.get(RANKINGS_ENDPOINT);

    const raw = response.data?.rankings ?? response.data ?? {};

    return normalizeRankings(raw);
  }, [normalizeRankings]);

  /* ---------------- Fetch Latest ---------------- */

  const fetchLatest = useCallback(async () => {
    setError(null);

    try {
      const polls = await requestRankings();
      setRankings(polls);
    } catch (err: unknown) {
      console.error("❌ Fetch CFB rankings failed:", err);

      const message =
        err instanceof Error ? err.message : "Failed to fetch rankings";

      setError(message);
    }
  }, [requestRankings]);

  /* ---------------- Initial Fetch ---------------- */

  useEffect(() => {
    let isMounted = true;

    const loadRankings = async () => {
      setLoading(true);
      setError(null);

      try {
        const polls = await requestRankings();

        if (isMounted) {
          setRankings(polls);
        }
      } catch (err: unknown) {
        console.error("❌ Initial CFB rankings fetch failed:", err);

        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch rankings";

          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadRankings();

    return () => {
      isMounted = false;
    };
  }, [requestRankings]);

  return {
    rankings,
    loading,
    error,
    refresh: fetchLatest,
  };
};
