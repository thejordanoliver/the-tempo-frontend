import MWCLogo from "assets/College_Logos/Conference_Logos/MWC.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { ImageSourcePropType } from "react-native";
import ACCLogo from "../assets/College_Logos/Conference_Logos/ACC.png";
import ACCLogoLight from "../assets/College_Logos/Conference_Logos/ACCLight.png";
import AACLogo from "../assets/College_Logos/Conference_Logos/American.png";
import BIG12Logo from "../assets/College_Logos/Conference_Logos/Big12.png";
import BIG12Logolight from "../assets/College_Logos/Conference_Logos/BIG12Light.png";
import BigSkyLogo from "../assets/College_Logos/Conference_Logos/BigSky.png";
import BIG10Logo from "../assets/College_Logos/Conference_Logos/BigTen.png";
import BIG10Logolight from "../assets/College_Logos/Conference_Logos/BIGTenLight.png";
import CAALogo from "../assets/College_Logos/Conference_Logos/CAA.png";
import CFBLogo from "../assets/College_Logos/Conference_Logos/CFB.png";
import CUSALogo from "../assets/College_Logos/Conference_Logos/CUSA.png";
import CUSALogoLight from "../assets/College_Logos/Conference_Logos/CUSALight.png";
import IvyLeagueLogo from "../assets/College_Logos/Conference_Logos/IvyLeague.png";
import MACLogo from "../assets/College_Logos/Conference_Logos/MAC.png";
import MEACLogo from "../assets/College_Logos/Conference_Logos/MEAC.png";
import MVFCLogo from "../assets/College_Logos/Conference_Logos/MVFC.png";
import NECLogo from "../assets/College_Logos/Conference_Logos/NEC.png";
import OVCLogo from "../assets/College_Logos/Conference_Logos/OVC.png";
import PAC12Logo from "../assets/College_Logos/Conference_Logos/PAC12.png";
import PatriotLeagueLogo from "../assets/College_Logos/Conference_Logos/PatriotLeague.png";
import PioneerLeagueLogo from "../assets/College_Logos/Conference_Logos/PioneerLeague.png";
import SECLogo from "../assets/College_Logos/Conference_Logos/SEC.png";
import SLCLogo from "../assets/College_Logos/Conference_Logos/SLC.png";
import SoConLogo from "../assets/College_Logos/Conference_Logos/SoCon.png";
import SunBeltLogo from "../assets/College_Logos/Conference_Logos/SunBelt.png";
import SWACLogo from "../assets/College_Logos/Conference_Logos/SWAC.png";

export type Conference = {
  id: number;
  uid: string;
  groupId: number;
  name: string;
  shortName: string;
  logo: ImageSourcePropType | string | null;
  logoLight: ImageSourcePropType | string | null;
  color: string | null;
  secondaryColor: string | null;
  parentGroupId: number | null;
};

export const cfbConferences: Conference[] = [
  {
      id: 1,
      uid: "s:20~l:23~g:80",
      groupId: 80,
      name: "FBS",
      shortName: "FBS",
      logo: CFBLogo,
      logoLight: CFBLogo,
      parentGroupId: null,
      color: null,
      secondaryColor: null
  },
  {
    id: 2,
    uid: "s:20~l:23~g:1",
    groupId: 1,
    name: "Atlantic Coast Conference",
    shortName: "ACC",
    logo: ACCLogo,
    logoLight: ACCLogoLight,
    parentGroupId: 80,
    color: "#013CA6",
    secondaryColor: "#A5A9AB",
  },
  {
    id: 3,
    uid: "s:20~l:23~g:151",
    groupId: 151,
    name: "American Conference",
    shortName: "American",
    logo: AACLogo,
    logoLight: AACLogo,
    parentGroupId: 80,
    color: "#041E41",
    secondaryColor: "#EE2231",
  },
  {
    id: 4,
    uid: "s:20~l:23~g:4",
    groupId: 4,
    name: "Big 12 Conference",
    shortName: "Big 12",
    logo: BIG12Logo,
    logoLight: BIG12Logolight,
    parentGroupId: 80,
    color: "#C41230",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 5,
    uid: "s:20~l:23~g:5",
    groupId: 5,
    name: "Big Ten Conference",
    shortName: "Big Ten",
    logo: BIG10Logo,
    logoLight: BIG10Logolight,
    parentGroupId: 80,
    color: "#0088CE",
    secondaryColor: "#000000",
  },
  {
    id: 6,
    uid: "s:20~l:23~g:12",
    groupId: 12,
    name: "Conference USA",
    shortName: "CUSA",
    logo: CUSALogo,
    logoLight: CUSALogoLight,
    parentGroupId: 80,
    color: "#003865",
    secondaryColor: "#A6192E",
  },
  {
      id: 7,
      uid: "s:20~l:23~g:18",
      groupId: 18,
      name: "FBS Independents",
      shortName: "FBS Indep.",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa_conf/500/fbs_independents.png",
      logoLight: "",
      parentGroupId: 80,
      color: null,
      secondaryColor: null
  },
  {
    id: 8,
    uid: "s:20~l:23~g:15",
    groupId: 15,
    name: "Mid-American Conference",
    shortName: "MAC",
    logo: MACLogo,
    logoLight: MACLogo,
    parentGroupId: 80,
    color: "#0B213E",
    secondaryColor: "#019E4F",
  },
  {
    id: 9,
    uid: "s:20~l:23~g:17",
    groupId: 17,
    name: "Mountain West Conference",
    shortName: "Mountain West",
    logo: MWCLogo,
    logoLight: MWCLogo,
    parentGroupId: 80,
    color: "#4F2D7F",
    secondaryColor: "#AFAFAF",
  },
  {
    id: 10,
    uid: "s:20~l:23~g:9",
    groupId: 9,
    name: "Pac-12 Conference",
    shortName: "Pac-12",
    logo: PAC12Logo,
    logoLight: PAC12Logo,
    parentGroupId: 80,
    color: "#092346",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 11,
    uid: "s:20~l:23~g:8",
    groupId: 8,
    name: "Southeastern Conference",
    shortName: "SEC",
    logo: SECLogo,
    logoLight: SECLogo,
    parentGroupId: 80,
    color: "#22356B",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 12,
    uid: "s:20~l:23~g:37",
    groupId: 37,
    name: "Sun Belt Conference",
    shortName: "Sun Belt",
    logo: SunBeltLogo,
    logoLight: SunBeltLogo,
    parentGroupId: 80,
    color: "#F6A800",
    secondaryColor: "#0A2240",
  },
  {
      id: 25,
      uid: "s:20~l:23~g:81",
      groupId: 81,
      name: "FCS",
      shortName: "FCS",
      logo: null,
      logoLight: null,
      parentGroupId: null,
      color: null,
      secondaryColor: null
  },
  {
    id: 26,
    uid: "s:20~l:23~g:20",
    groupId: 20,
    name: "Big Sky Conference",
    shortName: "Big Sky",
    logo: BigSkyLogo,
    logoLight: BigSkyLogo,
    parentGroupId: 81,
    color: "#005DAA",
    secondaryColor: "#70CDE3",
  },
  {
    id: 27,
    uid: "s:20~l:23~g:48",
    groupId: 48,
    name: "Coastal Athletic Association",
    shortName: "CAA",
    logo: CAALogo,
    logoLight: CAALogo,
    parentGroupId: 81,
    color: "#00205C",
    secondaryColor: "#906ABB",
  },
  {
      id: 28,
      uid: "s:20~l:23~g:32",
      groupId: 32,
      name: "FCS Independents",
      shortName: "FCS Indep.",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa_conf/500/fcs_independents.png",
      logoLight: "",
      parentGroupId: 81,
      color: null,
      secondaryColor: null
  },
  {
    id: 29,
    uid: "s:20~l:23~g:22",
    groupId: 22,
    name: "Ivy League",
    shortName: "Ivy",
    logo: IvyLeagueLogo,
    logoLight: IvyLeagueLogo,
    parentGroupId: 81,
    color: "#026937",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 30,
    uid: "s:20~l:23~g:24",
    groupId: 24,
    name: "Mid-Eastern Athletic Conference",
    shortName: "MEAC",
    logo: MEACLogo,
    logoLight: MEACLogo,
    parentGroupId: 81,
    color: "#342A7A",
    secondaryColor: "#FDBF57",
  },
  {
    id: 31,
    uid: "s:20~l:23~g:21",
    groupId: 21,
    name: "Missouri Valley Football Conference",
    shortName: "MVFC",
    logo: MVFCLogo,
    logoLight: MVFCLogo,
    parentGroupId: 81,
    color: "#003976",
    secondaryColor: "#C8102E",
  },
  {
    id: 32,
    uid: "s:20~l:23~g:25",
    groupId: 25,
    name: "Northeast Conference",
    shortName: "NEC",
    logo: NECLogo,
    logoLight: NECLogo,
    parentGroupId: 81,
    color: "#006BA3",
    secondaryColor: "#231F20",
  },
  {
    id: 33,
    uid: "s:20~l:23~g:179",
    groupId: 179,
    name: "OVC-Big South Association",
    shortName: "OVC-Big South",
    logo: OVCLogo,
    logoLight: OVCLogo,
    parentGroupId: 81,
    color: "#9D2440",
    secondaryColor: "#D1AD85",
  },
  {
    id: 34,
    uid: "s:20~l:23~g:27",
    groupId: 27,
    name: "Patriot League",
    shortName: "Patriot",
    logo: PatriotLeagueLogo,
    logoLight: PatriotLeagueLogo,
    parentGroupId: 81,
    color: "#25355F",
    secondaryColor: "#D72633",
  },
  {
    id: 35,
    uid: "s:20~l:23~g:28",
    groupId: 28,
    name: "Pioneer Football League",
    shortName: "Pioneer",
    logo: PioneerLeagueLogo,
    logoLight: PioneerLeagueLogo,
    parentGroupId: 81,
    color: "#25355F",
    secondaryColor: "#D72633",
  },
  {
    id: 36,
    uid: "s:20~l:23~g:29",
    groupId: 29,
    name: "Southern Conference",
    shortName: "Southern",
    logo: SoConLogo,
    logoLight: SoConLogo,
    parentGroupId: 81,
    color: "#001489",
    secondaryColor: "#DA291C",
  },
  {
    id: 37,
    uid: "s:20~l:23~g:30",
    groupId: 30,
    name: "Southland Conference",
    shortName: "Southland",
    logo: SLCLogo,
    logoLight: SLCLogo,
    parentGroupId: 81,
    color: "#000000",
    secondaryColor: "#C2A553",
  },
  {
    id: 38,
    uid: "s:20~l:23~g:31",
    groupId: 31,
    name: "Southwestern Athletic Conference",
    shortName: "SWAC",
    logo: SWACLogo,
    logoLight: SWACLogo,
    parentGroupId: 81,
    color: "#E01821",
    secondaryColor: "#B0B0B0",
  },
  {
      id: 39,
      uid: "s:20~l:23~g:177",
      groupId: 177,
      name: "United Athletic Conference",
      shortName: "UAC",
      logo: null,
      logoLight: null,
      parentGroupId: 81,
      color: null,
      secondaryColor: null
  },
];

export function getCFBConferenceLogo(id: number | string, isDark: boolean) {
  const conference = cfbConferences.find(
    (t) => String(t.groupId) === String(id),
  );

  if (!conference) return PlaceholderLogo;

  return isDark ? conference.logoLight || conference.logo : conference.logo;
}
