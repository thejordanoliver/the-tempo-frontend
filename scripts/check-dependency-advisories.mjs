import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const EXCEPTION_EXPIRES_AT = "2026-12-12T00:00:00.000Z";
export const EXPECTED_VERSIONS = Object.freeze({
  "expo-router": "57.0.31",
  "query-string": "7.1.3",
  "decode-uri-component": "0.2.2",
});
export const EXPECTED_ADVISORIES = Object.freeze([
  "GHSA-qr28-fpjm-wq7f",
  "GHSA-vcc3-ghjq-m6fr",
]);

const EXPECTED_NODES = {
  "expo-router": "node_modules/expo-router",
  "query-string": "node_modules/query-string",
  "decode-uri-component": "node_modules/decode-uri-component",
};

const EXPECTED_VIA = {
  "expo-router": "query-string",
  "query-string": "decode-uri-component",
};

function sameMembers(a, b) {
  return (
    a.length === b.length &&
    a.every((item) => b.includes(item)) &&
    b.every((item) => a.includes(item))
  );
}

/**
 * Never blanket-ignore a nonzero npm audit. This is a narrowly scoped,
 * expiring exception for the Expo SDK 57 CommonJS query-string dependency.
 * Unknown advisory IDs, vulnerable packages, install locations or versions fail.
 */
export function assessDependencyAudit(audit, lock, now = new Date()) {
  const issues = [];
  if (!audit || typeof audit !== "object" || audit.error) {
    return { ok: false, issues: ["npm audit did not produce a valid report."] };
  }

  const vulnerabilities = audit.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== "object" || Array.isArray(vulnerabilities)) {
    return { ok: false, issues: ["Missing npm audit vulnerability details."] };
  }

  const actualNames = Object.keys(vulnerabilities).sort();
  const allowedNames = Object.keys(EXPECTED_VERSIONS).sort();
  if (!sameMembers(actualNames, allowedNames)) {
    issues.push(
      "Unexpected vulnerability set: " +
        JSON.stringify(actualNames) +
        " (expected only " +
        JSON.stringify(allowedNames) +
        ").",
    );
  }

  const installed = lock?.packages;
  if (!installed || typeof installed !== "object") {
    issues.push("Missing npm lockfile package information.");
  }

  for (const name of allowedNames) {
    const expectedNode = EXPECTED_NODES[name];
    const vulnerable = vulnerabilities[name];
    if (!vulnerable || typeof vulnerable !== "object") {
      issues.push("Missing expected audit entry: " + name);
      continue;
    }
    if (vulnerable.severity !== "high") {
      issues.push("Unexpected severity for " + name + ": " + vulnerable.severity);
    }
    if (!sameMembers(vulnerable.nodes ?? [], [expectedNode])) {
      issues.push("Unexpected vulnerable locations for " + name);
    }

    if (installed?.[expectedNode]?.version !== EXPECTED_VERSIONS[name]) {
      issues.push(
        "Installed " + name + " changed (expected " + EXPECTED_VERSIONS[name] + ").",
      );
    }

    // Audit reports transitive package entries via their vulnerable dependency;
    // the decoder leaf must contain the two exact GitHub-reviewed advisories.
    const via = vulnerable.via;
    if (!Array.isArray(via)) {
      issues.push("Missing advisory provenance for " + name);
      continue;
    }
    if (name === "decode-uri-component") {
      const urls = via.map((entry) => (
        entry && typeof entry === "object" ? entry.url : null
      ));
      const expectedUrls = EXPECTED_ADVISORIES.map((id) => (
        "https://github.com/advisories/" + id
      ));
      if (!sameMembers(urls, expectedUrls)) {
        issues.push("Unrecognized advisory for " + name + ".");
      }
    } else if (!sameMembers(via, [EXPECTED_VIA[name]])) {
      issues.push("Unrecognized advisory chain for " + name + ".");
    }
  }

  // Do not allow other installed copies to silently enter the lockfile.
  for (const name of allowedNames) {
    const paths = Object.keys(installed ?? {}).filter(
      (path) => path === "node_modules/" + name ||
        path.endsWith("/node_modules/" + name),
    );
    if (!sameMembers(paths, [EXPECTED_NODES[name]])) {
      issues.push("Unexpected installed copies of " + name + ".");
    }
  }

  const counts = audit.metadata?.vulnerabilities;
  if (!counts || counts.total !== 3 || counts.high !== 3) {
    issues.push("Audit totals changed; review every newly reported severity.");
  }

  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    issues.push("Invalid review date.");
  } else if (now >= new Date(EXCEPTION_EXPIRES_AT)) {
    issues.push("Temporary dependency exception expired on 2026-12-12 UTC.");
  }

  return { ok: issues.length === 0, issues };
}

function main() {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["audit", "--json"], {
    encoding: "utf8",
    maxBuffer: 12 * 1024 * 1024,
    timeout: 120_000,
  });
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    throw new Error("npm audit failed to complete: " + String(result.error ?? result.stderr));
  }

  let audit;
  try {
    audit = JSON.parse(result.stdout);
  } catch {
    throw new Error("npm audit returned invalid JSON.");
  }

  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const assessment = assessDependencyAudit(audit, lock);
  if (!assessment.ok) {
    for (const issue of assessment.issues) {
      console.error("::error::Dependency audit: " + issue);
    }
    process.exitCode = 1;
    return;
  }

  console.warn(
    "::warning::Temporary security exception: 3 HIGH package findings from " +
      "expo-router@57 -> query-string@7 -> decode-uri-component@0.2.2. " +
      "Two DoS advisories (" + EXPECTED_ADVISORIES.join(", ") +
      ") remain UNRESOLVED. Exception expires 2026-12-12 UTC. " +
      "Review docs/security/dependency-advisories.md. This is NOT a clean npm audit.",
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error("::error::" + (error?.message ?? String(error)));
    process.exitCode = 1;
  }
}
