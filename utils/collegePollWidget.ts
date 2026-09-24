import type {
  ExploreCollegePollLeague,
  ExploreCollegePollType,
  ExploreWidgetSize,
} from "types/widgets";
import type { CollegePollOption } from "types/collegePollWidget";

const CFB_POLL_OPTIONS: readonly CollegePollOption[] = [
  { label: "AP Poll", shortLabel: "AP", value: "ap" },
  { label: "Coaches Poll", shortLabel: "Coaches", value: "coaches" },
  { label: "CFP Rankings", shortLabel: "CFP", value: "cfp" },
  { label: "FCS Coaches Poll", shortLabel: "FCS", value: "fcs" },
];

const CBB_POLL_OPTIONS: readonly CollegePollOption[] = [
  { label: "AP Poll", shortLabel: "AP", value: "ap" },
  { label: "Coaches Poll", shortLabel: "Coaches", value: "coaches" },
];

export function getCollegePollOptions(
  league: ExploreCollegePollLeague,
): readonly CollegePollOption[] {
  return league === "cfb" ? CFB_POLL_OPTIONS : CBB_POLL_OPTIONS;
}

export function isCollegePollTypeAvailable(
  league: ExploreCollegePollLeague,
  pollType: ExploreCollegePollType,
) {
  return getCollegePollOptions(league).some(
    (option) => option.value === pollType,
  );
}

export function normalizeCollegePollType(
  league: ExploreCollegePollLeague,
  pollType: ExploreCollegePollType | undefined,
): ExploreCollegePollType {
  return pollType && isCollegePollTypeAvailable(league, pollType)
    ? pollType
    : "ap";
}

export function getCollegePollLabel(
  league: ExploreCollegePollLeague,
  pollType: ExploreCollegePollType,
) {
  return (
    getCollegePollOptions(league).find((option) => option.value === pollType)
      ?.label ?? "AP Poll"
  );
}

export function getCollegePollPageSize(size: ExploreWidgetSize) {
  switch (size) {
    case "small":
      return 1;
    case "medium":
      return 5;
    case "large":
      return 5;
  }
}
