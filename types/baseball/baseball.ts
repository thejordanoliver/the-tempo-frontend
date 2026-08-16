export type BaseballGame = {
  league: {
    id: number;
    uid: string;
    code: string;
    name: string;
    slug: string;
  };
  id: number;
  uid: string;
  name: string;
  shortName: string;
  headline: string;
  date: string;
  startDate: string;
  timestamp: number;
  season: {
    year: number;
    type: number;
    slug: string;
  };
  status: {
    state: string;
    description: string;
    detail: string;
    shortDetail: string;
    period: number;
    completed: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    indoor: boolean;
  };
  weather: {
    displayValue: string;
    temperature: number;
    highTemperature: number;
    conditionId: string;
    link: {
      language: string;
      rel: string[];
      href: string;
      text: string;
      shortText: string;
      isExternal: boolean;
      isPremium: boolean;
    };
  };
  broadcasts: string[];
  geoBroadcasts: unknown[];
  innings: number;
  home: {
    id: number;
    espnId: number;
    name: string;
    code: string;
    primaryColor: string;
    secondaryColor: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
    homeRank: number;
    winner: boolean;
  };
  away: {
    id: number;
    espnId: number;
    name: string;
    fullName: string;
    code: string;
    primaryColor: string;
    secondaryColor: string;
    score: number;
    hits: number;
    errors: number;
    record: string;
    awayRank: number;
    winner: boolean;
  };
  isConferenceGame: boolean;
  isNeutralSite: boolean;
  attendance: number;
  playByPlayAvailable: boolean;
  recent: true;
  wasSuspended: boolean;
  situation: {
    balls: number;
    strikes: number;
    outs: number;
    outsText: string;
    onFirst: boolean;
    onSecond: boolean;
    onThird: boolean;
    pitcher: {
      playerId: number;
      period: number;
      summary: string;
      athlete: {
        id: string;
        fullName: string;
        displayName: string;
        shortName: string;
        position: string;
      };
    };
    batter: {
      id: string;
      fullName: string | null;
      displayName: string | null;
      shortName: string | null;
      position: string | null;
    };
    lastPlay: {
      id: string;
      text: string;
      scoreValue: number;
      summaryType: string;
      atBatId: string;
      type: {
        id: string;
        text: string;
        abbreviation: string;
      };
      teamId: string;
      athletesInvolved: [
        {
          id: string;
          fullName: string;
          displayName: string;
          shortName: string;
          position: string;
        },
      ];
    };
  };
  raw: {
    eventId: string;
    competitionId: string;
  };
};

export type BaseballGameCardProps = {
  game: BaseballGame;
  isMLB?: boolean;
  isSB?: boolean;
  isCB?: boolean;
};
