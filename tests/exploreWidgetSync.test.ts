import assert from "node:assert/strict";
import test from "node:test";
import { ExploreWidgetSync, type WidgetSettings, type WidgetSettingsCache } from "../utils/exploreWidgetSync";
import type { ExploreWidgetConfig } from "../types/widgets";

const widget = (id = "local"): ExploreWidgetConfig => ({ id, type: "standings", title: "Standings", createdAt: 1, size: "medium", order: 0, standingsLeague: "nba" });
const remote = (widgets = [widget("remote")], revision = 1): WidgetSettings => ({ schemaVersion: 2, widgets, revision, updatedAt: "2026-10-02T00:00:00Z" });
function harness(cache: WidgetSettingsCache | null = null, account: WidgetSettings | null = null) {
  let stored = cache;
  let server = account;
  const puts: number[] = [];
  let offline = false;
  const sync = new ExploreWidgetSync({
    load: async () => stored,
    persist: async (next) => { stored = structuredClone(next); },
    get: async () => { if (offline) throw new Error("offline"); return server; },
    put: async (widgets, revision) => {
      if (offline) throw new Error("offline");
      puts.push(revision);
      if (revision !== (server?.revision ?? 0)) throw { response: { status: 409 } };
      server = remote(widgets, revision + 1);
      return server;
    },
    onChange: () => {},
  });
  return { sync, puts, stored: () => stored, server: () => server, offline: (value: boolean) => { offline = value; }, account: (value: WidgetSettings) => { server = value; } };
}

test("a second device loads account settings without saving defaults", async () => {
  const h = harness(null, remote());
  await h.sync.start();
  assert.equal(h.sync.state.widgets[0].id, "remote");
  assert.deepEqual(h.puts, []);
  h.sync.stop();
});
test("imports local settings only into an absent account configuration", async () => {
  const cache: WidgetSettingsCache = { version: 2, widgets: [widget()], revision: null, pending: false };
  const h = harness(cache);
  await h.sync.start();
  assert.deepEqual(h.puts, [0]);
  assert.equal(h.server()?.widgets[0].id, "local");
  const other = harness(cache, remote([], 2));
  await other.sync.start();
  assert.deepEqual(other.sync.state.widgets, []);
  assert.deepEqual(other.puts, []);
  h.sync.stop(); other.sync.stop();
});
test("an intentionally empty legacy dashboard creates an empty account configuration", async () => {
  const h = harness({ version: 2, widgets: [], revision: null, pending: false });
  await h.sync.start();
  assert.deepEqual(h.puts, [0]);
  assert.deepEqual(h.server()?.widgets, []);
  h.sync.stop();
});
test("failed server reads never import or erase cached settings", async () => {
  const h = harness({ version: 2, widgets: [widget()], revision: null, pending: false });
  h.offline(true);
  await h.sync.start();
  assert.equal(h.sync.state.widgets[0].id, "local");
  assert.ok(h.sync.state.error);
  assert.deepEqual(h.puts, []);
  h.sync.stop();
});
test("offline edits remain durable and retry with their original revision", async () => {
  const h = harness(null, remote());
  await h.sync.start();
  h.offline(true);
  h.sync.edit(() => [widget("edited")]);
  await h.sync.refresh();
  assert.equal(h.stored()?.pending, true);
  assert.equal(h.stored()?.widgets[0].id, "edited");
  h.offline(false);
  await h.sync.refresh();
  assert.equal(h.server()?.widgets[0].id, "edited");
  assert.equal(h.stored()?.pending, false);
  h.sync.stop();
});
test("stale offline edits cannot overwrite another device and explicit reload resolves conflict", async () => {
  const h = harness({ version: 2, widgets: [widget()], revision: 1, pending: true }, remote([widget("other")], 2));
  await h.sync.start();
  assert.equal(h.sync.state.conflict, true);
  assert.equal(h.stored()?.pending, true);
  assert.equal(h.server()?.widgets[0].id, "other");
  await h.sync.reloadAccountSettings();
  assert.equal(h.sync.state.widgets[0].id, "other");
  assert.equal(h.sync.state.conflict, false);
  h.sync.stop();
});
test("edits made during a save are sent sequentially using the acknowledged revision", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const revisions: number[] = [];
  const sync = new ExploreWidgetSync({ load: async () => null, persist: async () => {}, get: async () => remote(),
    put: async (widgets, revision) => { revisions.push(revision); if (revisions.length === 1) await gate; return remote(widgets, revision + 1); }, onChange: () => {} });
  await sync.start();
  sync.edit(() => [widget("first")]);
  const saving = sync.refresh();
  await new Promise((resolve) => setTimeout(resolve, 0));
  sync.edit(() => [widget("second")]);
  release();
  await saving;
  assert.deepEqual(revisions, [1, 2]);
  assert.equal(sync.state.widgets[0].id, "second");
  assert.equal(sync.state.pending, false);
  sync.stop();
});
test("a disposed account does not publish or upload a late read", async () => {
  let release!: (value: WidgetSettings) => void;
  const get = new Promise<WidgetSettings>((resolve) => { release = resolve; });
  let updates = 0;
  let puts = 0;
  const sync = new ExploreWidgetSync({ load: async () => null, persist: async () => {}, get: () => get,
    put: async () => { puts++; return remote(); }, onChange: () => { updates++; } });
  const started = sync.start();
  await new Promise((resolve) => setTimeout(resolve, 0));
  sync.stop();
  const before = updates;
  release(remote());
  await started;
  assert.equal(updates, before);
  assert.equal(puts, 0);
});


test("concurrent startup and focus share one local load and server request", async () => {
  let loads = 0;
  let reads = 0;
  const sync = new ExploreWidgetSync({ load: async () => { loads++; return null; }, persist: async () => {},
    get: async () => { reads++; return remote(); }, put: async () => remote(), onChange: () => {} });
  await Promise.all([sync.start(), sync.refresh()]);
  assert.equal(loads, 1);
  assert.equal(reads, 1);
  sync.stop();
});

test("local read failure never saves an empty replacement", async () => {
  let saves = 0;
  const sync = new ExploreWidgetSync({ load: async () => { throw new Error("bad JSON"); },
    persist: async () => { saves++; }, get: async () => remote(), put: async () => { saves++; return remote(); }, onChange: () => {} });
  await sync.start();
  assert.equal(sync.state.ready, false);
  assert.ok(sync.state.error);
  assert.equal(saves, 0);
  sync.stop();
});

test("failed explicit reload preserves pending edits", async () => {
  let stored: WidgetSettingsCache = { version: 2, widgets: [widget("local")], revision: 1, pending: true };
  let failPersistence = false;
  const sync = new ExploreWidgetSync({ load: async () => stored,
    persist: async (cache) => { if (failPersistence) throw new Error("disk full"); stored = cache; },
    get: async () => remote(), put: async () => { throw { response: { status: 409 } }; }, onChange: () => {} });
  await sync.start();
  failPersistence = true;
  await sync.reloadAccountSettings();
  assert.equal(sync.state.widgets[0].id, "local");
  assert.equal(sync.state.conflict, true);
  assert.equal(stored.pending, true);
  sync.stop();
});
