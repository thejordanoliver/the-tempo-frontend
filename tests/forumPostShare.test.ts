import assert from "node:assert/strict";
import test from "node:test";
import {
  getForumPostShareLink,
  getForumPostPreviewText,
  getForumPostShareText,
  getSharedForumPostFallback,
  getSharedForumPostId,
} from "../utils/forums/forumPostShare";

test("shares include a bounded preview and a link to the exact post", () => {
  const text = getForumPostShareText({
    id: "post-123",
    username: "fan",
    text: "x".repeat(500),
  });
  assert.ok(text.includes("Post from @fan on Tempo"));
  assert.ok(text.includes("x".repeat(280)));
  assert.ok(!text.includes("x".repeat(281)));
  assert.equal(getSharedForumPostId(text), "post-123");
  assert.equal(getForumPostShareLink("post-123"), "tempo://post/post-123");
});

test("media-only posts still have a tappable destination", () => {
  assert.equal(
    getSharedForumPostId(
      getForumPostShareText({ id: "123", username: "fan", text: " " }),
    ),
    "123",
  );
});

test("rejects malformed links and unexpected destinations", () => {
  for (const text of [
    "hello",
    "https://example.com/post/123",
    "nbascorestracker://post/",
    "nbascorestracker://post/%ZZ",
    "nbascorestracker://post/%2Fmessages",
    "nbascorestracker://post/123?other=1",
    "nbascorestracker://post/123\nother text",
  ]) {
    assert.equal(getSharedForumPostId(text), null);
  }
});

test("new links use Tempo branding while legacy shared DMs still open", () => {
  assert.equal(getSharedForumPostId("tempo://post/123"), "123");
  assert.equal(getSharedForumPostId("nbascorestracker://post/123"), "123");
  for (const text of [
    "tempo://post/%ZZ",
    "tempo://post/%2Fmessages",
    "tempo://post/123?other=1",
    "tempo://post/",
  ]) {
    assert.equal(getSharedForumPostId(text), null);
  }
});

test("post previews truncate long and multiline text with an ellipsis", () => {
  assert.equal(getForumPostPreviewText("  Short post  "), "Short post");
  assert.equal(getForumPostPreviewText("x".repeat(280)), "x".repeat(280));
  assert.equal(getForumPostPreviewText("x".repeat(281)), `${"x".repeat(280)}…`);
  assert.equal(
    getForumPostPreviewText("one\ntwo\nthree\nfour\nfive"),
    "one\ntwo\nthree\nfour…",
  );
  assert.equal(getForumPostPreviewText(" \n "), "");
});

test("unavailable post previews retain the original author and text without the link", () => {
  for (const link of ["tempo://post/123", "nbascorestracker://post/123"]) {
    assert.deepEqual(
      getSharedForumPostFallback(
        `Post from @fan on Tempo\n\nGame thoughts\n\n${link}`,
      ),
      { username: "fan", text: "Game thoughts" },
    );
    assert.deepEqual(getSharedForumPostFallback(link), {
      username: "",
      text: "",
    });
  }
  assert.deepEqual(
    getSharedForumPostFallback(
      getForumPostShareText({ id: "123", username: "fan", text: "" }),
    ),
    { username: "fan", text: "" },
  );
});
