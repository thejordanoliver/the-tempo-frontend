import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const WidgetReadyContext = createContext<(() => void) | null>(null);

// Keep widgets mounted so their requests start together, but reveal the board
// only after every selected widget has finished its initial load.
export function useWidgetBoardLoading(widgetIds: readonly string[]) {
  const [readyIds, setReadyIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [revealed, setRevealed] = useState(false);
  const allReady = widgetIds.every((id) => readyIds.has(id));

  if (!revealed && widgetIds.length > 0 && allReady) {
    setRevealed(true);
  }

  const onWidgetReady = useCallback((id: string) => {
    setReadyIds((previous) => {
      if (previous.has(id)) return previous;
      return new Set([...previous, id]);
    });
  }, []);

  // Refreshes, retries, and newly added widgets must not hide an existing board.
  return { loading: !revealed && !allReady, onWidgetReady };
}

export function WidgetLoadBoundary({
  widgetId,
  onReady,
  children,
}: {
  widgetId: string;
  onReady: (id: string) => void;
  children: ReactNode;
}) {
  const reportReady = useMemo(
    () => () => onReady(widgetId),
    [onReady, widgetId],
  );
  return (
    <WidgetReadyContext.Provider value={reportReady}>
      {children}
    </WidgetReadyContext.Provider>
  );
}

export function useWidgetLoadReady(loading: boolean) {
  const reportReady = useContext(WidgetReadyContext);
  useEffect(() => {
    if (!loading) reportReady?.();
  }, [loading, reportReady]);
}
