import { cbConferences } from "./cbConferences";
import { mcbbConferences } from "./mcbbConferences";
import { mchConferences } from "./mchConferences";
import { sbConferences } from "./sbConferences";
import { wchConferences } from "./wchConferences";

export const COLLEGE_CONFERENCES = {
  cb: cbConferences,
  sb: sbConferences,
  mch: mchConferences,
  wch: wchConferences,
};

export type CollegeConferenceLeague = keyof typeof COLLEGE_CONFERENCES;

const BRANDING_NAMES: Readonly<Record<string, string>> = {
  "Atlantic Sun": "ASUN",
  "Big 10": "Big Ten",
  "C-USA": "CUSA",
};

export function isCollegeConferenceLeague(
  league: string,
): league is CollegeConferenceLeague {
  return Object.hasOwn(COLLEGE_CONFERENCES, league);
}

export function resolveCollegeConference(
  league: CollegeConferenceLeague,
  selection: number | string,
) {
  const key = String(selection).trim().toLowerCase();
  const conference = COLLEGE_CONFERENCES[league].find(
    (entry) =>
      String(entry.groupId) === key ||
      entry.shortName.toLowerCase() === key ||
      entry.name.toLowerCase() === key,
  );

  if (!conference) return undefined;

  const brandingName =
    BRANDING_NAMES[conference.shortName] ?? conference.shortName;
  const branding = mcbbConferences.find(
    (entry) => entry.shortName === brandingName,
  );
  return {
    ...conference,
    logo: branding?.logo ?? null,
    logoLight: branding?.logoLight ?? null,
    color: branding?.color ?? null,
  };
}
