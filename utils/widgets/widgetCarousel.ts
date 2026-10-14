export function getWidgetCarouselDotWindow(
  currentIndex: number,
  pageCount: number,
) {
  const normalizedPageCount = Math.max(0, Math.floor(pageCount));

  if (normalizedPageCount === 0) return [];

  const visibleCount = Math.min(normalizedPageCount, 5);
  const normalizedIndex = Math.max(
    0,
    Math.min(Math.floor(currentIndex), normalizedPageCount - 1),
  );
  const centeredStart = normalizedIndex - Math.floor(visibleCount / 2);
  const startIndex = Math.max(
    0,
    Math.min(centeredStart, normalizedPageCount - visibleCount),
  );

  return Array.from({ length: visibleCount }, (_, index) => startIndex + index);
}
