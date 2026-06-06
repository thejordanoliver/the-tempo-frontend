import { Dispatch, SetStateAction, useEffect, useMemo } from "react";

type MonthGroup = {
  key: string;
  year: number;
  month: number;
  label?: string;
  count: number;
};

type UseTeamMonthSelectorParams = {
  gamesByMonth: MonthGroup[];
  selectedDate: Date | null;
  setSelectedDate: Dispatch<SetStateAction<Date | null>>;
};

export function useTeamMonthSelector({
  gamesByMonth,
  selectedDate,
  setSelectedDate,
}: UseTeamMonthSelectorParams) {
  const gameCountByMonth = useMemo(() => {
    return new Map(gamesByMonth.map((group) => [group.key, group.count]));
  }, [gamesByMonth]);

  const monthsToShow = useMemo(() => {
    return gamesByMonth.map((group) => ({
      key: group.key,
      year: group.year,
      month: group.month,
      label: group.label,
      count: group.count,
    }));
  }, [gamesByMonth]);

  useEffect(() => {
    if (selectedDate || monthsToShow.length === 0) return;

    const today = new Date();

    const currentMonthWithGames = monthsToShow.find(
      ({ month, year }) =>
        month === today.getMonth() && year === today.getFullYear(),
    );

    const startingMonth = currentMonthWithGames ?? monthsToShow[0];

    setSelectedDate(new Date(startingMonth.year, startingMonth.month, 1));
  }, [monthsToShow, selectedDate, setSelectedDate]);

  const handleSelectMonth = (month: number, year: number) => {
    setSelectedDate(new Date(year, month, 1));
  };

  return {
    monthsToShow,
    gameCountByMonth,
    handleSelectMonth,
  };
}