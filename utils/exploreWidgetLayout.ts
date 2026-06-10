import type { ExploreWidgetConfig } from "types/widgets";

export type DashboardWidgetCell = {
  widget: ExploreWidgetConfig;
  index: number;
};

export type DashboardWidgetRow = {
  id: string;
  cells: DashboardWidgetCell[];
};

export const buildWidgetRows = (
  widgets: ExploreWidgetConfig[],
): DashboardWidgetRow[] => {
  const rows: DashboardWidgetRow[] = [];
  let pendingSmallCells: DashboardWidgetCell[] = [];

  const flushSmallCells = () => {
    if (pendingSmallCells.length === 0) return;

    rows.push({
      id: pendingSmallCells.map((cell) => cell.widget.id).join(":"),
      cells: pendingSmallCells,
    });
    pendingSmallCells = [];
  };

  widgets.forEach((widget, index) => {
    const cell = { widget, index };

    if (widget.size === "small") {
      pendingSmallCells.push(cell);

      if (pendingSmallCells.length === 2) {
        flushSmallCells();
      }
      return;
    }

    flushSmallCells();
    rows.push({ id: widget.id, cells: [cell] });
  });

  flushSmallCells();
  return rows;
};
