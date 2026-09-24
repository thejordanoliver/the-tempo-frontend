import { Image } from "expo-image";
import type { ComponentProps } from "react";

import type {
  ExploreCollegePollLeague,
  ExploreCollegePollType,
  ExploreWidgetSize,
} from "types/widgets";

export type CollegePollOption = {
  label: string;
  shortLabel: string;
  value: ExploreCollegePollType;
};

export type CollegePollRow = {
  key: string;
  rank: number;
  trend: number;
  points: number;
  record: string;
  teamId?: string | number;
  teamCode: string;
  teamName: string;
  color: string;
  logo?: ComponentProps<typeof Image>["source"];
};

export type CollegePollTableProps = {
  size: ExploreWidgetSize;
  width: number;
  isDark: boolean;
  isEditing: boolean;
  league: ExploreCollegePollLeague;
  loading: boolean;
  error: string | null;
  rows: CollegePollRow[];
  onRetry: () => void | Promise<void>;
  autoPlay: boolean;
};

export type CollegePollSourceProps = Pick<
  CollegePollTableProps,
  "size" | "width" | "isDark" | "isEditing" | "autoPlay"
> & {
  pollType: ExploreCollegePollType;
};

export type CollegePollWidgetProps = {
  isDark: boolean;
  size: ExploreWidgetSize;
  width: number;
  height: number;
  league: ExploreCollegePollLeague;
  pollType: ExploreCollegePollType;
  onChangeSelection: (
    league: ExploreCollegePollLeague,
    pollType: ExploreCollegePollType,
  ) => void;
  autoPlay: boolean;
  onChangeAutoPlay: (autoPlay: boolean) => void;
  widgetId: string;
  widgetSize: ExploreWidgetSize;
  isEditing: boolean;
  availableSizeOptions: readonly ExploreWidgetSize[];
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onRemoveWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export type CollegePollSettingsModalProps = {
  visible: boolean;
  isDark: boolean;
  selectedLeague: ExploreCollegePollLeague;
  selectedPollType: ExploreCollegePollType;
  autoPlay: boolean;
  onClose: () => void;
  onSelect: (
    league: ExploreCollegePollLeague,
    pollType: ExploreCollegePollType,
  ) => void;
  onChangeAutoPlay: (autoPlay: boolean) => void;
};
