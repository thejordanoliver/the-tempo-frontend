export type Experience = {
  years: number;
  displayValue: string;
  abbreviation: string;
};

export type CBBPlayer = {
  id: string;
  name: string;
  firstname: string;
 lastname: string;
  shortName?: string;
  jersey?: string;
  experience: Experience;
  team: string;
  teamId: string;
  position: string;
  height?: string;
  weight?: string;
  imageUrl: string;
};
