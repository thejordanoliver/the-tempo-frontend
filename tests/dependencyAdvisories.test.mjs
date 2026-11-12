import assert from "node:assert/strict";
import test from "node:test";
import {
  assessDependencyAudit,
  EXPECTED_ADVISORIES,
  EXPECTED_VERSIONS,
} from "../scripts/check-dependency-advisories.mjs";

function fixture() {
  const entries = Object.fromEntries(
    Object.entries(EXPECTED_VERSIONS).map(([name, version]) => [
      "node_modules/" + name,
      { version },
    ]),
  );
  const vulnerabilities = {
    "decode-uri-component": {
      severity: "high",
      nodes: ["node_modules/decode-uri-component"],
      via: EXPECTED_ADVISORIES.map((id) => ({
        url: "https://github.com/advisories/" + id,
        title: "Known DoS issue",
      })),
    },
    "query-string": {
      severity: "high",
      nodes: ["node_modules/query-string"],
      via: ["decode-uri-component"],
    },
    "expo-router": {
      severity: "high",
      nodes: ["node_modules/expo-router"],
      via: ["query-string"],
    },
  };
  return [
    { vulnerabilities, metadata: { vulnerabilities: { high: 3, total: 3 } } },
    { packages: entries },
  ];
}

const reviewDate = new Date("2026-11-12T00:00:00.000Z");

test("only the precisely documented chain is temporarily allowed", () => {
  const [audit, lock] = fixture();
  assert.deepEqual(
    assessDependencyAudit(audit, lock, reviewDate),
    { ok: true, issues: [] },
  );
});

test("new or changed advisories must fail the release", () => {
  const [audit, lock] = fixture();
  audit.vulnerabilities["decode-uri-component"].via.push({
    url: "https://github.com/advisories/GHSA-new-issue",
  });
  assert.equal(assessDependencyAudit(audit, lock, reviewDate).ok, false);
});

test("unknown vulnerable packages and changed totals must fail", () => {
  const [audit, lock] = fixture();
  audit.vulnerabilities["new-dependency"] = {
    severity: "high",
    via: [], nodes: ["node_modules/new-dependency"],
  };
  audit.metadata.vulnerabilities.high += 1;
  audit.metadata.vulnerabilities.total += 1;
  assert.equal(assessDependencyAudit(audit, lock, reviewDate).ok, false);
});

test("new installed versions and duplicate copies must fail review", () => {
  const [audit, lock] = fixture();
  lock.packages["node_modules/decode-uri-component"].version = "0.5.1";
  assert.equal(assessDependencyAudit(audit, lock, reviewDate).ok, false);
  const [audit2, lock2] = fixture();
  lock2.packages["node_modules/other/node_modules/decode-uri-component"] = { version: "0.2.2" };
  assert.equal(assessDependencyAudit(audit2, lock2, reviewDate).ok, false);
});

test("changed transitive dependency chains must fail review", () => {
  const [audit, lock] = fixture();
  audit.vulnerabilities["expo-router"].via = ["different-dependency"];
  assert.equal(assessDependencyAudit(audit, lock, reviewDate).ok, false);
});

test("expired exceptions cannot keep CI green", () => {
  const [audit, lock] = fixture();
  assert.equal(
    assessDependencyAudit(audit, lock, new Date("2026-12-12T00:00:00.000Z")).ok,
    false,
  );
});

test("invalid or unavailable audit data fails closed", () => {
  const [, lock] = fixture();
  assert.equal(assessDependencyAudit({ error: "registry unavailable" }, lock, reviewDate).ok, false);
  assert.equal(assessDependencyAudit({}, lock, reviewDate).ok, false);
});
