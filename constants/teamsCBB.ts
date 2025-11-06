// constants/teams.ts
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";
import { CBBTeam, Conference, Venue } from "types/types";

//Conference Logos
import MountainWestConference from "assets/College_Logos/MWC.png";
import NCAALogo from "assets/College_Logos/NCAA.png";
import A10Conference from "../assets/College_Logos/A10.png";
import AtlanticCoastConference from "../assets/College_Logos/ACC.png";
import AmericanAthleticConference from "../assets/College_Logos/American.png";
import BIG10Conference from "../assets/College_Logos/BIG10.png";
import BIG12Conference from "../assets/College_Logos/BIG12.png";
import ConferenceUSA from "../assets/College_Logos/CUSA.png";
import MidAmericanConference from "../assets/College_Logos/MAC.png";
import PAC12Conference from "../assets/College_Logos/PAC12.png";
import SoutheasternConference from "../assets/College_Logos/SEC.png";
import SunBeltConference from "../assets/College_Logos/SunBelt.png";

//Logos
import AirForceLogo from "assets/College_Logos/AirForce.png";
import AirForceLogoLight from "assets/College_Logos/AirForceLight.png";
import AkronLogo from "assets/College_Logos/Akron.png";
import AlabamaLogo from "assets/College_Logos/Alabama.png";
import AlabamaAMLogo from "assets/College_Logos/AlabamaA&M.png";
import AlabamaAMLogoLight from "assets/College_Logos/AlabamaA&MLight.png";
import AlabamaLogoLight from "assets/College_Logos/AlabamaLight.png";
import AlabamaStLogo from "assets/College_Logos/AlabamaSt.png";
import AlcornStLogo from "assets/College_Logos/AlcornSt.png";
import AmericanUniversityLogo from "assets/College_Logos/AmericanUniversity.png";
import AppalachianStateLogo from "assets/College_Logos/AppalachianState.png";
import ArizonaLogo from "assets/College_Logos/Arizona.png";
import ArizonaStateLogo from "assets/College_Logos/ArizonaState.png";
import ArkansasPineBluffLogo from "assets/College_Logos/Arkansas-PineBluff.png";
import ArkansasLogo from "assets/College_Logos/Arkansas.png";
import ArkansasLogoLight from "assets/College_Logos/ArkansasLight.png";
import AuburnLogo from "assets/College_Logos/Auburn.png";
import AuburnLogoLight from "assets/College_Logos/AuburnLight.png";
import AustinPeayLogo from "assets/College_Logos/AustinPeay.png";
import BallStateLogo from "assets/College_Logos/BallState.png";
import BaylorLogo from "assets/College_Logos/Baylor.png";
import BaylorLogoLight from "assets/College_Logos/BaylorLight.png";
import BethuneCookmanLogo from "assets/College_Logos/Bethune-Cookman.png";
import BoiseStateLogo from "assets/College_Logos/BoiseState.png";
import BostonCollegeLogo from "assets/College_Logos/BostonCollege.png";
import BostonCollegeLogoLight from "assets/College_Logos/BostonCollegeLight.png";
import BowlingGreenLogo from "assets/College_Logos/BowlingGreen.png";
import BryantLogo from "assets/College_Logos/Bryant.png";
import BucknellLogo from "assets/College_Logos/Bucknell.png";
import BuffaloLogo from "assets/College_Logos/Buffalo.png";
import BuffaloStateLogo from "assets/College_Logos/BuffaloState.png";
import ButlerLogo from "assets/College_Logos/Butler.png";
import BYULogo from "assets/College_Logos/BYU.png";
import BYULogoLight from "assets/College_Logos/BYULight.png";
import CaliforniaLogo from "assets/College_Logos/California.png";
import CaliforniaLogoLight from "assets/College_Logos/CaliforniaLight.png";
import CampbellLogo from "assets/College_Logos/Campbell.png";
import CentralConnecticutLogo from "assets/College_Logos/CentralConnecticut.png";
import CentralMichiganLogo from "assets/College_Logos/CentralMichigan.png";
import CentralMichiganLogoLight from "assets/College_Logos/CentralMichiganLight.png";
import CentralWashingtonLogo from "assets/College_Logos/CentralWashington.png";
import CharlestonSouthernLogo from "assets/College_Logos/CharlestonSouthern.png";
import CharlotteLogo from "assets/College_Logos/Charlotte.png";
import CharlotteLogoLight from "assets/College_Logos/CharlotteLight.png";
import ChattanoogaLogo from "assets/College_Logos/Chattanooga.png";
import CincinnatiLogo from "assets/College_Logos/Cincinnati.png";
import CincinnatiLogoLight from "assets/College_Logos/CincinnatiLight.png";
import ClemsonLogo from "assets/College_Logos/Clemson.png";
import ClemsonLogoLight from "assets/College_Logos/ClemsonLight.png";
import CoastalCarolinaLogo from "assets/College_Logos/CoastalCarolina.png";
import ColgateLogo from "assets/College_Logos/Colgate.png";
import ColgateLogoLight from "assets/College_Logos/ColgateLight.png";
import ColoradoLogo from "assets/College_Logos/Colorado.png";
import ColoradoStateLogo from "assets/College_Logos/ColoradoState.png";
import DelawareLogo from "assets/College_Logos/Delaware.png";
import DelawareStateLogo from "assets/College_Logos/DelawareState.png";
import DukeLogo from "assets/College_Logos/Duke.png";
import DukeLogoLight from "assets/College_Logos/DukeLight.png";
import DuquesneLogo from "assets/College_Logos/Duquesne.png";
import DuquesneLogoLight from "assets/College_Logos/DuquesneLight.png";
import EasternKentuckyLogo from "assets/College_Logos/EasternKentucky.png";
import EasternKentuckyLogoLight from "assets/College_Logos/EasternKentuckyLight.png";
import EasternMichiganLogo from "assets/College_Logos/EasternMichigan.png";
import EasternMichiganLogoLight from "assets/College_Logos/EasternMichiganLight.png";
import FAMULogo from "assets/College_Logos/FAMU.png";
import FAULogo from "assets/College_Logos/FAU.png";
import FIULogo from "assets/College_Logos/FIU.png";
import FIULogoLight from "assets/College_Logos/FIULight.png";
import FloridaLogo from "assets/College_Logos/Florida.png";
import FloridaStateLogo from "assets/College_Logos/FSU.png";
import GeorgetownLogo from "assets/College_Logos/Georgetown.png";
import GeorgiaLogo from "assets/College_Logos/Georgia.png";
import GeorgiaSouthernLogo from "assets/College_Logos/GeorgiaSouthern.png";
import HawaiiLogo from "assets/College_Logos/Hawaii.png";
import HighPointLogo from "assets/College_Logos/HighPoint.png";
import HighPointLogoLight from "assets/College_Logos/HighPointLight.png";
import HolyCrossLogo from "assets/College_Logos/HolyCross.png";
import HoustonLogo from "assets/College_Logos/Houston.png";
import IdahoStateLogo from "assets/College_Logos/IdahoState.png";
import IllinoisLogo from "assets/College_Logos/Illinois.png";
import IllinoisStateLogo from "assets/College_Logos/IllinoisState.png";
import IndianaLogo from "assets/College_Logos/Indiana.png";
import IndianaLogoLight from "assets/College_Logos/IndianaLight.png";
import IowaLogo from "assets/College_Logos/Iowa.png";
import IowaLogoLight from "assets/College_Logos/IowaLight.png";
import KansasLogo from "assets/College_Logos/Kansas.png";
import KansasStLogo from "assets/College_Logos/KansasSt.png";
import KansasStLogoLight from "assets/College_Logos/KansasStLight.png";
import KentuckyLogo from "assets/College_Logos/Kentucky.png";
import KentuckyLogoLight from "assets/College_Logos/KentuckyLight.png";
import LATechLogo from "assets/College_Logos/LATech.png";
import LindenwoodLogo from "assets/College_Logos/Lindenwood.png";
import LIULogo from "assets/College_Logos/LIU.png";
import LSULogo from "assets/College_Logos/LSU.png";
import LSULogoLight from "assets/College_Logos/LSULight.png";
import MarshallLogo from "assets/College_Logos/Marshall.png";
import MarylandLogo from "assets/College_Logos/Maryland.png";
import MiamiOHLogo from "assets/College_Logos/Miami(OH).png";
import MiamiLogo from "assets/College_Logos/Miami.png";
import MichiganLogo from "assets/College_Logos/Michigan.png";
import MichiganStateLogo from "assets/College_Logos/MichiganState.png";
import MichiganStateLogoLight from "assets/College_Logos/MichiganStateLight.png";
import MinnesotaLogo from "assets/College_Logos/Minnesota.png";
import MinnesotaLogoLight from "assets/College_Logos/MinnesotaLight.png";
import MissouriLogo from "assets/College_Logos/Missouri.png";
import MissStLogo from "assets/College_Logos/MissSt.png";
import MiddleTennesseeLogo from "assets/College_Logos/MTSU.png";
import NavyLogo from "assets/College_Logos/Navy.png";
import NCStateLogo from "assets/College_Logos/NCState.png";
import NebraskaLogo from "assets/College_Logos/Nebraska.png";
import NebraskaLogoLight from "assets/College_Logos/NebraskaLight.png";
import NevadaLogo from "assets/College_Logos/Nevada.png";
import NevadaLogoLight from "assets/College_Logos/NevadaLight.png";
import NichollsLogo from "assets/College_Logos/Nicholls.png";
import NorfolkStLogo from "assets/College_Logos/NorfolkSt.png";
import NorthernArizonaLogo from "assets/College_Logos/NorthernArizona.png";
import NorthernArizonaLogoLight from "assets/College_Logos/NorthernArizonaLight.png";
import NorthernIllinoisLogo from "assets/College_Logos/NorthernIllinois.png";
import NorthTexasLogo from "assets/College_Logos/NorthTexas.png";
import NorthwesternLogo from "assets/College_Logos/Northwestern.png";
import NotreDameLogo from "assets/College_Logos/NotreDame.png";
import NotreDameLogoLight from "assets/College_Logos/NotreDameLight.png";
import OhioLogo from "assets/College_Logos/Ohio.png";
import OhioStLogo from "assets/College_Logos/OhioState.png";
import OhioStLogoLight from "assets/College_Logos/OhioStateLight.png";
import OklahomaLogo from "assets/College_Logos/Oklahoma.png";
import OklahomaLogoLight from "assets/College_Logos/OklahomaLight.png";
import OKStateLogo from "assets/College_Logos/OklahomaState.png";
import ODULogo from "assets/College_Logos/OldDominion.png";
import OleMissLogo from "assets/College_Logos/OleMiss.png";
import OleMissLogoLight from "assets/College_Logos/OleMissLight.png";
import OralRobertsLogo from "assets/College_Logos/OralRoberts.png";
import OralRobertsLogoLight from "assets/College_Logos/OralRobertsLight.png";
import OregonLogo from "assets/College_Logos/Oregon.png";
import OregonLogoLight from "assets/College_Logos/OregonLight.png";
import OregonStateLogo from "assets/College_Logos/OregonState.png";
import PennLogo from "assets/College_Logos/Penn.png";
import PennStateLogo from "assets/College_Logos/PennState.png";
import PittsburghLogo from "assets/College_Logos/Pittsburgh.png";
import PittsburghLogoLight from "assets/College_Logos/PittsburghLight.png";
import PrincetonLogo from "assets/College_Logos/Princeton.png";
import PurdueLogo from "assets/College_Logos/Purdue.png";
import RiceLogo from "assets/College_Logos/Rice.png";
import RiceLogoLight from "assets/College_Logos/RiceLight.png";
import RichmondLogo from "assets/College_Logos/Richmond.png";
import RichmondLogoLight from "assets/College_Logos/RichmondLight.png";
import RutgersLogo from "assets/College_Logos/Rutgers.png";
import SamHoustonLogo from "assets/College_Logos/SamHouston.png";
import SamHoustonLogoLight from "assets/College_Logos/SamHoustonLight.png";
import SanDiegoStLogo from "assets/College_Logos/SanDiegoSt..png";
import SouthDakotaStateLogo from "assets/College_Logos/SDST.png";
import SouthAlabamaLogo from "assets/College_Logos/SouthAlabama.png";
import StonehillLogo from "assets/College_Logos/Stonehill.png";
import TCULogo from "assets/College_Logos/TCU.png";
import TCULogoLight from "assets/College_Logos/TCULight.png";
import TempleLogo from "assets/College_Logos/Temple.png";
import TempleLogoLight from "assets/College_Logos/TempleLight.png";
import TennesseeLogo from "assets/College_Logos/Tennessee.png";
import TennesseeLogoLight from "assets/College_Logos/TennesseeLight.png";
import TennesseeTechLogo from "assets/College_Logos/TennesseeTech.png";
import TexasLogo from "assets/College_Logos/Texas.png";
import TexasAMLogo from "assets/College_Logos/TexasA&M.png";
import TexasAMLogoLight from "assets/College_Logos/TexasA&MLight.png";
import TexasLogoLight from "assets/College_Logos/TexasLight.png";
import TroyLogo from "assets/College_Logos/Troy.png";
import TulaneLogo from "assets/College_Logos/Tulane.png";
import TulsaLogo from "assets/College_Logos/Tulsa.png";
import TulsaLogoLight from "assets/College_Logos/TulsaLight.png";
import UCFLogo from "assets/College_Logos/UCF.png";
import UConnLogo from "assets/College_Logos/UCONN.png";
import UNCLogo from "assets/College_Logos/UNC.png";
import UNLVLogo from "assets/College_Logos/UNLV.png";
import UNLVLogoLight from "assets/College_Logos/UNLVLight.png";
import USCLogo from "assets/College_Logos/USC.png";
import USFLogo from "assets/College_Logos/USF.png";
import UtahLogo from "assets/College_Logos/Utah.png";
import UtahStateLogo from "assets/College_Logos/UtahState.png";
import UTEPLogo from "assets/College_Logos/UTEP.png";
import UTEPLogoLight from "assets/College_Logos/UTEPLight.png";
import UTSALogo from "assets/College_Logos/UTSA.png";
import VanderbiltLogo from "assets/College_Logos/Vanderbilt.png";
import VirginiaLogo from "assets/College_Logos/Virginia.png";
import VirginiaLogoLight from "assets/College_Logos/VirginiaLight.png";
import VirginiaTechLogo from "assets/College_Logos/VirginiaTech.png";
import VirginiaTechLogoLight from "assets/College_Logos/VirginiaTechLight.png";
import WakeForestLogo from "assets/College_Logos/WakeForest.png";
import WakeForestLogoLight from "assets/College_Logos/WakeForestLight.png";
import WesternKentuckyLogo from "assets/College_Logos/WesternKentucky.png";
import WesternMichiganLogo from "assets/College_Logos/WesternMichigan.png";
import WestVirginiaLogo from "assets/College_Logos/WestVirginia.png";
import WestVirginiaLogoLight from "assets/College_Logos/WestVirginiaLight.png";
import WisconsinLogo from "assets/College_Logos/Wisconsin.png";
import WyomingLogo from "assets/College_Logos/Wyoming.png";
import WyomingLogoLight from "assets/College_Logos/WyomingLight.png";
import AbileneChristianLogo from "../assets/College_Logos/AbileneChristian.png";
import ArkansasStateLogo from "../assets/College_Logos/ArkansasState.png";
import ArlingtonBaptistLogo from "../assets/College_Logos/ArlingtonBaptist.png";
import ArmyLogo from "../assets/College_Logos/Army.png";
import BinghamtonLogo from "../assets/College_Logos/Binghamton.png";
import BradleyLogo from "../assets/College_Logos/Bradley.png";
import CalPolyLogo from "../assets/College_Logos/CalPoly.png";
import CarolinaUniversityLogo from "../assets/College_Logos/CarolinaUniversity.png";
import CentralArkansasLogo from "../assets/College_Logos/CentralArkansas.png";
import CollegeOfBiblicalStudiesLogo from "../assets/College_Logos/CollegeOfBiblicalStudies.png";
import CoppinStateLogo from "../assets/College_Logos/CoppinState.png";
import CornellLogo from "../assets/College_Logos/Cornell.png";
import CreightonLogo from "../assets/College_Logos/Creighton.png";
import DallasUniversityLogo from "../assets/College_Logos/DallasUniversity.png";
import DartmouthLogo from "../assets/College_Logos/Dartmouth.png";
import DavidsonLogo from "../assets/College_Logos/Davidson.png";
import DaytonLogo from "../assets/College_Logos/Dayton.png";
import DaytonLogoLight from "../assets/College_Logos/DaytonLight.png";
import DenverLogo from "../assets/College_Logos/Denver.png";
import DenverLogoLight from "../assets/College_Logos/DenverLight.png";
import DrakeLogo from "../assets/College_Logos/Drake.png";
import ECULogo from "../assets/College_Logos/EastCarolina.png";
import EasternIllinoisLogo from "../assets/College_Logos/EasternIllinois.png";
import EasternWashingtonLogo from "../assets/College_Logos/EasternWashington.png";
import EasternWashingtonLogoLight from "../assets/College_Logos/EasternWashingtonLight.png";
import EastWestUniversityLogo from "../assets/College_Logos/EastWestUniversity.png";
import EastWestUniversityLogoLight from "../assets/College_Logos/EastWestUniversityLight.png";
import ElonLogo from "../assets/College_Logos/Elon.png";
import ETAMLogo from "../assets/College_Logos/ETA&M.png";
import EvansvilleLogo from "../assets/College_Logos/Evansville.png";
import FairleighDickinsonLogo from "../assets/College_Logos/FairleighDickinson.png";
import FordhamLogo from "../assets/College_Logos/Fordham.png";
import FresnoStLogo from "../assets/College_Logos/FresnoState.png";
import Furman from "../assets/College_Logos/Furman.png";
import GardnerWebbLogo from "../assets/College_Logos/Gardner-Webb.png";
import GeorgeMasonLogo from "../assets/College_Logos/GeorgeMason.png";
import GeorgeWashingtonLogo from "../assets/College_Logos/GeorgeWashington.png";
import GeorgiaStateLogo from "../assets/College_Logos/GeorgiaState.png";
import GeorgiaTechLogo from "../assets/College_Logos/GeorgiaTech.png";
import GeorgiaTechLogoLight from "../assets/College_Logos/GeorgiaTechLight.png";
import GonzagaLogo from "../assets/College_Logos/Gonzaga.png";
import GramblingLogo from "../assets/College_Logos/Grambling.png";
import GrandCanyonLogo from "../assets/College_Logos/GrandCanyon.png";
import GrandCanyonLogoLight from "../assets/College_Logos/GrandCanyonLight.png";
import HarvardLogo from "../assets/College_Logos/Harvard.png";
import HofstraLogo from "../assets/College_Logos/Hofstra.png";
import HofstraLogoLight from "../assets/College_Logos/HofstraLight.png";
import HoustonChristianLogo from "../assets/College_Logos/HoustonChristian.png";
import HowardLogo from "../assets/College_Logos/Howard.png";
import IdahoLogo from "../assets/College_Logos/Idaho.png";
import IncarnateWordLogo from "../assets/College_Logos/IncarnateWord.png";
import IndianaStateLogo from "../assets/College_Logos/IndianaState.png";
import IowaStateLogo from "../assets/College_Logos/IowaState.png";
import JacksonStateLogo from "../assets/College_Logos/JacksonState.png";
import JacksonvilleLogo from "../assets/College_Logos/Jacksonville.png";
import JacksonvilleLogoLight from "../assets/College_Logos/JacksonvilleLight.png";
import JamesMadisonLogo from "../assets/College_Logos/JamesMadison.png";
import JaxStateLogo from "../assets/College_Logos/JaxState.png";
import KennesawStateLogo from "../assets/College_Logos/KennesawState.png";
import KentStateLogo from "../assets/College_Logos/KentState.png";
import LafayetteLogo from "../assets/College_Logos/Lafayette.png";
import LamarLogo from "../assets/College_Logos/Lamar.png";
import LaSalleLogo from "../assets/College_Logos/LaSalle.png";
import LehighLogo from "../assets/College_Logos/Lehigh.png";
import LibertyLogo from "../assets/College_Logos/Liberty.png";
import LipscombLogo from "../assets/College_Logos/Lipscomb.png";
import LongwoodLogo from "../assets/College_Logos/Longwood.png";
import LouisianaLogo from "../assets/College_Logos/Louisiana.png";
import LouisvilleLogo from "../assets/College_Logos/Louisville.png";
import LoyolaChicagoLogo from "../assets/College_Logos/LoyolaChicago.png";
import LoyolaMarylandLogo from "../assets/College_Logos/LoyolaMaryland.png";
import LynchburgLogo from "../assets/College_Logos/Lynchburg.png";
import MaineLogo from "../assets/College_Logos/Maine.png";
import MaristLogo from "../assets/College_Logos/Marist.png";
import MarquetteLogo from "../assets/College_Logos/Marquette.png";
import MarylandEasternShoreLogo from "../assets/College_Logos/MarylandEasternShore.png";
import McNeeseLogo from "../assets/College_Logos/McNeese.png";
import MemphisLogo from "../assets/College_Logos/Memphis.png";
import MercerLogo from "../assets/College_Logos/Mercer.png";
import MerrimackLogo from "../assets/College_Logos/Merrimack.png";
import MilliganLogo from "../assets/College_Logos/Milligan.png";
import MississippiValleyStateLogo from "../assets/College_Logos/MississippiValleyState.png";
import MissouriStateLogo from "../assets/College_Logos/MissouriState.png";
import MonmouthLogo from "../assets/College_Logos/Monmouth.png";
import MontanaLogo from "../assets/College_Logos/Montana.png";
import MontanaLogoLight from "../assets/College_Logos/MontanaLight.png";
import MontanaStateLogo from "../assets/College_Logos/MontanaState.png";
import MorganStateLogo from "../assets/College_Logos/MorganState.png";
import MountSaintMarys from "../assets/College_Logos/MountSt.Mary's.png";
import MurrayStateLogo from "../assets/College_Logos/MurrayState.png";
import NewHavenLogo from "../assets/College_Logos/NewHaven.png";
import NewMexicoLogo from "../assets/College_Logos/NewMexico.png";
import NewMexicoStateLogo from "../assets/College_Logos/NewMexicoState.png";
import NiagaraLogo from "../assets/College_Logos/Niagara.png";
import NicholsLogo from "../assets/College_Logos/Nichols.png";
import NorthFloridaLogo from "../assets/College_Logos/NorhFlorida.png";
import NorthAlabamaLogo from "../assets/College_Logos/NorthAlabama.png";
import NorthCarolinaATLogo from "../assets/College_Logos/NorthCarolinaA&T.png";
import NorthDakotaLogo from "../assets/College_Logos/NorthDakota.png";
import NorthDakotaStateLogo from "../assets/College_Logos/NorthDakotaState.png";
import NorhternColoradoLogo from "../assets/College_Logos/NorthernColorado.png";
import OaklandLogo from "../assets/College_Logos/Oakland.png";
import OmahaLogo from "../assets/College_Logos/Omaha.png";
import PennStateYorkLogo from "../assets/College_Logos/PennStateYork.png";
import PortlandStateLogo from "../assets/College_Logos/PortlandState.png";
import PrairieViewAMLogo from "../assets/College_Logos/PrairieViewA&M.png";
import QueensLogo from "../assets/College_Logos/Queens.png";
import RhodeIslandLogo from "../assets/College_Logos/RhodeIsland.png";
import RiderLogo from "../assets/College_Logos/Rider.png";
import RITLogo from "../assets/College_Logos/RIT.png";
import RobertMorrisLogo from "../assets/College_Logos/RobertMorris.png";
import SacredHeartLogo from "../assets/College_Logos/SacredHeart.png";
import SaintFrancisLogo from "../assets/College_Logos/SaintFrancis.png";
import SaintJosephsLogo from "../assets/College_Logos/SaintJosephs.png";
import SaintLouisLogo from "../assets/College_Logos/SaintLouis.png";
import SaintMaryLogo from "../assets/College_Logos/SaintMary.png";
import SaintMaryLogoLight from "../assets/College_Logos/SaintMaryLight.png";
import SamfordLogo from "../assets/College_Logos/Samford.png";
import SanDiegoLogo from "../assets/College_Logos/SanDiego.png";
import SanJoseStateLogo from "../assets/College_Logos/SanJoséState.png";
import SELouisianaLogo from "../assets/College_Logos/SELouisiana.png";
import SIUELogo from "../assets/College_Logos/SIUEdwardsville.png";
import SIUELogoLight from "../assets/College_Logos/SIUEdwardsvilleLight.png";
import SMULogo from "../assets/College_Logos/SMU.png";
import SouthCarolinaLogo from "../assets/College_Logos/SouthCarolina.png";
import SouthCarolinaLogoLight from "../assets/College_Logos/SouthCarolinaLight.png";
import SouthCarolinaStateLogo from "../assets/College_Logos/SouthCarolinaState.png";
import SouthDakotaLogo from "../assets/College_Logos/SouthDakota.png";
import SoutheastMissouriStateLogo from "../assets/College_Logos/SoutheastMissouriState.png";
import SouthernLogo from "../assets/College_Logos/Southern.png";
import SouthernIllinoisLogo from "../assets/College_Logos/SouthernIllinois.png";
import SouthernMissLogo from "../assets/College_Logos/SouthernMiss.png";
import SouthernUtahLogo from "../assets/College_Logos/SouthernUtah.png";
import StJohnsLogo from "../assets/College_Logos/St.Johns.png";
import StJohnsLogoLight from "../assets/College_Logos/St.JohnsLight.png";
import StanfordLogo from "../assets/College_Logos/Stanford.png";
import StBonaventureLogo from "../assets/College_Logos/StBonaventure.png";
import StBonaventureLogoLight from "../assets/College_Logos/StBonaventureLight.png";
import StetsonLogo from "../assets/College_Logos/Stetson.png";
import SyracuseLogo from "../assets/College_Logos/Syracuse.png";
import TennesseeStateLogo from "../assets/College_Logos/TennesseeState.png";
import TexasAMSALogo from "../assets/College_Logos/TexasA&MSA.png";
import TexasSouthernLogo from "../assets/College_Logos/TexasSouthern.png";
import TexasStLogo from "../assets/College_Logos/TexasSt.png";
import TexasTechLogo from "../assets/College_Logos/TexasTech.png";
import TheCitadelLogo from "../assets/College_Logos/TheCitadel.png";
import ToledoLogo from "../assets/College_Logos/Toledo.png";
import ToledoLogoLight from "../assets/College_Logos/ToledoLight.png";
import TowsonLogo from "../assets/College_Logos/Towson.png";
import UABLogo from "../assets/College_Logos/UAB.png";
import UAlbanyLogo from "../assets/College_Logos/UAlbany.png";
import UCLALogo from "../assets/College_Logos/UCLA.png";
import UCLALogoLight from "../assets/College_Logos/UCLALight.png";
import ULMLogo from "../assets/College_Logos/ULM.png";
import UmassLogo from "../assets/College_Logos/Umass.png";
import UMassLowellLogo from "../assets/College_Logos/UMassLowell.png";
import UMBCLogo from "../assets/College_Logos/UMBC.png";
import UNCGreensboroLogo from "../assets/College_Logos/UNCGreensboro.png";
import UtahLogoLight from "../assets/College_Logos/UtahLight.png";
import UtahStateLogoLight from "../assets/College_Logos/UtahStateLight.png";
import UTMartinLogo from "../assets/College_Logos/UTMartin.png";
import ValparaisoLogo from "../assets/College_Logos/Valparaiso.png";
import VCULogo from "../assets/College_Logos/VCU.png";
import VillanovaLogo from "../assets/College_Logos/Villanova.png";
import VMILogo from "../assets/College_Logos/VMI.png";
import WashingtonLogo from "../assets/College_Logos/Washington.png";
import WashingtonLogoLight from "../assets/College_Logos/WashingtonLight.png";
import WashingtonStateLogo from "../assets/College_Logos/WashingtonState.png";
import WashingtonStateLogoLight from "../assets/College_Logos/WashingtonStateLight.png";
import WCarolinaLogo from "../assets/College_Logos/WCarolina.png";
import WeberStateLogo from "../assets/College_Logos/WeberState.png";
import WichitaStLogo from "../assets/College_Logos/WichitaSt.png";
import WIllinoisLogo from "../assets/College_Logos/WIllinois.png";
import WinthropLogo from "../assets/College_Logos/Winthrop.png";
import WisconsinGreenBayLogo from "../assets/College_Logos/WisconsinGreenBay.png";
import WisconsinGreenBayLogoLight from "../assets/College_Logos/WisconsinGreenBayLight.png";
import WoffordLogo from "../assets/College_Logos/Wofford.png";
import XavierLogo from "../assets/College_Logos/Xavier.png";
import XavierLogoLight from "../assets/College_Logos/XavierLight.png";
import YaleLogo from "../assets/College_Logos/Yale.png";
import YoungstownStateLogo from "../assets/College_Logos/YoungstownState.png";

export const teams: CBBTeam[] = [
  {
    id: 1504,
    espnID: 242,
    name: "Rice",
    fullName: "Rice Owls",
    code: "RICE",
    color: "#d1d5d8",
    secondaryColor: "#003d7d",
    logo: RiceLogo,
    logoLight: RiceLogoLight,
  },

  {
    id: 2201,
    espnID: 98,
    name: "Western Kentucky",
    shortName: "W Kentucky",
    fullName: "Western Kentucky Hilltoppers",
    code: "WKU",
    color: "#F32026",
    secondaryColor: "#b3b5b8",
    logo: WesternKentuckyLogo,
  },
  {
    id: 1823,
    espnID: 2046,
    name: "Austin Peay",
    fullName: "Austin Peay Governors",
    code: "APSU",
    color: "#8e0b0b",
    secondaryColor: "null",
    logo: AustinPeayLogo,
  },
  {
    id: 2182,
    espnID: 2670,
    name: "VCU",
    fullName: "VCU Rams",
    shortName: "VCU",
    code: "VCU",
    color: "#ffaf00",
    secondaryColor: "#000000",
    logo: VCULogo,
  },
  {
    id: 2053,
    espnID: 77,
    name: "Northwestern",
    fullName: "Northwestern Wildcats",
    code: "NU",
    color: "#582c83",
    secondaryColor: "#ffffff",
    logo: NorthwesternLogo,
    location: "Evanston, IL",
    city: "Evanston",
    latitude: 42.063,
    longitude: -87.6922,
  },
  {
    id: 1904,
    espnID: 339,
    name: "Evansville",
    fullName: "Evansville Purple Aces",
    shortName: "Evansville",
    code: "EVAN",
    color: "#663399",
    secondaryColor: "#ef6f00",
    logo: EvansvilleLogo,
    location: "Evansville, IN",
    city: "Evansville",
    latitude: 37.9716,
    longitude: -87.5711,
  },
  {
    id: 195,
    espnID: 158,
    name: "Nebraska",
    fullName: "Nebraska Cornhuskers",
    code: "NEB",
    color: "#d00000",
    secondaryColor: "#ffffff",
    logo: NebraskaLogo,
    logoLight: NebraskaLogoLight,
    location: "Lincoln, NE",
    city: "Lincoln",
    latitude: 40.8206,
    longitude: -96.7056,
  },
  {
    id: 2171,
    espnID: 2439,
    name: "UNLV",
    fullName: "UNLV Rebels",
    code: "UNLV",
    color: "#b10202",
    secondaryColor: "#ffffff",
    logo: UNLVLogo,
    logoLight: UNLVLogoLight,
  },
  {
    id: 1943,
    espnID: 304,
    name: "Idaho State",
    fullName: "Idaho State Bengals",
    code: "IDST",
    color: "#ef8c00",
    secondaryColor: "#e9a126",
    logo: IdahoStateLogo,
  },
  {
    id: 2180,
    espnID: 328,
    name: "Utah State",
    fullName: "Utah State Aggies",
    code: "USU",
    color: "#00263a",
    secondaryColor: "#949ca1",
    logo: UtahStateLogo,
    logoLight: UtahStateLogoLight,
  },
  {
    id: 5875,
    espnID: 41,
    name: "UConn",
    fullName: "UConn Huskies",
    code: "CONN",
    color: "#0c2340",
    secondaryColor: "#f1f2f3",
    logo: UConnLogo,
  },
  {
    id: 1944,
    espnID: 356,
    name: "Illinois",
    fullName: "Illinois Fighting Illini",
    code: "ILL",
    color: "#ff5f05",
    secondaryColor: "#13294b",
    logo: IllinoisLogo,
    location: "Champaign, IL",
    city: "Champaign",
    latitude: 40.0999,
    longitude: -88.2354,
  },
  {
    id: 1506,
    espnID: 2751,
    name: "Wyoming",
    fullName: "Wyoming Cowboys",
    code: "WYO",
    color: "#492f24",
    secondaryColor: "#ffc425",
    logo: WyomingLogo,
    logoLight: WyomingLogoLight,
  },
  {
    id: 1914,
    espnID: 52,
    name: "Florida State",
    fullName: "Florida State Seminoles",
    code: "FSU",
    color: "#782f40",
    secondaryColor: "#ceb888",
    logo: FloridaStateLogo,
  },
  {
    id: 1891,
    espnID: 2184,
    name: "Duquesne",
    fullName: "Duquesne Dukes",
    code: "DUQ",
    color: "#002D62",
    secondaryColor: "#b90b2e",
    logo: DuquesneLogo,
    logoLight: DuquesneLogoLight,
  },
  {
    id: 230,
    espnID: 2226,
    name: "FAU",
    shortName: "FAU",
    fullName: "Florida Atlantic Owls",
    code: "FAU",
    color: "#00447c",
    secondaryColor: "#d31245",
    logo: FAULogo,
  },
  {
    id: 3429,
    espnID: 2429,
    name: "Charlotte",
    fullName: "Charlotte 49ers",
    code: "CLT",
    color: "#005035",
    secondaryColor: "#cfab7a",
    logo: CharlotteLogo,
    logoLight: CharlotteLogoLight,
  },
  {
    id: 190,
    espnID: 288,
    name: "Lipscomb",
    fullName: "Lipscomb Bisons",
    shortName: "Lipscomb",
    code: "LIP",
    color: "#20366C",
    secondaryColor: "#f6b734",
    logo: LipscombLogo,
  },
  {
    id: 1830,
    espnID: 2066,
    name: "Binghamton",
    fullName: "Binghamton Bearcats",
    shortName: "Binghamton",
    code: "BING",
    color: "#00614A",
    secondaryColor: "#f0f0f0",
    logo: BinghamtonLogo,
  },
  {
    id: 7597,
    espnID: 178,
    name: "RIT",
    fullName: "RIT Tigers",
    shortName: "RIT",
    code: "RIT",
    color: "#000000",
    secondaryColor: "#ff6b00",
    logo: RITLogo,
  },
  {
    id: 2093,
    espnID: 2520,
    name: "Rider",
    fullName: "Rider Broncs",
    shortName: "Rider",
    code: "RID",
    color: "#a80532",
    secondaryColor: "#ebebeb",
    logo: RiderLogo,
  },
  {
    id: 2375,
    espnID: 108942,
    name: "Carolina University",
    fullName: "Carolina University Bruins",
    shortName: "Carolina U",
    code: "CU",
    color: "#002868",
    secondaryColor: "#FFCA00",
    logo: CarolinaUniversityLogo,
  },
  {
    id: 6201,
    espnID: 108942,
    name: "Biblical Stud",
    fullName: "College Of Biblical Studies Ambassadors",
    shortName: "Biblical Stud",
    code: "CBS",
    color: "#00322D",
    secondaryColor: "#AF6528",
    logo: CollegeOfBiblicalStudiesLogo,
  },
  {
    id: 1878,
    espnID: 2154,
    name: "Coppin State",
    fullName: "Coppin State Eagles",
    shortName: "Coppin St",
    code: "COPP",
    color: "#2e3192",
    secondaryColor: "#ffd204",
    logo: CoppinStateLogo,
  },
  {
    id: 2039,
    espnID: 153,
    name: "North Carolina",
    fullName: "North Carolina Tar Heels",
    code: "UNC",
    color: "#7bafd4",
    secondaryColor: "#13294b",
    logo: UNCLogo,
  },
  {
    id: 1910,
    espnID: 50,
    name: "Florida A&M",
    fullName: "Florida A&M Rattlers",
    code: "FAMU",
    color: "#F89728",
    secondaryColor: "#00843d",
    logo: FAMULogo,
  },
  {
    id: 2035,
    espnID: 166,
    name: "New Mexico State",
    shortName: "New Mexico St",
    fullName: "New Mexico State Aggies",
    code: "NMSU",
    color: "#891216",
    secondaryColor: "#000000",
    logo: NewMexicoStateLogo,
  },
  {
    id: 2032,
    espnID: 2440,
    name: "Nevada",
    fullName: "Nevada Wolf Pack",
    code: "NEV",
    color: "#002d62",
    secondaryColor: "#ffffff",
    logo: NevadaLogo,
    logoLight: NevadaLogoLight,
  },
  {
    id: 2177,
    espnID: 2638,
    name: "UTEP",
    fullName: "UTEP Miners",
    code: "UTEP",
    color: "#ff8200",
    secondaryColor: "#041e42",
    logo: UTEPLogo,
    logoLight: UTEPLogoLight,
  },
  {
    id: 1496,
    espnID: 249,
    name: "North Texas",
    fullName: "North Texas Mean Green",
    code: "UNT",
    color: "#000",
    secondaryColor: "#00853E",
    logo: NorthTexasLogo,
  },
  {
    id: 1933,
    espnID: 62,
    name: "Hawai'i",
    fullName: "Hawai'i Rainbow Warriors",
    code: "HAW",
    color: "#003420",
    secondaryColor: "#ffffff",
    logo: HawaiiLogo,
  },
  {
    id: 2185,
    espnID: 238,
    name: "Vanderbilt",
    fullName: "Vanderbilt Commodores",
    code: "VAN",
    color: "#000000",
    secondaryColor: "#CFAE70",
    logo: VanderbiltLogo,
    location: "Nashville, TN",
    city: "Nashville",
    latitude: 36.1429,
    longitude: -86.8074,
  },
  {
    id: 2060,
    espnID: 197,
    name: "Oklahoma State",
    fullName: "Oklahoma State Cowboys",
    code: "OKST",
    color: "#000000",
    secondaryColor: "#dddddd",
    logo: OKStateLogo,
  },
  {
    id: 2201,
    espnID: 2117,
    name: "Central Michigan",
    fullName: "Central Michigan Chippewas",
    code: "CMU",
    color: "#6a0032",
    secondaryColor: "#ffc82e",
    logo: CentralMichiganLogo,
    logoLight: CentralMichiganLogoLight,
  },
  {
    id: 2079,
    espnID: 221,
    name: "Pittsburgh",
    fullName: "Pittsburgh Panthers",
    code: "PITT",
    color: "#003263",
    secondaryColor: "#231f20",
    logo: PittsburghLogo,
    logoLight: PittsburghLogoLight,
  },
  {
    id: 223,
    espnID: 277,
    name: "West Virginia",
    fullName: "West Virginia Mountaineers",
    code: "WVU",
    color: "#002855",
    secondaryColor: "#eaaa00",
    logo: WestVirginiaLogo,
    logoLight: WestVirginiaLogoLight,
  },
  {
    id: 2036,
    espnID: 315,
    name: "Niagara",
    fullName: "Niagara Purple Eagles",
    shortName: "Niagara",
    code: "NIA",
    color: "#69207E",
    secondaryColor: "#f0f0f0",
    logo: NiagaraLogo,
  },
  {
    id: 2192,
    espnID: 154,
    name: "Wake Forest",
    fullName: "Wake Forest Demon Deacons",
    code: "WAKE",
    color: "#000000",
    secondaryColor: "#ceb888",
    logo: WakeForestLogo,
    logoLight: WakeForestLogoLight,
  },
  {
    id: 2183,
    espnID: 2678,
    name: "VMI",
    fullName: "VMI Keydets",
    code: "VMI",
    color: "#ae122a",
    secondaryColor: "#ffd619",
    logo: VMILogo,
  },
  {
    id: 1805,
    espnID: 2006,
    name: "Akron",
    fullName: "Akron Zips",
    code: "AKR",
    color: "#00285e",
    secondaryColor: "#84754e",
    logo: AkronLogo,
  },
  {
    id: 201,
    espnID: "2598",
    name: "St. Francis (PA)",
    code: "SFPA",
    logo: SaintFrancisLogo,
  },
  {
    id: 2141,
    espnID: 2633,
    name: "Tennessee",
    fullName: "Tennessee Volunteers",
    code: "TENN",
    color: "#ff8200",
    secondaryColor: "#58595b",
    logo: TennesseeLogo,
    logoLight: TennesseeLogoLight,
    location: "Knoxville, TN",
    city: "Knoxville",
    latitude: 35.9552,
    longitude: -83.925,
  },
  {
    id: 1824,
    espnID: 2050,
    name: "Ball State",
    code: "BALL",
    logo: BallStateLogo,
  },
  {
    id: 2165,
    espnID: 2116,
    name: "UCF",
    fullName: "UCF Knights",
    code: "UCF",
    color: "#000000",
    secondaryColor: "#b4a269",
    logo: UCFLogo,
    location: "Orlando, FL",
    city: "Orlando",
    latitude: 28.6077,
    longitude: 81.1952,
  },
  {
    id: 2117,
    espnID: 2569,
    name: "South Carolina St",
    fullName: "South Carolina State Bulldogs",
    code: "SCST",
    color: "#7d1315",
    secondaryColor: "#104897",
    logo: SouthCarolinaStateLogo,
  },
  {
    id: 7588,
    espnID: 2441,
    name: "New Haven",
    fullName: "New Haven Chargers",
    shortName: "New Haven",
    code: "NHVN",
    color: "#041e42",
    secondaryColor: "#ffc425",
    logo: NewHavenLogo,
  },
  {
    id: 231,
    espnID: 2229,
    name: "FIU",
    fullName: "Florida International Panthers",
    code: "FIU",
    color: "#001538",
    secondaryColor: "#c5960c",
    logo: FIULogo,
    logoLight: FIULogoLight,
  },
  {
    id: 1843,
    espnID: 2803,
    name: "Bryant",
    fullName: "Bryant Bulldogs",
    code: "BRY",
    color: "#000000",
    secondaryColor: "#9f8343",
    logo: BryantLogo,
  },
  {
    id: 204,
    espnID: 2649,
    name: "Toledo",
    fullName: "Toledo Rockets",
    code: "TOL",
    color: "#0a2240",
    secondaryColor: "#ffcd00",
    logo: ToledoLogo,
    logoLight: ToledoLogoLight,
  },
  {
    id: 1966,
    espnID: 2341,
    name: "LIU",
    code: "LIU",
    color: "#69B3E7",
    secondaryColor: "#FFC72C",
    logo: LIULogo,
  },
  {
    id: 2085,
    espnID: 2509,
    name: "Purdue",
    fullName: "Purdue Boilermakers",
    code: "PUR",
    color: "#000000",
    secondaryColor: "#cfb991",
    logo: PurdueLogo,
    location: "West Lafayette, IN",
    city: "West Lafayette",
    latitude: 40.427,
    longitude: -86.9188,
  },
  {
    id: 2073,
    espnID: 213,
    name: "Penn State",
    fullName: "Penn State Nittany Lions",
    code: "PSU",
    color: "#00265D",
    secondaryColor: "#002e5c",
    logo: PennStateLogo,
    location: "University Park, PA",
    city: "University Park",
    latitude: 40.8128,
    longitude: -77.856,
  },
  {
    id: 2048,
    espnID: 2459,
    name: "Northern Illinois",
    fullName: "Northern Illinois Huskies",
    code: "NIU",
    color: "#F1122C",
    secondaryColor: "#cc0000",
    logo: NorthernIllinoisLogo,
  },
  {
    id: 1894,
    espnID: 2197,
    name: "Eastern Illinois",
    fullName: "Eastern Illinois Panthers",
    code: "EIU",
    color: "#000000",
    secondaryColor: "#bebab9",
    logo: EasternIllinoisLogo,
  },
  {
    id: 221,
    espnID: 5,
    name: "UAB",
    fullName: "UAB Blazers",
    code: "UAB",
    color: "#003b28",
    secondaryColor: "#ffc845",
    logo: UABLogo,
  },
  {
    id: 1806,
    espnID: 2010,
    name: "Alabama A&M",
    fullName: "Alabama A&M Bulldogs",
    code: "AAMU",
    color: "#790000",
    secondaryColor: "#ffffff",
    logo: AlabamaAMLogo,
    logoLight: AlabamaAMLogoLight,
  },
  {
    id: 2006,
    espnID: 142,
    name: "Missouri",
    fullName: "Missouri Tigers",
    code: "MIZ",
    color: "#f1b82d",
    secondaryColor: "#000000",
    logo: MissouriLogo,
    city: "Columbia",
    latitude: 38.9354,
    longitude: -92.332,
  },
  {
    id: 1976,
    espnID: 2348,
    name: "Louisiana Tech",
    shortName: "LA Tech",
    fullName: "Louisiana Tech Bulldogs",
    code: "LT",
    color: "#002d65",
    secondaryColor: "#d3313a",
    logo: LATechLogo,
  },
  {
    id: 2003,
    espnID: 135,
    name: "Minnesota",
    fullName: "Minnesota Golden Gophers",
    code: "MINN",
    color: "#5e0a2f",
    secondaryColor: "#fab41c",
    logo: MinnesotaLogo,
    logoLight: MinnesotaLogoLight,
    location: "Minneapolis, MN",
    city: "Minneapolis",
    latitude: 44.976,
    longitude: -93.2248,
  },
  {
    id: 1816,
    espnID: 9,
    name: "Arizona State",
    fullName: "Arizona State Sun Devils",
    code: "ASU",
    color: "#8e0c3a",
    secondaryColor: "#ffc72c",
    logo: ArizonaStateLogo,
  },
  {
    id: 2046,
    espnID: 2464,
    name: "Northern Arizona",
    fullName: "Northern Arizona Lumberjacks",
    code: "NAU",
    color: "#003976",
    secondaryColor: "#1b3069",
    logo: NorthernArizonaLogo,
    logoLight: NorthernArizonaLogoLight,
  },
  {
    id: 1919,
    espnID: 278,
    name: "Fresno State",
    fullName: "Fresno State Bulldogs",
    code: "FRES",
    color: "#c41230",
    secondaryColor: "#13284c",
    logo: FresnoStLogo,
  },
  {
    id: 1847,
    espnID: 13,
    name: "Cal Poly",
    fullName: "Cal Poly Mustangs",
    code: "CP",
    color: "#1E4D2B",
    secondaryColor: "#eed897",
    logo: CalPolyLogo,
  },
  {
    id: 2110,
    espnID: 23,
    name: "San José State",
    fullName: "San José State Spartans",
    code: "SJSU",
    color: "#005893",
    secondaryColor: "#fdba31",
    logo: SanJoseStateLogo,
  },
  {
    id: 1995,
    espnID: 127,
    name: "Michigan State",
    fullName: "Michigan State Spartans",
    code: "MSU",
    color: "#18453b",
    secondaryColor: "#ffffff",
    logo: MichiganStateLogo,
    logoLight: MichiganStateLogoLight,
    location: "East Lansing, MI",
    city: "East Lansing",
    latitude: 42.7284,
    longitude: -84.4849,
  },
  {
    id: 2202,
    espnID: 2711,
    name: "Western Michigan",
    fullName: "Western Michigan Broncos",
    code: "WMU",
    color: "#532e1f",
    secondaryColor: "#8b7f79",
    logo: WesternMichiganLogo,
  },
  {
    id: 1896,
    espnID: 2199,
    name: "Eastern Michigan",
    fullName: "Eastern Michigan Eagles",
    code: "EMU",
    color: "#00331b",
    secondaryColor: "#f0f0f0",
    logo: EasternMichiganLogo,
    logoLight: EasternMichiganLogoLight,
  },
  {
    id: 1895,
    espnID: 2198,
    name: "Eastern Kentucky",
    fullName: "Eastern Kentucky Colonels",
    code: "EKU",
    color: "#660819",
    secondaryColor: "#f0f0f0",
    logo: EasternKentuckyLogo,
    logoLight: EasternKentuckyLogoLight,
  },
  {
    id: 2061,
    espnID: 295,
    name: "Old Dominion",
    fullName: "Old Dominion Monarchs",
    code: "ODU",
    color: "#00507d",
    secondaryColor: "#a1d2f1",
    logo: ODULogo,
  },
  {
    id: 2190,
    espnID: 259,
    name: "Virginia Tech",
    fullName: "Virginia Tech Hokies",
    code: "VT",
    color: "#630031",
    secondaryColor: "#cf4520",
    logo: VirginiaTechLogo,
    logoLight: VirginiaTechLogoLight,
  },
  {
    id: 2209,
    espnID: 2729,
    name: "William & Mary",
    fullName: "William & Mary Tribe",
    code: "W&M",
    color: "#103217",
    secondaryColor: "#f6b220",
    logo: "https://media.api-sports.io/american-football/teams/98.png",
  },
  {
    id: 1983,
    espnID: 269,
    name: "Marquette",
    fullName: "Marquette Golden Eagles",
    shortName: "Marquette",
    code: "MARQ",
    color: "#003366",
    secondaryColor: "#ffcc00",
    logo: MarquetteLogo,
  },
  {
    id: 214,
    espnID: 2253,
    name: "Grand Canyon",
    fullName: "Grand Canyon Lopes",
    shortName: "Grand Canyon",
    code: "GCU",
    color: "#522398",
    secondaryColor: "#ffffff",
    logo: GrandCanyonLogo,
    logoLight: GrandCanyonLogoLight,
  },
  {
    id: 191,
    espnID: 2350,
    name: "Loyola Chicago",
    fullName: "Loyola Chicago Ramblers",
    shortName: "Loyola Chicago",
    code: "LUC",
    color: "#9d1244",
    secondaryColor: "#eaaa00",
    logo: LoyolaChicagoLogo,
  },
  {
    id: 2001,
    espnID: 2397,
    name: "Milligan",
    fullName: "Milligan Buffaloes",
    shortName: "Milligan",
    code: "MILLI",
    color: "#000000",
    logo: MilliganLogo,
  },
  {
    id: 1503,
    espnID: 2352,
    name: "Loyola Maryland",
    fullName: "Loyola Maryland Greyhounds",
    shortName: "Loyola MD",
    code: "L-MD",
    color: "#76a7a0",
    secondaryColor: "#c9cbca",
    logo: LoyolaMarylandLogo,
  },
  {
    id: 1499,
    espnID: 2244,
    name: "George Mason",
    fullName: "George Mason Patriots",
    shortName: "George Mason",
    code: "GMU",
    color: "#016600",
    secondaryColor: "#ecb010",
    logo: GeorgeMasonLogo,
  },
  {
    id: 1890,
    espnID: 150,
    name: "Duke",
    fullName: "Duke Blue Devils",
    code: "DUKE",
    color: "#013088",
    secondaryColor: "#ffffff",
    logo: DukeLogo,
    logoLight: DukeLogoLight,
  },

  {
    id: 2130,
    espnID: 2608,
    name: "Saint Mary's",
    fullName: "Saint Mary's Gaels",
    shortName: "Saint Mary's",
    code: "SMC",
    color: "#d80024",
    secondaryColor: "#003057",
    logo: SaintMaryLogo,
    logoLight: SaintMaryLogoLight,
  },
  {
    id: 2140,
    espnID: 218,
    name: "Temple",
    fullName: "Temple Owls",
    code: "TEM",
    color: "#A80532",
    secondaryColor: "#a7a9ac",
    logo: TempleLogo,
    logoLight: TempleLogoLight,
  },
  {
    id: 1959,
    espnID: 2305,
    name: "Kansas",
    fullName: "Kansas Jayhawks",
    code: "KU",
    color: "#0051ba",
    secondaryColor: "#e8000d",
    logo: KansasLogo,
  },
  {
    id: 2143,
    espnID: 2635,
    name: "Tennessee Tech",
    fullName: "Tennessee Tech Golden Eagles",
    code: "TNTC",
    color: "#5A4099",
    secondaryColor: "#ffde00",
    logo: TennesseeTechLogo,
  },
  {
    id: 189,
    espnID: 84,
    name: "Indiana",
    fullName: "Indiana Hoosiers",
    code: "IU",
    color: "#990000",
    secondaryColor: "#edebeb",
    logo: IndianaLogo,
    logoLight: IndianaLogoLight,
    coach: "Curt Cignetti",
    location: "Bloomington, IN",
    city: "Bloomington",
    venue: "Memorial Stadium",
    address: "701 E 17th St, Bloomington, IN 47408",
    venueCapacity: "52,626",
    established: 1887,
    latitude: 39.1807,
    longitude: -86.5256,
  },
  {
    id: 181,
    espnID: 38,
    name: "Colorado",
    fullName: "Colorado Buffaloes",
    code: "COLO",
    color: "#000000",
    secondaryColor: "#cfb87c",
    logo: ColoradoLogo,
  },
  {
    id: 202,
    espnID: 2628,
    name: "TCU",
    fullName: "TCU Horned Frogs",
    code: "TCU",
    color: "#4d1979",
    secondaryColor: "#f1f2f3",
    logo: TCULogo,
    logoLight: TCULogoLight,
  },
  {
    id: 176,
    espnID: 333,
    name: "Alabama",
    fullName: "Alabama Crimson Tide",
    code: "ALA",
    color: "#9e1632",
    secondaryColor: "#ffffff",
    logo: AlabamaLogo,
    logoLight: AlabamaLogoLight,
    location: "Tuscaloosa, AL",
    city: "Tuscaloosa",
    latitude: 33.2103,
    longitude: -87.5659,
  },
  {
    id: 2058,
    espnID: 194,
    name: "Ohio State",
    code: "OSU",
    color: "#ce1141",
    secondaryColor: "#505056",
    logo: OhioStLogo,
    logoLight: OhioStLogoLight,
    location: "Columbus, OH",
    city: "Columbus",
    latitude: 40.0017,
    longitude: -83.0197,
  },
  {
    id: 2055,
    espnID: 87,
    name: "Notre Dame",
    code: "ND",
    color: "#0c2340",
    secondaryColor: "#c99700",
    logo: NotreDameLogo,
    logoLight: NotreDameLogoLight,
  },
  {
    id: 1924,
    espnID: 61,
    name: "Georgia",
    fullName: "Georgia Bulldogs",
    code: "UGA",
    color: "#ba0c2f",
    secondaryColor: "#ffffff",
    logo: GeorgiaLogo,
    location: "Athens, GA",
    city: "Athens",
    latitude: 33.948,
    longitude: -83.3773,
  },
  {
    id: 2065,
    espnID: 2483,
    name: "Oregon",
    fullName: "Oregon Ducks",
    code: "ORE",
    color: "#007030",
    secondaryColor: "#fee11a",
    logo: OregonLogo,
    logoLight: OregonLogoLight,
    location: "Eugene, OR",
    city: "Eugene",
    established: 1894,
    latitude: 44.0582,
    longitude: -123.0687,
  },
  {
    id: 2144,
    espnID: 245,
    name: "Texas A&M",
    fullName: "Texas A&M Aggies",
    code: "TA&M",
    color: "#500000",
    secondaryColor: "#ffffff",
    logo: TexasAMLogo,
    logoLight: TexasAMLogoLight,
    location: "College Station, TX",
    city: "College Station",
    latitude: 30.6105,
    longitude: -96.3398,
  },
  {
    id: 1909,
    espnID: 57,
    name: "Florida",
    fullName: "Florida Gators",
    code: "FLA",
    color: "#0021a5",
    secondaryColor: "#fa4616",
    logo: FloridaLogo,
    location: "Gainesville, FL",
    city: "Gainesville",
    latitude: 29.652,
    longitude: -82.325,
    championships: [2006, 2007, 2025],
  },
  {
    id: 2181,
    espnID: 254,
    name: "Utah",
    fullName: "Utah Utes",
    code: "UTAH",
    color: "#ea002a",
    secondaryColor: "#ffffff",
    logo: UtahLogo,
    logoLight: UtahLogoLight,
  },
  {
    id: 1994,
    espnID: 130,
    name: "Michigan",
    fullName: "Michigan Wolverines",
    code: "MICH",
    color: "#00274c",
    secondaryColor: "#ffcb05",
    logo: MichiganLogo,

    location: "Ann Arbor, MI",
    city: "Ann Arbor",
    latitude: 42.2658,
    longitude: -83.7487,
  },
  {
    id: 1870,
    espnID: 36,
    name: "Colorado State",
    fullName: "Colorado State Rams",
    code: "CSU",
    color: "#1e4d2b",
    secondaryColor: "#c8c372",
    logo: ColoradoStateLogo,
  },
  {
    id: 2059,
    espnID: 201,
    name: "Oklahoma",
    fullName: "Oklahoma Sooners",
    code: "OU",
    color: "#a32036",
    secondaryColor: "#ffffff",
    logo: OklahomaLogo,
    logoLight: OklahomaLogoLight,
    location: "Norman, OK",
    city: "Norman",
    latitude: 35.2059,
    longitude: -97.4421,
  },
  {
    id: 1825,
    espnID: 239,
    name: "Baylor",
    fullName: "Baylor Bears",
    code: "BAY",
    color: "#154734",
    secondaryColor: "#ffb81c",
    logo: BaylorLogo,
    logoLight: BaylorLogoLight,
  },
  {
    id: 1892,
    espnID: 151,
    name: "East Carolina",
    fullName: "East Carolina Pirates",
    code: "ECU",
    color: "#4b1869",
    secondaryColor: "#f0907b",
    logo: ECULogo,
  },
  {
    id: 194,
    espnID: 152,
    name: "NC State",
    fullName: "NC State Wolfpack",
    code: "NCSU",
    color: "#cc0000",
    secondaryColor: "#ffffff",
    logo: NCStateLogo,
  },
  {
    id: 2172,
    espnID: 30,
    name: "USC",
    fullName: "USC Trojans",
    code: "USC",
    color: "#9e2237",
    secondaryColor: "#ffcc00",
    logo: USCLogo,
    location: "Los Angeles, CA",
    city: "Los Angeles",
    latitude: 34.0141,
    longitude: -118.2879,
  },
  {
    id: 1993,
    espnID: 2390,
    name: "Miami",
    fullName: "Miami Hurricanes",
    code: "MIA",
    color: "#005030",
    secondaryColor: "#f47321",
    logo: MiamiLogo,
    location: "Miami Gardens, FL",
    city: "Miami",
    latitude: 25.958,
    longitude: -80.2389,
  },

  {
    id: 1829,
    espnID: 2065,
    name: "Bethune-Cookman",
    fullName: "Bethune-Cookman Wildcats",
    code: "BCU",
    color: "#7b1831",
    secondaryColor: "#e9aa12",
    logo: BethuneCookmanLogo,
  },
  {
    id: 1991,
    espnID: 2379,
    name: "Md.-East. Shore",
    shortName: "MD East Shore",
    fullName: "Maryland Eastern Shore Hawks",
    code: "UMES",
    color: "#5c2301",
    secondaryColor: "#b5b7ba",
    logo: MarylandEasternShoreLogo,
  },
  {
    id: 2214,
    espnID: 275,
    name: "Wisconsin",
    fullName: "Wisconsin Badgers",
    code: "WIS",
    color: "#c4012f",
    secondaryColor: "#ffffff",
    logo: WisconsinLogo,
    location: "Madison, WI",
    city: "Madison",
    latitude: 43.0699,
    longitude: -89.4127,
  },
  {
    id: 1945,
    espnID: 2287,
    name: "Illinois State",
    fullName: "Illinois State Redbirds",
    code: "ILST",
    color: "#CE1126",
    secondaryColor: "#ffe716",
    logo: IllinoisStateLogo,
  },
  {
    id: 177,
    espnID: 8,
    name: "Arkansas",
    fullName: "Arkansas Razorbacks",
    code: "ARK",
    color: "#a41f35",
    secondaryColor: "#ffffff",
    logo: ArkansasLogo,
    logoLight: ArkansasLogoLight,
    coach: "Vacant",
    location: "Fayetteville, AR",
    city: "Fayetteville",
    latitude: 36.0687,
    longitude: -94.1788,
  },
  {
    id: 6646,
    espnID: 294,
    name: "Jacksonville",
    fullName: "Jacksonville Dolphins",
    code: "JAX",
    color: "#00523e",
    secondaryColor: "#ffffff",
    logo: JacksonvilleLogo,
    logoLight: JacksonvilleLogoLight,
  },
  {
    id: 1865,
    espnID: 2132,
    name: "Cincinnati",
    fullName: "Cincinnati Bearcats",
    code: "CIN",
    color: "#000000",
    secondaryColor: "#717073",
    logo: CincinnatiLogo,
    logoLight: CincinnatiLogoLight,
  },
  {
    id: 1964,
    espnID: 96,
    name: "Kentucky",
    fullName: "Kentucky Wildcats",
    code: "UK",
    color: "#0033a0",
    secondaryColor: "#ffffff",
    logo: KentuckyLogo,
    logoLight: KentuckyLogoLight,
    coach: "Mark Stoops",
    location: "Lexington, KY",
    city: "Lexington",
    venue: "Kroger Field",
    address: "1540 University Dr, Lexington, KY 40506",
    venueCapacity: "61,000",
    established: 1881,
    latitude: 38.0221,
    longitude: -84.5058,
  },
  {
    id: 1495,
    espnID: 193,
    name: "Miami (OH)",
    fullName: "Miami (OH) RedHawks",
    code: "M-OH",
    color: "#a4000c",
    secondaryColor: "#f0f0f0",
    logo: MiamiOHLogo,
  },
  {
    id: 2062,
    espnID: 145,
    name: "Ole Miss",
    fullName: "Ole Miss Rebels",
    code: "MISS",
    color: "#13294b",
    secondaryColor: "#c8102e",
    logo: OleMissLogo,
    logoLight: OleMissLogoLight,
    location: "Oxford, MS",
    city: "Oxford",
    latitude: 34.3631,
    longitude: -89.5365,
  },
  {
    id: 2157,
    espnID: 2653,
    name: "Troy",
    fullName: "Troy Trojans",
    code: "TROY",
    color: "#AE0210",
    secondaryColor: "#88898c",
    logo: TroyLogo,
  },
  {
    id: 2178,
    espnID: 2636,
    name: "UTSA",
    fullName: "UTSA Roadrunners",
    code: "UTSA",
    color: "#002A5C",
    secondaryColor: "#f47321",
    logo: UTSALogo,
  },
  {
    id: 1938,
    espnID: 248,
    name: "Houston",
    fullName: "Houston Cougars",
    code: "HOU",
    color: "#c92a39",
    secondaryColor: "#ffffff",
    logo: HoustonLogo,
  },
  {
    id: 218,
    espnID: 58,
    name: "South Florida",
    fullName: "South Florida Bulls",
    code: "USF",
    color: "#004A36",
    secondaryColor: "#231f20",
    logo: USFLogo,
  },
  {
    id: 1841,
    espnID: 252,
    name: "BYU",
    fullName: "BYU Cougars",
    code: "BYU",
    color: "#003da5",
    secondaryColor: "#ffffff",
    logo: BYULogo,
    logoLight: BYULogoLight,
  },
  {
    id: 1856,
    espnID: 2115,
    name: "Central Connecticut",
    fullName: "Central Connecticut Blue Devils",
    code: "CCSU",
    color: "#1B49A2",
    secondaryColor: "#d1d5d8",
    logo: CentralConnecticutLogo,
  },
  {
    id: 1950,
    espnID: 2294,
    name: "Iowa",
    fullName: "Iowa Hawkeyes",
    code: "IOWA",
    color: "#000000",
    secondaryColor: "#fcd116",
    logo: IowaLogo,
    logoLight: IowaLogoLight,
    location: "Iowa City, IA",
    city: "Iowa City",
    latitude: 41.6583,
    longitude: -91.5519,
  },
  {
    id: 200,
    espnID: 2571,
    name: "South Dakota State",
    fullName: "South Dakota State Jackrabbits",
    code: "SDST",
    color: "#0033a0",
    secondaryColor: "#ffd100",
    logo: SouthDakotaStateLogo,
  },
  {
    id: 1985,
    espnID: 120,
    name: "Maryland",
    fullName: "Maryland Terrapins",
    code: "MD",
    color: "#D5002B",
    secondaryColor: "#ffcd00",
    logo: MarylandLogo,
    location: "College Park, MD",
    city: "College Park",
    latitude: 38.9908,
    longitude: -76.9447,
  },
  {
    id: 1845,
    espnID: 2084,
    name: "Buffalo",
    fullName: "Buffalo Bulls",
    code: "BUF",
    color: "#041A9B",
    secondaryColor: "#ebebeb",
    logo: BuffaloLogo,
  },
  {
    id: 1836,
    espnID: 103,
    name: "Boston College",
    fullName: "Boston College Eagles",
    code: "BC",
    color: "#8c2232",
    secondaryColor: "#dbcca6",
    logo: BostonCollegeLogo,
    logoLight: BostonCollegeLogoLight,
  },
  {
    id: 2096,
    espnID: 164,
    name: "Rutgers",
    fullName: "Rutgers Scarlet Knights",
    code: "RUTG",
    color: "#d21034",
    secondaryColor: "#ffffff",
    logo: RutgersLogo,
    location: "Piscataway, NJ",
    city: "Piscataway",
    latitude: 40.5137,
    longitude: -74.4643,
  },
  {
    id: 1813,
    espnID: 2026,
    name: "App State",
    fullName: "App State Mountaineers",
    code: "APP",
    color: "#000000",
    secondaryColor: "#ffcd00",
    logo: AppalachianStateLogo,
  },
  {
    id: 2029,
    espnID: 2426,
    name: "Navy",
    fullName: "Navy Midshipmen",
    code: "NAVY",
    color: "#00225b",
    secondaryColor: "#b5a67c",
    logo: NavyLogo,
  },
  {
    id: 1884,
    espnID: 48,
    name: "Delaware",
    fullName: "Delaware Blue Hens",
    code: "DEL",
    color: "#033594",
    secondaryColor: "#e8ce31",
    logo: DelawareLogo,
  },
  {
    id: 2189,
    espnID: 258,
    name: "Virginia",
    fullName: "Virginia Cavaliers",
    code: "UVA",
    color: "#232d4b",
    secondaryColor: "#f84c1e",
    logo: VirginiaLogo,
    logoLight: VirginiaLogoLight,
  },
  {
    id: 2092,
    espnID: 257,
    name: "Richmond",
    fullName: "Richmond Spiders",
    code: "RICH",
    color: "#9e0712",
    secondaryColor: "#b90b2e",
    logo: RichmondLogo,
    logoLight: RichmondLogoLight,
  },
  {
    id: 1804,
    espnID: 2005,
    name: "Air Force",
    fullName: "Air Force Falcons",
    code: "AF",
    color: "#003594",
    logo: AirForceLogo,
    logoLight: AirForceLogoLight,
  },
  {
    id: 2049,
    espnID: 2460,
    name: "Northern Iowa",
    fullName: "Northern Iowa Panthers",
    code: "UNI",
    color: "#473282",
    secondaryColor: "#ffffff",
    logo: "https://media.api-sports.io/american-football/teams/150.png",
  },
  {
    id: 1951,
    espnID: 66,
    name: "Iowa State",
    fullName: "Iowa State Cyclones",
    code: "ISU",
    color: "#822433",
    secondaryColor: "#fdca2f",
    logo: IowaStateLogo,
  },
  {
    id: 3361,
    espnID: 2546,
    name: "SE Missouri State",
    fullName: "Southeast Missouri State Redhawks",
    code: "SEMO",
    color: "#c8102e",
    secondaryColor: "#000000",
    logo: SoutheastMissouriStateLogo,
  },
  {
    id: 2166,
    espnID: 26,
    name: "UCLA",
    fullName: "UCLA Bruins",
    code: "UCLA",
    color: "#2774ae",
    secondaryColor: "#f2a900",
    logo: UCLALogo,
    logoLight: UCLALogoLight,
    coach: "Vacant",
    location: "Pasadena, CA",
    city: "Pasadena",
    venue: "Rose Bowl",
    address: "1001 Rose Bowl Dr, Pasadena, CA 91103",
    venueCapacity: "88,565",
    established: 1919,
    latitude: 34.1613,
    longitude: -118.1675,
  },
  {
    id: 1838,
    espnID: 189,
    name: "Bowling Green",
    fullName: "Bowling Green Falcons",
    code: "BGSU",
    color: "#2b1000",
    secondaryColor: "#492000",
    logo: BowlingGreenLogo,
  },
  {
    id: 2108,
    espnID: 21,
    name: "San Diego State",
    fullName: "San Diego State Aztecs",
    code: "SDSU",
    color: "#c41230",
    secondaryColor: "#000000",
    logo: SanDiegoStLogo,
  },
  {
    id: 1815,
    espnID: 12,
    name: "Arizona",
    fullName: "Arizona Wildcats",
    code: "ARIZ",
    color: "#0c234b",
    secondaryColor: "#ab0520",
    logo: ArizonaLogo,
  },
  {
    id: 2041,
    espnID: 155,
    name: "North Dakota",
    fullName: "North Dakota Fighting Hawks",
    code: "UND",
    color: "#00A26B",
    secondaryColor: "#c2c3c0",
    logo: NorthDakotaLogo,
  },
  {
    id: 2043,
    espnID: 2454,
    name: "North Florida",
    fullName: "North Florida Ospreys",
    code: "UNF",
    color: "#004B8D",
    secondaryColor: "#babcbe",
    logo: NorthFloridaLogo,
  },
  {
    id: 237,
    espnID: 276,
    name: "Marshall",
    fullName: "Marshall Thundering Herd",
    code: "MRSH",
    color: "#00ae42",
    secondaryColor: "#be854c",
    logo: MarshallLogo,
  },
  {
    id: 196,
    espnID: 2450,
    name: "Norfolk State",
    fullName: "Norfolk State Spartans",
    code: "NORF",
    color: "#0c8968",
    secondaryColor: "#fdb813",
    logo: NorfolkStLogo,
  },
  {
    id: 2159,
    espnID: 202,
    name: "Tulsa",
    fullName: "Tulsa Golden Hurricane",
    code: "TLSA",
    color: "#003595",
    secondaryColor: "#d0b787",
    logo: TulsaLogo,
    logoLight: TulsaLogoLight,
  },
  {
    id: 1850,
    espnID: 25,
    name: "California",
    fullName: "California Golden Bears",
    code: "CAL",
    color: "#031522",
    secondaryColor: "#ffc423",
    logo: CaliforniaLogo,
    logoLight: CaliforniaLogoLight,
  },
  {
    id: 2161,
    espnID: 302,
    name: "UC Davis",
    fullName: "UC Davis Aggies",
    code: "UCD",
    color: "#002855",
    secondaryColor: "#c3c4c6",
    logo: "https://media.api-sports.io/american-football/teams/162.png",
  },
  {
    id: 2115,
    espnID: 6,
    name: "South Alabama",
    fullName: "South Alabama Jaguars",
    code: "USA",
    color: "#003E7E",
    secondaryColor: "#fff",
    logo: SouthAlabamaLogo,
  },
  {
    id: 188,
    espnID: 2275,
    name: "Hofstra",
    fullName: "Hofstra Pride",
    shortName: "Hofstra",
    code: "HOF",
    color: "#00337c",
    secondaryColor: "#f6c934",
    logo: HofstraLogo,
    logoLight: HofstraLogoLight,
  },
  {
    id: 2037,
    espnID: 2447,
    name: "Nicholls",
    fullName: "Nicholls Colonels",
    code: "NICH",
    color: "#C41230",
    secondaryColor: "#f0f0f0",
    logo: NichollsLogo,
  },
  {
    id: 247,
    espnID: 326,
    name: "Texas State",
    fullName: "Texas State Bobcats",
    code: "TXST",
    color: "#4e1719",
    secondaryColor: "#b4975a",
    logo: TexasStLogo,
  },
  {
    id: 1501,
    espnID: 290,
    name: "Georgia Southern",
    fullName: "Georgia Southern Eagles",
    code: "GASO",
    color: "#003775",
    secondaryColor: "#f0f0f0",
    logo: GeorgiaSouthernLogo,
  },
  {
    id: 2018,
    espnID: 2415,
    name: "Morgan State",
    fullName: "Morgan State Bears",
    code: "MORG",
    color: "#014786",
    secondaryColor: "#f47937",
    logo: MorganStateLogo,
  },
  {
    id: 2057,
    espnID: 195,
    name: "Ohio",
    fullName: "Ohio Bobcats",
    code: "OHIO",
    color: "#295A29",
    secondaryColor: "#e4bb85",
    logo: OhioLogo,
  },
  {
    id: 1954,
    espnID: 256,
    name: "JMU",
    fullName: "James Madison Dukes",
    code: "JMU",
    color: "#450084",
    secondaryColor: "#b5a068",
    logo: JamesMadisonLogo,
  },
  {
    id: 1999,
    espnID: 2393,
    name: "Middle Tennessee",
    shortName: "Mid Tenn",
    fullName: "Middle Tennessee Blue Raiders",
    code: "MTSU",
    color: "#006db6",
    secondaryColor: "#ffffff",
    logo: MiddleTennesseeLogo,
  },
  {
    id: 1822,
    espnID: 2,
    name: "Auburn",
    fullName: "Auburn Tigers",
    code: "AUB",
    color: "#002b5c",
    secondaryColor: "#f26522",
    logo: AuburnLogo,
    logoLight: AuburnLogoLight,
    location: "Auburn, AL",
    city: "Auburn",
    latitude: 32.6025,
    longitude: -85.4893,
  },
  {
    id: 1494,
    espnID: 2382,
    name: "Mercer",
    fullName: "Mercer Bears",
    code: "MER",
    color: "#ff7f29",
    secondaryColor: "#080808",
    logo: MercerLogo,
  },
  {
    id: 1901,
    espnID: 2210,
    name: "Elon",
    fullName: "Elon Phoenix",
    code: "ELON",
    color: "#020303",
    secondaryColor: "#b59a57",
    logo: ElonLogo,
  },
  {
    id: 1960,
    espnID: 2306,
    name: "Kansas State",
    fullName: "Kansas State Wildcats",
    code: "KSU",
    color: "#3c0969",
    secondaryColor: "#e2e3e4",
    logo: KansasStLogo,
    logoLight: KansasStLogoLight,
  },
  {
    id: 1498,
    espnID: 233,
    name: "South Dakota",
    fullName: "South Dakota Coyotes",
    code: "SDAK",
    color: "#CD1241",
    secondaryColor: "#f0f0f0",
    logo: SouthDakotaLogo,
  },
  {
    id: 212,
    espnID: 324,
    name: "Coastal Carolina",
    fullName: "Coastal Carolina Chanticleers",
    code: "CCU",
    color: "#007073",
    secondaryColor: "#876447",
    logo: CoastalCarolinaLogo,
  },
  {
    id: 1820,
    espnID: 349,
    name: "Army",
    fullName: "Army Black Knights",
    code: "ARMY",
    color: "#ce9c00",
    secondaryColor: "#231f20",
    logo: ArmyLogo,
  },
  {
    id: 219,
    espnID: 2572,
    name: "Southern Miss",
    fullName: "Southern Miss Golden Eagles",
    code: "USM",
    color: "#FFAA3C",
    secondaryColor: "#ffc423",
    logo: SouthernMissLogo,
  },
  {
    id: 1972,
    espnID: 2335,
    name: "Liberty",
    fullName: "Liberty Flames",
    code: "LIB",
    color: "#071740",
    secondaryColor: "#a61f21",
    logo: LibertyLogo,
  },
  {
    id: 2158,
    espnID: 2655,
    name: "Tulane",
    fullName: "Tulane Green Wave",
    code: "TULN",
    color: "#006547",
    secondaryColor: "#468ac9",
    logo: TulaneLogo,
  },
  {
    id: 2168,
    espnID: 113,
    name: "UMass",
    fullName: "Massachusetts Minutemen",
    code: "MASS",
    color: "#880007",
    secondaryColor: "null",
    logo: UmassLogo,
  },
  {
    id: 2169,
    espnID: 2349,
    name: "UMass Lowell",
    fullName: "UMass Lowell River Hawks",
    shortName: "UMass Lowell",
    code: "UML",
    color: "#00529C",
    secondaryColor: "#cf1f2f",
    logo: UMassLowellLogo,
  },
  {
    id: 6490,
    espnID: 2603,
    name: "Saint Joseph's",
    fullName: "Saint Joseph's Hawks",
    shortName: "Saint Joseph's",
    code: "JOES",
    color: "#9e1b32",
    secondaryColor: "#6c6f70",
    logo: SaintJosephsLogo,
  },
  {
    id: 2128,
    espnID: 139,
    name: "Saint Louis",
    fullName: "Saint Louis Billikens",
    shortName: "Saint Louis",
    code: "SLU",
    color: "#00539C",
    secondaryColor: "#ebebeb",
    logo: SaintLouisLogo,
  },
  {
    id: 1968,
    espnID: 2325,
    name: "La Salle",
    fullName: "La Salle Explorers",
    shortName: "La Salle",
    code: "LAS",
    color: "#003356",
    secondaryColor: "#ffce00",
    logo: LaSalleLogo,
  },
  {
    id: 2167,
    espnID: 2378,
    name: "UMBC",
    fullName: "UMBC Retrievers",
    shortName: "UMBC",
    code: "UMBC",
    color: "#000000",
    secondaryColor: "#ad860a",
    logo: UMBCLogo,
  },
  {
    id: 1975,
    espnID: 309,
    name: "Louisiana",
    fullName: "Louisiana Ragin' Cajuns",
    code: "UL",
    color: "#ce181e",
    secondaryColor: "#ffffff",
    logo: LouisianaLogo,
  },
  {
    id: 2098,
    espnID: 2545,
    name: "SE Louisiana",
    fullName: "SE Louisiana Lions",
    code: "SELA",
    color: "#215732",
    secondaryColor: "#ffc72c",
    logo: SELouisianaLogo,
  },
  {
    id: 1817,
    espnID: 2032,
    name: "Arkansas State",
    fullName: "Arkansas State Red Wolves",
    code: "ARST",
    color: "#e81018",
    secondaryColor: "#000000",
    logo: ArkansasStateLogo,
  },
  {
    id: 232,
    espnID: 2755,
    name: "Grambling",
    fullName: "Grambling Tigers",
    code: "GRAM",
    color: "#ee8601",
    secondaryColor: "#ffd10a",
    logo: GramblingLogo,
  },
  {
    id: 2005,
    espnID: 344,
    name: "Mississippi State",
    shortName: "Miss St",
    fullName: "Mississippi State Bulldogs",
    code: "MSST",
    color: "#5d1725",
    secondaryColor: "#c1c6c8",
    logo: MissStLogo,
    location: "Starkville, MS",
    city: "Starkville",
    latitude: 33.4552,
    longitude: -88.793,
  },
  {
    id: 192,
    espnID: 235,
    name: "Memphis",
    fullName: "Memphis Tigers",
    code: "MEM",
    color: "#004991",
    secondaryColor: "#8e908f",
    logo: MemphisLogo,
  },
  {
    id: 2116,
    espnID: 2579,
    name: "South Carolina",
    fullName: "South Carolina Gamecocks",
    code: "SC",
    color: "#73000a",
    secondaryColor: "#ffffff",
    logo: SouthCarolinaLogo,
    logoLight: SouthCarolinaLogoLight,
    location: "Columbia, SC",
    city: "Columbia",
    latitude: 33.9734,
    longitude: -81.0197,
  },
  {
    id: 1925,
    espnID: 2247,
    name: "Georgia State",
    fullName: "Georgia State Panthers",
    code: "GAST",
    color: "#1e539a",
    secondaryColor: "#ebebeb",
    logo: GeorgiaStateLogo,
  },
  {
    id: 2099,
    espnID: 2567,
    name: "SMU",
    fullName: "SMU Mustangs",
    code: "SMU",
    color: "#354ca1",
    secondaryColor: "#cc0035",
    logo: SMULogo,
  },
  {
    id: 2133,
    espnID: 24,
    name: "Stanford",
    fullName: "Stanford Cardinal",
    code: "STAN",
    color: "#8c1515",
    secondaryColor: "#ffffff",
    logo: StanfordLogo,
  },
  {
    id: 1491,
    espnID: 2142,
    name: "Colgate",
    fullName: "Colgate Raiders",
    code: "COLG",
    color: "#821019",
    secondaryColor: "#ffffff",
    logo: ColgateLogo,
    logoLight: ColgateLogoLight,
  },
  {
    id: 2146,
    espnID: 2641,
    name: "Texas Tech",
    fullName: "Texas Tech Red Raiders",
    code: "TTU",
    color: "#000000",
    secondaryColor: "#da291c",
    logo: TexasTechLogo,
  },
  {
    id: 2024,
    espnID: 93,
    name: "Murray State",
    fullName: "Murray State Racers",
    code: "MUR",
    color: "#002148",
    secondaryColor: "#000e00",
    logo: MurrayStateLogo,
  },
  {
    id: 2030,
    espnID: 2437,
    name: "Nebraska O.",
    fullName: "Omaha Mavericks",
    shortName: "Omaha",
    code: "OMA",
    color: "#e3193e",
    secondaryColor: "#474648",
    logo: OmahaLogo,
  },
  {
    id: 203,
    espnID: 251,
    name: "Texas",
    fullName: "Texas Longhorns",
    code: "TEX",
    color: "#c15d26",
    secondaryColor: "#ffffff",
    logo: TexasLogo,
    logoLight: TexasLogoLight,
    location: "Austin, TX",
    city: "Austin",
    established: 1906,
    latitude: 30.2672,
    longitude: 97.7431,
  },
  {
    id: 236,
    espnID: 2433,
    name: "UL Monroe",
    fullName: "UL Monroe Warhawks",
    code: "ULM",
    color: "#231F20",
    secondaryColor: "#b18445",
    logo: ULMLogo,
  },
  {
    id: 2137,
    espnID: 183,
    name: "Syracuse",
    fullName: "Syracuse Orange",
    code: "SYR",
    color: "#ff6500",
    secondaryColor: "#000e54",
    logo: SyracuseLogo,
  },
  {
    id: 1977,
    espnID: 97,
    name: "Louisville",
    fullName: "Louisville Cardinals",
    code: "LOU",
    color: "#c9001f",
    secondaryColor: "#000000",
    logo: LouisvilleLogo,
  },
  {
    id: 2034,
    espnID: 167,
    name: "New Mexico",
    fullName: "New Mexico Lobos",
    code: "UNM",
    color: "#891216",
    secondaryColor: "#000000",
    logo: NewMexicoLogo,
  },
  {
    id: 1979,
    espnID: 311,
    name: "Maine",
    fullName: "Maine Black Bears",
    code: "ME",
    color: "#127dbe",
    secondaryColor: "null",
    logo: MaineLogo,
  },
  {
    id: 2195,
    espnID: 265,
    name: "Washington State",
    fullName: "Washington State Cougars",
    code: "WSU",
    color: "#981e32",
    secondaryColor: "#ffffff",
    logo: WashingtonStateLogo,
    logoLight: WashingtonStateLogoLight,
  },
  {
    id: 1942,
    espnID: 70,
    name: "Idaho",
    fullName: "Idaho Vandals",
    code: "IDHO",
    color: "#000000",
    secondaryColor: "#8c6e4a",
    logo: IdahoLogo,
  },
  {
    id: 2066,
    espnID: 204,
    name: "Oregon State",
    fullName: "Oregon State Beavers",
    code: "ORST",
    color: "#231f20",
    secondaryColor: "#d73f09",
    logo: OregonStateLogo,
  },
  {
    id: 1835,
    espnID: 68,
    name: "Boise State",
    fullName: "Boise State Broncos",
    code: "BOIS",
    color: "#0033a0",
    secondaryColor: "#fa4616",
    logo: BoiseStateLogo,
  },
  {
    id: 2193,
    espnID: 264,
    name: "Washington",
    fullName: "Washington Huskies",
    code: "WASH",
    color: "#33006f",
    secondaryColor: "#e8d3a2",
    logo: WashingtonLogo,
    logoLight: WashingtonLogoLight,
    location: "Seattle, WA",
    city: "Seattle",
    latitude: 47.6501,
    longitude: -122.3016,
  },
  {
    id: 235,
    espnID: 2309,
    name: "Kent State",
    fullName: "Kent State Golden Flashes",
    code: "KENT",
    color: "#003976",
    secondaryColor: "#efab00",
    logo: KentStateLogo,
  },
  {
    id: 1967,
    espnID: 99,
    name: "LSU",
    fullName: "LSU Tigers",
    code: "LSU",
    color: "#461d7c",
    secondaryColor: "#fdd023",
    logo: LSULogo,
    logoLight: LSULogoLight,
    location: "Baton Rouge, LA",
    city: "Baton Rouge",
    latitude: 30.412,
    longitude: -91.1839,
  },
  {
    id: 1926,
    espnID: 59,
    name: "Georgia Tech",
    fullName: "Georgia Tech Yellow Jackets",
    code: "GT",
    color: "#003057",
    secondaryColor: "#b3a369",
    logo: GeorgiaTechLogo,
    logoLight: GeorgiaTechLogoLight,
  },
  {
    id: 180,
    espnID: 228,
    name: "Clemson",
    fullName: "Clemson Tigers",
    code: "CLEM",
    color: "#f56600",
    secondaryColor: "#522d80",
    logo: ClemsonLogo,
    logoLight: ClemsonLogoLight,
  },
  {
    id: 2106,
    espnID: 2535,
    name: "Samford",
    fullName: "Samford Bulldogs",
    code: "SAM",
    color: "#005485",
    secondaryColor: "#bc0023",
    logo: SamfordLogo,
  },
  {
    id: 185,
    espnID: 231,
    name: "Furman",
    fullName: "Furman Paladins",
    code: "FUR",
    color: "#582c83",
    secondaryColor: "#ffffff",
    logo: Furman,
  },
  {
    id: 244,
    espnID: 253,
    name: "Southern Utah",
    fullName: "Southern Utah Thunderbirds",
    code: "SUU",
    color: "#c72026",
    secondaryColor: "#000000",
    logo: SouthernUtahLogo,
  },
  {
    id: 226,
    espnID: 2127,
    name: "Charleston Southern",
    fullName: "Charleston Southern Buccaneers",
    code: "CHSO",
    color: "#2e3192",
    secondaryColor: "#ded090",
    logo: CharlestonSouthernLogo,
  },
  {
    id: 1490,
    espnID: 2110,
    name: "Central Arkansas",
    fullName: "Central Arkansas Bears",
    code: "CARK",
    color: "#4f2d7f",
    secondaryColor: "#8e959a",
    logo: CentralArkansasLogo,
  },
  {
    id: 2200,
    espnID: 2710,
    name: "Western Illinois",
    fullName: "Western Illinois Leathernecks",
    code: "WIU",
    color: "#4e1e8a",
    secondaryColor: "#ffc90a",
    logo: WIllinoisLogo,
  },
  {
    id: 1969,
    espnID: 322,
    name: "Lafayette",
    fullName: "Lafayette Leopards",
    code: "LAF",
    color: "#790000",
    secondaryColor: "#a59474",
    logo: LafayetteLogo,
  },
  {
    id: 205,
    espnID: 2724,
    name: "Wichita State",
    fullName: "Wichita State Shockers",
    code: "WICH",
    color: "#0d0a03",
    secondaryColor: "#ffc41e",
    logo: WichitaStLogo,
  },
  {
    id: 1963,
    espnID: 338,
    name: "Kennesaw State",
    fullName: "Kennesaw State Owls",
    shortName: "Kenn St",
    code: "KENN",
    color: "#fdbb30",
    secondaryColor: "#000000",
    logo: KennesawStateLogo,
  },
  {
    id: 1948,
    espnID: 282,
    name: "Indiana State",
    fullName: "Indiana State Sycamores",
    code: "INST",
    color: "#00669a",
    secondaryColor: "#f0f0f0",
    logo: IndianaStateLogo,
  },
  {
    id: 2191,
    espnID: 2681,
    name: "Wagner",
    fullName: "Wagner Seahawks",
    code: "WAG",
    color: "#00483A",
    secondaryColor: "#ffffff",
    logo: "https://media.api-sports.io/american-football/teams/219.png",
  },
  {
    id: 2047,
    espnID: 2458,
    name: "Northern Colorado",
    fullName: "Northern Colorado Bears",
    code: "UNCO",
    color: "#13558D",
    secondaryColor: "#ffc533",
    logo: NorhternColoradoLogo,
  },
  {
    id: 1807,
    espnID: 2011,
    name: "Alabama State",
    fullName: "Alabama State Hornets",
    code: "ALST",
    color: "#e9a900",
    secondaryColor: "#0a0a0a",
    logo: AlabamaStLogo,
  },
  {
    id: 1946,
    espnID: 2916,
    name: "Incarnate Word",
    fullName: "Incarnate Word Cardinals",
    code: "UIW",
    color: "#000000",
    secondaryColor: "#080808",
    logo: IncarnateWordLogo,
  },
  {
    id: 1936,
    espnID: 107,
    name: "Holy Cross",
    fullName: "Holy Cross Crusaders",
    code: "HC",
    color: "#0a0a0a",
    secondaryColor: "#080808",
    logo: HolyCrossLogo,
  },
  {
    id: 242,
    espnID: 2523,
    name: "Robert Morris",
    fullName: "Robert Morris Colonials",
    code: "RMU",
    color: "#00214D",
    secondaryColor: "#a21d2b",
    logo: RobertMorrisLogo,
  },
  {
    id: 2064,
    espnID: 198,
    name: "Oral Roberts",
    fullName: "Oral Roberts Golden Eagles",
    shortName: "Oral Roberts",
    code: "ORU",
    color: "#002462",
    secondaryColor: "#dac792",
    logo: OralRobertsLogo,
    logoLight: OralRobertsLogoLight,
  },
  {
    id: 225,
    espnID: 2241,
    name: "Gardner-Webb",
    fullName: "Gardner-Webb Runnin' Bulldogs",
    code: "GWEB",
    color: "#c12535",
    secondaryColor: "#909090",
    logo: GardnerWebbLogo,
  },
  {
    id: 226,
    espnID: 2717,
    name: "Western Carolina",
    fullName: "Western Carolina Catamounts",
    code: "WCU",
    color: "#492F91",
    secondaryColor: "#bf9e70",
    logo: WCarolinaLogo,
  },
  {
    id: 2196,
    espnID: 2692,
    name: "Weber State",
    fullName: "Weber State Wildcats",
    code: "WEB",
    color: "#18005a",
    secondaryColor: "#ebebeb",
    logo: WeberStateLogo,
  },
  {
    id: 1809,
    espnID: 2016,
    name: "Alcorn State",
    fullName: "Alcorn State Braves",
    code: "ALCN",
    color: "#4b0058",
    secondaryColor: "#46166a",
    logo: AlcornStLogo,
  },
  {
    id: 1970,
    espnID: 2320,
    name: "Lamar",
    fullName: "Lamar Cardinals",
    shortName: "Lamar",
    code: "LAM",
    color: "#dc0032",
    secondaryColor: "#ebebeb",
    logo: LamarLogo,
  },
  {
    id: 6714,
    espnID: 130174,
    name: "Texas A&M SA",
    fullName: "Texas A&M SA Jaguars",
    shortName: "Texas A&M SA",
    code: "TEXSA",
    color: "#000000",
    secondaryColor: "#ffffffff",
    logo: TexasAMSALogo,
  },
  {
    id: 230,
    espnID: 47,
    name: "Howard",
    fullName: "Howard Bison",
    code: "HOW",
    color: "#003a63",
    secondaryColor: "#e51937",
    logo: HowardLogo,
  },
  {
    id: 231,
    name: "Stephen F. Austin",

    logo: "https://media.api-sports.io/american-football/teams/231.png",
  },
  {
    id: 2121,
    espnID: 2582,
    name: "Southern Univ.",
    fullName: "Southern Jaguars",
    code: "SOU",
    color: "#004B97",
    secondaryColor: "#ffc82d",
    logo: SouthernLogo,
  },
  {
    id: 246,
    espnID: 2640,
    name: "Texas Southern",
    fullName: "Texas Southern Tigers",
    code: "TXSO",
    color: "#860038",
    secondaryColor: "#ffffff",
    logo: TexasSouthernLogo,
  },
  {
    id: 1990,
    espnID: 2377,
    name: "McNeese",
    fullName: "McNeese Cowboys",
    code: "MCN",
    color: "#00529C",
    secondaryColor: "null",
    logo: McNeeseLogo,
  },
  {
    id: 1492,
    espnID: 331,
    name: "East. Washington",
    fullName: "Eastern Washington Eagles",
    code: "EWU",
    color: "#a10022",
    secondaryColor: "#abb4bc",
    logo: EasternWashingtonLogo,
    logoLight: EasternWashingtonLogoLight,
  },
  {
    id: 237,
    espnID: 2029,
    name: "Arkansas-Pine Bluff",
    fullName: "Arkansas-Pine Bluff Golden Lions",
    code: "UAPB",
    color: "#e0aa0f",
    secondaryColor: "#eaaa00",
    logo: ArkansasPineBluffLogo,
  },
  {
    id: 2218,
    espnID: 2754,
    name: "Youngstown State",
    shortName: "Youngstown St",
    fullName: "Youngstown State Penguins",
    code: "YSU",
    color: "#E51936",
    secondaryColor: "#690717",
    logo: YoungstownStateLogo,
  },
  {
    id: 216,
    espnID: 2344,
    name: "Longwood",
    fullName: "Longwood Lancers",
    shortName: "Longwood",
    code: "LONG",
    color: "#003273",
    secondaryColor: "#9ea2a3",
    logo: LongwoodLogo,
  },
  {
    id: 2008,
    espnID: 2623,
    name: "Missouri State",
    shortName: "Missouri St",
    fullName: "Missouri State Bears",
    code: "MOST",
    color: "#5F0000",
    secondaryColor: "#e8e8e8",
    logo: MissouriStateLogo,
  },
  {
    id: 2215,
    espnID: 2747,
    name: "Wofford",
    fullName: "Wofford Terriers",
    code: "WOF",
    color: "#533B23",
    secondaryColor: "#f0f0f0",
    logo: WoffordLogo,
  },
  {
    id: 241,
    espnID: 2000,
    name: "Abilene Christian",
    fullName: "Abilene Christian Wildcats",
    code: "ACU",
    color: "#592d82",
    secondaryColor: "#b1b3b3",
    logo: AbileneChristianLogo,
  },
  {
    id: 242,
    espnID: 222,
    name: "Villanova",
    fullName: "Villanova Wildcats",
    code: "VILL",
    color: "#00205b",
    secondaryColor: "#13b5ea",
    logo: VillanovaLogo,
  },
  {
    id: 2120,
    espnID: 79,
    name: "Southern Illinois",
    fullName: "Southern Illinois Salukis",
    code: "SIU",
    color: "#85283D",
    secondaryColor: "#c2c3c0",
    logo: SouthernIllinoisLogo,
  },
  {
    id: 2152,
    espnID: 119,
    name: "Towson",
    fullName: "Towson Tigers",
    code: "TOW",
    color: "#FFC229",
    secondaryColor: "#000",
    logo: TowsonLogo,
  },
  {
    id: 245,
    espnID: 2083,
    name: "Bucknell",
    fullName: "Bucknell Bison",
    code: "BUCK",
    color: "#000060",
    secondaryColor: "#00316e",
    logo: BucknellLogo,
  },
  {
    id: 246,
    espnID: 2619,
    name: "Stony Brook",
    fullName: "Stony Brook Seawolves",
    code: "STBK",
    color: "#990000",
    secondaryColor: "null",
    logo: "https://media.api-sports.io/american-football/teams/246.png",
  },
  {
    id: 247,
    espnID: 2630,
    name: "UT Martin",
    fullName: "UT Martin Skyhawks",
    code: "UTM",
    color: "#FF6700",
    secondaryColor: "#102a5c",
    logo: UTMartinLogo,
  },
  {
    id: 248,
    espnID: 2448,
    name: "North Carolina A&T",
    fullName: "North Carolina A&T Aggies",
    code: "NCAT",
    color: "#0505aa",
    secondaryColor: "#004684",
    logo: NorthCarolinaATLogo,
  },
  {
    id: 179,
    espnID: 2097,
    name: "Campbell",
    fullName: "Campbell Fighting Camels",
    code: "CAM",
    color: "#000000",
    secondaryColor: "null",
    logo: CampbellLogo,
  },
  {
    id: 250,
    espnID: 55,
    name: "Jax State",
    fullName: "Jacksonville State Gamecocks",
    code: "JVST",
    color: "#b50500",
    secondaryColor: "#b5b7ba",
    logo: JaxStateLogo,
  },
  {
    id: 251,
    espnID: 2466,
    name: "Northwestern State",
    fullName: "Northwestern State Demons",
    code: "NWST",
    color: "#492F91",
    secondaryColor: "#ed6118",
    logo: "https://media.api-sports.io/american-football/teams/251.png",
  },
  {
    id: 252,
    espnID: 2634,
    name: "Tennessee State",
    fullName: "Tennessee State Tigers",
    code: "TNST",
    color: "#171796",
    secondaryColor: "#f0f0f0",
    logo: TennesseeStateLogo,
  },
  {
    id: 2013,
    espnID: 147,
    name: "Montana State",
    fullName: "Montana State Bobcats",
    code: "MTST",
    color: "#00205c",
    secondaryColor: "#bc955c",
    logo: MontanaStateLogo,
  },
  {
    id: 2042,
    espnID: 2449,
    name: "North Dakota St",
    fullName: "North Dakota State Bison",
    code: "NDSU",
    color: "#01402A",
    secondaryColor: "#ffffff",
    logo: NorthDakotaStateLogo,
  },
  {
    id: 255,
    espnID: 236,
    name: "Chattanooga",
    fullName: "Chattanooga Mocs",
    code: "UTC",
    color: "#00386b",
    secondaryColor: "#dca71d",
    logo: ChattanoogaLogo,
  },
  {
    id: 2091,
    espnID: 227,
    name: "Rhode Island",
    fullName: "Rhode Island Rams",
    code: "URI",
    color: "#091f3f",
    secondaryColor: "#5ab3e8",
    logo: RhodeIslandLogo,
  },
  {
    id: 257,
    espnID: 2230,
    name: "Fordham",
    fullName: "Fordham Rams",
    code: "FOR",
    color: "#830032",
    secondaryColor: "#909090",
    logo: FordhamLogo,
  },
  {
    id: 258,
    espnID: 16,
    name: "Sacramento State",
    fullName: "Sacramento State Hornets",
    code: "SAC",
    color: "#00573C",
    secondaryColor: "#cdb97d",
    logo: "https://media.api-sports.io/american-football/teams/258.png",
  },
  {
    id: 259,
    name: "Houston Christian",
    code: "HCU",
    logo: HoustonChristianLogo,
  },
  {
    id: 260,
    espnID: 2643,
    name: "The Citadel",
    fullName: "The Citadel Bulldogs",
    code: "CIT",
    color: "#7badd3",
    secondaryColor: "#002856",
    logo: TheCitadelLogo,
  },
  {
    id: 261,
    espnID: 160,
    name: "New Hampshire",
    fullName: "New Hampshire Wildcats",
    code: "UNH",
    color: "#004990",
    secondaryColor: "#c3c4c6",
    logo: "https://media.api-sports.io/american-football/teams/261.png",
  },
  {
    id: 262,
    espnID: 2193,
    name: "East Tennessee State",
    fullName: "East Tennessee State Buccaneers",
    code: "ETSU",
    color: "#002d61",
    secondaryColor: "#ffc423",
    logo: "https://media.api-sports.io/american-football/teams/262.png",
  },
  {
    id: 263,
    espnID: 2453,
    name: "North Alabama",
    fullName: "North Alabama Lions",
    code: "UNA",
    color: "#000000",
    secondaryColor: "null",
    logo: NorthAlabamaLogo,
  },
  {
    id: 264,
    espnID: 3101,
    name: "Utah Tech",
    fullName: "Utah Tech Trailblazers",
    code: "UTU",
    color: "#000000",
    secondaryColor: "null",
    logo: "https://media.api-sports.io/american-football/teams/264.png",
  },
  {
    id: 265,
    espnID: 2413,
    name: "Morehead State",
    fullName: "Morehead State Eagles",
    code: "MORE",
    color: "#094FA3",
    secondaryColor: "#fed91a",
    logo: "https://media.api-sports.io/american-football/teams/265.png",
  },
  {
    id: 266,
    name: "North Greenville",
    code: "NG",
    logo: "https://media.api-sports.io/american-football/teams/266.png",
  },
  {
    id: 267,
    espnID: 2405,
    name: "Monmouth",
    fullName: "Monmouth Hawks",
    code: "MONM",
    color: "#051844",
    secondaryColor: "null",
    logo: MonmouthLogo,
  },
  {
    id: 268,
    name: "Limestone",

    logo: "https://media.api-sports.io/american-football/teams/268.png",
  },
  {
    id: 269,
    name: "Mars Hill",
    code: "MH",
    logo: "https://media.api-sports.io/american-football/teams/269.png",
  },
  {
    id: 271,
    espnID: 2400,
    name: "Mississippi Valley St",
    fullName: "Mississippi Valley State Delta Devils",
    code: "MVSU",
    color: "#005328",
    secondaryColor: "#cf2d34",
    logo: MississippiValleyStateLogo,
  },

  {
    id: 1819,
    espnID: 3166,
    name: "Arlington Baptist",
    fullName: "Arlington Baptist Patriots",
    logo: ArlingtonBaptistLogo,
    color: "#BF2030",
    secondaryColor: "#0D233F",
  },

  {
    id: 274,
    name: "Western Oregon",
    code: "WORE",
    logo: "https://media.api-sports.io/american-football/teams/274.png",
  },
  {
    id: 275,
    name: "Lehigh",
    code: "LEH",
    logo: "https://media.api-sports.io/american-football/teams/275.png",
  },
  {
    id: 1992,
    espnID: 2771,
    name: "Merrimack",
    fullName: "Merrimack Warriors",
    shortName: "Merrimack",
    code: "MRMK",
    color: "#2f4f93",
    secondaryColor: "#e8c535",
    logo: MerrimackLogo,
  },
  {
    id: 277,
    espnID: 2168,
    name: "Dayton",
    fullName: "Dayton Flyers",
    shortName: "Dayton",
    code: "DAY",
    color: "#004B8D",
    secondaryColor: "#ffffff",
    logo: DaytonLogo,
    logoLight: DaytonLogoLight,
  },
  {
    id: 2125,
    espnID: 179,
    name: "St. Bonaventure",
    fullName: "St. Bonaventure Bonnies",
    shortName: "St Bonaventure",
    code: "SBU",
    color: "#70261D",
    secondaryColor: "#fff",
    logo: StBonaventureLogo,
    logoLight: StBonaventureLogoLight,
  },
  {
    id: 1839,
    espnID: 71,
    name: "Bradley",
    fullName: "Bradley Braves",
    shortName: "Bradley",
    code: "BRAD",
    color: "#b70002",
    secondaryColor: "#c0c0c0",
    logo: BradleyLogo,
  },
  {
    id: 278,
    espnID: 2368,
    name: "Marist",
    fullName: "Marist Red Foxes",
    code: "MRST",
    color: "#e53730",
    secondaryColor: "#f0f0f0",
    logo: MaristLogo,
  },
  {
    id: 279,
    espnID: 46,
    name: "Georgetown",
    fullName: "Georgetown Hoyas",
    code: "GTWN",
    color: "#110E42",
    secondaryColor: "#001c58",
    logo: GeorgetownLogo,
  },
  {
    id: 280,
    espnID: 2529,
    name: "Sacred Heart",
    fullName: "Sacred Heart Pioneers",
    code: "SHU",
    color: "#a40012",
    secondaryColor: "#c29472",
    logo: SacredHeartLogo,
  },
  {
    id: 281,
    espnID: 2086,
    name: "Butler",
    fullName: "Butler Bulldogs",
    code: "BUT",
    color: "#0d1361",
    secondaryColor: "#00a3e0",
    logo: ButlerLogo,
  },
  {
    id: 282,
    name: "St. Thomas University (Fl)",

    logo: "https://media.api-sports.io/american-football/teams/282.png",
  },
  {
    id: 183,
    espnID: 2166,
    name: "Davidson",
    fullName: "Davidson Wildcats",
    code: "DAV",
    color: "#000000",
    secondaryColor: "#e51837",
    logo: DavidsonLogo,
  },
  {
    id: 1885,
    espnID: 2169,
    name: "Delaware State",
    fullName: "Delaware State Hornets",
    code: "DSU",
    color: "#FF3630",
    secondaryColor: "#009cdd",
    logo: DelawareStateLogo,
  },
  {
    id: 2212,
    espnID: 2737,
    name: "Winthrop",
    fullName: "Winthrop Eagles",
    shortName: "Winthrop",
    code: "WIN",
    color: "#9e0b0e",
    secondaryColor: "#fdb41e",
    logo: WinthropLogo,
  },
  {
    id: 285,
    name: "Lincoln (PA)",

    logo: "https://media.api-sports.io/american-football/teams/285.png",
  },
  {
    id: 286,
    name: "Bloomsburg",

    logo: "https://media.api-sports.io/american-football/teams/286.png",
  },
  {
    id: 287,
    espnID: 284,
    name: "Stonehill",
    fullName: "Stonehill Skyhawks",
    code: "STO",
    color: "#2F2975",
    secondaryColor: "#FFFFFF",
    logo: StonehillLogo,
  },
  {
    id: 2012,
    espnID: 149,
    name: "Montana",
    fullName: "Montana Grizzlies",
    code: "MONT",
    color: "#751D4A",
    secondaryColor: "#666666",
    logo: MontanaLogo,
    logoLight: MontanaLogoLight,
  },
  {
    id: 228,
    espnID: 2181,
    name: "Drake",
    fullName: "Drake Bulldogs",
    code: "DRKE",
    color: "#005596",
    secondaryColor: "#bec0c2",
    logo: DrakeLogo,
  },
  {
    id: 2135,
    espnID: 56,
    name: "Stetson",
    fullName: "Stetson Hatters",
    code: "STET",
    color: "#0a5640",
    secondaryColor: "#56854e",
    logo: StetsonLogo,
  },
  {
    id: 1811,
    espnID: 44,
    name: "American University",
    fullName: "American University Eagles",
    shortName: "American",
    code: "AMER",
    color: "#c41130",
    secondaryColor: "#c8102e",
    logo: AmericanUniversityLogo,
  },
  {
    id: 1934,
    espnID: 2272,
    name: "High Point",
    fullName: "High Point Panthers",
    shortName: "High Point",
    code: "HPU",
    color: "#b0b7bc",
    secondaryColor: "#ebebeb",
    logo: HighPointLogo,
    logoLight: HighPointLogoLight,
  },
  {
    id: 2114,
    espnID: 2565,
    name: "SIU Edwardsville",
    fullName: "SIU Edwardsville Cougars",
    shortName: "SIUE",
    code: "SIUE",
    color: "#eb1c23",
    secondaryColor: "#080808",
    logo: SIUELogo,
    logoLight: SIUELogoLight,
  },
  {
    id: 193,
    espnID: 2430,
    name: "UNC Greensboro",
    fullName: "UNC Greensboro Spartans",
    shortName: "UNC Greensboro",
    code: "UNCG",
    color: "#003559",
    secondaryColor: "#ffd90a",
    logo: UNCGreensboroLogo,
  },
  {
    id: 2082,
    espnID: 2502,
    name: "Portland State",
    fullName: "Portland State Vikings",
    shortName: "Portland St",
    code: "PRST",
    color: "#00311e",
    secondaryColor: "#ebebeb",
    logo: PortlandStateLogo,
  },
  {
    id: 3371,
    espnID: 112706,
    name: "Penn State-York",
    fullName: "Penn State-York Nittany Lions",
    shortName: "PSU York",
    code: "PSUY",
    color: "#1D417D",
    secondaryColor: "#fff",
    logo: PennStateYorkLogo,
  },
  {
    id: 2056,
    espnID: 2473,
    name: "Oakland",
    fullName: "Oakland Golden Grizzlies",
    shortName: "Oakland",
    code: "OAK",
    color: "#04091c",
    secondaryColor: "#bc955c",
    logo: OaklandLogo,
  },
  {
    id: 1886,
    espnID: 2172,
    name: "Denver",
    fullName: "Denver Pioneers",
    shortName: "Denver",
    code: "DEN",
    color: "#98002e",
    secondaryColor: "#a8996e",
    logo: DenverLogo,
    logoLight: DenverLogoLight,
  },

  {
    id: 291,
    name: "Concordia College (MI)",

    logo: "https://media.api-sports.io/american-football/teams/291.png",
  },
  {
    id: 292,
    name: "Miles College",

    logo: "https://media.api-sports.io/american-football/teams/292.png",
  },
  {
    id: 293,
    name: "Hampton",

    logo: "https://media.api-sports.io/american-football/teams/293.png",
  },
  {
    id: 294,
    name: "Presbyterian",

    logo: "https://media.api-sports.io/american-football/teams/294.png",
  },

  {
    id: 296,
    name: "Florida Memorial University",

    logo: "https://media.api-sports.io/american-football/teams/296.png",
  },
  {
    id: 297,
    name: "Lane",

    logo: "https://media.api-sports.io/american-football/teams/297.png",
  },
  {
    id: 2184,
    espnID: 2674,
    name: "Valparaiso",
    fullName: "Valparaiso Beacons",
    code: "VAL",
    color: "#381e0e",
    secondaryColor: "#613318",
    logo: ValparaisoLogo,
  },
  {
    id: 2083,
    espnID: 2504,
    name: "Prairie View A&M",
    fullName: "Prairie View A&M Panthers",
    shortName: "Prairie View",
    code: "PV",
    color: "#4d0960",
    secondaryColor: "#000000",
    logo: PrairieViewAMLogo,
  },
  {
    id: 3380,
    espnID: 2504,
    name: "Dallas",
    fullName: "Dallas Crusaders",
    shortName: "Dallas",
    code: "DALL",
    color: "#001A4B",
    secondaryColor: "#FFFFFF",
    logo: DallasUniversityLogo,
  },
  {
    id: 3239,
    espnID: 2504,
    name: "East-West University",
    fullName: "East-West University Phantoms",
    shortName: "East West",
    code: "EAWE",
    color: "#212D65",
    secondaryColor: "#FCD920",
    logo: EastWestUniversityLogo,
    logoLight: EastWestUniversityLogoLight,
  },
  {
    id: 299,
    name: "Indiana Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/299.png",
  },
  {
    id: 300,
    espnID: 301,
    name: "San Diego",
    fullName: "San Diego Toreros",
    code: "USD",
    color: "#2f99d4",
    secondaryColor: "#2f99d4",
    logo: SanDiegoLogo,
  },
  {
    id: 301,
    name: "La Verne",

    logo: "https://media.api-sports.io/american-football/teams/301.png",
  },
  {
    id: 302,
    name: "North Carolina Central",

    logo: "https://media.api-sports.io/american-football/teams/302.png",
  },
  {
    id: 1952,
    espnID: 2296,
    name: "Jackson State",
    fullName: "Jackson State Tigers",
    shortName: "Jackson St",
    code: "JKST",
    color: "#123297",
    secondaryColor: "#b5b7ba",
    logo: JacksonStateLogo,
  },
  {
    id: 304,
    name: "Assumption",

    logo: "https://media.api-sports.io/american-football/teams/304.png",
  },
  {
    id: 305,
    name: "Thomas More College",

    logo: "https://media.api-sports.io/american-football/teams/305.png",
  },
  {
    id: 306,
    name: "Virginia Lynchburg",

    logo: "https://media.api-sports.io/american-football/teams/306.png",
  },
  {
    id: 307,
    name: "Post University",

    logo: "https://media.api-sports.io/american-football/teams/307.png",
  },
  {
    id: 308,
    name: "Missouri S&T",

    logo: "https://media.api-sports.io/american-football/teams/308.png",
  },
  {
    id: 309,
    name: "Michigan Tech",

    logo: "https://media.api-sports.io/american-football/teams/309.png",
  },
  {
    id: 310,
    name: "Winston-Salem",

    logo: "https://media.api-sports.io/american-football/teams/310.png",
  },
  {
    id: 311,
    name: "Taylor",

    logo: "",
  },
  {
    id: 312,
    name: "Louisiana Christian University",

    logo: "",
  },
  {
    id: 313,
    name: "Albany State",

    logo: "",
  },
  {
    id: 314,
    name: "UVA Wise",

    logo: "https://media.api-sports.io/american-football/teams/314.png",
  },
  {
    id: 1973,
    espnID: 2815,
    name: "Lindenwood",
    fullName: "Lindenwood Lions",
    shortName: "Lindenwood",
    code: "LIN",
    color: "#B5A36A",
    secondaryColor: "#101820",
    logo: LindenwoodLogo,
  },
  {
    id: 2430,
    espnID: 2511,
    name: "Queens",
    fullName: "Queens University Royals",
    shortName: "Queens",
    code: "QUC",
    color: "#192C66",
    logo: QueensLogo,
  },
  {
    id: 5787,
    espnID: 2511,
    name: "Lynchburg",
    fullName: "Lynchburg Hornets",
    shortName: "Lynchburg",
    code: "LYNCH",
    color: "#7E1E27",
    logo: LynchburgLogo,
  },
  {
    id: 317,
    name: "Barton College",

    logo: "",
  },
  {
    id: 318,
    name: "North American University",

    logo: "",
  },
  {
    id: 319,
    name: "Chadron State",

    logo: "",
  },
  {
    id: 320,
    name: "Tuskegee",

    logo: "",
  },
  {
    id: 321,
    espnID: 108,
    name: "Harvard",
    fullName: "Harvard Crimson",
    code: "HARV",
    color: "#990000",
    secondaryColor: "#dbdbdb",
    logo: HarvardLogo,
  },
  {
    id: 323,
    espnID: 163,
    name: "Princeton",
    fullName: "Princeton Tigers",
    code: "PRIN",
    color: "#000000",
    secondaryColor: "#ff6000",
    logo: PrincetonLogo,
  },
  {
    id: 324,
    espnID: 219,
    name: "Pennsylvania",
    fullName: "Pennsylvania Quakers",
    code: "PENN",
    color: "#082A74",
    secondaryColor: "#a6163d",
    logo: PennLogo,
  },
  {
    id: 325,
    name: "Kentucky State",

    logo: "https://media.api-sports.io/american-football/teams/325.png",
  },
  {
    id: 227,
    espnID: 172,
    name: "Cornell",
    fullName: "Cornell Big Red",
    code: "COR",
    color: "#d60027",
    secondaryColor: "#101010",
    logo: CornellLogo,
  },
  {
    id: 1883,
    espnID: 159,
    name: "Dartmouth",
    fullName: "Dartmouth Big Green",
    shortName: "Dartmouth",
    code: "DART",
    color: "#005730",
    secondaryColor: "#000000",
    logo: DartmouthLogo,
  },
  {
    id: 2217,
    espnID: 43,
    name: "Yale",
    fullName: "Yale Bulldogs",
    shortName: "Yale",
    code: "YALE",
    color: "#004a81",
    secondaryColor: "#286dc0",
    logo: YaleLogo,
  },
  {
    id: 1907,
    espnID: 161,
    name: "Fairleigh Dickinson",
    fullName: "Fairleigh Dickinson Knights",
    shortName: "FDU",
    code: "FDU",
    color: "#72293c",
    secondaryColor: "#28334a",
    logo: FairleighDickinsonLogo,
  },
  {
    id: 1971,
    espnID: 161,
    name: "Lehigh",
    fullName: "Lehigh Mountain Hawks",
    shortName: "Lehigh",
    code: "LEH",
    color: "#6c2b2a",
    secondaryColor: "#b69e70",
    logo: LehighLogo,
  },
  {
    id: 249,
    espnID: 2739,
    name: "Wisc. Green Bay",
    fullName: "Green Bay Phoenix",
    shortName: "Green Bay",
    code: "GB",
    color: "#006633",
    secondaryColor: "#ffffff",
    logo: WisconsinGreenBayLogo,
    logoLight: WisconsinGreenBayLogoLight,
  },
  {
    id: 329,
    name: "Morehouse College",

    logo: "https://media.api-sports.io/american-football/teams/329.png",
  },
  {
    id: 330,
    name: "Columbia",

    logo: "https://media.api-sports.io/american-football/teams/330.png",
  },
  {
    id: 332,
    name: "Eastern New Mexico",

    logo: "https://media.api-sports.io/american-football/teams/332.png",
  },
  {
    id: 333,
    name: "St. Andrews",

    logo: "https://media.api-sports.io/american-football/teams/333.png",
  },
  {
    id: 334,
    name: "Delta State",

    logo: "https://media.api-sports.io/american-football/teams/334.png",
  },
  {
    id: 335,
    name: "Keiser University",

    logo: "https://media.api-sports.io/american-football/teams/335.png",
  },
  {
    id: 336,
    name: "Warner",

    logo: "https://media.api-sports.io/american-football/teams/336.png",
  },
  {
    id: 337,
    name: "Western New Mexico",

    logo: "https://media.api-sports.io/american-football/teams/337.png",
  },
  {
    id: 338,
    name: "Mississippi College",

    logo: "https://media.api-sports.io/american-football/teams/338.png",
  },
  {
    id: 339,
    name: "Southern Conn St",

    logo: "https://media.api-sports.io/american-football/teams/339.png",
  },
  {
    id: 340,
    name: "Edward Waters",

    logo: "https://media.api-sports.io/american-football/teams/340.png",
  },
  {
    id: 342,
    name: "Southwest Baptist",

    logo: "https://media.api-sports.io/american-football/teams/342.png",
  },
  {
    id: 343,
    name: "William Jewell College",

    logo: "https://media.api-sports.io/american-football/teams/343.png",
  },
  {
    id: 344,
    name: "McKendree",

    logo: "https://media.api-sports.io/american-football/teams/344.png",
  },
  {
    id: 346,
    name: "Virginia Union",

    logo: "https://media.api-sports.io/american-football/teams/346.png",
  },
  {
    id: 347,
    name: "Benedict College",

    logo: "https://media.api-sports.io/american-football/teams/347.png",
  },
  {
    id: 348,
    name: "Savannah State",

    logo: "https://media.api-sports.io/american-football/teams/348.png",
  },
  {
    id: 349,
    name: "Bentley",

    logo: "https://media.api-sports.io/american-football/teams/349.png",
  },
  {
    id: 350,
    name: "Westfield State",

    logo: "https://media.api-sports.io/american-football/teams/350.png",
  },
  {
    id: 351,
    name: "Western Connecticut State",

    logo: "https://media.api-sports.io/american-football/teams/351.png",
  },
  {
    id: 352,
    name: "Pace University",

    logo: "https://media.api-sports.io/american-football/teams/352.png",
  },
  {
    id: 353,
    name: "St. Lawrence",

    logo: "https://media.api-sports.io/american-football/teams/353.png",
  },
  {
    id: 354,
    name: "SUNY Morrisville",

    logo: "https://media.api-sports.io/american-football/teams/354.png",
  },
  {
    id: 355,
    name: "Elizabeth City State",

    logo: "https://media.api-sports.io/american-football/teams/355.png",
  },
  {
    id: 356,
    name: "Dean College",

    logo: "https://media.api-sports.io/american-football/teams/356.png",
  },
  {
    id: 357,
    name: "Curry College",

    logo: "https://media.api-sports.io/american-football/teams/357.png",
  },
  {
    id: 358,
    name: "Husson",

    logo: "https://media.api-sports.io/american-football/teams/358.png",
  },
  {
    id: 359,
    name: "Alfred State College",

    logo: "https://media.api-sports.io/american-football/teams/359.png",
  },
  {
    id: 360,
    name: "University of New England",

    logo: "https://media.api-sports.io/american-football/teams/360.png",
  },
  {
    id: 361,
    name: "Gallaudet",

    logo: "https://media.api-sports.io/american-football/teams/361.png",
  },
  {
    id: 362,
    name: "Rose-Hulman",

    logo: "https://media.api-sports.io/american-football/teams/362.png",
  },
  {
    id: 363,
    name: "Albion",

    logo: "https://media.api-sports.io/american-football/teams/363.png",
  },
  {
    id: 364,
    name: "Walsh",

    logo: "https://media.api-sports.io/american-football/teams/364.png",
  },
  {
    id: 365,
    name: "Quincy",

    logo: "https://media.api-sports.io/american-football/teams/365.png",
  },
  {
    id: 366,
    name: "Findlay",

    logo: "https://media.api-sports.io/american-football/teams/366.png",
  },
  {
    id: 368,
    name: "Northern Michigan",

    logo: "https://media.api-sports.io/american-football/teams/368.png",
  },
  {
    id: 369,
    name: "Shorter",

    logo: "https://media.api-sports.io/american-football/teams/369.png",
  },
  {
    id: 370,
    name: "Charleston (WV)",

    logo: "https://media.api-sports.io/american-football/teams/370.png",
  },
  {
    id: 371,
    name: "Frostburg State",

    logo: "https://media.api-sports.io/american-football/teams/371.png",
  },
  {
    id: 373,
    espnID: 2699,
    name: "West Liberty",
    fullName: "West Liberty Hilltoppers",
    code: "WLIBST",
    color: "#000000",
    secondaryColor: "null",
    logo: "https://media.api-sports.io/american-football/teams/373.png",
  },
  {
    id: 374,
    espnID: 2274,
    name: "Hiram College",
    fullName: "Hiram College Terriers",
    code: "HIR",
    color: "#000000",
    secondaryColor: "null",
    logo: "https://media.api-sports.io/american-football/teams/374.png",
  },
  {
    id: 375,
    espnID: 83,
    name: "Depauw",
    fullName: "Depauw Tigers",
    code: "DEP",
    color: "#000000",
    secondaryColor: "null",
    logo: "https://media.api-sports.io/american-football/teams/375.png",
  },
  {
    id: 376,
    espnID: 286,
    name: "NC Wesleyan",
    fullName: "North Carolina Wesleyan Battling Bishops",
    code: "NORTH",
    color: "#000000",
    secondaryColor: "null",
    logo: "https://media.api-sports.io/american-football/teams/376.png",
  },
  {
    id: 377,
    espnID: 2079,
    name: "Bridgewater (VA)",
    fullName: "Bridgewater (VA) Eagles",
    code: "BRVA",
    color: "#990022",
    secondaryColor: "#8d724b",
    logo: "https://media.api-sports.io/american-football/teams/377.png",
  },
  {
    id: 378,
    name: "Edinboro",

    logo: "https://media.api-sports.io/american-football/teams/378.png",
  },
  {
    id: 379,
    name: "Shepherd",

    logo: "https://media.api-sports.io/american-football/teams/379.png",
  },
  {
    id: 380,
    name: "California (PA)",

    logo: "https://media.api-sports.io/american-football/teams/380.png",
  },
  {
    id: 381,
    name: "Mercyhurst",

    logo: "https://media.api-sports.io/american-football/teams/381.png",
  },
  {
    id: 382,
    name: "Kutztown",

    logo: "https://media.api-sports.io/american-football/teams/382.png",
  },
  {
    id: 384,
    name: "Slippery Rock",

    logo: "https://media.api-sports.io/american-football/teams/384.png",
  },
  {
    id: 385,
    name: "Seton Hill",

    logo: "https://media.api-sports.io/american-football/teams/385.png",
  },
  {
    id: 386,
    name: "East Stroudsburg",

    logo: "https://media.api-sports.io/american-football/teams/386.png",
  },
  {
    id: 387,
    name: "Gannon",

    logo: "https://media.api-sports.io/american-football/teams/387.png",
  },
  {
    id: 388,
    name: "West Chester",

    logo: "https://media.api-sports.io/american-football/teams/388.png",
  },
  {
    id: 390,
    name: "Central State (OH)",

    logo: "https://media.api-sports.io/american-football/teams/390.png",
  },
  {
    id: 392,
    name: "Brockport",

    logo: "https://media.api-sports.io/american-football/teams/392.png",
  },
  {
    id: 393,
    espnID: 2884,
    name: "Nichols",
    fullName: "Nichols College Bison",
    code: "NICHOLS",
    color: "#007b5f",
    secondaryColor: "#000000",
    logo: NicholsLogo,
  },
  {
    id: 394,
    name: "Coast Guard",

    logo: "https://media.api-sports.io/american-football/teams/394.png",
  },
  {
    id: 395,
    name: "FDU-Florham",

    logo: "https://media.api-sports.io/american-football/teams/395.png",
  },
  {
    id: 396,
    name: "Lebanon Valley",

    logo: "https://media.api-sports.io/american-football/teams/396.png",
  },
  {
    id: 397,
    name: "Fitchburg State",

    logo: "https://media.api-sports.io/american-football/teams/397.png",
  },
  {
    id: 398,
    name: "Worcester State College",

    logo: "https://media.api-sports.io/american-football/teams/398.png",
  },
  {
    id: 399,
    name: "Hilbert College",

    logo: "https://media.api-sports.io/american-football/teams/399.png",
  },
  {
    id: 400,
    name: "Willamette",

    logo: "https://media.api-sports.io/american-football/teams/400.png",
  },
  {
    id: 403,
    name: "SUNY Cortland",

    logo: "https://media.api-sports.io/american-football/teams/403.png",
  },
  {
    id: 404,
    name: "Albright",

    logo: "https://media.api-sports.io/american-football/teams/404.png",
  },
  {
    id: 405,
    name: "Misericordia",

    logo: "https://media.api-sports.io/american-football/teams/405.png",
  },
  {
    id: 406,
    name: "Wilkes University",

    logo: "https://media.api-sports.io/american-football/teams/406.png",
  },
  {
    id: 407,
    name: "Widener University",

    logo: "https://media.api-sports.io/american-football/teams/407.png",
  },
  {
    id: 409,
    name: "Bridgewater State (MA)",

    logo: "https://media.api-sports.io/american-football/teams/409.png",
  },
  {
    id: 410,
    name: "Bowdoin",

    logo: "https://media.api-sports.io/american-football/teams/410.png",
  },
  {
    id: 411,
    name: "Hamilton",

    logo: "https://media.api-sports.io/american-football/teams/411.png",
  },
  {
    id: 412,
    name: "Salisbury University",

    logo: "https://media.api-sports.io/american-football/teams/412.png",
  },
  {
    id: 413,
    name: "Ave Maria",

    logo: "https://media.api-sports.io/american-football/teams/413.png",
  },
  {
    id: 414,
    name: "Endicott College",

    logo: "https://media.api-sports.io/american-football/teams/414.png",
  },
  {
    id: 415,
    name: "The College of New Jersey",

    logo: "https://media.api-sports.io/american-football/teams/415.png",
  },
  {
    id: 416,
    name: "Fayetteville State",

    logo: "https://media.api-sports.io/american-football/teams/416.png",
  },
  {
    id: 417,
    name: "Chowan",

    logo: "https://media.api-sports.io/american-football/teams/417.png",
  },
  {
    id: 418,
    name: "Johnson C Smith",

    logo: "https://media.api-sports.io/american-football/teams/418.png",
  },
  {
    id: 420,
    name: "Dubuque",

    logo: "https://media.api-sports.io/american-football/teams/420.png",
  },
  {
    id: 421,
    name: "Wartburg College",

    logo: "https://media.api-sports.io/american-football/teams/421.png",
  },
  {
    id: 422,
    name: "Luther",

    logo: "https://media.api-sports.io/american-football/teams/422.png",
  },
  {
    id: 423,
    name: "Johns Hopkins",

    logo: "https://media.api-sports.io/american-football/teams/423.png",
  },
  {
    id: 424,
    name: "Juniata",

    logo: "https://media.api-sports.io/american-football/teams/424.png",
  },
  {
    id: 425,
    name: "Ithaca",

    logo: "https://media.api-sports.io/american-football/teams/425.png",
  },
  {
    id: 426,
    name: "Alfred",

    logo: "https://media.api-sports.io/american-football/teams/426.png",
  },
  {
    id: 427,
    name: "Hanover",

    logo: "https://media.api-sports.io/american-football/teams/427.png",
  },
  {
    id: 428,
    name: "Olivet College",

    logo: "https://media.api-sports.io/american-football/teams/428.png",
  },
  {
    id: 429,
    name: "Mass Maritime",

    logo: "https://media.api-sports.io/american-football/teams/429.png",
  },
  {
    id: 430,
    name: "Anna Maria College",

    logo: "https://media.api-sports.io/american-football/teams/430.png",
  },
  {
    id: 431,
    name: "Chicago",

    logo: "https://media.api-sports.io/american-football/teams/431.png",
  },
  {
    id: 432,
    name: "Beloit College",

    logo: "https://media.api-sports.io/american-football/teams/432.png",
  },
  {
    id: 434,
    name: "Grinnell",

    logo: "https://media.api-sports.io/american-football/teams/434.png",
  },
  {
    id: 435,
    name: "Cornell College (IA)",

    logo: "https://media.api-sports.io/american-football/teams/435.png",
  },
  {
    id: 436,
    name: "Ripon",

    logo: "https://media.api-sports.io/american-football/teams/436.png",
  },
  {
    id: 437,
    name: "Hillsdale",

    logo: "https://media.api-sports.io/american-football/teams/437.png",
  },
  {
    id: 438,
    name: "Truman State",

    logo: "https://media.api-sports.io/american-football/teams/438.png",
  },
  {
    id: 441,
    name: "Alderson Broaddus",

    logo: "https://media.api-sports.io/american-football/teams/441.png",
  },
  {
    id: 443,
    name: "Glenville State",

    logo: "https://media.api-sports.io/american-football/teams/443.png",
  },
  {
    id: 446,
    name: "Augustana University (SD)",

    logo: "https://media.api-sports.io/american-football/teams/446.png",
  },
  {
    id: 447,
    name: "Susquehanna University",

    logo: "https://media.api-sports.io/american-football/teams/447.png",
  },
  {
    id: 448,
    name: "Moravian",

    logo: "https://media.api-sports.io/american-football/teams/448.png",
  },
  {
    id: 449,
    name: "Kenyon",

    logo: "https://media.api-sports.io/american-football/teams/449.png",
  },
  {
    id: 451,
    name: "Denison",

    logo: "https://media.api-sports.io/american-football/teams/451.png",
  },
  {
    id: 452,
    name: "Oberlin",

    logo: "https://media.api-sports.io/american-football/teams/452.png",
  },
  {
    id: 454,
    name: "Newberry",

    logo: "https://media.api-sports.io/american-football/teams/454.png",
  },
  {
    id: 455,
    name: "LaGrange College",

    logo: "https://media.api-sports.io/american-football/teams/455.png",
  },
  {
    id: 456,
    name: "Ferrum",

    logo: "https://media.api-sports.io/american-football/teams/456.png",
  },
  {
    id: 457,
    name: "Hampden Sydney",

    logo: "https://media.api-sports.io/american-football/teams/457.png",
  },
  {
    id: 458,
    name: "Greensboro College",

    logo: "https://media.api-sports.io/american-football/teams/458.png",
  },
  {
    id: 461,
    name: "Methodist",

    logo: "https://media.api-sports.io/american-football/teams/461.png",
  },
  {
    id: 463,
    name: "Carnegie Mellon",

    logo: "https://media.api-sports.io/american-football/teams/463.png",
  },
  {
    id: 464,
    name: "Grove City College",

    logo: "https://media.api-sports.io/american-football/teams/464.png",
  },
  {
    id: 466,
    name: "Geneva College",

    logo: "https://media.api-sports.io/american-football/teams/466.png",
  },
  {
    id: 467,
    name: "Berry College",

    logo: "https://media.api-sports.io/american-football/teams/467.png",
  },
  {
    id: 468,
    name: "Wisconsin-Whitewater",

    logo: "https://media.api-sports.io/american-football/teams/468.png",
  },
  {
    id: 469,
    name: "Shippensburg",

    logo: "https://media.api-sports.io/american-football/teams/469.png",
  },
  {
    id: 471,
    name: "Carson-Newman",

    logo: "https://media.api-sports.io/american-football/teams/471.png",
  },
  {
    id: 472,
    name: "Western New England",

    logo: "https://media.api-sports.io/american-football/teams/472.png",
  },
  {
    id: 473,
    name: "Utica College",

    logo: "https://media.api-sports.io/american-football/teams/473.png",
  },
  {
    id: 474,
    name: "Catholic University",

    logo: "https://media.api-sports.io/american-football/teams/474.png",
  },
  {
    id: 475,
    name: "Kean University",

    logo: "https://media.api-sports.io/american-football/teams/475.png",
  },
  {
    id: 476,
    name: "Merchant Marine",

    logo: "https://media.api-sports.io/american-football/teams/476.png",
  },
  {
    id: 477,
    name: "SUNY Maritime",

    logo: "https://media.api-sports.io/american-football/teams/477.png",
  },
  {
    id: 478,
    name: "Guilford",

    logo: "https://media.api-sports.io/american-football/teams/478.png",
  },
  {
    id: 480,
    name: "McDaniel College",

    logo: "https://media.api-sports.io/american-football/teams/480.png",
  },
  {
    id: 481,
    name: "Franklin & Marshall",

    logo: "https://media.api-sports.io/american-football/teams/481.png",
  },
  {
    id: 482,
    name: "New Haven",

    logo: "https://media.api-sports.io/american-football/teams/482.png",
  },
  {
    id: 483,
    name: "American International",

    logo: "https://media.api-sports.io/american-football/teams/483.png",
  },
  {
    id: 484,
    name: "Hobart",

    logo: "https://media.api-sports.io/american-football/teams/484.png",
  },
  {
    id: 486,
    name: "West Virginia State",

    logo: "https://media.api-sports.io/american-football/teams/486.png",
  },
  {
    id: 487,
    name: "Fairmont State",

    logo: "https://media.api-sports.io/american-football/teams/487.png",
  },
  {
    id: 489,
    name: "Montclair State",

    logo: "https://media.api-sports.io/american-football/teams/489.png",
  },
  {
    id: 491,
    name: "Southern Virginia",

    logo: "https://media.api-sports.io/american-football/teams/491.png",
  },
  {
    id: 495,
    name: "Bates College",

    logo: "https://media.api-sports.io/american-football/teams/495.png",
  },
  {
    id: 496,
    name: "William Paterson",

    logo: "https://media.api-sports.io/american-football/teams/496.png",
  },
  {
    id: 497,
    name: "Keystone",

    logo: "https://media.api-sports.io/american-football/teams/497.png",
  },
  {
    id: 499,
    name: "Muhlenberg",

    logo: "https://media.api-sports.io/american-football/teams/499.png",
  },
  {
    id: 502,
    name: "Catawba",

    logo: "https://media.api-sports.io/american-football/teams/502.png",
  },
  {
    id: 504,
    name: "Delaware Valley",

    logo: "https://media.api-sports.io/american-football/teams/504.png",
  },
  {
    id: 505,
    name: "Ohio Dominican",

    logo: "https://media.api-sports.io/american-football/teams/505.png",
  },
  {
    id: 506,
    name: "Colby College",

    logo: "https://media.api-sports.io/american-football/teams/506.png",
  },
  {
    id: 508,
    name: "Gettysburg",

    logo: "https://media.api-sports.io/american-football/teams/508.png",
  },
  {
    id: 510,
    name: "Franklin",

    logo: "https://media.api-sports.io/american-football/teams/510.png",
  },
  {
    id: 511,
    name: "Trine University",

    logo: "https://media.api-sports.io/american-football/teams/511.png",
  },
  {
    id: 512,
    name: "Mount St. Joseph",

    logo: "https://media.api-sports.io/american-football/teams/512.png",
  },
  {
    id: 513,
    name: "Hope",

    logo: "https://media.api-sports.io/american-football/teams/513.png",
  },
  {
    id: 514,
    name: "UMASS Dartmouth",

    logo: "https://media.api-sports.io/american-football/teams/514.png",
  },
  {
    id: 515,
    name: "Framingham State",

    logo: "https://media.api-sports.io/american-football/teams/515.png",
  },
  {
    id: 516,
    name: "Defiance",

    logo: "https://media.api-sports.io/american-football/teams/516.png",
  },
  {
    id: 517,
    name: "Kalamazoo",

    logo: "https://media.api-sports.io/american-football/teams/517.png",
  },
  {
    id: 518,
    name: "John Carroll",

    logo: "https://media.api-sports.io/american-football/teams/518.png",
  },
  {
    id: 519,
    name: "Baldwin Wallace",

    logo: "https://media.api-sports.io/american-football/teams/519.png",
  },
  {
    id: 520,
    name: "Mount Union",

    logo: "https://media.api-sports.io/american-football/teams/520.png",
  },
  {
    id: 521,
    name: "Marietta",

    logo: "https://media.api-sports.io/american-football/teams/521.png",
  },
  {
    id: 522,
    name: "Tufts University",

    logo: "https://media.api-sports.io/american-football/teams/522.png",
  },
  {
    id: 525,
    name: "Austin College",

    logo: "https://media.api-sports.io/american-football/teams/525.png",
  },
  {
    id: 527,
    name: "North Central",

    logo: "https://media.api-sports.io/american-football/teams/527.png",
  },
  {
    id: 528,
    name: "Elmhurst",

    logo: "https://media.api-sports.io/american-football/teams/528.png",
  },
  {
    id: 529,
    name: "Augustana College (IL)",

    logo: "https://media.api-sports.io/american-football/teams/529.png",
  },
  {
    id: 531,
    name: "Augsburg",

    logo: "https://media.api-sports.io/american-football/teams/531.png",
  },
  {
    id: 532,
    name: "Concordia-Chicago",

    logo: "https://media.api-sports.io/american-football/teams/532.png",
  },
  {
    id: 533,
    name: "Aurora",

    logo: "https://media.api-sports.io/american-football/teams/533.png",
  },
  {
    id: 534,
    name: "Washburn",

    logo: "https://media.api-sports.io/american-football/teams/534.png",
  },
  {
    id: 535,
    name: "Nebraska-Kearney",

    logo: "https://media.api-sports.io/american-football/teams/535.png",
  },
  {
    id: 536,
    name: "West Virginia Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/536.png",
  },
  {
    id: 537,
    name: "Concord",

    logo: "https://media.api-sports.io/american-football/teams/537.png",
  },
  {
    id: 538,
    name: "Fort Valley State",

    logo: "https://media.api-sports.io/american-football/teams/538.png",
  },
  {
    id: 539,
    name: "Allen",

    logo: "https://media.api-sports.io/american-football/teams/539.png",
  },
  {
    id: 540,
    name: "Emporia State",

    logo: "https://media.api-sports.io/american-football/teams/540.png",
  },
  {
    id: 541,
    name: "Missouri Western",

    logo: "https://media.api-sports.io/american-football/teams/541.png",
  },
  {
    id: 542,
    name: "Central College",

    logo: "https://media.api-sports.io/american-football/teams/542.png",
  },
  {
    id: 543,
    name: "Loras College",

    logo: "https://media.api-sports.io/american-football/teams/543.png",
  },
  {
    id: 544,
    name: "Wisconsin-Platteville",

    logo: "https://media.api-sports.io/american-football/teams/544.png",
  },
  {
    id: 545,
    name: "Hardin-Simmons",

    logo: "https://media.api-sports.io/american-football/teams/545.png",
  },
  {
    id: 546,
    name: "Benedictine University (IL)",

    logo: "https://media.api-sports.io/american-football/teams/546.png",
  },
  {
    id: 547,
    name: "Concordia (WI)",

    logo: "https://media.api-sports.io/american-football/teams/547.png",
  },
  {
    id: 548,
    name: "Wooster",

    logo: "https://media.api-sports.io/american-football/teams/548.png",
  },
  {
    id: 549,
    name: "Wabash College",

    logo: "https://media.api-sports.io/american-football/teams/549.png",
  },
  {
    id: 551,
    name: "Otterbein",

    logo: "https://media.api-sports.io/american-football/teams/551.png",
  },
  {
    id: 552,
    name: "Sewanee Univ. of the South",

    logo: "https://media.api-sports.io/american-football/teams/552.png",
  },
  {
    id: 555,
    name: "St. Scholastica",

    logo: "https://media.api-sports.io/american-football/teams/555.png",
  },
  {
    id: 556,
    name: "Gustavus Adolphus",

    logo: "https://media.api-sports.io/american-football/teams/556.png",
  },
  {
    id: 557,
    name: "Wisconsin-Stout",

    logo: "https://media.api-sports.io/american-football/teams/557.png",
  },
  {
    id: 558,
    name: "Minot State",

    logo: "https://media.api-sports.io/american-football/teams/558.png",
  },
  {
    id: 559,
    name: "Wayne State (NE)",

    logo: "https://media.api-sports.io/american-football/teams/559.png",
  },
  {
    id: 560,
    name: "Lock Haven",

    logo: "https://media.api-sports.io/american-football/teams/560.png",
  },
  {
    id: 561,
    name: "Clarion",

    logo: "https://media.api-sports.io/american-football/teams/561.png",
  },
  {
    id: 562,
    name: "McMurry",

    logo: "https://media.api-sports.io/american-football/teams/562.png",
  },
  {
    id: 563,
    name: "East Texas Baptist",

    logo: "https://media.api-sports.io/american-football/teams/563.png",
  },
  {
    id: 564,
    name: "New Mexico Highlands",

    logo: "https://media.api-sports.io/american-football/teams/564.png",
  },
  {
    id: 565,
    name: "Fort Lewis",

    logo: "https://media.api-sports.io/american-football/teams/565.png",
  },
  {
    id: 567,
    name: "Millikin",

    logo: "https://media.api-sports.io/american-football/teams/567.png",
  },
  {
    id: 568,
    name: "Eureka College",

    logo: "https://media.api-sports.io/american-football/teams/568.png",
  },
  {
    id: 570,
    name: "Monmouth (IL)",

    logo: "https://media.api-sports.io/american-football/teams/570.png",
  },
  {
    id: 571,
    name: "Illinois College",

    logo: "https://media.api-sports.io/american-football/teams/571.png",
  },
  {
    id: 572,
    name: "Norwich",

    logo: "https://media.api-sports.io/american-football/teams/572.png",
  },
  {
    id: 573,
    name: "Castleton",

    logo: "https://media.api-sports.io/american-football/teams/573.png",
  },
  {
    id: 574,
    name: "Greenville",

    logo: "https://media.api-sports.io/american-football/teams/574.png",
  },
  {
    id: 575,
    name: "Manchester",

    logo: "https://media.api-sports.io/american-football/teams/575.png",
  },
  {
    id: 576,
    name: "California Lutheran",

    logo: "https://media.api-sports.io/american-football/teams/576.png",
  },
  {
    id: 577,
    name: "Puget Sound",

    logo: "https://media.api-sports.io/american-football/teams/577.png",
  },
  {
    id: 579,
    name: "Lewis & Clark",

    logo: "https://media.api-sports.io/american-football/teams/579.png",
  },
  {
    id: 580,
    name: "Amherst College",

    logo: "https://media.api-sports.io/american-football/teams/580.png",
  },
  {
    id: 581,
    name: "Middlebury",

    logo: "https://media.api-sports.io/american-football/teams/581.png",
  },
  {
    id: 582,
    name: "Iowa Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/582.png",
  },
  {
    id: 584,
    name: "Millsaps",

    logo: "https://media.api-sports.io/american-football/teams/584.png",
  },
  {
    id: 585,
    name: "Wisconsin-Oshkosh",

    logo: "https://media.api-sports.io/american-football/teams/585.png",
  },
  {
    id: 586,
    name: "Northwest Missouri State",

    logo: "https://media.api-sports.io/american-football/teams/586.png",
  },
  {
    id: 587,
    name: "Central Missouri",

    logo: "https://media.api-sports.io/american-football/teams/587.png",
  },
  {
    id: 588,
    name: "Lake Forest",

    logo: "https://media.api-sports.io/american-football/teams/588.png",
  },
  {
    id: 589,
    name: "Knox College",

    logo: "https://media.api-sports.io/american-football/teams/589.png",
  },
  {
    id: 590,
    name: "Southern Nazarene",

    logo: "https://media.api-sports.io/american-football/teams/590.png",
  },
  {
    id: 591,
    name: "East Central",

    logo: "https://media.api-sports.io/american-football/teams/591.png",
  },
  {
    id: 592,
    espnID: 2695,
    name: "West Alabama",
    fullName: "West Alabama Tigers",
    code: "WES",
    color: "#d31d33",
    secondaryColor: "#ffffff",
    logo: "https://media.api-sports.io/american-football/teams/592.png",
  },
  {
    id: 593,
    name: "Bemidji State",

    logo: "https://media.api-sports.io/american-football/teams/593.png",
  },
  {
    id: 594,
    name: "Winona State",

    logo: "https://media.api-sports.io/american-football/teams/594.png",
  },
  {
    id: 595,
    name: "University of Mary",

    logo: "https://media.api-sports.io/american-football/teams/595.png",
  },
  {
    id: 596,
    name: "Southwest Minnesota State",

    logo: "https://media.api-sports.io/american-football/teams/596.png",
  },
  {
    id: 597,
    name: "Adams State",

    logo: "https://media.api-sports.io/american-football/teams/597.png",
  },
  {
    id: 598,
    name: "Colorado School of Mines",

    logo: "https://media.api-sports.io/american-football/teams/598.png",
  },
  {
    id: 599,
    name: "Colorado Mesa",

    logo: "https://media.api-sports.io/american-football/teams/599.png",
  },
  {
    id: 600,
    name: "South Dakota Mines",

    logo: "https://media.api-sports.io/american-football/teams/600.png",
  },
  {
    id: 601,
    name: "Carleton College",

    logo: "https://media.api-sports.io/american-football/teams/601.png",
  },
  {
    id: 603,
    name: "Clark Atlanta",

    logo: "https://media.api-sports.io/american-football/teams/603.png",
  },
  {
    id: 604,
    name: "Shaw",

    logo: "https://media.api-sports.io/american-football/teams/604.png",
  },
  {
    id: 605,
    name: "Bowie State",

    logo: "https://media.api-sports.io/american-football/teams/605.png",
  },
  {
    id: 606,
    name: "Hendrix College",

    logo: "https://media.api-sports.io/american-football/teams/606.png",
  },
  {
    id: 607,
    name: "Howard Payne",

    logo: "https://media.api-sports.io/american-football/teams/607.png",
  },
  {
    id: 609,
    name: "Central Washington",

    logo: CentralWashingtonLogo,
  },
  {
    id: 610,
    name: "Erskine",

    logo: "https://media.api-sports.io/american-football/teams/610.png",
  },
  {
    id: 611,
    name: "Lenoir-Rhyne",

    logo: "https://media.api-sports.io/american-football/teams/611.png",
  },
  {
    id: 612,
    name: "Linfield",

    logo: "https://media.api-sports.io/american-football/teams/612.png",
  },
  {
    id: 613,
    name: "Redlands",

    logo: "https://media.api-sports.io/american-football/teams/613.png",
  },
  {
    id: 614,
    name: "Whitworth",

    logo: "https://media.api-sports.io/american-football/teams/614.png",
  },
  {
    id: 615,
    name: "Claremont Mudd Scripps College",

    logo: "https://media.api-sports.io/american-football/teams/615.png",
  },
  {
    id: 616,
    name: "Colorado State-Pueblo",

    logo: "https://media.api-sports.io/american-football/teams/616.png",
  },
  {
    id: 617,
    name: "Western Colorado",

    logo: "https://media.api-sports.io/american-football/teams/617.png",
  },
  {
    id: 618,
    name: "Rensselaer",

    logo: "https://media.api-sports.io/american-football/teams/618.png",
  },
  {
    id: 620,
    name: "Virginia State",

    logo: "https://media.api-sports.io/american-football/teams/620.png",
  },
  {
    id: 622,
    name: "Livingstone",

    logo: "https://media.api-sports.io/american-football/teams/622.png",
  },
  {
    id: 623,
    name: "Buena Vista",

    logo: "https://media.api-sports.io/american-football/teams/623.png",
  },
  {
    id: 624,
    name: "Coe College",

    logo: "https://media.api-sports.io/american-football/teams/624.png",
  },
  {
    id: 625,
    name: "Bluffton",

    logo: "https://media.api-sports.io/american-football/teams/625.png",
  },
  {
    id: 626,
    name: "Adrian",

    logo: "https://media.api-sports.io/american-football/teams/626.png",
  },
  {
    id: 627,
    name: "Anderson (IN)",

    logo: "https://media.api-sports.io/american-football/teams/627.png",
  },
  {
    id: 628,
    name: "Alma College",

    logo: "https://media.api-sports.io/american-football/teams/628.png",
  },
  {
    id: 630,
    name: "Wayne State (MI)",

    logo: "https://media.api-sports.io/american-football/teams/630.png",
  },
  {
    id: 631,
    name: "Wisconsin-La Crosse",

    logo: "https://media.api-sports.io/american-football/teams/631.png",
  },
  {
    id: 632,
    name: "Missouri Southern State",

    logo: "https://media.api-sports.io/american-football/teams/632.png",
  },
  {
    id: 633,
    name: "Central Oklahoma",

    logo: "https://media.api-sports.io/american-football/teams/633.png",
  },
  {
    id: 634,
    name: "Franklin Pierce",

    logo: "https://media.api-sports.io/american-football/teams/634.png",
  },
  {
    id: 635,
    name: "St. Anselm",

    logo: "https://media.api-sports.io/american-football/teams/635.png",
  },
  {
    id: 636,
    name: "Averett",

    logo: "https://media.api-sports.io/american-football/teams/636.png",
  },
  {
    id: 637,
    name: "Brevard College",

    logo: "https://media.api-sports.io/american-football/teams/637.png",
  },
  {
    id: 638,
    name: "Tusculum",

    logo: "https://media.api-sports.io/american-football/teams/638.png",
  },
  {
    id: 639,
    name: "Wingate",

    logo: "https://media.api-sports.io/american-football/teams/639.png",
  },
  {
    id: 640,
    name: "Arkansas Tech",

    logo: "https://media.api-sports.io/american-football/teams/640.png",
  },
  {
    id: 641,
    name: "Ouachita Baptist",

    logo: "https://media.api-sports.io/american-football/teams/641.png",
  },
  {
    id: 642,
    name: "Henderson State",

    logo: "https://media.api-sports.io/american-football/teams/642.png",
  },
  {
    id: 643,
    name: "Arkansas-Monticello",

    logo: "https://media.api-sports.io/american-football/teams/643.png",
  },
  {
    id: 644,
    name: "Mary Hardin-Baylor",

    logo: "https://media.api-sports.io/american-football/teams/644.png",
  },
  {
    id: 645,
    name: "Southwestern University",

    logo: "https://media.api-sports.io/american-football/teams/645.png",
  },
  {
    id: 646,
    name: "Trinity University (TX)",

    logo: "https://media.api-sports.io/american-football/teams/646.png",
  },
  {
    id: 647,
    name: "Texas Lutheran",

    logo: "https://media.api-sports.io/american-football/teams/647.png",
  },
  {
    id: 648,
    name: "Carroll (WI)",

    logo: "https://media.api-sports.io/american-football/teams/648.png",
  },
  {
    id: 649,
    name: "North Park",

    logo: "https://media.api-sports.io/american-football/teams/649.png",
  },
  {
    id: 651,
    name: "Illinois Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/651.png",
  },
  {
    id: 652,
    name: "Harding University",

    logo: "https://media.api-sports.io/american-football/teams/652.png",
  },
  {
    id: 653,
    name: "Southern Arkansas",

    logo: "https://media.api-sports.io/american-football/teams/653.png",
  },
  {
    id: 654,
    name: "Northwestern Oklahoma State",

    logo: "https://media.api-sports.io/american-football/teams/654.png",
  },
  {
    id: 655,
    name: "Oklahoma Baptist",

    logo: "https://media.api-sports.io/american-football/teams/655.png",
  },
  {
    id: 656,
    name: "Southwestern Oklahoma",

    logo: "https://media.api-sports.io/american-football/teams/656.png",
  },
  {
    id: 657,
    name: "Southeastern Oklahoma",

    logo: "https://media.api-sports.io/american-football/teams/657.png",
  },
  {
    id: 659,
    name: "Indianapolis",

    logo: "https://media.api-sports.io/american-football/teams/659.png",
  },
  {
    id: 660,
    name: "Grand Valley State",

    logo: "https://media.api-sports.io/american-football/teams/660.png",
  },
  {
    id: 661,
    name: "Lincoln (MO)",

    logo: "https://media.api-sports.io/american-football/teams/661.png",
  },
  {
    id: 662,
    name: "Fort Hays State",

    logo: "https://media.api-sports.io/american-football/teams/662.png",
  },
  {
    id: 663,
    name: "Valdosta State",
    code: "VAL",
    logo: "https://media.api-sports.io/american-football/teams/663.png",
  },
  {
    id: 664,
    name: "Minnesota Duluth",

    logo: "https://media.api-sports.io/american-football/teams/664.png",
  },
  {
    id: 665,
    name: "Upper Iowa",

    logo: "https://media.api-sports.io/american-football/teams/665.png",
  },
  {
    id: 666,
    name: "Northern State",

    logo: "https://media.api-sports.io/american-football/teams/666.png",
  },
  {
    id: 667,
    name: "Minnesota State",

    logo: "https://media.api-sports.io/american-football/teams/667.png",
  },
  {
    id: 668,
    name: "Wisconsin-Stevens Point",

    logo: "https://media.api-sports.io/american-football/teams/668.png",
  },
  {
    id: 670,
    name: "Wisconsin Lutheran",

    logo: "https://media.api-sports.io/american-football/teams/670.png",
  },
  {
    id: 671,
    name: "Lakeland University",

    logo: "https://media.api-sports.io/american-football/teams/671.png",
  },
  {
    id: 672,
    name: "Heidelberg",

    logo: "https://media.api-sports.io/american-football/teams/672.png",
  },
  {
    id: 673,
    name: "Ohio Northern",

    logo: "https://media.api-sports.io/american-football/teams/673.png",
  },
  {
    id: 675,
    name: "Allegheny",

    logo: "https://media.api-sports.io/american-football/teams/675.png",
  },
  {
    id: 676,
    name: "Case Western Reserve",

    logo: "https://media.api-sports.io/american-football/teams/676.png",
  },
  {
    id: 677,
    name: "Washington & Jefferson",

    logo: "https://media.api-sports.io/american-football/teams/677.png",
  },
  {
    id: 678,
    name: "Wisconsin-River Falls",

    logo: "https://media.api-sports.io/american-football/teams/678.png",
  },
  {
    id: 680,
    name: "Muskingum",

    logo: "https://media.api-sports.io/american-football/teams/680.png",
  },
  {
    id: 681,
    name: "Capital University",

    logo: "https://media.api-sports.io/american-football/teams/681.png",
  },
  {
    id: 682,
    name: "Concordia-St. Paul",

    logo: "https://media.api-sports.io/american-football/teams/682.png",
  },
  {
    id: 683,
    name: "Sioux Falls",

    logo: "https://media.api-sports.io/american-football/teams/683.png",
  },
  {
    id: 684,
    name: "Kentucky Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/684.png",
  },
  {
    id: 685,
    name: "Midwestern State",

    logo: "https://media.api-sports.io/american-football/teams/685.png",
  },
  {
    id: 687,
    name: "Angelo State",

    logo: "https://media.api-sports.io/american-football/teams/687.png",
  },
  {
    id: 688,
    name: "Pittsburg State",

    logo: "https://media.api-sports.io/american-football/teams/688.png",
  },
  {
    id: 689,
    name: "Northeastern State",

    logo: "https://media.api-sports.io/american-football/teams/689.png",
  },
  {
    id: 690,
    name: "Black Hills State",

    logo: "https://media.api-sports.io/american-football/teams/690.png",
  },
  {
    id: 691,
    name: "West Texas A&M",

    logo: "https://media.api-sports.io/american-football/teams/691.png",
  },

  {
    id: 692,
    name: "Texas A&M-Kingsville",

    logo: "https://media.api-sports.io/american-football/teams/692.png",
  },
  {
    id: 694,
    name: "Chapman University",

    logo: "https://media.api-sports.io/american-football/teams/694.png",
  },
  {
    id: 695,
    name: "Pacific (OR)",

    logo: "https://media.api-sports.io/american-football/teams/695.png",
  },
  {
    id: 697,
    name: "Pacific Lutheran",

    logo: "https://media.api-sports.io/american-football/teams/697.png",
  },
  {
    id: 698,
    name: "Lycoming",

    logo: "https://media.api-sports.io/american-football/teams/698.png",
  },
  {
    id: 699,
    name: "MIT",

    logo: "https://media.api-sports.io/american-football/teams/699.png",
  },
  {
    id: 700,
    name: "Ohio Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/700.png",
  },
  {
    id: 701,
    name: "Rowan",

    logo: "https://media.api-sports.io/american-football/teams/701.png",
  },
  {
    id: 702,
    name: "Belhaven University",

    logo: "https://media.api-sports.io/american-football/teams/702.png",
  },
  {
    id: 703,
    name: "Wisconsin-Eau Claire",

    logo: "https://media.api-sports.io/american-football/teams/703.png",
  },
  {
    id: 704,
    name: "Concordia-Moorhead",

    logo: "https://media.api-sports.io/american-football/teams/704.png",
  },
  {
    id: 705,
    name: "Hamline",

    logo: "https://media.api-sports.io/american-football/teams/705.png",
  },
  {
    id: 706,
    name: "Bethel (MN)",

    logo: "https://media.api-sports.io/american-football/teams/706.png",
  },
  {
    id: 709,
    name: "Ashland",

    logo: "https://media.api-sports.io/american-football/teams/709.png",
  },
  {
    id: 710,
    name: "Christopher Newport",

    logo: "https://media.api-sports.io/american-football/teams/710.png",
  },
  {
    id: 711,
    name: "Rhodes College",

    logo: "https://media.api-sports.io/american-football/teams/711.png",
  },
  {
    id: 712,
    name: "Macalester",

    logo: "https://media.api-sports.io/american-football/teams/712.png",
  },
  {
    id: 714,
    name: "Centre College",

    logo: "https://media.api-sports.io/american-football/teams/714.png",
  },
  {
    id: 715,
    name: "Hartwick",

    logo: "https://media.api-sports.io/american-football/teams/715.png",
  },
  {
    id: 716,
    espnID: 2698,
    name: "West Georgia",
    fullName: "West Georgia Wolves",
    code: "WGA",
    color: "#0033a1",
    secondaryColor: "#db1a21",
    logo: "https://media.api-sports.io/american-football/teams/716.png",
  },
  {
    id: 717,
    name: "Ferris State",

    logo: "https://media.api-sports.io/american-football/teams/717.png",
  },
  {
    id: 719,
    name: "Bethany (WV)",

    logo: "https://media.api-sports.io/american-football/teams/719.png",
  },
  {
    id: 720,
    name: "West Florida",

    logo: "https://media.api-sports.io/american-football/teams/720.png",
  },
  {
    id: 721,
    name: "Birmingham-Southern",

    logo: "https://media.api-sports.io/american-football/teams/721.png",
  },
  {
    id: 722,
    name: "Point University",

    logo: "https://media.api-sports.io/american-football/teams/722.png",
  },
  {
    id: 723,
    name: "Apprentice School",

    logo: "https://media.api-sports.io/american-football/teams/723.png",
  },
  {
    id: 724,
    name: "UFTL",

    logo: "https://media.api-sports.io/american-football/teams/724.png",
  },
  {
    id: 727,
    name: "Arkansas Baptist",

    logo: "https://media.api-sports.io/american-football/teams/727.png",
  },
  {
    id: 728,
    name: "Northwestern (IA)",

    logo: "https://media.api-sports.io/american-football/teams/728.png",
  },
  {
    id: 729,
    name: "Webber International",

    logo: "https://media.api-sports.io/american-football/teams/729.png",
  },
  {
    id: 730,
    name: "UAlbany",

    logo: UAlbanyLogo,
  },
  {
    id: 731,
    name: "Tarleton State",

    logo: "https://media.api-sports.io/american-football/teams/731.png",
  },
  {
    id: 732,
    name: "Lincoln (CA)",

    logo: "https://media.api-sports.io/american-football/teams/732.png",
  },
  {
    id: 733,
    name: "College of Idaho",

    logo: "https://media.api-sports.io/american-football/teams/733.png",
  },
  {
    id: 734,
    name: "Northwood (MI)",

    logo: "https://media.api-sports.io/american-football/teams/734.png",
  },
  {
    id: 735,
    name: "Saginaw Valley State",

    logo: "https://media.api-sports.io/american-football/teams/735.png",
  },
  {
    id: 736,
    name: "UNC Pembroke",

    logo: "https://media.api-sports.io/american-football/teams/736.png",
  },
  {
    id: 737,
    name: "Indiana-Pennsylvania",

    logo: "https://media.api-sports.io/american-football/teams/737.png",
  },
  {
    id: 738,
    name: "Millersville",

    logo: "https://media.api-sports.io/american-football/teams/738.png",
  },
  {
    id: 739,
    name: "Minnesota State Moorhead",

    logo: "https://media.api-sports.io/american-football/teams/739.png",
  },
  {
    id: 740,
    name: "Rockford",

    logo: "https://media.api-sports.io/american-football/teams/740.png",
  },
  {
    id: 741,
    name: "Dakota State",

    logo: "https://media.api-sports.io/american-football/teams/741.png",
  },
  {
    id: 742,
    name: "Salve Regina",

    logo: "https://media.api-sports.io/american-football/teams/742.png",
  },
  {
    id: 743,
    name: "WPI",

    logo: "https://media.api-sports.io/american-football/teams/743.png",
  },
  {
    id: 744,
    name: "Ursinus",
    code: "URS",
    logo: "https://media.api-sports.io/american-football/teams/744.png",
  },
  {
    id: 745,
    name: "Alvernia",

    logo: "https://media.api-sports.io/american-football/teams/745.png",
  },
  {
    id: 746,
    name: "Valley City State",

    logo: "https://media.api-sports.io/american-football/teams/746.png",
  },
  {
    id: 747,
    name: "Lyon College",

    logo: "https://media.api-sports.io/american-football/teams/747.png",
  },
  {
    id: 748,
    name: "Notre Dame College (OH)",

    logo: "https://media.api-sports.io/american-football/teams/748.png",
  },
  {
    id: 749,
    name: "Lake Erie",

    logo: "https://media.api-sports.io/american-football/teams/749.png",
  },
  {
    id: 750,
    name: "Tiffin",

    logo: "https://media.api-sports.io/american-football/teams/750.png",
  },
  {
    id: 751,
    name: "Randolph-Macon",

    logo: "https://media.api-sports.io/american-football/teams/751.png",
  },
  {
    id: 752,
    name: "University of Rochester (NY)",

    logo: "https://media.api-sports.io/american-football/teams/752.png",
  },
  {
    id: 753,
    name: "Davenport University-Grand Rapids",

    logo: "https://media.api-sports.io/american-football/teams/753.png",
  },
  {
    id: 754,
    name: "Union (NY)",

    logo: "https://media.api-sports.io/american-football/teams/754.png",
  },
  {
    id: 755,
    name: "Kings College (PA)",

    logo: "https://media.api-sports.io/american-football/teams/755.png",
  },
  {
    id: 756,
    name: "Eastern University",

    logo: "https://media.api-sports.io/american-football/teams/756.png",
  },
  {
    id: 757,
    name: "Springfield",

    logo: "https://media.api-sports.io/american-football/teams/757.png",
  },
  {
    id: 758,
    name: "St. John Fisher University",

    logo: "https://media.api-sports.io/american-football/teams/758.png",
  },
  {
    id: 759,
    name: "Emory & Henry College",

    logo: "https://media.api-sports.io/american-football/teams/759.png",
  },
  {
    id: 760,
    name: "Dickinson (PA)",

    logo: "https://media.api-sports.io/american-football/teams/760.png",
  },
  {
    id: 761,
    name: "Shenandoah",

    logo: "https://media.api-sports.io/american-football/teams/761.png",
  },
  {
    id: 762,
    name: "Plymouth State",

    logo: "https://media.api-sports.io/american-football/teams/762.png",
  },
  {
    id: 763,
    name: "Maryville College (TN)",

    logo: "https://media.api-sports.io/american-football/teams/763.png",
  },
  {
    id: 764,
    name: "Westminster (PA)",

    logo: "https://media.api-sports.io/american-football/teams/764.png",
  },
  {
    id: 765,
    name: "Wittenberg",

    logo: "https://media.api-sports.io/american-football/teams/765.png",
  },
  {
    id: 766,
    name: "Nebraska Wesleyan",

    logo: "https://media.api-sports.io/american-football/teams/766.png",
  },
  {
    id: 767,
    name: "Carthage",

    logo: "https://media.api-sports.io/american-football/teams/767.png",
  },
  {
    id: 768,
    name: "Martin Luther",

    logo: "https://media.api-sports.io/american-football/teams/768.png",
  },
  {
    id: 769,
    name: "Northwestern (MN)",

    logo: "https://media.api-sports.io/american-football/teams/769.png",
  },
  {
    id: 770,
    name: "Crown College",

    logo: "https://media.api-sports.io/american-football/teams/770.png",
  },
  {
    id: 771,
    name: "St. Norbert",

    logo: "https://media.api-sports.io/american-football/teams/771.png",
  },
  {
    id: 772,
    name: "St. Ambrose",

    logo: "https://media.api-sports.io/american-football/teams/772.png",
  },
  {
    id: 773,
    name: "Westminster (MO)",

    logo: "https://media.api-sports.io/american-football/teams/773.png",
  },
  {
    id: 774,
    name: "Roosevelt",

    logo: "https://media.api-sports.io/american-football/teams/774.png",
  },
  {
    id: 775,
    name: "Bluefield State University",

    logo: "https://media.api-sports.io/american-football/teams/775.png",
  },
  {
    id: 776,
    name: "Huntingdon College (AL)",

    logo: "https://media.api-sports.io/american-football/teams/776.png",
  },
  {
    id: 777,
    name: "Saint Augustine's",

    logo: "https://media.api-sports.io/american-football/teams/777.png",
  },
  {
    id: 778,
    name: "Simpson College (IA)",

    logo: "https://media.api-sports.io/american-football/teams/778.png",
  },
  {
    id: 779,
    name: "Southeastern University",

    logo: "https://media.api-sports.io/american-football/teams/779.png",
  },
  {
    id: 780,
    name: "George Fox",

    logo: "https://media.api-sports.io/american-football/teams/780.png",
  },
  {
    id: 781,
    name: "Union College",

    logo: "https://media.api-sports.io/american-football/teams/781.png",
  },
  {
    id: 782,
    name: "Minnesota Morris",

    logo: "https://media.api-sports.io/american-football/teams/782.png",
  },
  {
    id: 783,
    name: "Oklahoma Panhandle State",

    logo: "https://media.api-sports.io/american-football/teams/783.png",
  },
  {
    id: 784,
    name: "UT Permian Basin",

    logo: "https://media.api-sports.io/american-football/teams/784.png",
  },
  {
    id: 785,
    name: "Wheeling",

    logo: "https://media.api-sports.io/american-football/teams/785.png",
  },
  {
    id: 786,
    name: "Mayville State",

    logo: "https://media.api-sports.io/american-football/teams/786.png",
  },
  {
    id: 787,
    name: "Saint Vincent",

    logo: "https://media.api-sports.io/american-football/teams/787.png",
  },
  {
    id: 788,
    name: "Thiel",

    logo: "https://media.api-sports.io/american-football/teams/788.png",
  },
  {
    id: 789,
    name: "Sul Ross State",

    logo: "https://media.api-sports.io/american-football/teams/789.png",
  },
  {
    id: 790,
    name: "Stevenson",

    logo: "https://media.api-sports.io/american-football/teams/790.png",
  },
  {
    id: 791,
    name: "Waynesburg",

    logo: "https://media.api-sports.io/american-football/teams/791.png",
  },
  {
    id: 792,
    name: "Wilmington (OH)",

    logo: "https://media.api-sports.io/american-football/teams/792.png",
  },
  {
    id: 793,
    name: "Pomona Pitzer",

    logo: "https://media.api-sports.io/american-football/teams/793.png",
  },
  {
    id: 794,
    name: "Wheaton",

    logo: "https://media.api-sports.io/american-football/teams/794.png",
  },
  {
    id: 795,
    name: "Madonna University (Mich.)",

    logo: "https://media.api-sports.io/american-football/teams/795.png",
  },
  {
    id: 796,
    name: "Saint John's (MN)",

    logo: "https://media.api-sports.io/american-football/teams/796.png",
  },
  {
    id: 797,
    name: "Lawrence University",

    logo: "https://media.api-sports.io/american-football/teams/797.png",
  },
  {
    id: 798,
    name: "Dickinson State",

    logo: "https://media.api-sports.io/american-football/teams/798.png",
  },
  {
    id: 799,
    name: "St. Olaf",

    logo: "https://media.api-sports.io/american-football/teams/799.png",
  },
  {
    id: 800,
    name: "Eastern Oregon",

    logo: "https://media.api-sports.io/american-football/teams/800.png",
  },
  {
    id: 801,
    name: "Columbus State",

    logo: "https://media.api-sports.io/american-football/teams/801.png",
  },
  {
    id: 802,
    name: "Southwestern Assemblies of God",

    logo: "https://media.api-sports.io/american-football/teams/802.png",
  },
  {
    id: 803,
    name: "Arizona Christian",

    logo: "https://media.api-sports.io/american-football/teams/803.png",
  },
  {
    id: 804,
    name: "Wayland Baptist",

    logo: "https://media.api-sports.io/american-football/teams/804.png",
  },
  {
    id: 805,
    name: "Wesleyan University (CT)",

    logo: "https://media.api-sports.io/american-football/teams/805.png",
  },
  {
    id: 806,
    name: "Trinity (CT)",

    logo: "https://media.api-sports.io/american-football/teams/806.png",
  },
  {
    id: 807,
    name: "Montana-Western",

    logo: "https://media.api-sports.io/american-football/teams/807.png",
  },
  {
    id: 808,
    name: "Southern Oregon",

    logo: "https://media.api-sports.io/american-football/teams/808.png",
  },
  {
    id: 809,
    name: "Williams",

    logo: "https://media.api-sports.io/american-football/teams/809.png",
  },
  {
    id: 810,
    name: "Washington University (St. Louis)",

    logo: "https://media.api-sports.io/american-football/teams/810.png",
  },
  {
    id: 811,
    name: "Washington and Lee",

    logo: "https://media.api-sports.io/american-football/teams/811.png",
  },
  {
    id: 812,
    name: "St. Xavier (IL)",

    logo: "https://media.api-sports.io/american-football/teams/812.png",
  },
  {
    id: 813,
    espnID: 2534,
    name: "Sam Houston",
    fullName: "Sam Houston Bearkats",
    code: "SHSU",
    color: "#fe5000",
    secondaryColor: "#000000",
    logo: SamHoustonLogo,
    logoLight: SamHoustonLogoLight,
  },
  {
    id: 207,
    espnID: 2752,
    name: "Xavier",
    fullName: "Xavier Musketeers",
    shortName: "Xavier",
    code: "XAV",
    color: "#21304e",
    secondaryColor: "#a5a7a8",
    logo: XavierLogo,
    logoLight: XavierLogoLight,
  },
  {
    id: 814,
    name: "Montana Tech",
    logo: "https://media.api-sports.io/american-football/teams/814.png",
  },
  {
    id: 815,
    name: "St. Thomas-Minnesota",

    logo: "https://media.api-sports.io/american-football/teams/815.png",
  },
  {
    id: 3383,
    espnID: 2837,
    name: "East Texas A&M",
    fullName: "East Texas A&M Lions",
    code: "ETAM",
    color: "#00386C",
    secondaryColor: "#FFC333",
    logo: ETAMLogo,
  },
  {
    id: 1927,
    espnID: 2250,
    name: "Gonzaga",
    fullName: "Gonzaga Bulldogs",
    code: "GONZ",
    color: "#041e42",
    secondaryColor: "#c8102e",
    logo: GonzagaLogo,
  },
  {
    id: 1500,
    espnID: 45,
    name: "George Washington",
    fullName: "George Washington Revolutionaries",
    shortName: "G Washington",
    code: "GW",
    color: "#002843",
    secondaryColor: "#e8d2a1",
    logo: GeorgeWashingtonLogo,
  },
  {
    id: 2020,
    espnID: 116,
    name: "Mount St. Mary's",
    fullName: "Mount St. Mary's Mountaineers",
    shortName: "Mount St Marys",
    code: "MSM",
    color: "#005596",
    secondaryColor: "#ebebeb",
    logo: MountSaintMarys,
  },
  {
    id: 182,
    espnID: 156,
    name: "Creighton",
    fullName: "Creighton Bluejays",
    code: "CREI",
    color: "#005ca9",
    secondaryColor: "#6cadde",
    logo: CreightonLogo,
  },
  {
    id: 2127,
    espnID: 2599,
    name: "St. John's",
    fullName: "St. John's Red Storm",
    code: "SJU",
    color: "#d10000",
    secondaryColor: "#101010",
    logo: StJohnsLogo,
    logoLight: StJohnsLogoLight,
  },
];

export const conferenceListMap: Record<string, string[]> = {
  "American Athletic Conference (AAC)": [
    "Army Black Knights",
    "Charlotte 49ers",
    "East Carolina Pirates",
    "Florida Atlantic Owls",
    "Memphis Tigers",
    "Navy Midshipmen",
    "North Texas Mean Green",
    "Rice Owls",
    "South Florida Bulls",
    "Temple Owls",
    "Tulane Green Wave",
    "Tulsa Golden Hurricane",
    "UAB Blazers",
    "UTSA Roadrunners",
  ],

  ACC: [
    "Boston College Eagles",
    "California Golden Bears",
    "Clemson Tigers",
    "Duke Blue Devils",
    "Florida State Seminoles",
    "Georgia Tech Yellow Jackets",
    "Louisville Cardinals",
    "Miami (FL) Hurricanes",
    "NC State Wolfpack",
    "North Carolina Tar Heels",
    "Pitt Panthers",
    "SMU Mustangs",
    "Stanford Cardinal",
    "Syracuse Orange",
    "Virginia Cavaliers",
    "Virginia Tech Hokies",
    "Wake Forest Demon Deacons",
  ],

  // Add to conferenceListMap:
  "Atlantic 10": [
    "Davidson Wildcats",
    "Dayton Flyers",
    "Duquesne Dukes",
    "Fordham Rams",
    "George Mason Patriots",
    "George Washington Revolutionaries",
    "La Salle Explorers",
    "Loyola Chicago Ramblers",
    "Rhode Island Rams",
    "Richmond Spiders",
    "Saint Joseph’s Hawks",
    "Saint Louis Billikens",
    "St. Bonaventure Bonnies",
    "VCU Rams",
    "UMass Lowell River Hawks", // (if still member for the season you target)
  ],

  "Big 12": [
    "Arizona Wildcats",
    "Arizona State Sun Devils",
    "Baylor Bears",
    "BYU Cougars",
    "Cincinnati Bearcats",
    "Colorado Buffaloes",
    "Houston Cougars",
    "Iowa State Cyclones",
    "Kansas Jayhawks",
    "Kansas State Wildcats",
    "Oklahoma State Cowboys",
    "TCU Horned Frogs",
    "Texas Tech Red Raiders",
    "UCF Knights",
    "Utah Utes",
    "West Virginia Mountaineers",
  ],

  "Big Ten": [
    "Illinois Fighting Illini",
    "Indiana Hoosiers",
    "Iowa Hawkeyes",
    "Maryland Terrapins",
    "Michigan Wolverines",
    "Michigan State Spartans",
    "Minnesota Golden Gophers",
    "Nebraska Cornhuskers",
    "Northwestern Wildcats",
    "Ohio State Buckeyes",
    "Oregon Ducks",
    "Penn State Nittany Lions",
    "Purdue Boilermakers",
    "Rutgers Scarlet Knights",
    "UCLA Bruins",
    "USC Trojans",
    "Washington Huskies",
    "Wisconsin Badgers",
  ],

  CUSA: [
    "Delaware Fightin' Blue Hens",
    "FIU Panthers",
    "Jacksonville State Gamecocks",
    "Kennesaw State Owls",
    "Liberty Flames",
    "Louisiana Tech Bulldogs",
    "Middle Tennessee Blue Raiders",
    "Missouri State Bears",
    "New Mexico State Aggies",
    "Sam Houston Bearkats",
    "UTEP Miners",
    "Western Kentucky Hilltoppers",
  ],

  MAC: [
    "Akron Zips",
    "Ball State Cardinals",
    "Bowling Green Falcons",
    "Buffalo Bulls",
    "Central Michigan Chippewas",
    "Eastern Michigan Eagles",
    "Kent State Golden Flashes",
    "UMass Minutemen",
    "Miami (OH) RedHawks",
    "Northern Illinois Huskies",
    "Ohio Bobcats",
    "Toledo Rockets",
    "Western Michigan Broncos",
  ],

  MWC: [
    "Air Force Falcons",
    "Boise State Broncos",
    "Colorado State Rams",
    "Fresno State Bulldogs",
    "Hawai'i Rainbow Warriors",
    "Nevada Wolf Pack",
    "New Mexico Lobos",
    "San Diego State Aztecs",
    "San Jose State Spartans",
    "UNLV Rebels",
    "Utah State Aggies",
    "Wyoming Cowboys",
  ],

  SEC: [
    "Alabama Crimson Tide",
    "Arkansas Razorbacks",
    "Auburn Tigers",
    "Florida Gators",
    "Georgia Bulldogs",
    "Kentucky Wildcats",
    "LSU Tigers",
    "Mississippi State Bulldogs",
    "Missouri Tigers",
    "Oklahoma Sooners",
    "Ole Miss Rebels",
    "South Carolina Gamecocks",
    "Tennessee Volunteers",
    "Texas Longhorns",
    "Texas A&M Aggies",
    "Vanderbilt Commodores",
  ],

  "Sun Belt": [
    "Appalachian State Mountaineers",
    "Arkansas State Red Wolves",
    "Coastal Carolina Chanticleers",
    "Georgia Southern Eagles",
    "Georgia State Panthers",
    "James Madison Dukes",
    "Louisiana Ragin' Cajuns",
    "Louisiana-Monroe Warhawks",
    "Marshall Thundering Herd",
    "Old Dominion Monarchs",
    "South Alabama Jaguars",
    "Southern Miss Golden Eagles",
    "Texas State Bobcats",
    "Troy Trojans",
  ],
  A10: [
    "Davidson Wildcats",
    "Dayton Flyers",
    "Duquesne Dukes",
    "Fordham Rams",
    "George Mason Patriots",
    "George Washington Revolutionaries",
    "La Salle Explorers",
    "Loyola Chicago Ramblers",
    "Rhode Island Rams",
    "Richmond Spiders",
    "Saint Joseph's Hawks",
    "Saint Louis Billikens",
    "St. Bonaventure Bonnies",
    "VCU Rams",
    "UMass Lowell River Hawks",
  ],
  "FBS Independents": [
    "UConn Huskies",
    "Notre Dame Fighting Irish",
    "Oregon State Beavers",
    "Washington State Cougars",
  ],
};

// Conference teams
export const conferenceObjectListMap: Conference[] = [
  {
    name: "AAC",
    logo: AmericanAthleticConference,
    color: {
      primary: "#041E41",
      secondary: "#EE2231",
    },
    teams: [
      "Army",
      "Charlotte",
      "East Carolina",
      "Florida Atlantic",
      "Memphis",
      "Navy",
      "North Texas",
      "Rice",
      "South Florida",
      "Temple",
      "Tulane",
      "Tulsa",
      "UAB",
      "UTSA",
    ],
  },
  {
    name: "ACC",
    logo: AtlanticCoastConference,
    color: {
      primary: "#013CA6",
      secondary: "#A5A9AB",
    },
    teams: [
      "Boston College",
      "California",
      "Clemson",
      "Duke",
      "Florida State",
      "Georgia Tech",
      "Louisville",
      "Miami (FL)",
      "NC State",
      "North Carolina",
      "Pittsburgh",
      "SMU",
      "Stanford",
      "Syracuse",
      "Virginia",
      "Virginia Tech",
      "Wake Forest",
    ],
  },

  {
    name: "Atlantic 10",
    logo: A10Conference,
    color: {
      primary: "#E12726",
      secondary: "#231F20",
    },
    teams: [
      "Davidson",
      "Dayton",
      "Duquesne",
      "Fordham",
      "George Mason",
      "George Washington",
      "La Salle",
      "Loyola Chicago",
      "Rhode Island",
      "Richmond",
      "Saint Joseph’s",
      "Saint Louis",
      "St. Bonaventure",
      "VCU",
      "UMass Lowell",
    ],
  },

  {
    name: "Big 12",
    logo: BIG12Conference,
    color: {
      primary: "#C41230",
      secondary: "#FFFFFF",
    },
    teams: [
      "Arizona",
      "Arizona State",
      "Baylor",
      "BYU",
      "Cincinnati",
      "Colorado",
      "Houston",
      "Iowa State",
      "Kansas",
      "Kansas State",
      "Oklahoma State",
      "TCU",
      "Texas Tech",
      "UCF",
      "Utah",
      "West Virginia",
    ],
  },
  {
    name: "Big Ten",
    logo: BIG10Conference,
    color: {
      primary: "#0088CE",
      secondary: "#000000",
    },
    teams: [
      "Illinois",
      "Indiana",
      "Iowa",
      "Maryland",
      "Michigan",
      "Michigan State",
      "Minnesota",
      "Nebraska",
      "Northwestern",
      "Ohio State",
      "Oregon",
      "Penn State",
      "Purdue",
      "Rutgers",
      "UCLA",
      "USC",
      "Washington",
      "Wisconsin",
    ],
  },
  {
    name: "CUSA",
    logo: ConferenceUSA,
    color: {
      primary: "#003865",
      secondary: "#A6192E",
    },
    teams: [
      "Delaware",
      "FIU",
      "Jacksonville State",
      "Kennesaw State",
      "Liberty",
      "Louisiana Tech",
      "Middle Tennessee",
      "Missouri State",
      "New Mexico State",
      "Sam Houston",
      "UTEP",
      "Western Kentucky",
    ],
  },
  {
    name: "MAC",
    logo: MidAmericanConference,
    color: {
      primary: "#0B213E",
      secondary: "#019E4F",
    },
    teams: [
      "Akron",
      "Ball State",
      "Bowling Green",
      "Buffalo",
      "Central Michigan",
      "Eastern Michigan",
      "Kent State",
      "UMass",
      "Miami (OH)",
      "Northern Illinois",
      "Ohio",
      "Toledo",
      "Western Michigan",
    ],
  },
  {
    name: "MWC",
    logo: MountainWestConference,
    color: {
      primary: "#4F2D7F",
      secondary: "#AFAFAF",
    },
    teams: [
      "Air Force",
      "Hawai'i",
      "Nevada",
      "New Mexico",
      "San José State",
      "UNLV",
      "Wyoming",
    ],
  },
  {
    name: "SEC",
    logo: SoutheasternConference,
    color: {
      primary: "#22356B",
      secondary: "#FFFFFF",
    },
    teams: [
      "Alabama",
      "Arkansas",
      "Auburn",
      "Florida",
      "Georgia",
      "Kentucky",
      "LSU",
      "Mississippi State",
      "Missouri",
      "Oklahoma",
      "Ole Miss",
      "South Carolina",
      "Tennessee",
      "Texas",
      "Texas A&M",
      "Vanderbilt",
    ],
  },
  {
    name: "Sun Belt",
    logo: SunBeltConference,
    color: {
      primary: "#F6A800",
      secondary: "#0A2240",
    },
    teams: [
      "Appalachian State",
      "Arkansas State",
      "Coastal Carolina",
      "Georgia Southern",
      "Georgia State",
      "James Madison",
      "Louisiana",
      "UL Monroe",
      "Marshall",
      "Old Dominion",
      "South Alabama",
      "Southern Miss",
      "Troy",
    ],
  },
  {
    name: "Pac-12",
    logo: PAC12Conference,
    color: {
      primary: "#092346",
      secondary: "#FFFFFF",
    },
    teams: ["Oregon State", "Washington State"],
  },
  {
    name: "FBS Independents",
    logo: NCAALogo,
    color: {
      primary: "#009CDE",
      secondary: "#fff",
    },
    teams: ["UConn", "Notre Dame"],
  },
];

// --- Helper mapping from modal name to conference key ---
export const modalToMapKey: Record<string, string> = {
  SEC: "SEC",
  "Big Ten": "Big Ten",
  "Big 12": "Big 12",
  ACC: "ACC",
  "Pac-12": "Pac-12",
  AAC: "AAC",
  MWC: "MWC",
  "Sun Belt": "Sun Belt",
  CUSA: "CUSA",
  MAC: "MAC",
  "FBS Independents": "FBS Independents",
};

export const getTeamInfo = (teamId: number | string) => {
  if (teamId == null) return undefined;
  return teams.find((t) => String(t.id) === String(teamId));
};

export function getTeamLogo(idOrAbbr: number | string, isDark: boolean) {
  const key = String(idOrAbbr).toLowerCase();

  const team = teams.find(
    (t) =>
      String(t.id) === String(idOrAbbr) ||
      t.code?.toLowerCase() === key ||
      t.abbreviation?.toLowerCase() === key ||
      t.name?.toLowerCase() === key ||
      t.fullName?.toLowerCase() === key
  );

  if (!team) return PlaceholderLogo;

  return isDark ? team.logoLight || team.logo : team.logo;
}

export function getTeamLogoESPN(idOrAbbr: number | string, isDark: boolean) {
  const idOrAbbrLower = String(idOrAbbr).toLowerCase();

  const team = teams.find(
    (t) =>
      String(t.espnID) === String(idOrAbbr) ||
      t.code?.toLowerCase() === idOrAbbrLower ||
      t.abbreviation?.toLowerCase() === idOrAbbrLower
  );

  if (!team) return PlaceholderLogo; // fallback

  return isDark ? team.logoLight || team.logo : team.logo;
}

export const getTeamName = (teamId: number | string, fallback?: string) => {
  const team = getTeamInfo(teamId);
  return team?.name || fallback || "Unknown Team";
};
export const getTeamCode = (teamId: number | string, fallback?: string) => {
  const team = getTeamInfo(teamId);
  return team?.code || fallback || "UKNW";
};
export const getTeamCodeESPN = (teamId: number | string, fallback?: string) => {
  const team = getTeamInfo(teamId);
  const teamESPN = teams.find((t) => String(t.espnID) === String(teamId));
  return teamESPN?.code || fallback || "UKNW";
};

export function getCBBTeamAbbreviation(
  teamId: string,
  fallback?: string
): string | null {
  const team = getTeamInfo(teamId);
  return team?.code || fallback || "UKNW";
}

export const teamsCFBById: Record<string, CBBTeam> = teams.reduce(
  (map, team) => {
    map[team.id] = team;
    return map;
  },
  {} as Record<string, CBBTeam>
);

export const logoMap: Record<string, any> = {
  AirForceLogo: AirForceLogo,
  AkronLogo: AkronLogo,
  AlabamaLogo: AlabamaLogo,
  AlabamaAMLogo: AlabamaAMLogo,
  AlabamaStLogo: AlabamaStLogo,
  AppalachianStateLogo: AppalachianStateLogo,
  ArizonaLogo: ArizonaLogo,
  ArizonaStateLogo: ArizonaStateLogo,
  ArkansasPineBluffLogo: ArkansasPineBluffLogo,
  ArkansasLogo: ArkansasLogo,
  ArkansasStateLogo: ArkansasStateLogo,
  AuburnLogo: AuburnLogo,
  AustinPeayLogo: AustinPeayLogo,
  BallStateLogo: BallStateLogo,
  BaylorLogo: BaylorLogo,
  BoiseStateLogo: BoiseStateLogo,
  BostonCollegeLogo: BostonCollegeLogo,
  BowlingGreenLogo: BowlingGreenLogo,
  BryantLogo: BryantLogo,
  BucknellLogo: BucknellLogo,
  BuffaloStateLogo: BuffaloStateLogo,
  ButlerLogo: ButlerLogo,
  BYULogo: BYULogo,
  CaliforniaLogo: CaliforniaLogo,
  CampbellLogo: CampbellLogo,
  CentralArkansasLogo: CentralArkansasLogo,
  CentralConnecticutLogo: CentralConnecticutLogo,
  CentralMichiganLogo: CentralMichiganLogo,
  CentralWashingtonLogo: CentralWashingtonLogo,
  CharlestonSouthernLogo: CharlestonSouthernLogo,
  CharlotteLogo: CharlotteLogo,
  ChattanoogaLogo: ChattanoogaLogo,
  CincinnatiLogo: CincinnatiLogo,
  ClemsonLogo: ClemsonLogo,
  CoastalCarolinaLogo: CoastalCarolinaLogo,
  ColgateLogo: ColgateLogo,
  ColoradoLogo: ColoradoLogo,
  ColoradoStateLogo: ColoradoStateLogo,
  DelawareLogo: DelawareLogo,
  DelawareStateLogo: DelawareStateLogo,
  DukeLogo: DukeLogo,
  DuquesneLogo: DuquesneLogo,
  EasternKentuckyLogo: EasternKentuckyLogo,
  EasternMichiganLogo: EasternMichiganLogo,
  FAMULogo: FAMULogo,
  FAULogo: FAULogo,
  FIULogo: FIULogo,
  FloridaLogo: FloridaLogo,
  FloridaStateLogo: FloridaStateLogo,
  GeorgetownLogo: GeorgetownLogo,
  GeorgiaLogo: GeorgiaLogo,
  GeorgiaSouthernLogo: GeorgiaSouthernLogo,
  GeorgiaStateLogo: GeorgiaStateLogo,
  GeorgiaTechLogo: GeorgiaTechLogo,
  HawaiiLogo: HawaiiLogo,
  HolyCrossLogo: HolyCrossLogo,
  HoustonLogo: HoustonLogo,
  IdahoLogo: IdahoLogo,
  IdahoStateLogo: IdahoStateLogo,
  IllinoisLogo: IllinoisLogo,
  IllinoisStateLogo: IllinoisStateLogo,
  IndianaLogo: IndianaLogo,
  IndianaStateLogo: IndianaStateLogo,
  IowaLogo: IowaLogo,
  IowaStateLogo: IowaStateLogo,
  JamesMadisonLogo: JamesMadisonLogo,
  JaxStateLogo: JaxStateLogo,
  KansasLogo: KansasLogo,
  KansasStLogo: KansasStLogo,
  KentStateLogo: KentStateLogo,
  KentuckyLogo: KentuckyLogo,
  LibertyLogo: LibertyLogo,
  LouisianaLogo: LouisianaLogo,
  LouisvilleLogo: LouisvilleLogo,
  LSULogo: LSULogo,
  MarshallLogo: MarshallLogo,
  MarylandLogo: MarylandLogo,
  MiamiLogo: MiamiLogo,
  MiamiOHLogo: MiamiOHLogo,
  MichiganLogo: MichiganLogo,
  MichiganStateLogo: MichiganStateLogo,
  MinnesotaLogo: MinnesotaLogo,
  MissouriLogo: MissouriLogo,
  MissStLogo: MissStLogo,
  MissouriStateLogo: MissouriStateLogo,
  NavyLogo: NavyLogo,
  NCStateLogo: NCStateLogo,
  NebraskaLogo: NebraskaLogo,
  NevadaLogo: NevadaLogo,
  NewMexicoLogo: NewMexicoLogo,
  NewMexicoStateLogo: NewMexicoStateLogo,
  NorfolkStLogo: NorfolkStLogo,
  NorthernArizonaLogo: NorthernArizonaLogo,
  NorthernIllinoisLogo: NorthernIllinoisLogo,
  NorthTexasLogo: NorthTexasLogo,
  NorthwesternLogo: NorthwesternLogo,
  NotreDameLogo: NotreDameLogo,
  OhioLogo: OhioLogo,
  OhioStLogo: OhioStLogo,
  OklahomaLogo: OklahomaLogo,
  OKStateLogo: OKStateLogo,
  ODULogo: ODULogo,
  OleMissLogo: OleMissLogo,
  OregonLogo: OregonLogo,
  OregonStateLogo: OregonStateLogo,
  PennLogo: PennLogo,
  PennStateLogo: PennStateLogo,
  PittsburghLogo: PittsburghLogo,
  PrincetonLogo: PrincetonLogo,
  PurdueLogo: PurdueLogo,
  RiceLogo: RiceLogo,
  RutgersLogo: RutgersLogo,
  SamHoustonLogo: SamHoustonLogo,
  SanDiegoStLogo: SanDiegoStLogo,
  SanJoseStateLogo: SanJoseStateLogo,
  SouthAlabamaLogo: SouthAlabamaLogo,
  SouthCarolinaLogo: SouthCarolinaLogo,
  SouthDakotaLogo: SouthDakotaLogo,
  SouthDakotaStateLogo: SouthDakotaStateLogo,
  SouthernMissLogo: SouthernMissLogo,
  StanfordLogo: StanfordLogo,
  SyracuseLogo: SyracuseLogo,
  TCULogo: TCULogo,
  TempleLogo: TempleLogo,
  TennesseeLogo: TennesseeLogo,
  TexasLogo: TexasLogo,
  TexasAMLogo: TexasAMLogo,
  TexasStLogo: TexasStLogo,
  TexasTechLogo: TexasTechLogo,
  ToledoLogo: ToledoLogo,
  TroyLogo: TroyLogo,
  TulaneLogo: TulaneLogo,
  TulsaLogo: TulsaLogo,
  UABLogo: UABLogo,
  UAlbanyLogo: UAlbanyLogo,
  UCFLogo: UCFLogo,
  UCLALogo: UCLALogo,
  UConnLogo: UConnLogo,
  ULMLogo: ULMLogo,
  UmassLogo: UmassLogo,
  UNCLogo: UNCLogo,
  UNLVLogo: UNLVLogo,
  USCLogo: USCLogo,
  USFLogo: USFLogo,
  UtahLogo: UtahLogo,
  UtahStateLogo: UtahStateLogo,
  UTEPLogo: UTEPLogo,
  UTMartinLogo: UTMartinLogo,
  UTSALogo: UTSALogo,
  VanderbiltLogo: VanderbiltLogo,
  VirginiaLogo: VirginiaLogo,
  VirginiaTechLogo: VirginiaTechLogo,
  WakeForestLogo: WakeForestLogo,
  WashingtonLogo: WashingtonLogo,
  WashingtonStateLogo: WashingtonStateLogo,
  WestVirginiaLogo: WestVirginiaLogo,
  WesternKentuckyLogo: WesternKentuckyLogo,
  WesternMichiganLogo: WesternMichiganLogo,
  WisconsinLogo: WisconsinLogo,
  WyomingLogo: WyomingLogo,
  YaleLogo: YaleLogo,

  // Light versions
  AirForceLogoLight: AirForceLogoLight,
  AlabamaAMLogoLight: AlabamaAMLogoLight,
  AlabamaLogoLight: AlabamaLogoLight,
  ArkansasLogoLight: ArkansasLogoLight,
  AuburnLogoLight: AuburnLogoLight,
  BaylorLogoLight: BaylorLogoLight,
  BYULogoLight: BYULogoLight,
  CaliforniaLogoLight: CaliforniaLogoLight,
  CentralMichiganLogoLight: CentralMichiganLogoLight,
  CincinnatiLogoLight: CincinnatiLogoLight,
  ClemsonLogoLight: ClemsonLogoLight,
  ColgateLogoLight: ColgateLogoLight,
  DukeLogoLight: DukeLogoLight,
  DuquesneLogoLight: DuquesneLogoLight,
  EasternKentuckyLogoLight: EasternKentuckyLogoLight,
  EasternMichiganLogoLight: EasternMichiganLogoLight,
  IndianaLogoLight: IndianaLogoLight,
  IowaLogoLight: IowaLogoLight,
  KansasStLogoLight: KansasStLogoLight,
  KentuckyLogoLight: KentuckyLogoLight,
  LSULogoLight: LSULogoLight,
  MichiganStateLogoLight: MichiganStateLogoLight,
  MinnesotaLogoLight: MinnesotaLogoLight,
  NebraskaLogoLight: NebraskaLogoLight,
  NevadaLogoLight: NevadaLogoLight,
  NorthernArizonaLogoLight: NorthernArizonaLogoLight,
  OklahomaLogoLight: OklahomaLogoLight,
  OhioStLogoLight: OhioStLogoLight,
  OleMissLogoLight: OleMissLogoLight,
  OregonLogoLight: OregonLogoLight,
  PittsburghLogoLight: PittsburghLogoLight,
  RiceLogoLight: RiceLogoLight,
  SamHoustonLogoLight: SamHoustonLogoLight,
  TCULogoLight: TCULogoLight,
  TempleLogoLight: TempleLogoLight,
  TennesseeLogoLight: TennesseeLogoLight,
  TexasLogoLight: TexasLogoLight,
  TexasAMLogoLight: TexasAMLogoLight,
  TulsaLogoLight: TulsaLogoLight,
  UNLVLogoLight: UNLVLogoLight,
  UTEPLogoLight: UTEPLogoLight,
  VirginiaLogoLight: VirginiaLogoLight,
  VirginiaTechLogoLight: VirginiaTechLogoLight,
  WakeForestLogoLight: WakeForestLogoLight,
  WestVirginiaLogoLight: WestVirginiaLogoLight,
  WyomingLogoLight: WyomingLogoLight,
  SouthCarolinaLogoLight: SouthCarolinaLogoLight,
  ToledoLogoLight: ToledoLogoLight,
  UtahLogoLight: UtahLogoLight,
  UtahStateLogoLight: UtahStateLogoLight,
  WashingtonLogoLight: WashingtonLogoLight,
  WashingtonStateLogoLight: WashingtonStateLogoLight,
};

// Define known neutral-site matchups
export const neutralSiteGames: Record<string, Venue> = {
  "Florida-Georgia": {
    name: "EverBank Stadium",
    city: "Jacksonville, FL",
    // venueImage: EverBankStadium,
    address: "1 EverBank Stadium Dr, Jacksonville, FL 32202",
    latitude: 30.323471,
    longitude: -81.636528,
    venueCapacity: "67,838",
  },
};

export const teamMapByID = Object.fromEntries(teams.map((t) => [t.id, t]));
export const teamMapByESPNID = Object.fromEntries(
  teams.map((t) => [t.espnID, t])
);

export function mapToInternalCBBTeam(apiTeam: any) {
  if (!apiTeam) return {};

  // Try to find matching internal team
  const team = teams.find((t) => t.id === apiTeam.id) || null;

  if (team) return team;
}
