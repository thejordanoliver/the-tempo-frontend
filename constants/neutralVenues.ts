import { Venue } from "types/types";

const normalize = (s?: unknown) => {
  if (typeof s !== "string") return "";
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
};
export function getNeutralVenue(venueName?: string, isNeutralSite?: boolean) {
  // 🔒 Only allow neutral stadiums if it's actually a neutral-site game
  if (!isNeutralSite) return null;

  if (!venueName) return null;

  const normalizedInput = normalize(venueName);

  // 1. Exact match (fast path)
  if (neutralVenues[venueName]) {
    return neutralVenues[venueName];
  }

  // 2. Fuzzy match
  for (const key of Object.keys(neutralVenues)) {
    const normalizedKey = normalize(key);

    if (
      normalizedInput.includes(normalizedKey) ||
      normalizedKey.includes(normalizedInput)
    ) {
      return neutralVenues[key];
    }
  }

  return null;
}

export const neutralVenues: Record<string, Venue> = {
  "Etihad Arena": {
    name: "Etihad Arena",
    address:
      "FJ63+4PQ - Yas St - Yas Island - YS2 - Abu Dhabi - United Arab Emirates",
    latitude: 24.4539,
    longitude: 54.3773,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680251/arenas/basketball/etihad.avif",
  },

  "Stan Sheriff Center": {
    name: "Stan Sheriff Center",
    address: "1355 Lower Campus Rd, Honolulu, HI 96822",
    latitude: 21.3099,
    longitude: -157.8581,
    venueCapacity: "10,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/stan-sheriff-center.jpg",
  },

  "Accor Arena": {
    name: "Accor Arena",
    address: "8 Bd de Bercy, 75012 Paris, France",
    latitude: 48.8575,
    longitude: 2.3514,
    venueCapacity: "20,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/accor.jpg",
  },

  "Arena CDMX": {
    name: "Arena CDMX",
    city: "Mexico City",
    address: "Av. de las Granjas 800, Santa Barbara, Azcapotzalco",
    latitude: 19.4977,
    longitude: -99.1751,
    venueCapacity: "22,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/cdmx.jpg",
  },

  "Uber Arena": {
    name: "Uber Arena",
    city: "Berlin",
    address: "Mercedes-Platz 1, 10243 Berlin, Germany",
    latitude: 52.5062,
    longitude: 13.4434,
    venueCapacity: "17,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/uber.jpg",
  },

  "The O2": {
    name: "The O2 Arena",
    city: "London",
    address: "Peninsula Square, London SE10 0DX, United Kingdom",
    latitude: 51.503,
    longitude: 0.0032,
    venueCapacity: "20,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680191/arenas/basketball/the-o2.webp",
  },

  "Thomas & Mack Center": {
    name: "Thomas & Mack Center",
    city: "Las Vegas",
    address: "4505 S Maryland Pkwy, Las Vegas, NV 89154",
    latitude: 36.1057,
    longitude: -115.1426,
    venueCapacity: "17,923",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680183/arenas/basketball/vegas-summer-league.jpg",
  },

  "Cox Pavilion": {
    name: "Cox Pavilion",
    city: "Las Vegas",
    address: "4505 S Maryland Pkwy, Las Vegas, NV 89154",
    latitude: 36.1054,
    longitude: -115.1433,
    venueCapacity: "3,286",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1767000000/arenas/basketball/cox-pavilion.jpg",
  },

  "Jon M. Huntsman Center": {
    name: "Jon M. Huntsman Center",
    city: "Salt Lake City",
    address: "1825 E South Campus Dr, Salt Lake City, UT 84112",
    latitude: 40.7625,
    longitude: -111.8508,
    venueCapacity: "15,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1769869282/basketball/arenas/huntsman-center.jpg",
  },

  "Acrisure Arena": {
    name: "Acrisure Arena",
    address: "75702 Varner Rd, Palm Desert, CA 92211",
    latitude: 33.7222,
    longitude: -116.3745,
    venueCapacity: "20,300",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/acrisure.jpg",
  },

  "Coliseo de Puerto Rico": {
    name: "Coliseo de Puerto Rico",
    address: "500 Av. Arterial B, San Juan, 00918, Puerto Rico",
    latitude: 18.4655,
    longitude: -66.1057,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/coliseode-puerto-rico.jpg",
  },

  "Pechanga Arena": {
    name: "Pechanga Arena",
    address: "3500 Sports Arena Blvd, San Diego, CA 92110",
    latitude: 32.7468,
    longitude: -117.1882,
    venueCapacity: "16,100",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/pechanga.jpg",
  },

  "North Charleston Coliseum": {
    name: "North Charleston Coliseum",
    address: "5001 Coliseum Dr, North Charleston, SC 29418",
    latitude: 32.8655,
    longitude: -80.0224,
    venueCapacity: "13,295",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/north-charleston-coliseum.jpg",
  },

  "Legacy Arena at BJCC": {
    name: "Legacy Arena at BJCC",
    address: "1001 19th St N, Birmingham, AL 35234",
    latitude: 33.5207,
    longitude: -86.8025,
    venueCapacity: "17,654",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/legacy.jpg",
  },
  "Simmons Bank Arena": {
    name: "Simmons Bank Arena",
    address: "1 Simmons Bank Arena Drive, North Little Rock, AR 72114",
    latitude: 34.76,
    longitude: -92.26,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680234/arenas/basketball/simmons-bank.webp",
  },
  "T-Mobile Center": {
    name: "T-Mobile Center",
    address: "1 1407 Grand Blvd, Kansas City, MO 64106",
    latitude: 39.0975,
    longitude: -94.5802,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680234/arenas/basketball/t-mobile-center.webp",
  },

  "Madison Square Garden": {
    name: "Madison Square Garden",
    city: "New York",
    address: "4 Pennsylvania Plaza, New York, NY 10001",
    latitude: 40.7128,
    longitude: -74.006,
    venueCapacity: "19,812",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680234/arenas/basketball/knicks.webp",
  },
  "Rocket Arena": {
    name: "Rocket Arena",
    city: "Cleveland",
    address: "1 Center Court, Cleveland, OH 44115",
    latitude: 41.4966,
    longitude: -81.688,
    venueCapacity: "19,432",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680234/arenas/basketball/cavaliers.webp",
  },
  "Jenny Craig Pavilion": {
    name: "Jenny Craig Pavilion",
    city: "San Diego",
    address: "5998 Alcala Park, San Diego, CA 92110",
    latitude: 32.7713,
    longitude: -117.1927,
    venueCapacity: "5,100",
    venueImage: {
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774672119/arenas/basketball/jenny-craig-pavilion.webp",
    },
  },
  "Veterans Memorial Arena": {
    name: "VyStar Veterans Memorial Arena",
    city: "Jacksonville",
    address: "300 A Philip Randolph Blvd, Jacksonville, FL 32202",
    latitude: 30.3257,
    longitude: -81.6376,
    venueCapacity: "15,000",
    venueImage: {
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774671988/arenas/basketball/veterans-memorial-arena.jpg",
    },
  },
  "Mohegan Sun Arena": {
    name: "Mohegan Sun Arena",
    city: "Uncasville",
    address: "1 Mohegan Sun Blvd, Uncasville, CT 06382",
    latitude: 41.4871,
    longitude: -72.086,
    venueCapacity: "10,000",
    venueImage: {
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774671887/arenas/basketball/mohegan-sun-arena.jpg",
    },
  },
  "United Center": {
    name: "United Center",
    city: "Chicago",
    address: "1901 W Madison St, Chicago, IL 60612",
    latitude: 41.8807,
    longitude: -87.6742,
    venueCapacity: "20,917",
    venueImage: {
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/bulls.jpg",
    },
  },
  "Mortgage Matchup Center": {
    name: "Mortgage Matchup Center",
    city: "Phoenix",
    address: "201 E Jefferson St, Phoenix, AZ 85004",
    latitude: 33.4455,
    longitude: -112.0713,
    venueCapacity: "18,422",
    venueImage: {
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/suns.jpg",
    },
  },
  "Amerant Bank Arena": {
    name: "Amerant Bank Arena",
    city: "Sunrise",
    address: "1 Panther Pkwy, Sunrise, FL 33323",
    latitude: 26.1585,
    longitude: -80.3256,
    venueCapacity: "19,250",
    venueImage: {
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774457972/arenas/basketball/amerant-bank-arena.jpg",
    },
  },
  "Bon Secours Wellness Arena": {
    name: "Bon Secours Wellness Arena",
    address: "650 N Academy St, Greenville, SC 29601",
    latitude: 34.8526,
    longitude: -82.3915,
    venueCapacity: "15,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680234/arenas/basketball/bon-secours-wellness-arena.webp",
  },
  "Benchmark International Arena": {
    name: "Benchmark International Arena",
    city: "North Little Rock",
    address:
      "1 Benchmark International Arena Drive, North Little Rock, AR 72114",
    latitude: 34.76,
    longitude: -92.26,
    venueCapacity: "18,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680234/arenas/basketball/benchmark-international.webp",
  },
  "Bridgestone Arena": {
    name: "Bridgestone Arena",
    city: "Nashville",
    address: "501 Broadway, Nashville, TN 37203",
    latitude: 36.1595,
    longitude: -86.7781,
    venueCapacity: "17,159",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774458320/arenas/basketball/bridgestone-arena.webp",
  },
  "Capital One Arena": {
    name: "Capital One Arena",
    city: "Washington, D.C.",
    address: "601 F St NW, Washington, DC 20004",
    latitude: 38.8983,
    longitude: -77.0209,
    venueCapacity: "20,356",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/wizards.jpg",
  },
  "Dickies Arena": {
    name: "Dickies Arena",
    city: "Fort Worth",
    address: "1911 Montgomery St, Fort Worth, TX 76107",
    latitude: 32.7411,
    longitude: -97.3686,
    venueCapacity: "14,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/dickies-arena.jpg",
  },
  "Golden 1 Center": {
    name: "Golden 1 Center",
    city: "Sacramento",
    address: "500 David J Stern Walk, Sacramento, CA 95814",
    latitude: 38.5802,
    longitude: -121.4997,
    venueCapacity: "17,608",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/arenas/basketball/kings.jpg",
  },
  "Meta Apex": {
    name: "Meta Apex",
    city: "Las Vegas",
    address: "3200 S Las Vegas Blvd, Las Vegas, NV 89109",
    latitude: 36.1028,
    longitude: -115.1713,
    venueCapacity: "20,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766680000/arenas/mma/meta-apex.jpg",
  },
};

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
  "Levi's Stadium": {
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
      uri: "https://res.cloudinary.com/dm3qtdhag/image/upload/v1774705341/stadiums/football/camping-world-stadium.jpg",
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
  "Tom Benson Hall of Fame Stadium": {
    name: "Tom Benson Hall of Fame Stadium",
    city: "Canton",
    address: "2625 Fulton Dr NW, Canton, OH 44718",
    latitude: 40.8216,
    longitude: -81.3865,
    venueCapacity: "23,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671637/stadiums/football/tom-benson-hall-of-fame.jpg",
  },
  "Moscone Center": {
    name: "Moscone Center",
    city: "San Francisco",
    address: "747 Howard St, San Francisco, CA 94103",
    latitude: 37.784,
    longitude: -122.4014,
    venueCapacity: "N/A",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1769676975/stadiums/football/moscone-center.png",
  },

  "Lucas Oil Stadium": {
    name: "Lucas Oil Stadium",
    city: "Indianapolis",
    address: "500 S Capitol Ave, Indianapolis, IN 46225",
    latitude: 39.7601,
    longitude: -86.1639,
    venueCapacity: "67,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/colts.jpg",
  },

  "Levi's® Stadium": {
    name: "Levi's® Stadium",
    city: "San Francisco",
    address: "4900 Marie P DeBartolo Way, Santa Clara, CA 95054",
    latitude: 37.4033,
    longitude: -121.9694,
    venueCapacity: "68,500",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/niners.jpg",
  },

  "Aviva Stadium": {
    name: "Aviva Stadium",
    city: "Dublin",
    address: "Lansdowne Rd, Dublin 4, Ireland",
    latitude: 30.323471,
    longitude: -81.636528,
    venueCapacity: "67,838",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/aviva.jpg",
  },
  "Everbank Stadium": {
    name: "Everbank Stadium",
    city: "Jacksonville",
    address: "1 EverBank Stadium Dr, Jacksonville, FL 32202",
    latitude: 30.323471,
    longitude: -81.636528,
    venueCapacity: "67,838",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/jaguars.jpg",
  },
  "Mercedes-Benz Stadium": {
    name: "Mercedes-Benz Stadium",
    city: "Atlanta",
    address: "1 AMB Dr NW, Atlanta, GA 30313",
    latitude: 33.7554,
    longitude: -84.4008,
    venueCapacity: "71,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/falcons.jpg",
  },
  "AT&T Stadium": {
    name: "AT&T Stadium",
    city: "Arlington",
    address: "1 AT&T Way, Arlington, TX 76011",
    latitude: 32.7473,
    longitude: -97.0945,
    venueCapacity: "80,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/cowboys.jpg",
  },
  "Hard Rock Stadium": {
    name: "Hard Rock Stadium",
    city: "Miami",
    address: "347 Don Shula Dr, Miami Gardens, FL 33056",
    latitude: 25.9579,
    longitude: -80.239,
    venueCapacity: "65,326",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/dolphins.jpg",
  },
  "Caesars Superdome": {
    name: "Caesars Superdome",
    city: "New Orleans",
    address: "1500 Sugar Bowl Dr, New Orleans, LA 70112",
    latitude: 29.9507,
    longitude: -90.0811,
    venueCapacity: "73,208",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/saints.jpg",
  },
  "Rose Bowl": {
    name: "Rose Bowl",
    city: "Pasadena",
    address: "1001 Rose Bowl Dr, Pasadena, CA 91103",
    latitude: 34.1613,
    longitude: -118.1676,
    venueCapacity: "88,565",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766712788/stadiums/football/rose-bowl.jpg",
  },
  "Cramton Bowl": {
    name: "Cramton Bowl",
    city: "Montgomery",
    address: "Madison Ave, Montgomery, AL 36104",
    latitude: 32.3795,
    longitude: -86.293,
    venueCapacity: "25,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/cramton-bowl.jpg",
  },
  "Ford Center At The Star": {
    name: "Ford Center At The Star",
    city: "Frisco",
    address: "9 Cowboys Way, Frisco, TX 75034",
    latitude: 33.12,
    longitude: -96.83,
    venueCapacity: "12,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/ford-center-at-the-star.jpg",
  },
  "Brooks Stadium (SC)": {
    name: "Brooks Stadium (SC)",
    city: "Conway",
    address: "540 University Blvd, Conway, SC 29526",
    latitude: 33.7961,
    longitude: -79.0137,
    venueCapacity: "21,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/coastal-carolina.jpg",
  },
  "Allegiant Stadium": {
    name: "Allegiant Stadium",
    city: "Las Vegas",
    address: "6475 S. Raiders Way, Las Vegas, NV 89118",
    latitude: 36.090794,
    longitude: -115.183952,
    venueCapacity: "65,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/raiders.jpg",
  },
  "Ford Field": {
    name: "Ford Field",
    city: "Detroit",
    address: "2000 Brush Street, Detroit, MI 48226",
    latitude: 42.34,
    longitude: -83.0456,
    venueCapacity: "65,000",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/lions.jpg",
  },
  "Chase Field": {
    name: "Chase Field",
    city: "Phoenix",
    address: "401 E Jefferson St, Phoenix, AZ 85004",
    latitude: 33.4455,
    longitude: -112.0667,
    venueCapacity: "48,405",
    venueImage:
      "https://upload.wikimedia.org/wikipedia/commons/a/a2/Reserve_A-10_Warthogs_Flyover_2023_World_Series_%288099146%29.jpg",
  },
  "Gerald J. Ford Stadium": {
    name: "Gerald J. Ford Stadium",
    city: "Dallas",
    address: "5800 Ownby Dr, Dallas, TX 75205",
    venueCapacity: "32,000",
    latitude: 32.8424,
    longitude: -96.7849,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766762810/stadiums/football/cfb_190_gerald_j__ford_stadium.jpg",
  },

  Alamodome: {
    name: "Alamodome",
    city: "San Antonio",
    address: "100 Montana St, San Antonio, TX 78203",
    venueCapacity: "64,000",
    latitude: 29.4181,
    longitude: -98.4786,
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766763179/stadiums/football/cfb_133_alamodome.jpg",
  },
  "Nissan Stadium": {
    name: "Nissan Stadium",
    city: "Nashville",
    address: "1 Titans Way, Nashville, TN 37213",
    latitude: 36.1665,
    longitude: -86.7713,
    venueCapacity: "69,143",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1766671698/stadiums/football/titans.jpg",
  },
  "Independence Stadium": {
    name: "Independence Stadium",
    latitude: 32.5252, // Shreveport, LA
    longitude: -93.7502,
    venueCapacity: "50,000", // updated approximate capacity
    address: "4000 Clyde Fant Pkwy, Shreveport, LA 71101",
    city: "Shreveport, LA",
    venueImage:
      "https://assets.simpleviewinc.com/simpleview/image/upload/crm/shreveport/20241228_202959_032B00EF-CD4D-7480-D2225FCC188209DC-032af8dfb2655d3_032b0ebc-a656-af67-f8cec304f3a2e5c1.jpg",
  },

  "Yankee Stadium": {
    name: "Yankee Stadium",
    latitude: 40.8296,
    longitude: -73.9262,
    venueCapacity: "46,537",
    address: "1 E 161st St, Bronx, NY 10451",
    city: "Bronx, NY",
    venueImage: require("assets/Baseball/Stadiums/YankeeStadium.webp"),
  },
  "Sun Bowl": {
    name: "Sun Bowl",
    city: "El Paso",
    address: "2701 Sun Bowl Dr, El Paso, TX 79902",
    latitude: 31.7732,
    longitude: -106.5067,
    venueCapacity: "51,500",
    venueImage:
      "https://res.cloudinary.com/dm3qtdhag/image/upload/v1767220397/stadiums/football/cfb_57_sun_bowl_stadium.jpg",
  },
};
