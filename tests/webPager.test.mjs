import assert from "node:assert/strict";
import test from "node:test";
import { sportsHookHarness, flush } from "./helpers/sportsHookHarness.mjs";

function setup(overrides = {}) {
  const h = sportsHookHarness();
  const ref = { current: null };
  const selected = [];
  const states = [];
  const offsets = [];
  const props = {
    children: ["page-one", "page-two", "page-three"],
    onPageSelected: ({ nativeEvent }) => selected.push(nativeEvent.position),
    onPageScroll: ({ nativeEvent }) =>
      offsets.push(nativeEvent.position + nativeEvent.offset),
    onPageScrollStateChanged: ({ nativeEvent }) =>
      states.push(nativeEvent.pageScrollState),
    ...overrides,
  };
  h.react.Children = { toArray: (children) => children };
  h.react.forwardRef = (render) => (p) => render(p, ref);
  h.react.useImperativeHandle = (target, factory, deps) => {
    target.current = h.react.useMemo(factory, deps);
  };
  const jsx = (type, attributes) => ({ type, props: attributes });
  Object.assign(h.modules, {
    "react-native": { View: "View" },
    "react/jsx-runtime": { jsx, jsxs: jsx },
  });
  h.start(h.load("components/PagerView.web.tsx").default, [props]);
  return {
    ...h,
    ref,
    props,
    selected,
    states,
    offsets,
    get tree() {
      return h.state;
    },
    update(p) {
      h.update([{ ...props, ...p }]);
    },
  };
}

const visiblePages = (h) =>
  h.tree.props.children.filter((page) => page.props.style.display === "flex");
const touch = (pageX, pageY) => ({ nativeEvent: { pageX, pageY } });

test("web pager selects tabs imperatively, retains panels and emits settling/selection/idle events", async () => {
  const h = setup({ initialPage: 1 });
  try {
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-two");
    h.ref.current.setPage(2);
    await flush();
    assert.equal(h.tree.props.children.length, 3);
    assert.equal(visiblePages(h)[0].props.children, "page-three");
    assert.equal(
      h.tree.props.children[0].props.importantForAccessibility,
      "no-hide-descendants",
    );
    assert.deepEqual(h.selected, [1, 2]);
    assert.deepEqual(h.offsets, [1, 2]);
    assert.deepEqual(h.states, ["settling", "idle", "settling", "idle"]);
    h.ref.current.setPageWithoutAnimation(-2);
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-one");
    h.ref.current.setPage(999);
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-three");
  } finally {
    h.stop();
  }
});

test("web swipe selection respects scroll disabling and leaves vertical scrolling alone", async () => {
  const h = setup();
  try {
    await flush();
    h.tree.props.onTouchStart(touch(200, 40));
    h.tree.props.onTouchEnd(touch(50, 43));
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-two");
    h.tree.props.onTouchStart(touch(200, 40));
    h.tree.props.onTouchEnd(touch(200, 200));
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-two");
    h.ref.current.setScrollEnabled(false);
    h.tree.props.onTouchStart(touch(200, 40));
    h.tree.props.onTouchEnd(touch(50, 43));
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-two");
    h.ref.current.setPage(2);
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-three");
  } finally {
    h.stop();
  }
});

test("page-count changes preserve the selection or clamp a removed page", async () => {
  const h = setup();
  try {
    h.ref.current.setPage(2);
    await flush();
    h.update({ children: [...h.props.children, "page-four"] });
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-three");
    h.update({ children: ["page-one", "page-two"] });
    await flush();
    assert.equal(visiblePages(h)[0].props.children, "page-two");
  } finally {
    h.stop();
  }
});
