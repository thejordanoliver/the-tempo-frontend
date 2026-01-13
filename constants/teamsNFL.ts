import { NFLTeam, Venue } from "types/nfl";
//Logos
import NinersLogo from "assets/Football/NFL_Logos/49ers.png";
import BearsLogo from "assets/Football/NFL_Logos/Bears.png";
import BengalsLogo from "assets/Football/NFL_Logos/Bengals.png";
import BillsLogo from "assets/Football/NFL_Logos/Bills.png";
import BroncosLogo from "assets/Football/NFL_Logos/Broncos.png";
import BrownsLogo from "assets/Football/NFL_Logos/Browns.png";
import BuccaneersLogo from "assets/Football/NFL_Logos/Buccaneers.png";
import CardinalsLogo from "assets/Football/NFL_Logos/Cardinals.png";
import ChargersLogo from "assets/Football/NFL_Logos/Chargers.png";
import ChiefsLogo from "assets/Football/NFL_Logos/Chiefs.png";
import ColtsLogo from "assets/Football/NFL_Logos/Colts.png";
import CommandersLogo from "assets/Football/NFL_Logos/Commanders.png";
import CowboysLogo from "assets/Football/NFL_Logos/Cowboys.png";
import DolphinsLogo from "assets/Football/NFL_Logos/Dolphins.png";
import EaglesLogo from "assets/Football/NFL_Logos/Eagles.png";
import FalconsLogo from "assets/Football/NFL_Logos/Falcons.png";
import GiantsLogo from "assets/Football/NFL_Logos/Giants.png";
import GiantsLogoLight from "assets/Football/NFL_Logos/GiantsLight.png";
import JaguarsLogo from "assets/Football/NFL_Logos/Jaguars.png";
import JetsLogo from "assets/Football/NFL_Logos/Jets.png";
import JetsLogoLight from "assets/Football/NFL_Logos/JetsLight.png";
import LionsLogo from "assets/Football/NFL_Logos/Lions.png";
import PackersLogo from "assets/Football/NFL_Logos/Packers.png";
import PanthersLogo from "assets/Football/NFL_Logos/Panthers.png";
import PatriotsLogo from "assets/Football/NFL_Logos/Patriots.png";
import RaidersLogo from "assets/Football/NFL_Logos/Raiders.png";
import RamsLogo from "assets/Football/NFL_Logos/Rams.png";
import RavensLogo from "assets/Football/NFL_Logos/Ravens.png";
import SaintsLogo from "assets/Football/NFL_Logos/Saints.png";
import SeahawksLogo from "assets/Football/NFL_Logos/Seahawks.png";
import SteelersLogo from "assets/Football/NFL_Logos/Steelers.png";
import TexansLogo from "assets/Football/NFL_Logos/Texans.png";
import TitansLogo from "assets/Football/NFL_Logos/Titans.png";
import VikingsLogo from "assets/Football/NFL_Logos/Vikings.png";
import PlaceholderLogo from "assets/Placeholders/teamPlaceholder.png";


export const teams: NFLTeam[] = [
  {
    id: 1,
    espnID: 13,
    oddsID: "par_01hqmkr1y9fkaaeekn9w035jft",
    fullName: "Las Vegas Raiders",
    code: "LV",
    city: "Las Vegas",
    location: "Las Vegas, NV",
    address: "6475 S. Raiders Way, Las Vegas, NV 89118",
    coach: "Pete Carroll",
    owner: "Carol and Mark Davis",
    venue: "Allegiant Stadium",
    established: 1960,
    logo: RaidersLogo,
    logoLight: RaidersLogo,
    name: "Raiders",
    color: "#000000",
    secondaryColor: "#a5acaf",
    latitude: 36.090794,
    longitude: -115.183952,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/raiders.jpg",
    venueCapacity: "65,000",
  },
  {
    id: 2,
    espnID: 30,
    oddsID: "par_01hqmkr1y7e2r9kcn2qe0dt1d5",
    fullName: "Jacksonville Jaguars",
    code: "JAX",
    city: "Jacksonville",
    location: "Jacksonville, FL",
    address: "1 EverBank Stadium Dr, Jacksonville, FL 32202",
    coach: "Liam Coen",
    owner: "Shahid Khan",
    venue: "EverBank Stadium",
    established: 1995,
    logo: JaguarsLogo,
    logoLight: JaguarsLogo,

    name: "Jaguars",
    color: "#101820",
    secondaryColor: "#d7a22a",
    latitude: 30.323471,
    longitude: -81.636528,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/jaguars.jpg",
    venueCapacity: "67,838",
  },
  {
    id: 3,
    espnID: 17,
    oddsID: "par_01hqmkr1yeffz9y9spwv8bx3na",
    fullName: "New England Patriots",
    code: "NE",
    city: "Foxborough",
    location: "Foxborough, MA",
    address: "1 Patriot Pl., Foxborough, MA 02035",
    coach: "Mike Vrabel",
    owner: "Robert Kraft",
    venue: "Gillette Stadium",
    established: 1960,
    logo: PatriotsLogo,
    logoLight: PatriotsLogo,
    name: "Patriots",
    color: "#002a5c",
    secondaryColor: "#c60c30",
    latitude: 42.0908,
    longitude: -71.2643,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/patriots.jpg",
    venueCapacity: "66,829",
  },
  {
    id: 4,
    espnID: 19,
    oddsID: "par_01hqmkr1ygfzrv5sqe2v97c43e",
    fullName: "New York Giants",
    code: "NYG",
    city: "New York",
    location: "New York, NY",
    address: "1 MetLife Stadium Dr., East Rutherford, NJ 07073",
    coach: "Brian Daboll",
    owner: "John Mara, Steve Tisch",
    venue: "MetLife Stadium",
    established: 1925,
    logo: GiantsLogo,
    logoLight: GiantsLogoLight,
    name: "Giants",
    color: "#003c7f",
    secondaryColor: "#c9243f",
    latitude: 40.813778,
    longitude: -74.07431,
    venueImage:
    "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/metlife-nyg.jpg",
    venueCapacity: "82,500",
  },
  {
    id: 5,
    espnID: 33,
    oddsID: "par_01hqmkr1xvev9rf557fy09k2cx",
    fullName: "Baltimore Ravens",
    code: "BAL",
    city: "Baltimore",
    location: "Baltimore, MD",
    address: "1101 Russell Street, Baltimore, MD 21230",
    coach: "John Harbaugh",
    owner: "Steve Bisciotti",
    venue: "M&T Bank Stadium",
    established: 1996,
    logo: RavensLogo,
    logoLight: RavensLogo,
    name: "Ravens",
    color: "#29126f",
    secondaryColor: "#000000",
    latitude: 39.278088,
    longitude: -76.623322,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/ravens.jpg",
    venueCapacity: "71,008",
  },
  {
    id: 6,
    espnID: 10,
    fullName: "Tennessee Titans",
    oddsID: "par_01hqmkr1yqexebpc06vyfwxqqm",
    code: "TEN",
    city: "Nashville",
    location: "Nashville, TN",
    address: "1 Titans Way, Nashville, TN 37213",
    coach: "Brian Callahan",
    owner: "Amy Adams Strunk",
    venue: "Nissan Stadium",
    established: 1960,
    logo: TitansLogo,
    logoLight: TitansLogo,
    name: "Titans",
    color: "#4b92db",
    secondaryColor: "#002a5c",
    latitude: 36.1665,
    longitude: -86.7713,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/titans.jpg",
    venueCapacity: "69,143",
  },
  {
    id: 7,
    espnID: 8,
    oddsID: "par_01hqmkr1y3fex9sq94dgg1107y",
    fullName: "Detroit Lions",
    code: "DET",
    city: "Detroit",
    location: "Detroit, MI",
    address: "2000 Brush Street, Detroit, MI 48226",
    coach: "Dan Campbell",
    owner: "Sheila Ford Hamp",
    venue: "Ford Field",
    established: 1930,
    logo: LionsLogo,
    logoLight: LionsLogo,
    name: "Lions",
    color: "#0076b6",
    secondaryColor: "#bbbbbb",
    latitude: 42.34,
    longitude: -83.0456,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/lions.jpg",
    venueCapacity: "65,000",
  },

  {
    id: 8,
    espnID: 1,
    fullName: "Atlanta Falcons",
    oddsID: "par_01hqmkr1xtexkbhkq7ct921rne",
    code: "ATL",
    city: "Atlanta",
    location: "Atlanta, GA",
    address: "181 Donald Lee Hollowell Pkwy NW, Atlanta, GA 30318",
    coach: "Raheem Morris",
    owner: "Arthur Blank",
    venue: "Mercedes-Benz Stadium",
    established: 1966,
    logo: FalconsLogo,
    logoLight: FalconsLogo,
    name: "Falcons",
    color: "#a71930",
    secondaryColor: "#000000",
    latitude: 33.7554,
    longitude: -84.4009,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/falcons.jpg",
    venueCapacity: "71,000",
  },
  {
    id: 9,
    espnID: 5,
    oddsID: "par_01hqmkr1y0ez5bem3gdncd8a0d",
    fullName: "Cleveland Browns",
    code: "CLE",
    city: "Cleveland",
    location: "Cleveland, OH",
    address: "76 Lou Groza Blvd., Berea, OH 44017",
    coach: "Kevin Stefanski",
    owner: "Dee and Jimmy Haslam",
    venue: "Huntington Bank Field",
    established: 1946,
    logo: BrownsLogo,
    logoLight: BrownsLogo,
    name: "Browns",
    color: "#472a08",
    secondaryColor: "#ff3c00",
    latitude: 41.5061,
    longitude: -81.6995,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/browns.jpg",
    venueCapacity: "67,431",
  },
  {
    id: 10,
    espnID: 4,
    oddsID: "par_01hqmkr1xze7xbceshy9tka512",
    fullName: "Cincinnati Bengals",
    code: "CIN",
    city: "Cincinnati",
    location: "Cincinnati, OH",
    address: "1 Paycor Stadium, Cincinnati, OH 45202",
    coach: "Zac Taylor",
    owner: "Mike Brown",
    venue: "Paycor Stadium",
    established: 1968,
    logo: BengalsLogo,
    logoLight: BengalsLogo,
    name: "Bengals",
    color: "#fb4f14",
    secondaryColor: "000000",
    latitude: 39.095,
    longitude: -84.516,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/bengals.jpg",
    venueCapacity: "65,515",
  },
  {
    id: 11,
    espnID: 22,
    oddsID: "par_01hqmkr1xsfxmrj5pdq0f23asx",
    fullName: "Arizona Cardinals",
    code: "ARI",
    city: "Glendale",
    location: "Glendale, AZ",
    address: "1 Cardinals Dr, Glendale, AZ 85305",
    coach: "Jonathan Gannon",
    owner: "Michael Bidwill",
    venue: "State Farm Stadium",
    established: 1920,
    logo: CardinalsLogo,
    logoLight: CardinalsLogo,
    name: "Cardinals",
    color: "#a40227",
    secondaryColor: "#ffffff",
    latitude: 33.5276,
    longitude: -112.2626,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/cardinals.jpg",
    venueCapacity: "63,400",
  },
  {
    id: 12,
    espnID: 21,
    oddsID: "par_01hqmkr1yjedgakx37g743855e",
    fullName: "Philadelphia Eagles",
    code: "PHI",
    city: "Philadelphia",
    location: "Philadelphia, PA",
    address: "1 Lincoln Financial Field Way, Philadelphia, PA 19148",
    coach: "Nick Sirianni",
    owner: "Jeffrey Lurie",
    venue: "Lincoln Financial Field",
    established: 1933,
    logo: EaglesLogo,
    logoLight: EaglesLogo,

    name: "Eagles",
    color: "#06424d",
    secondaryColor: "#000000",
    latitude: 39.9015,
    longitude: -75.1665,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/eagles.jpg",
    venueCapacity: "69,596",
  },
  {
    id: 13,
    espnID: 20,
    oddsID: "par_01hqmkr1yhe4sb3y0wfzga67tf",
    fullName: "New York Jets",
    code: "NYJ",
    city: "New York",
    location: "New York, NY",
    address: "1 MetLife Stadium Dr., East Rutherford, NJ 07073",
    coach: "Aaron Glenn",
    owner: "Robert Wood Johnson IV",
    venue: "MetLife Stadium",
    established: 1960,
    logo: JetsLogo,
    logoLight: JetsLogoLight,
    name: "Jets",
    color: "#115740",
    secondaryColor: "#ffffff",
    latitude: 40.813778,
    longitude: -74.07431,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/metlife-nyj.jpg",
    venueCapacity: "82,500",
  },
  {
    id: 14,
    espnID: 25,
    oddsID: "par_01hqmkr1ymfv0a8kfg96ha10ag",
    fullName: "San Francisco 49ers",
    code: "SF",
    city: "San Francisco",
    location: "San Francisco, CA",
    address: "4900 Marie P DeBartolo Way, Santa Clara, CA 95054",
    coach: "Kyle Shanahan",
    owner: "Jed York",
    venue: "Levi's Stadium",
    established: 1946,
    logo: NinersLogo,
    logoLight: NinersLogo,
    name: "49ers",
    color: "#aa0000",
    secondaryColor: "#b3995d",
    latitude: 37.4033,
    longitude: -121.9694,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/niners.jpg",
    venueCapacity: "68,500",
  },
  {
    id: 15,
    espnID: 9,
    oddsID: "par_01hqmkr1y4ez38hyananses4hq",

    fullName: "Green Bay Packers",
    code: "GB",
    city: "Green Bay",
    location: "Green Bay, WI",
    address: "1265 Lombardi Ave, Green Bay, WI 54304",
    coach: "Matt LaFleur",
    owner: "Green Bay Packers, Inc.",
    venue: "Lambeau Field",
    established: 1921,
    logo: PackersLogo,
    logoLight: PackersLogo,

    name: "Packers",
    color: "#203731",
    secondaryColor: "#ffb612",
    latitude: 44.5078291,
    longitude: -88.0955556,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/packers.jpg",
    venueCapacity: "81,441",
  },
  {
    id: 16,
    espnID: 3,
    oddsID: "par_01hqmkr1xye20ahvp8fr2bvt74",
    fullName: "Chicago Bears",
    code: "CHI",
    city: "Chicago",
    location: "Chicago, IL",
    address: "1410 Special Olympics Dr, Chicago, IL 60605",
    coach: "Ben Johnson",
    owner: "Virginia Halas McCaskey",
    venue: "Soldier Field",
    established: 1920,
    logo: BearsLogo,
    logoLight: BearsLogo,
    name: "Bears",
    color: "#0B162A",
    secondaryColor: "#e64100",
    latitude: 41.8624,
    longitude: -87.6166,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/bears.webp",
    venueCapacity: "61,500",
  },
  {
    id: 17,
    espnID: 12,
    fullName: "Kansas City Chiefs",
    oddsID: "par_01hqmkr1y8e9gt2q2rhmv196pv",
    code: "KC",
    city: "Kansas City",
    location: "Kansas City, MO",
    address: "1 Arrowhead Dr, Kansas City, MO 64129",
    coach: "Andy Reid",
    owner: "Clark Hunt",
    venue: "GEHA Field at Arrowhead Stadium",
    established: 1960,
    logo: ChiefsLogo,
    logoLight: ChiefsLogo,

    name: "Chiefs",
    color: "#E31837",
    secondaryColor: "#ffb612",
    latitude: 39.0997,
    longitude: -94.5786,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/chiefs.jpg",
    venueCapacity: "76,416",
  },
  {
    id: 18,
    espnID: 28,
    oddsID: "par_01hqmkr1yrfsvbjjasn01a7xz4",
    fullName: "Washington Commanders",
    code: "WSH",
    city: "Washington",
    location: "Washington, DC",
    address: "1600 Fedex Way, Landover, MD 20785",
    coach: "Dan Quinn",
    owner: "Josh Harris",
    venue: "Northwest Stadium",
    established: 1932,
    logo: CommandersLogo,
    logoLight: CommandersLogo,
    name: "Commanders",
    color: "#5a1414",
    secondaryColor: "#ffb612",
    latitude: 38.9081,
    longitude: -76.864,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/commanders.jpg",
    venueCapacity: "64,000",
  },
  {
    id: 19,
    espnID: 29,
    oddsID: "par_01hqmkr1xxf2ebbqzb95qzxxxm",
    fullName: "Carolina Panthers",
    code: "CAR",
    city: "Charlotte",
    location: "Charlotte, NC",
    address: "800 S Mint St, Charlotte, NC 28202",
    coach: "David Canales",
    owner: "David Tepper",
    venue: "Bank of America Stadium",
    established: 1995,
    logo: PanthersLogo,
    logoLight: PanthersLogo,

    name: "Panthers",
    color: "#0085ca",
    secondaryColor: "#000000",
    latitude: 35.2251,
    longitude: -80.8528,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766954261/stadiums/football/panthers.jpg",
    venueCapacity: "75,523",
  },
  {
    id: 20,
    espnID: 2,
    oddsID: "par_01hqmkr1xwe6prjwr3j4gpqwx8",
    fullName: "Buffalo Bills",
    code: "BUF",
    city: "Buffalo",
    location: "Buffalo, NY",
    address: "1 Bills Dr, Orchard Park, NY 14127",
    coach: "Sean McDermott",
    owner: "Kim and Terry Pegula",
    venue: "Highmark Stadium",
    established: 1960,
    logo: BillsLogo,
    logoLight: BillsLogo,

    name: "Bills",
    color: "#00338d",
    secondaryColor: "#d50a0a",
    latitude: 42.7738,
    longitude: -78.787,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/bills.jpg",
    venueCapacity: "71,608",
  },
  {
    id: 21,
    espnID: 11,
    oddsID: "par_01hqmkr1y6f10rxbf8y2y2xthh",
    fullName: "Indianapolis Colts",
    code: "IND",
    city: "Indianapolis",
    location: "Indianapolis, IN",
    address: "500 S Capitol Ave, Indianapolis, IN 46225",
    coach: "Shane Steichen",
    owner: "Jim Irsay",
    venue: "Lucas Oil Stadium",
    established: 1944,
    logo: ColtsLogo,
    logoLight: ColtsLogo,

    name: "Colts",
    color: "#002C5F",
    secondaryColor: "#ffffff",
    latitude: 39.7691,
    longitude: -86.158,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/colts.jpg",
    venueCapacity: "71,608",
  },
  {
    id: 22,
    espnID: 23,
    oddsID: "par_01hqmkr1yker5bwcznt0b1jpj1",
    fullName: "Pittsburgh Steelers",
    code: "PIT",
    city: "Pittsburgh",
    location: "Pittsburgh, PA",
    address: "100 Art Rooney Ave, Pittsburgh, PA 15212",
    coach: "Mike Tomlin",
    owner: "Art Rooney II and Family",
    venue: "Acrisure Stadium",
    established: 1933,
    logo: SteelersLogo,
    logoLight: SteelersLogo,

    name: "Steelers",
    color: "#000000",
    secondaryColor: "#ffb612",
    latitude: 40.4468,
    longitude: -80.0157,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/steelers.jpg",
    venueCapacity: "68,400",
  },
  {
    id: 23,
    espnID: 26,
    oddsID: "par_01hqmkr1ynfwaa91y9zvagkavd",
    fullName: "Seattle Seahawks",
    code: "SEA",
    city: "Seattle",
    location: "Seattle, WA",
    address: "800 Occidental Ave S, Seattle, WA 98134",
    coach: "Mike Macdonald",
    owner: "Seattle Seahawks Ownership Trust",
    venue: "Lumen Field",
    established: 1976,
    logo: SeahawksLogo,
    logoLight: SeahawksLogo,
    name: "Seahawks",
    color: "#002244",
    secondaryColor: "#69be28",
    latitude: 47.5952,
    longitude: -122.3316,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/seahawks.jpg",
    venueCapacity: "69,000",
  },
  {
    id: 24,
    espnID: 27,
    fullName: "Tampa Bay Buccaneers",
    oddsID: "par_01hqmkr1ypeszan8sq8dh7rqbg",
    code: "TB",
    city: "Tampa",
    location: "Tampa, FL",
    address: "4201 N Dale Mabry Hwy, Tampa, FL 33607",
    coach: "Todd Bowles",
    owner: "Bryan Glazer, Edward Glazer, Joel Glazer",
    venue: "Raymond James Stadium",
    established: 1976,
    logo: BuccaneersLogo,
    logoLight: BuccaneersLogo,
    name: "Buccaneers",
    color: "#bd1c36",
    secondaryColor: "#3e3a35",
    latitude: 27.9759,
    longitude: -82.5033,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766778404/stadiums/football/buccaneers.jpg",
    venueCapacity: "69,218",
  },
  {
    id: 25,
    espnID: 15,
    fullName: "Miami Dolphins",
    oddsID: "par_01hqmkr1ycf7dsbr1997gz03y9",
    code: "MIA",
    city: "Miami",
    location: "Miami, FL",
    address: "347 Don Shula Dr, Miami Gardens, FL 33056",
    coach: "Mike McDaniel",
    owner: "Stephen M. Ross",
    venue: "Hard Rock Stadium",
    established: 1966,
    logo: DolphinsLogo,
    logoLight: DolphinsLogo,
    name: "Dolphins",
    color: "#008e97",
    secondaryColor: "#fc4c02",
    latitude: 25.9579,
    longitude: -80.239,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/dolphins.jpg",
    venueCapacity: "65,326",
  },
  {
    id: 26,
    espnID: 34,
    oddsID: "par_01hqmkr1y5f63reha26n71p2jx",
    fullName: "Houston Texans",
    code: "HOU",
    city: "Houston",
    location: "Houston, TX",
    address: "Two NRG Park, Houston, TX 77054",
    coach: "DeMeco Ryans",
    owner: "Janice S. McNair",
    venue: "NRG Stadium",
    established: 2002,
    logo: TexansLogo,
    logoLight: TexansLogo,
    name: "Texans",
    color: "#03202f",
    secondaryColor: "#c41230",
    latitude: 29.6847,
    longitude: -95.4107,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/texans.jpg",
    venueCapacity: "72,220",
  },
  {
    id: 27,
    espnID: 18,
    oddsID: "par_01hqmkr1yfe62tp0rvy8bn2jyc",
    fullName: "New Orleans Saints",
    code: "NO",
    city: "New Orleans",
    location: "New Orleans, LA",
    address: "1500 Sugar Bowl Dr, New Orleans, LA 70112",
    coach: "Dennis Allen",
    owner: "Gayle Benson",
    venue: "Caesars Superdome",
    established: 1967,
    logo: SaintsLogo,
    logoLight: SaintsLogo,
    name: "Saints",
    color: "#d3bc8d",
    secondaryColor: "#000000",
    latitude: 29.9507,
    longitude: -90.0811,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/saints.jpg",
    venueCapacity: "73,208",
  },
  {
    id: 28,
    espnID: 7,
    oddsID: "par_01hqmkr1y2e15tjsz9afcsj7da",
    fullName: "Denver Broncos",
    code: "DEN",
    city: "Denver",
    location: "Denver, CO",
    address: "1701 Bryant St, Denver, CO 80204",
    coach: "Sean Payton",
    owner: "Walton-Penner Family Ownership Group",
    venue: "Empower Field at Mile High",
    established: 1960,
    logo: BroncosLogo,
    logoLight: BroncosLogo,
    name: "Broncos",
    color: "#0a2343",
    secondaryColor: "#fc4c02",
    latitude: 39.7439,
    longitude: -105.0201,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/broncos.jpg",
    venueCapacity: "76,125",
  },
  {
    id: 29,
    espnID: 6,
    oddsID: "par_01hqmkr1y1esas88pmaxe87by4",
    fullName: "Dallas Cowboys",
    code: "DAL",
    city: "Dallas",
    location: "Dallas, TX",
    address: "1 AT&T Way, Arlington, TX 76011",
    coach: "Brian Schottenheimer",
    owner: "Jerry Jones",
    venue: "AT&T Stadium",
    established: 1960,
    logo: CowboysLogo,
    logoLight: CowboysLogo,
    name: "Cowboys",
    color: "#041E42",
    secondaryColor: "#b0b7bc",
    latitude: 32.748,
    longitude: -97.0934,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/cowboys.jpg",
    venueCapacity: "80,000",
  },
  {
    id: 30,
    espnID: 24,
    oddsID: "par_01hqmkr1yafvas6wtv3jfs9f7a",
    fullName: "Los Angeles Chargers",
    code: "LAC",
    city: "Los Angeles",
    location: "Los Angeles, CA",
    address: "1001 Stadium Dr, Inglewood, CA 90301",
    coach: "Giff Smith (interim)",
    owner: "Alex Spanos and Family",
    venue: "SoFi Stadium",
    established: 1960,
    logo: ChargersLogo,
    logoLight: ChargersLogo,
    name: "Chargers",
    color: "#0080C6",
    secondaryColor: "#ffc20e",
    latitude: 33.9618,
    longitude: -118.3534,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/sofi-lac.jpg",
    venueCapacity: "70,240",
  },
  {
    id: 31,
    espnID: 14,
    oddsID: "par_01hqmkr1ybfmfb8mhz10drfe21",
    fullName: "Los Angeles Rams",
    code: "LAR",
    city: "Los Angeles",
    location: "Los Angeles, CA",
    address: "1001 Stadium Dr, Inglewood, CA 90301",
    coach: "Sean McVay",
    owner: "Stan Kroenke",
    venue: "SoFi Stadium",
    established: 1937,
    logo: RamsLogo,
    logoLight: RamsLogo,
    name: "Rams",
    color: "#003594",
    secondaryColor: "#ffd100",
    latitude: 33.9618,
    longitude: -118.3534,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/sofi-lar.jpg",
    venueCapacity: "70,240",
  },
  {
    id: 32,
    espnID: 16,
    fullName: "Minnesota Vikings",
    oddsID: "par_01hqmkr1ydf6vrfmd5f07caj88",
    code: "MIN",
    city: "Minneapolis",
    location: "Minneapolis, MN",
    address: "900 S 5th St, Minneapolis, MN 55415",
    coach: "Kevin O'Connell",
    owner: "Zygi Wilf",
    venue: "U.S. Bank Stadium",
    established: 1961,
    logo: VikingsLogo,
    logoLight: VikingsLogo,
    name: "Vikings",
    color: "#4f2683",
    secondaryColor: "#ffc62f",
    latitude: 44.9736,
    longitude: -93.2575,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/vikings.jpg",
    venueCapacity: "66,655",
  },
] as const;



export const neutralStadiums: Record<string, Venue> = {
  "Corinthians Arena": {
    name: "Corinthians Arena",
    city: "São Paulo",
    address:
      "Av. Miguel Ignácio Curi, 111 - Vila Carmosina, São Paulo - SP, 08295-005, Brazil",
    latitude: 23.5453,
    longitude: -46.4742,
    venueCapacity: "49,205",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/corinthians.jpg",
  },
  "Croke Park": {
    name: "Croke Park",
    city: "Dublin",
    address: "Jones Road Dublin 3 D03 P6K7 Ireland",
    latitude: 53.3607,
    longitude: 6.2511,
    venueCapacity: "82,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/croke.jpg",
  },
  "Tottenham Hotspur Stadium": {
    name: "Tottenham Hotspur Stadium",
    city: "London",
    address: "782 High Rd, London N17 0BX, United Kingdom",
    latitude: 51.6043,
    longitude: 0.0662,
    venueCapacity: "62,850",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/tottenham-hotspur.jpg",
  },
  "Olympic Stadium Berlin": {
    name: "Olympiastadion Berlin",
    city: "Berlin",
    address: "Olympischer Platz 3, 14053 Berlin, Germany",
    latitude: 51.5387,
    longitude: 0.0165,
    venueCapacity: "74,475",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/olympic.jpg",
  },
  "Levi's® Stadium": {
    name: "Levi's® Stadium",
    city: "San Francisco",
    address: "4900 Marie P DeBartolo Way, Santa Clara, CA 95054",
    latitude: 37.4033,
    longitude: -121.9694,
    venueCapacity: "68,500",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/niners.jpg",
  },
  "Wembley Stadium": {
    name: "Wembley Stadium",
    city: "London",
    address: "Wembley HA9 0WS, United Kingdom",
    latitude: 51.556,
    longitude: 0.2796,
    venueCapacity: "68,500",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/wembley.jpg",
  },
  "Camping World Stadium": {
    name: "Camping World Stadium",
    city: "Orlando",
    address: "1 Citrus Bowl Pl, Orlando, FL 32805",
    latitude: 28.5392,
    longitude: -81.4028,
    venueCapacity: "60,219",
    venueImage: {
      uri: "https://upload.wikimedia.org/wikipedia/commons/1/12/Camping_World_Stadium_Orlando.jpg",
    },
  },
  "Raymond James Stadium": {
    name: "Raymond James Stadium",
    city: "Tampa",
    address: "4201 N Dale Mabry Hwy, Tampa, FL 33607",
    latitude: 27.9759,
    longitude: -82.5033,
    venueCapacity: "69,218",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/buccaneers.jpg",
  },
  "SoFi Stadium": {
    name: "SoFi Stadium",
    city: "Inglewood",
    address: "1001 Stadium Dr, Inglewood, CA 90301",
    latitude: 33.9618,
    longitude: -118.3534,
    venueCapacity: "70,240",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/so-fi.jpg",
  },
};

export const getNFLTeam = (id: number | string) =>
  teams.find((t) => String(t.id) === String(id)) || null;

export const getTeamInfo = (teamId: number | string) => {
  if (teamId == null) return undefined;
  return teams.find((t) => String(t.id) === String(teamId));
};

export function getNFLTeamsLogo(
  idOrNicknameOrCode: number | string | undefined,
  isDark: boolean
) {
  if (!idOrNicknameOrCode) return PlaceholderLogo; // fallback

  const searchStr = String(idOrNicknameOrCode).toLowerCase();

  const team = teams.find((t) => {
    return (
      t.id === Number(idOrNicknameOrCode) || // match by ID
      (t.name && t.name.toLowerCase() === searchStr) || // match by name
      (t.code && t.code.toLowerCase() === searchStr) // match by code
    );
  });

  if (!team) return PlaceholderLogo;

  return isDark ? team.logoLight || team.logo : team.logo;
}

export const getTeamByESPNId = (espnId: number | string) => {
  return teams.find((t) => t.espnID?.toString() === espnId?.toString());
};

export function getTeamLogoESPN(
  idOrNicknameOrCode: number | string | undefined,
  isDark: boolean
) {
  if (!idOrNicknameOrCode) return PlaceholderLogo; // fallback

  const team = teams.find((t) => {
    return Number(t.espnID) === Number(idOrNicknameOrCode);
  });

  if (!team) return PlaceholderLogo;

  return isDark ? team.logoLight || team.logo : team.logo;
}

export const getTeamName = (teamId: string | number): string | null => {
  const team = getTeamInfo(teamId);
  return team?.name || null;
};

export function getTeamCode(teamId: string, fallback?: string): string | null {
  const team = getTeamInfo(teamId);
  return team?.code || fallback || "UKNW";
}

export const teamsNFLById: Record<string, NFLTeam> = teams.reduce(
  (map, team) => {
    map[team.id] = team;
    return map;
  },
  {} as Record<string, NFLTeam>
);

// Map your numeric team IDs to ESPN team IDs
export const teamIdMap: Record<number, string> = {
  1: "13",
  2: "30",
  3: "17",
  4: "19",
  5: "33",
  6: "10",
  7: "8",
  8: "1",
  9: "5",
  10: "4",
  11: "22",
  12: "21",
  13: "20",
  14: "25",
  15: "9",
  16: "3",
  17: "12",
  18: "28",
  19: "29",
  20: "2",
  21: "11",
  22: "23",
  23: "26",
  24: "27",
  25: "15",
  26: "34",
  27: "18",
  28: "7",
  29: "6",
  30: "24",
  31: "14",
  32: "16",
};

export const nflDivisionsById = {
  " AFC East": [
    "2", // Bills
    "15", // Dolphins
    "17", // Patriots
    "20", // Jets
  ],

  "AFC North": [
    "33", // Ravens
    "4", // Bengals
    "5", // Browns
    "23", // Steelers
  ],

  "AFC South": [
    "34", // Texans
    "11", // Colts
    "30", // Jaguars
    "10", // Titans
  ],

  "AFC West": [
    "7", // Broncos
    "12", // Chiefs
    "13", // Raiders
    "24", // Chargers
  ],

  "NFC East": [
    "6", // Cowboys
    "19", // Giants
    "21", // Eagles
    "28", // Commanders
  ],

  "NFC North": [
    "3", // Bears
    "8", // Lions
    "9", // Packers
    "16", // Vikings
  ],

  "NFC South": [
    "1", // Falcons
    "29", // Panthers
    "18", // Saints
    "27", // Buccaneers
  ],

  "NFC West": [
    "22", // Cardinals
    "14", // Rams
    "25", // 49ers
    "26", // Seahawks
  ],
};
