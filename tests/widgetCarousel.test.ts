import assert from "node:assert/strict";
import test from "node:test";
import { getWidgetCarouselDotWindow } from "../utils/widgetCarousel";

test("shows at most five centered carousel dots", () => {
  assert.deepEqual(getWidgetCarouselDotWindow(0, 25), [0, 1, 2, 3, 4]);
  assert.deepEqual(getWidgetCarouselDotWindow(3, 25), [1, 2, 3, 4, 5]);
  assert.deepEqual(getWidgetCarouselDotWindow(12, 25), [10, 11, 12, 13, 14]);
  assert.deepEqual(getWidgetCarouselDotWindow(24, 25), [20, 21, 22, 23, 24]);
  assert.deepEqual(getWidgetCarouselDotWindow(2, 5), [0, 1, 2, 3, 4]);
  assert.deepEqual(getWidgetCarouselDotWindow(0, 0), []);
});
