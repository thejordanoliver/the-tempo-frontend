import { RoundHeader } from "@/components/Sports/Basketball/Playoffs/NBAPlayoffs/RoundHeader";

export const RoundLabel = ({
  title,
  x,
  isDark,
}: {
  title: string;
  x: number;
  isDark: boolean;
}) => <RoundHeader title={title} centerX={x} width={200} isDark={isDark} />;
