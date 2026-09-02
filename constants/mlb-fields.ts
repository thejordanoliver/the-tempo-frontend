import ArizonaField from "assets/Baseball/MLB_Fields/ARI_arizona-diamondbacks_field_30.png";
import AthleticsField from "assets/Baseball/MLB_Fields/ATH_athletics_field_11.png";
import AtlantaField from "assets/Baseball/MLB_Fields/ATL_atlanta-braves_field_218.png";
import BaltimoreField from "assets/Baseball/MLB_Fields/BAL_baltimore-orioles_field_1.png";
import BostonField from "assets/Baseball/MLB_Fields/BOS_boston-red-sox_field_2.png";
import ChicagoCubsField from "assets/Baseball/MLB_Fields/CHC_chicago-cubs_field_16.png";
import ChicagoWhiteSoxField from "assets/Baseball/MLB_Fields/CHW_chicago-white-sox_field_4.png";
import CincinnatiField from "assets/Baseball/MLB_Fields/CIN_cincinnati-reds_field_83.png";
import ClevelandField from "assets/Baseball/MLB_Fields/CLE_cleveland-guardians_field_5.png";
import ColoradoField from "assets/Baseball/MLB_Fields/COL_colorado-rockies_field_27.png";
import DetroitField from "assets/Baseball/MLB_Fields/DET_detroit-tigers_field_45.png";
import HoustonField from "assets/Baseball/MLB_Fields/HOU_houston-astros_field_44.png";
import KansasCityField from "assets/Baseball/MLB_Fields/KC_kansas-city-royals_field_7.png";
import LosAngelesAngelsField from "assets/Baseball/MLB_Fields/LAA_los-angeles-angels_field_3.png";
import LosAngelesDodgersField from "assets/Baseball/MLB_Fields/LAD_los-angeles-dodgers_field_19.png";
import MiamiField from "assets/Baseball/MLB_Fields/MIA_miami-marlins_field_212.png";
import MilwaukeeField from "assets/Baseball/MLB_Fields/MIL_milwaukee-brewers_field_46.png";
import MinnesotaField from "assets/Baseball/MLB_Fields/MIN_minnesota-twins_field_210.png";
import NewYorkMetsField from "assets/Baseball/MLB_Fields/NYM_new-york-mets_field_209.png";
import NewYorkYankeesField from "assets/Baseball/MLB_Fields/NYY_new-york-yankees_field_208.png";
import PhiladelphiaField from "assets/Baseball/MLB_Fields/PHI_philadelphia-phillies_field_84.png";
import PittsburghField from "assets/Baseball/MLB_Fields/PIT_pittsburgh-pirates_field_47.png";
import SanDiegoField from "assets/Baseball/MLB_Fields/SD_san-diego-padres_field_85.png";
import SanFranciscoField from "assets/Baseball/MLB_Fields/SF_san-francisco-giants_field_43.png";
import SeattleField from "assets/Baseball/MLB_Fields/SEA_seattle-mariners_field_41.png";
import StLouisField from "assets/Baseball/MLB_Fields/STL_st-louis-cardinals_field_87.png";
import TampaBayField from "assets/Baseball/MLB_Fields/TB_tampa-bay-rays_field_31.png";
import TexasField from "assets/Baseball/MLB_Fields/TEX_texas-rangers_field_231.png";
import TorontoField from "assets/Baseball/MLB_Fields/TOR_toronto-blue-jays_field_14.png";
import WashingtonField from "assets/Baseball/MLB_Fields/WSH_washington-nationals_field_89.png";

const MLB_FIELD_IMAGES: Record<string, number> = {
  ARI: ArizonaField,
  ATH: AthleticsField,
  ATL: AtlantaField,
  BAL: BaltimoreField,
  BOS: BostonField,
  CHC: ChicagoCubsField,
  CHW: ChicagoWhiteSoxField,
  CIN: CincinnatiField,
  CLE: ClevelandField,
  COL: ColoradoField,
  DET: DetroitField,
  HOU: HoustonField,
  KC: KansasCityField,
  LAA: LosAngelesAngelsField,
  LAD: LosAngelesDodgersField,
  MIA: MiamiField,
  MIL: MilwaukeeField,
  MIN: MinnesotaField,
  NYM: NewYorkMetsField,
  NYY: NewYorkYankeesField,
  PHI: PhiladelphiaField,
  PIT: PittsburghField,
  SD: SanDiegoField,
  SEA: SeattleField,
  SF: SanFranciscoField,
  STL: StLouisField,
  TB: TampaBayField,
  TEX: TexasField,
  TOR: TorontoField,
  WSH: WashingtonField,
};

const MLB_CODE_ALIASES: Record<string, string> = {
  CWS: "CHW",
  KCR: "KC",
  OAK: "ATH",
  SDP: "SD",
  SFG: "SF",
  TBR: "TB",
  WSN: "WSH",
};

const MLB_FIELD_IMAGES_BY_VENUE_ID: Record<string, number> = {
  "1": BaltimoreField,
  "2": BostonField,
  "3": LosAngelesAngelsField,
  "4": ChicagoWhiteSoxField,
  "5": ClevelandField,
  "7": KansasCityField,
  "11": AthleticsField,
  "14": TorontoField,
  "16": ChicagoCubsField,
  "19": LosAngelesDodgersField,
  "27": ColoradoField,
  "30": ArizonaField,
  "31": TampaBayField,
  "41": SeattleField,
  "43": SanFranciscoField,
  "44": HoustonField,
  "45": DetroitField,
  "46": MilwaukeeField,
  "47": PittsburghField,
  "83": CincinnatiField,
  "84": PhiladelphiaField,
  "85": SanDiegoField,
  "87": StLouisField,
  "89": WashingtonField,
  "208": NewYorkYankeesField,
  "209": NewYorkMetsField,
  "210": MinnesotaField,
  "212": MiamiField,
  "218": AtlantaField,
  "231": TexasField,
};

export const DEFAULT_MLB_FIELD_IMAGE = AtlantaField;

export function getMLBFieldImage(
  teamCode?: string | null,
  venueId?: string | number | null,
) {
  const venueField =
    venueId === null || venueId === undefined
      ? undefined
      : MLB_FIELD_IMAGES_BY_VENUE_ID[String(venueId)];

  if (venueField) {
    return venueField;
  }

  const normalizedCode = teamCode?.trim().toUpperCase() ?? "";
  const canonicalCode = MLB_CODE_ALIASES[normalizedCode] ?? normalizedCode;

  return MLB_FIELD_IMAGES[canonicalCode] ?? DEFAULT_MLB_FIELD_IMAGE;
}
