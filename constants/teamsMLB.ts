import { MLBTeam } from "types/mlb";

import DiamondbacksLogo from "assets/Baseball/MLB_Logos/Diamondbacks.png";
import DiamondbacksLogoLight from "assets/Baseball/MLB_Logos/Diamondbacks.png";
import DodgersLogo from "assets/Baseball/MLB_Logos/Dodgers.png";
import DodgersLogoLight from "assets/Baseball/MLB_Logos/DodgersLight.png";
import GiantsLogo from "assets/Baseball/MLB_Logos/Giants.png";
import GiantsLogoLight from "assets/Baseball/MLB_Logos/Giants.png";
import PadresLogo from "assets/Baseball/MLB_Logos/Padres.png";
import PadresLogoLight from "assets/Baseball/MLB_Logos/PadresLight.png";
import RockiesLogo from "assets/Baseball/MLB_Logos/Rockies.png";
import RockiesLogoLight from "assets/Baseball/MLB_Logos/RockiesLight.png";
import CubsLogo from "assets/Baseball/MLB_Logos/Cubs.png";
import CubsLogoLight from "assets/Baseball/MLB_Logos/Cubs.png";
import RedsLogo from "assets/Baseball/MLB_Logos/Reds.png";
import RedsLogoLight from "assets/Baseball/MLB_Logos/RedsLight.png";
import BrewersLogo from "assets/Baseball/MLB_Logos/Brewers.png";
import BrewersLogoLight from "assets/Baseball/MLB_Logos/Brewers.png";
import CardinalsLogo from "assets/Baseball/MLB_Logos/Cardinals.png";
import CardinalsLogoLight from "assets/Baseball/MLB_Logos/CardinalsLight.png";
import PiratesLogo from "assets/Baseball/MLB_Logos/Pirates.png";
import PiratesLogoLight from "assets/Baseball/MLB_Logos/Pirates.png";
import BravesLogo from "assets/Baseball/MLB_Logos/Braves.png";
import BravesLogoLight from "assets/Baseball/MLB_Logos/BravesLight.png";
import MetsLogo from "assets/Baseball/MLB_Logos/Mets.png";
import MetsLogoLight from "assets/Baseball/MLB_Logos/Mets.png";
import PhilliesLogo from "assets/Baseball/MLB_Logos/Phillies.png";
import PhilliesLogoLight from "assets/Baseball/MLB_Logos/PhilliesLight.png";
import MarlinsLogo from "assets/Baseball/MLB_Logos/Marlins.png";
import MarlinsLogoLight from "assets/Baseball/MLB_Logos/Marlins.png";
import NationalsLogo from "assets/Baseball/MLB_Logos/Nationals.png";
import NationalsLogoLight from "assets/Baseball/MLB_Logos/NationalsLight.png";
import YankeesLogo from "assets/Baseball/MLB_Logos/Yankees.png";
import YankeesLogoLight from "assets/Baseball/MLB_Logos/YankeesLight.png";
import RedSoxLogo from "assets/Baseball/MLB_Logos/RedSox.png";
import RedSoxLogoLight from "assets/Baseball/MLB_Logos/RedSox.png";
import BlueJaysLogo from "assets/Baseball/MLB_Logos/BlueJays.png";
import BlueJaysLogoLight from "assets/Baseball/MLB_Logos/BlueJays.png";
import OriolesLogo from "assets/Baseball/MLB_Logos/Orioles.png";
import OriolesLogoLight from "assets/Baseball/MLB_Logos/Orioles.png";
import RaysLogo from "assets/Baseball/MLB_Logos/Rays.png";
import RaysLogoLight from "assets/Baseball/MLB_Logos/RaysLight.png";
import WhiteSoxLogo from "assets/Baseball/MLB_Logos/WhiteSox.png";
import WhiteSoxLogoLight from "assets/Baseball/MLB_Logos/WhiteSoxLight.png";
import GuardiansLogo from "assets/Baseball/MLB_Logos/Guardians.png";
import GuardiansLogoLight from "assets/Baseball/MLB_Logos/GuardiansLight.png";
import TigersLogo from "assets/Baseball/MLB_Logos/Tigers.png";
import TigersLogoLight from "assets/Baseball/MLB_Logos/TigersLight.png";
import TwinsLogo from "assets/Baseball/MLB_Logos/Twins.png";
import TwinsLogoLight from "assets/Baseball/MLB_Logos/TwinsLight.png";
import RoyalsLogo from "assets/Baseball/MLB_Logos/Royals.png";
import RoyalsLogoLight from "assets/Baseball/MLB_Logos/RoyalsLight.png";
import AstrosLogo from "assets/Baseball/MLB_Logos/Astros.png";
import AstrosLogoLight from "assets/Baseball/MLB_Logos/Astros.png";
import AthleticsLogo from "assets/Baseball/MLB_Logos/Athletics.png";
import AthleticsLogoLight from "assets/Baseball/MLB_Logos/AthleticsLight.png";
import MarinersLogo from "assets/Baseball/MLB_Logos/Mariners.png";
import MarinersLogoLight from "assets/Baseball/MLB_Logos/Mariners.png";
import RangersLogo from "assets/Baseball/MLB_Logos/Rangers.png";
import RangersLogoLight from "assets/Baseball/MLB_Logos/RangersLight.png";
import AngelsLogo from "assets/Baseball/MLB_Logos/Angels.png";
import AngelsLogoLight from "assets/Baseball/MLB_Logos/Angels.png";


export const teams: MLBTeam[] = [
  {
    id: 2,
    espnID: 29,
    name: "Diamondbacks",
    fullName: "Arizona Diamondbacks",
    code: "ARI",
    color: "#aa182c",
    secondaryColor: "#000000",
    logo: DiamondbacksLogo,
    logoLight: DiamondbacksLogoLight,
    firstSeason: 1998,
    latitude: 33.4455,
    longitude: -112.0667,
    venue: "Chase Field",
    venueCapacity: "48,405",
    address: "401 E Jefferson St, Phoenix, AZ 85004",
    city: "Phoenix, AZ",
    championships: [2001],
  },
  {
    id: 26,
    espnID: 11,
    name: "Athletics",
    fullName: "Oakland Athletics",
    code: "ATH",
    color: "#003831",
    secondaryColor: "#efb21e",
    logo: AthleticsLogo,
    logoLight: AthleticsLogoLight,
    firstSeason: 1901,
    latitude: 37.7516,
    longitude: -122.2005,
    venue: "Oakland Coliseum",
    venueCapacity: "63,132",
    address: "7000 Coliseum Way, Oakland, CA 94621",
    city: "Oakland, CA",
    championships: [1910, 1911, 1913, 1929, 1930, 1972, 1973, 1974, 1989],
  },
  {
    id: 3,
    espnID: 15,
    name: "Braves",
    fullName: "Atlanta Braves",
    code: "ATL",
    color: "#0c2340",
    secondaryColor: "#ba0c2f",
    logo: BravesLogo,
    logoLight:BravesLogoLight,
    firstSeason: 1876,
    latitude: 33.8907,
    longitude: -84.4677,
    venue: "Truist Park",
    venueCapacity: "41,149",
    address: "755 Battery Ave SE, Atlanta, GA 30339",
    city: "Atlanta, GA",
    championships: [1914, 1957, 1995, 2021],
  },
  {
    id: 4,
    espnID: 1,
    name: "Orioles",
    fullName: "Baltimore Orioles",
    code: "BAL",
    color: "#df4601",
    secondaryColor: "#000000",
    logo: OriolesLogo,
    logoLight: OriolesLogoLight,
    firstSeason: 1901,
    latitude: 39.2839,
    longitude: -76.6217,
    venue: "Oriole Park at Camden Yards",
    venueCapacity: "45,971",
    address: "333 W Camden St, Baltimore, MD 21201",
    city: "Baltimore, MD",
    championships: [1966, 1970, 1983],
  },
  {
    id: 5,
    espnID: 2,
    name: "Red Sox",
    fullName: "Boston Red Sox",
    code: "BOS",
    color: "#0d2b56",
    secondaryColor: "#bd3039",
    logo: RedSoxLogo,
    logoLight: RedSoxLogoLight,
    firstSeason: 1901,
    latitude: 42.3465,
    longitude: -71.0972,
    venue: "Fenway Park",
    venueCapacity: "37,755",
    address: "4 Jersey St, Boston, MA 02215",
    city: "Boston, MA",
    championships: [1903, 1912, 1915, 1916, 1918, 2004, 2007, 2013, 2018],
  },
  {
    id: 6,
    espnID: 16,
    name: "Cubs",
    fullName: "Chicago Cubs",
    code: "CHC",
    color: "#0e3386",
    secondaryColor: "#cc3433",
    logo: CubsLogo,
    logoLight: CubsLogoLight,
    firstSeason: 1876,
    latitude: 41.9484,
    longitude: -87.6553,
    venue: "Wrigley Field",
    venueCapacity: "41,649",
    address: "1060 W Addison St, Chicago, IL 60613",
    city: "Chicago, IL",
    championships: [1907, 1908, 2016],
  },
  {
    id: 7,
    espnID: 4,
    name: "White Sox",
    fullName: "Chicago White Sox",
    code: "CHW",
    color: "#000000",
    secondaryColor: "#c4ced4",
    logo: WhiteSoxLogo,
    logoLight: WhiteSoxLogoLight,
    firstSeason: 1901,
    latitude: 41.8299,
    longitude: -87.6339,
    venue: "Guaranteed Rate Field",
    venueCapacity: "40,615",
    address: "333 W 35th St, Chicago, IL 60616",
    city: "Chicago, IL",
    championships: [1906, 1917, 2005],
  },
  {
    id: 8,
    espnID: 17,
    name: "Reds",
    fullName: "Cincinnati Reds",
    code: "CIN",
    color: "#c6011f",
    secondaryColor: "#ffffff",
    logo:RedsLogo,
    logoLight: RedsLogoLight,
    firstSeason: 1882,
    latitude: 39.097,
    longitude: -84.507,
    venue: "Great American Ball Park",
    venueCapacity: "42,319",
    address: "100 Joe Nuxhall Way, Cincinnati, OH 45202",
    city: "Cincinnati, OH",
    championships: [1919, 1940, 1975, 1976, 1990],
  },
  {
    id: 9,
    espnID: 5,
    name: "Guardians",
    fullName: "Cleveland Guardians",
    code: "CLE",
    color: "#002b5c",
    secondaryColor: "#e31937",
    logo:GuardiansLogo,
    logoLight: GuardiansLogoLight,
    firstSeason: 1901,
    latitude: 41.4962,
    longitude: -81.6852,
    venue: "Progressive Field",
    venueCapacity: "34,830",
    address: "2401 Ontario St, Cleveland, OH 44115",
    city: "Cleveland, OH",
    championships: [1920, 1948],
  },
  {
    id: 10,
    espnID: 27,
    name: "Rockies",
    fullName: "Colorado Rockies",
    code: "COL",
    color: "#33006f",
    secondaryColor: "#000000",
    logo: RockiesLogo,
    logoLight: RockiesLogoLight,
    firstSeason: 1993,
    latitude: 39.7559,
    longitude: -104.9942,
    venue: "Coors Field",
    venueCapacity: "50,398",
    address: "2001 Blake St, Denver, CO 80205",
    city: "Denver, CO",
    championships: [],
  },
  {
    id: 12,
    espnID: 6,
    name: "Tigers",
    fullName: "Detroit Tigers",
    code: "DET",
    color: "#0a2240",
    secondaryColor: "#ff4713",
    logo: TigersLogo,
    logoLight: TigersLogoLight,
    firstSeason: 1901,
    latitude: 42.3391,
    longitude: -83.0484,
    venue: "Comerica Park",
    venueCapacity: "41,083",
    address: "2100 Woodward Ave, Detroit, MI 48201",
    city: "Detroit, MI",
    championships: [1935, 1945, 1968, 1984],
  },
  {
    id: 15,
    espnID: 18,
    name: "Astros",
    fullName: "Houston Astros",
    code: "HOU",
    color: "#002d62",
    secondaryColor: "#eb6e1f",
    logo: AstrosLogo,
    logoLight: AstrosLogoLight,
    firstSeason: 1962,
    latitude: 29.7573,
    longitude: -95.3555,
    venue: "Minute Maid Park",
    venueCapacity: "41,168",
    address: "501 Crawford St, Houston, TX 77002",
    city: "Houston, TX",
    championships: [2017, 2022],
  },
  {
    id: 16,
    espnID: 7,
    name: "Royals",
    fullName: "Kansas City Royals",
    code: "KC",
    color: "#004687",
    secondaryColor: "#7ab2dd",
    logo: RoyalsLogo,
    logoLight: RoyalsLogoLight,
    firstSeason: 1969,
    latitude: 39.0516,
    longitude: -94.4808,
    venue: "Kauffman Stadium",
    venueCapacity: "37,903",
    address: "1 Royal Way, Kansas City, MO 64129",
    city: "Kansas City, MO",
    championships: [1985, 2015],
  },
  {
    id: 17,
    espnID: 3,
    name: "Angels",
    fullName: "Los Angeles Angels",
    code: "LAA",
    color: "#ba0021",
    secondaryColor: "#c4ced4",
    logo: AngelsLogo,
    logoLight: AngelsLogoLight,
    firstSeason: 1961,
    latitude: 33.8003,
    longitude: -117.8827,
    venue: "Angel Stadium",
    venueCapacity: "45,517",
    address: "2000 E Gene Autry Way, Anaheim, CA 92806",
    city: "Anaheim, CA",
    championships: [2002],
  },
  {
    id: 18,
    espnID: 19,
    name: "Dodgers",
    fullName: "Los Angeles Dodgers",
    code: "LAD",
    color: "#005a9c",
    secondaryColor: "#ffffff",
    logo: DodgersLogo,
    logoLight: DodgersLogoLight,
    firstSeason: 1884,
    latitude: 34.0739,
    longitude: -118.24,
    venue: "Dodger Stadium",
    venueCapacity: "56,000",
    address: "1000 Vin Scully Ave, Los Angeles, CA 90012",
    city: "Los Angeles, CA",
    championships: [1955, 1959, 1963, 1965, 1981, 1988, 2020, 2025],
  },
  {
    id: 19,
    espnID: 28,
    name: "Marlins",
    fullName: "Miami Marlins",
    code: "MIA",
    color: "#00a3e0",
    secondaryColor: "#000000",
    logo:MarlinsLogo,
    logoLight: MarlinsLogoLight,
    firstSeason: 1993,
    latitude: 25.7781,
    longitude: -80.2198,
    venue: "loanDepot park",
    venueCapacity: "36,742",
    address: "501 Marlins Way, Miami, FL 33125",
    city: "Miami, FL",
    championships: [1997, 2003],
  },
  {
    id: 20,
    espnID: 8,
    name: "Brewers",
    fullName: "Milwaukee Brewers",
    code: "MIL",
    color: "#13294b",
    secondaryColor: "#ffc72c",
    logo: BrewersLogo,
    logoLight: BrewersLogoLight,
    firstSeason: 1969,
    latitude: 43.028,
    longitude: -87.9712,
    venue: "American Family Field",
    venueCapacity: "41,900",
    address: "1 Brewers Way, Milwaukee, WI 53214",
    city: "Milwaukee, WI",
    championships: [],
  },
  {
    id: 22,
    espnID: 9,
    name: "Twins",
    fullName: "Minnesota Twins",
    code: "MIN",
    color: "#031f40",
    secondaryColor: "#e20e32",
    logo: TwinsLogo,
    logoLight: TwinsLogoLight,
    firstSeason: 1901,
    latitude: 44.9817,
    longitude: -93.2777,
    venue: "Target Field",
    venueCapacity: "38,544",
    address: "1 Twins Way, Minneapolis, MN 55403",
    city: "Minneapolis, MN",
    championships: [1924, 1987, 1991],
  },
  {
    id: 24,
    espnID: 21,
    name: "Mets",
    fullName: "New York Mets",
    code: "NYM",
    color: "#002d72",
    secondaryColor: "#ff5910",
    logo: MetsLogo,
    logoLight: MetsLogoLight,
    firstSeason: 1962,
    latitude: 40.7571,
    longitude: -73.8458,
    venue: "Citi Field",
    venueCapacity: "41,922",
    address: "41 Seaver Way, Queens, NY 11368",
    city: "Queens, NY",
    championships: [1969, 1986],
  },
  {
    id: 25,
    espnID: 10,
    name: "Yankees",
    fullName: "New York Yankees",
    code: "NYY",
    color: "#132448",
    secondaryColor: "#c4ced4",
    logo: YankeesLogo,
    logoLight: YankeesLogoLight,
    firstSeason: 1901,
    latitude: 40.8296,
    longitude: -73.9262,
    venue: "Yankee Stadium",
    venueCapacity: "46,537",
    address: "1 E 161st St, Bronx, NY 10451",
    city: "Bronx, NY",
    championships: [
      1923, 1927, 1928, 1932, 1936, 1937, 1938, 1939, 1941, 1943, 1947, 1949,
      1950, 1951, 1952, 1953, 1956, 1958, 1961, 1962, 1977, 1978, 1996, 1998,
      1999, 2000, 2009,
    ],
  },
  {
    id: 27,
    espnID: 22,
    name: "Phillies",
    fullName: "Philadelphia Phillies",
    code: "PHI",
    color: "#e81828",
    secondaryColor: "#003278",
    logo: PhilliesLogo,
    logoLight: PhilliesLogoLight,
    firstSeason: 1883,
    latitude: 39.9057,
    longitude: -75.1665,
    venue: "Citizens Bank Park",
    venueCapacity: "42,792",
    address: "1 Citizens Bank Way, Philadelphia, PA 19148",
    city: "Philadelphia, PA",
    championships: [1980, 2008],
  },
  {
    id: 28,
    espnID: 23,
    name: "Pirates",
    fullName: "Pittsburgh Pirates",
    code: "PIT",
    color: "#000000",
    secondaryColor: "#fdb827",
    logo: PiratesLogo,
    logoLight: PiratesLogoLight,
    firstSeason: 1882,
    latitude: 40.4469,
    longitude: -80.0057,
    venue: "PNC Park",
    venueCapacity: "38,362",
    address: "115 Federal St, Pittsburgh, PA 15212",
    city: "Pittsburgh, PA",
    championships: [1909, 1925, 1960, 1971, 1979],
  },
  {
    id: 30,
    espnID: 25,
    name: "Padres",
    fullName: "San Diego Padres",
    code: "SD",
    color: "#2f241d",
    secondaryColor: "#ffc425",
    logo:PadresLogo,
    logoLight: PadresLogoLight,
    firstSeason: 1969,
    latitude: 32.7073,
    longitude: -117.1573,
    venue: "Petco Park",
    venueCapacity: "40,209",
    address: "100 Park Blvd, San Diego, CA 92101",
    city: "San Diego, CA",
    championships: [],
  },
  {
    id: 31,
    espnID: 26,
    name: "Giants",
    fullName: "San Francisco Giants",
    code: "SF",
    color: "#000000",
    secondaryColor: "#fd5a1e",
    logo:GiantsLogo,
    logoLight: GiantsLogoLight,
    firstSeason: 1883,
    latitude: 37.7786,
    longitude: -122.3893,
    venue: "Oracle Park",
    venueCapacity: "41,915",
    address: "24 Willie Mays Plaza, San Francisco, CA 94107",
    city: "San Francisco, CA",
    championships: [1905, 1921, 1922, 1933, 1954, 2010, 2012, 2014],
  },
  {
    id: 32,
    espnID: 12,
    name: "Mariners",
    fullName: "Seattle Mariners",
    code: "SEA",
    color: "#005c5c",
    secondaryColor: "#0c2c56",
    logo: MarinersLogo,
    logoLight: MarinersLogoLight,
    firstSeason: 1977,
    latitude: 47.5914,
    longitude: -122.3325,
    venue: "T-Mobile Park",
    venueCapacity: "47,929",
    address: "1250 1st Ave S, Seattle, WA 98134",
    city: "Seattle, WA",
    championships: [],
  },
  {
    id: 33,
    espnID: 24,
    name: "Cardinals",
    fullName: "St. Louis Cardinals",
    code: "STL",
    color: "#be0a14",
    secondaryColor: "#001541",
    logo: CardinalsLogo,
    logoLight: CardinalsLogoLight,
    firstSeason: 1882,
    latitude: 38.6226,
    longitude: -90.1928,
    venue: "Busch Stadium",
    venueCapacity: "45,529",
    address: "700 Clark Ave, St. Louis, MO 63102",
    city: "St. Louis, MO",
    championships: [
      1926, 1931, 1934, 1942, 1944, 1946, 1964, 1967, 1982, 2006, 2011,
    ],
  },
  {
    id: 34,
    espnID: 30,
    name: "Rays",
    fullName: "Tampa Bay Rays",
    code: "TB",
    color: "#092c5c",
    secondaryColor: "#8fbce6",
    logo: RaysLogo,
    logoLight: RaysLogoLight,
    firstSeason: 1998,
    latitude: 27.7683,
    longitude: -82.6534,
    venue: "Tropicana Field",
    venueCapacity: "25,025",
    address: "1 Tropicana Dr, St. Petersburg, FL 33705",
    city: "St. Petersburg, FL",
    championships: [],
  },
  {
    id: 35,
    espnID: 13,
    name: "Rangers",
    fullName: "Texas Rangers",
    code: "TEX",
    color: "#003278",
    secondaryColor: "#c0111f",
    logo: RangersLogo,
    logoLight:RangersLogoLight,
    firstSeason: 1961,
    latitude: 32.7473,
    longitude: -97.0842,
    venue: "Globe Life Field",
    venueCapacity: "40,300",
    address: "734 Stadium Dr, Arlington, TX 76011",
    city: "Arlington, TX",
    championships: [2023],
  },
  {
    id: 36,
    espnID: 14,
    name: "Blue Jays",
    fullName: "Toronto Blue Jays",
    code: "TOR",
    color: "#134a8e",
    secondaryColor: "#6cace5",
    logo: BlueJaysLogo,
    logoLight: BlueJaysLogoLight,
    firstSeason: 1977,
    latitude: 43.6415,
    longitude: -79.3894,
    venue: "Rogers Centre",
    venueCapacity: "49,282",
    address: "1 Blue Jays Way, Toronto, ON M5V 1J1",
    city: "Toronto, Ontario",
    championships: [1992, 1993],
  },
  {
    id: 37,
    espnID: 20,
    name: "Nationals",
    fullName: "Washington Nationals",
    code: "WSH",
    color: "#ab0003",
    secondaryColor: "#11225b",
    logo: NationalsLogo,
    logoLight: NationalsLogoLight,
    firstSeason: 1969,
    latitude: 38.873,
    longitude: -77.0074,
    venue: "Nationals Park",
    venueCapacity: "41,339",
    address: "1500 S Capitol St SE, Washington, DC 20003",
    city: "Washington, DC",
    championships: [2019],
  },
];

export const getMLBTeam = (id: number | string) =>
  teams.find((t) => String(t.id) === String(id)) || null;

export const getTeamLogo = (id: number | string, isDark: boolean) => {
  const team = teams.find((t) => String(t.id) === String(id));
  if (!team) return null;

  // adjust based on your actual team fields
  return isDark ? team.logoLight || team.logo : team.logo;
};

export const getMLBTeamByEspn = (id: number | string) =>
  teams.find((t) => String(t.espnID) === String(id)) || null;

export const teamsMLBById: Record<string, MLBTeam> = teams.reduce(
  (map, team) => {
    map[team.id] = team;
    return map;
  },
  {} as Record<string, MLBTeam>
);

export const mlbDivisionsById = {
  "AL East": [
    5, // Boston Red Sox
    1, // Baltimore Orioles
    36, // Toronto Blue Jays
    27, // Tampa Bay Rays
    25, // New York Yankees
  ],
  "AL Central": [
    9, // Cleveland Guardians
    12, // Detroit Tigers
    16, // Kansas City Royals
    22, // Minnesota Twins
    33, // Chicago White Sox
  ],
  "AL West": [
    3, // Oakland Athletics
    15, // Houston Astros
    17, // Los Angeles Angels
    32, // Seattle Mariners
    35, // Texas Rangers
  ],

  "NL East": [
    19, // Miami Marlins
    24, // New York Mets
    27, // Philadelphia Phillies
    37, // Washington Nationals
    3, // Atlanta Braves
  ],
  "NL Central": [
    6, // Chicago Cubs
    8, // Cincinnati Reds
    20, // Milwaukee Brewers
    28, // Pittsburgh Pirates
    22, // St. Louis Cardinals
  ],
  "NL West": [
    2, // Arizona Diamondbacks
    10, // Colorado Rockies
    18, // Los Angeles Dodgers
    30, // San Diego Padres
    31, // San Francisco Giants
  ],
};
