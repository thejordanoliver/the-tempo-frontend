import ExploreWidgetDashboard from "components/Explore/ExploreWidgetDashboard";
import { ExploreWidgetConfig, ExploreWidgetSize } from "types/widgets";

type EmptyStateProps = {
  isDark: boolean;
  selectedWidgets: ExploreWidgetConfig[];
  onAddWidget: () => void;
  onRemoveWidget: (widgetId: string) => void;
  onResizeWidget: (widgetId: string, size: ExploreWidgetSize) => void;
  onMoveWidget: (widgetId: string, direction: -1 | 1) => void;
};

export default function EmptyState(props: EmptyStateProps) {
  return <ExploreWidgetDashboard {...props} />;
}
