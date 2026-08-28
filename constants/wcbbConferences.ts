import MWCLogo from "assets/College_Logos/Conference_Logos/MWC.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import A10Logo from "../assets/College_Logos/Conference_Logos/A10.png";
import ACCLogo from "../assets/College_Logos/Conference_Logos/ACC.png";
import ACCLogoLight from "../assets/College_Logos/Conference_Logos/ACCLight.png";
import AMEastLogo from "../assets/College_Logos/Conference_Logos/AmericaEast.png";
import AACLogo from "../assets/College_Logos/Conference_Logos/American.png";
import BIG12Logo from "../assets/College_Logos/Conference_Logos/Big12.png";
import BIG12Logolight from "../assets/College_Logos/Conference_Logos/BIG12Light.png";
import BigEastLogo from "../assets/College_Logos/Conference_Logos/BigEast.png";
import BigSkyLogo from "../assets/College_Logos/Conference_Logos/BigSky.png";
import BigSouthLogo from "../assets/College_Logos/Conference_Logos/BigSouth.png";
import BIG10Logo from "../assets/College_Logos/Conference_Logos/BigTen.png";
import BIG10Logolight from "../assets/College_Logos/Conference_Logos/BIGTenLight.png";
import BigWestLogo from "../assets/College_Logos/Conference_Logos/BigWest.png";
import CAALogo from "../assets/College_Logos/Conference_Logos/CAA.png";
import WCBBLogo from "../assets/College_Logos/Conference_Logos/WCBB.png";
import CUSALogo from "../assets/College_Logos/Conference_Logos/CUSA.png";
import CUSALogoLight from "../assets/College_Logos/Conference_Logos/CUSALight.png";
import IvyLeagueLogo from "../assets/College_Logos/Conference_Logos/IvyLeague.png";
import MAACLogo from "../assets/College_Logos/Conference_Logos/MAAC.png";
import MACLogo from "../assets/College_Logos/Conference_Logos/MAC.png";
import MEACLogo from "../assets/College_Logos/Conference_Logos/MEAC.png";
import MVFCLogo from "../assets/College_Logos/Conference_Logos/MVFC.png";
import NECLogo from "../assets/College_Logos/Conference_Logos/NEC.png";
import OVCLogo from "../assets/College_Logos/Conference_Logos/OVC.png";
import PatriotLeagueLogo from "../assets/College_Logos/Conference_Logos/PatriotLeague.png";
import SECLogo from "../assets/College_Logos/Conference_Logos/SEC.png";
import SLCLogo from "../assets/College_Logos/Conference_Logos/SLC.png";
import SoConLogo from "../assets/College_Logos/Conference_Logos/SoCon.png";
import SunBeltLogo from "../assets/College_Logos/Conference_Logos/SunBelt.png";
import SWACLogo from "../assets/College_Logos/Conference_Logos/SWAC.png";
import WACLogo from "../assets/College_Logos/Conference_Logos/WAC.png";
import type { Conference } from "./cfbConferences";

export type WCBBConferenceSelection = number | string | null | undefined;

export const wcbbConferences: Conference[] = [
  {
    id: 0,
    uid: "top25",
    groupId: null,
    name: "Top 25",
    shortName: "Top 25",
    logo: WCBBLogo,
    logoLight: WCBBLogo,
    parentGroupId: 80,
    color: "#009CDE",
    secondaryColor: "#000000",
  },
  {
    id: 1,
    uid: "s:40~l:41~g:3",
    groupId: 3,
    name: "Atlantic 10 Conference",
    shortName: "A-10",
    parentGroupId: 50,
    logo: A10Logo,
    logoLight: A10Logo,
    color: "#E12726",
    secondaryColor: "#231F20",
  },
  {
    id: 2,
    uid: "s:40~l:41~g:2",
    groupId: 2,
    name: "Atlantic Coast Conference",
    shortName: "ACC",
    parentGroupId: 50,
    logo: ACCLogo,
    logoLight: ACCLogoLight,
    color: "#013CA6",
    secondaryColor: "#A5A9AB",
  },
  {
    id: 3,
    uid: "s:40~l:41~g:1",
    groupId: 1,
    name: "America East Conference",
    shortName: "Am. East",
    parentGroupId: 50,
    logo: AMEastLogo,
    logoLight: AMEastLogo,
    color: "#201646",
    secondaryColor: "#ff4438",
  },
  {
    id: 4,
    uid: "s:40~l:41~g:62",
    groupId: 62,
    name: "American Conference",
    shortName: "American",
    parentGroupId: 50,
    logo: AACLogo,
    logoLight: AACLogo,
    color: "#041E41",
    secondaryColor: "#EE2231",
  },
  {
    id: 5,
    uid: "s:40~l:41~g:46",
    groupId: 46,
    name: "ASUN Conference",
    shortName: "ASUN",
    parentGroupId: 50,
    logo: null,
    logoLight: null,
    color: "#4E5055",
    secondaryColor: "#F3E503",
  },
  {
    id: 6,
    uid: "s:40~l:41~g:8",
    groupId: 8,
    name: "Big 12 Conference",
    shortName: "Big 12",
    parentGroupId: 50,
    logo: BIG12Logo,
    logoLight: BIG12Logolight,
    color: "#C41230",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 7,
    uid: "s:40~l:41~g:4",
    groupId: 4,
    name: "Big East Conference",
    shortName: "Big East",
    parentGroupId: 50,
    logo: BigEastLogo,
    logoLight: BigEastLogo,
    color: "#ED1A39",
    secondaryColor: "#003E7E",
  },
  {
    id: 8,
    uid: "s:40~l:41~g:5",
    groupId: 5,
    name: "Big Sky Conference",
    shortName: "Big Sky",
    parentGroupId: 50,
    logo: BigSkyLogo,
    logoLight: BigSkyLogo,
    color: "#005DAA",
    secondaryColor: "#70CDE3",
  },
  {
    id: 9,
    uid: "s:40~l:41~g:6",
    groupId: 6,
    name: "Big South Conference",
    shortName: "Big South",
    parentGroupId: 50,
    logo: BigSouthLogo,
    logoLight: BigSouthLogo,
    color: "#0079C7",
    secondaryColor: "#ffffff",
  },
  {
    id: 10,
    uid: "s:40~l:41~g:7",
    groupId: 7,
    name: "Big Ten Conference",
    shortName: "Big Ten",
    parentGroupId: 50,
    logo: BIG10Logolight,
    logoLight: BIG10Logo,
    color: "#0088CE",
    secondaryColor: "#000000",
  },
  {
    id: 11,
    uid: "s:40~l:41~g:9",
    groupId: 9,
    name: "Big West Conference",
    shortName: "Big West",
    parentGroupId: 50,
    logo: BigWestLogo,
    logoLight: BigWestLogo,
    color: "#A2AAAD",
    secondaryColor: "#ffffff",
  },
  {
    id: 12,
    uid: "s:40~l:41~g:10",
    groupId: 10,
    name: "Coastal Athletic Association",
    shortName: "CAA",
    parentGroupId: 50,
    logo: CAALogo,
    logoLight: CAALogo,
    color: "#002263",
    secondaryColor: "#2C6ABB",
  },
  {
    id: 13,
    uid: "s:40~l:41~g:11",
    groupId: 11,
    name: "Conference USA",
    shortName: "CUSA",
    parentGroupId: 50,
    logo: CUSALogo,
    logoLight: CUSALogoLight,
    color: "#003865",
    secondaryColor: "#A6192E",
  },
  {
    id: 14,
    uid: "s:40~l:41~g:45",
    groupId: 45,
    name: "Horizon League",
    shortName: "Horizon",
    parentGroupId: 50,
    logo: null,
    logoLight: null,
    color: "#FFA400",
    secondaryColor: "#D7D2CB",
  },
  {
    id: 15,
    uid: "s:40~l:41~g:12",
    groupId: 12,
    name: "Ivy League",
    shortName: "Ivy",
    parentGroupId: 50,
    logo: IvyLeagueLogo,
    logoLight: IvyLeagueLogo,
    color: "#026937",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 16,
    uid: "s:40~l:41~g:13",
    groupId: 13,
    name: "Metro Atlantic Athletic Conference",
    shortName: "MAAC",
    parentGroupId: 50,
    logo: MAACLogo,
    logoLight: MAACLogo,
    color: "#E03A3E",
    secondaryColor: "#004FA3",
  },
  {
    id: 17,
    uid: "s:40~l:41~g:14",
    groupId: 14,
    name: "Mid-American Conference",
    shortName: "MAC",
    parentGroupId: 50,
    logo: MACLogo,
    logoLight: MACLogo,
    color: "#0B213E",
    secondaryColor: "#019E4F",
  },
  {
    id: 18,
    uid: "s:40~l:41~g:16",
    groupId: 16,
    name: "Mid-Eastern Athletic Conference",
    shortName: "MEAC",
    parentGroupId: 50,
    logo: MEACLogo,
    logoLight: MEACLogo,
    color: "#342A7A",
    secondaryColor: "#FDBF57",
  },
  {
    id: 19,
    uid: "s:40~l:41~g:44",
    groupId: 44,
    name: "Mountain West Conference",
    shortName: "Mountain West",
    parentGroupId: 50,
    logo: MWCLogo,
    logoLight: MWCLogo,
    color: "#4F2D7F",
    secondaryColor: "#AFAFAF",
  },
  {
    id: 20,
    uid: "s:40~l:41~g:18",
    groupId: 18,
    name: "Missouri Valley Conference",
    shortName: "MVC",
    parentGroupId: 50,
    logo: MVFCLogo,
    logoLight: MVFCLogo,
    color: "#003976",
    secondaryColor: "#C8102E",
  },
  {
    id: 21,
    uid: "s:40~l:41~g:19",
    groupId: 19,
    name: "Northeast Conference",
    shortName: "NEC",
    parentGroupId: 50,
    logo: NECLogo,
    logoLight: NECLogo,
    color: "#006BA3",
    secondaryColor: "#231F20",
  },
  {
    id: 22,
    uid: "s:40~l:41~g:20",
    groupId: 20,
    name: "Ohio Valley Conference",
    shortName: "OVC",
    parentGroupId: 50,
    logo: OVCLogo,
    logoLight: OVCLogo,
    color: "#9D2440",
    secondaryColor: "#D1AD85",
  },
  {
    id: 23,
    uid: "s:40~l:41~g:22",
    groupId: 22,
    name: "Patriot League",
    shortName: "Patriot",
    parentGroupId: 50,
    logo: PatriotLeagueLogo,
    logoLight: PatriotLeagueLogo,
    color: "#25355F",
    secondaryColor: "#D72633",
  },
  {
    id: 24,
    uid: "s:40~l:41~g:23",
    groupId: 23,
    name: "Southeastern Conference",
    shortName: "SEC",
    parentGroupId: 50,
    logo: SECLogo,
    logoLight: SECLogo,
    color: "#22356B",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 25,
    uid: "s:40~l:41~g:24",
    groupId: 24,
    name: "Southern Conference",
    shortName: "SoCon",
    parentGroupId: 50,
    logo: SoConLogo,
    logoLight: SoConLogo,
    color: "#001489",
    secondaryColor: "#DA291C",
  },
  {
    id: 26,
    uid: "s:40~l:41~g:25",
    groupId: 25,
    name: "Southland Conference",
    shortName: "Southland",
    parentGroupId: 50,
    logo: SLCLogo,
    logoLight: SLCLogo,
    color: "#000000",
    secondaryColor: "#C2A553",
  },
  {
    id: 27,
    uid: "s:40~l:41~g:49",
    groupId: 49,
    name: "Summit League",
    shortName: "Summit",
    parentGroupId: 50,
    logo: null,
    logoLight: null,
    color: "#7E868C",
    secondaryColor: "#003494",
  },
  {
    id: 28,
    uid: "s:40~l:41~g:27",
    groupId: 27,
    name: "Sun Belt Conference",
    shortName: "Sun Belt",
    parentGroupId: 50,
    logo: SunBeltLogo,
    logoLight: SunBeltLogo,
    color: "#F6A800",
    secondaryColor: "#0A2240",
  },
  {
    id: 29,
    uid: "s:40~l:41~g:26",
    groupId: 26,
    name: "Southwestern Athletic Conference",
    shortName: "SWAC",
    parentGroupId: 50,
    logo: SWACLogo,
    logoLight: SWACLogo,
    color: "#E01821",
    secondaryColor: "#B0B0B0",
  },
  {
    id: 30,
    uid: "s:40~l:41~g:30",
    groupId: 30,
    name: "Western Athletic Conference",
    shortName: "WAC",
    parentGroupId: 50,
    logo: WACLogo,
    logoLight: WACLogo,
    color: "#98002E",
    secondaryColor: "#D9D4CC",
  },
  {
    id: 31,
    uid: "s:40~l:41~g:29",
    groupId: 29,
    name: "West Coast Conference",
    shortName: "WCC",
    parentGroupId: 50,
    logo: "https://a.espncdn.com/i/teamlogos/ncaa_conf/sml/trans/west_coast.gif",
    logoLight: null,
    color: "#000000",
    secondaryColor: "#ffffff",
  },
];

function normalizeWCBBConferenceselection(selection: WCBBConferenceSelection) {
  return String(selection ?? "").trim();
}

export const getCFBConference = (groupId: number | string | null) => {
  if (groupId == null) return undefined;
  return wcbbConferences.find((c) => String(c.groupId) === String(groupId));
};

export const getCFBConferenceName = (groupId: number | string | null) => {
  if (groupId == null) return undefined;
  const conference = wcbbConferences.find(
    (c) => String(c.groupId) === String(groupId),
  );

  return conference?.shortName || conference?.name;
};

export const resolveWCBBConferenceselection = (
  selection: WCBBConferenceSelection,
) => {
  const normalizedSelection = normalizeWCBBConferenceselection(selection);

  if (!normalizedSelection) {
    return undefined;
  }

  const lowerSelection = normalizedSelection.toLowerCase();

  if (lowerSelection === "DIV I") {
    return getCFBConference(50);
  }

  return wcbbConferences.find((conference) => {
    return (
      conference.uid.toLowerCase() === lowerSelection ||
      conference.shortName.toLowerCase() === lowerSelection ||
      conference.name.toLowerCase() === lowerSelection ||
      (conference.groupId != null &&
        String(conference.groupId) === normalizedSelection)
    );
  });
};

export const getWCBBConferenceSelectionName = (
  selection: WCBBConferenceSelection,
) => {
  const conference = resolveWCBBConferenceselection(selection);

  if (!conference) {
    return undefined;
  }

  if (conference.groupId === 50) {
    return "DIV I";
  }

  return conference.shortName || conference.name;
};

export function getWCBBConferenceLogo(
  groupId: number | string | null,
  isDark: boolean,
) {
  const conference = wcbbConferences.find(
    (t) => String(t.groupId) === String(groupId),
  );

  if (!conference) return PlaceholderLogo;

  return isDark ? conference.logoLight || conference.logo : conference.logo;
}
