import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
// @ts-expect-error Node's type-stripping test runner requires the .ts extension.
import { createExpiringRequestCache } from "../services/messageAttachmentUrlCache.ts";

const projectRoot = process.cwd();
const readProjectFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(projectRoot, relativePath), "utf8");

test("signed attachment URLs are deduplicated and cached only before expiry", async () => {
  let now = Date.parse("2026-08-27T12:00:00.000Z");
  let loads = 0;
  const cache = createExpiringRequestCache<{
    expiresAt: string;
    url: string;
  }>({
    now: () => now,
    refreshBufferMs: 30_000,
  });
  const load = async () => {
    loads += 1;
    return {
      expiresAt: new Date(now + 5 * 60_000).toISOString(),
      url: `signed-${loads}`,
    };
  };

  const [first, concurrent] = await Promise.all([
    cache.get("attachment-1", load),
    cache.get("attachment-1", load),
  ]);
  assert.equal(loads, 1);
  assert.equal(first.url, concurrent.url);

  assert.equal((await cache.get("attachment-1", load)).url, "signed-1");
  assert.equal(loads, 1);

  now += 4 * 60_000 + 31_000;
  assert.equal((await cache.get("attachment-1", load)).url, "signed-2");
  assert.equal(loads, 2);
});

test("force refresh and logout-style clearing discard private URL entries", async () => {
  let loads = 0;
  const cache = createExpiringRequestCache<{
    expiresAt: string;
    url: string;
  }>({ refreshBufferMs: 30_000 });
  const load = async () => ({
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    url: `signed-${++loads}`,
  });

  await cache.get("attachment-1", load);
  await cache.get("attachment-1", load, { forceRefresh: true });
  assert.equal(loads, 2);

  cache.clear();
  await cache.get("attachment-1", load);
  assert.equal(loads, 3);
});

test("an in-flight signing response cannot repopulate a cleared logout cache", async () => {
  const cache = createExpiringRequestCache<{
    expiresAt: string;
    url: string;
  }>({ refreshBufferMs: 30_000 });
  let resolveOldRequest!: (value: { expiresAt: string; url: string }) => void;
  const oldRequest = cache.get(
    "attachment-1",
    () =>
      new Promise((resolve) => {
        resolveOldRequest = resolve;
      }),
  );

  cache.clear();
  const newValue = await cache.get("attachment-1", async () => ({
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    url: "signed-after-login",
  }));

  resolveOldRequest({
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    url: "signed-before-logout",
  });
  await oldRequest;

  const cached = await cache.get("attachment-1", async () => {
    throw new Error("The post-login cache entry should remain available.");
  });
  assert.equal(newValue.url, "signed-after-login");
  assert.equal(cached.url, "signed-after-login");
});

test("uploads are conversation-bound and message wire payloads use attachment IDs", () => {
  const apiSource = readProjectFile("services/messagesApi.ts");
  const contextSource = readProjectFile("contexts/MessagesContext.tsx");

  assert.match(
    apiSource,
    /\/api\/messages\/conversations\/\$\{conversationId\}\/attachments/,
  );
  assert.match(apiSource, /\{ giphyId \}/);
  assert.match(contextSource, /\.\.\.\(attachmentId \? \{ attachmentId \} : \{\}\)/);
  assert.match(contextSource, /attachment,\s+timestamp:/);
  assert.doesNotMatch(contextSource, /requestPayload\s*=\s*\{[^}]*attachment,/s);
});

test("signed URLs stay out of persistent storage and failed images retry once", () => {
  const urlSource = readProjectFile("services/messageAttachmentUrls.ts");
  const imageSource = readProjectFile(
    "components/Messages/AuthorizedMessageImage.tsx",
  );

  assert.doesNotMatch(urlSource, /AsyncStorage|setItem|multiSet/);
  assert.match(urlSource, /subscribeAuthSession/);
  assert.match(urlSource, /!accessToken/);
  assert.match(imageSource, /didRetryExpiredUrlRef\.current/);
  assert.match(imageSource, /loadSignedUrl\(true\)/);
  assert.match(imageSource, /Image unavailable/);
});

test("text-only message requests remain valid without an attachment ID", () => {
  const contextSource = readProjectFile("contexts/MessagesContext.tsx");

  assert.match(contextSource, /const text = payload\.text\?\.trim\(\) \?\? ""/);
  assert.match(contextSource, /if \(!normalizedConversationId \|\| \(!text && !attachment\)\)/);
  assert.match(contextSource, /conversationId: normalizedConversationId,\s+text,/);
});
