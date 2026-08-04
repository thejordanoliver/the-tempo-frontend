export type CountdownType = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};


export type CalendarMonth = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

export type MarkedDate = {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
  disableTouchEvent?: boolean;
};

export type CalendarModalProps = {
  visible: boolean;
  selectedDate?: string;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  onMonthChange?: (date: string) => void;
  markedDates: Record<string, MarkedDate>;
};