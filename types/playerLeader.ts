export type PlayerLeader = {
  id: number;
  firstName: string;
  lastName: string;
  jersey_number: string;
  headshot_url?: string;
  team: {
    id: number;
    code: string,
    logo: any
  };
  leaderStat?: {
    name: string;
    value: number;
  };
};

export type PlayerLeadersSlideProps = {
  header: string;
  players: PlayerLeader[];
  slideWidth: number;
  slideHeight: number;
  visible: boolean; // ✅ add
};
