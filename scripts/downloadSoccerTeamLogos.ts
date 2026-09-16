// Run through: npx tsx scripts/downloadTeamLogos.ts --soccer [--dry-run]
// Asset maintenance only; no provider requests are added to the app runtime.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "constants/teamsSOCC.ts");
const LOGOS = "assets/Soccer/Logos";
const REPORT = path.join(ROOT, "scripts/soccer-logo-download-report.json");
const FIELDS = ["logo", "logoLight"] as const;
type Field = (typeof FIELDS)[number];
type LogoPair = Record<Field, string>;
type Team = {
  id: string;
  name: string;
  node: ts.ObjectLiteralExpression;
  properties: Record<Field, ts.PropertyAssignment>;
};
type MissingTeam = { id: string; name: string; urls: LogoPair };
type DownloadReport = {
  missing: MissingTeam[];
  sharedCollege: { id: string; name: string }[];
  singleVariant: { id: string; name: string }[];
};

function property(node: ts.ObjectLiteralExpression, key: string) {
  return node.properties.find(
    (item): item is ts.PropertyAssignment =>
      ts.isPropertyAssignment(item) &&
      (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name)) &&
      item.name.text === key,
  );
}

function literal(node: ts.ObjectLiteralExpression, key: string): string {
  const value = property(node, key)?.initializer;
  if (value && (ts.isStringLiteral(value) || ts.isNumericLiteral(value))) {
    return value.text;
  }
  throw new Error("Missing literal team " + key);
}

function parse(source: string) {
  const file = ts.createSourceFile(SOURCE, source, ts.ScriptTarget.Latest, true);
  let array: ts.ArrayLiteralExpression | undefined;
  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "soccerTeams" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      array = node.initializer;
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!array) throw new Error("soccerTeams array not found");
  const teams = array.elements.map((node): Team => {
    if (!ts.isObjectLiteralExpression(node)) throw new Error("Invalid team entry");
    const logo = property(node, "logo");
    const logoLight = property(node, "logoLight");
    if (!logo || !logoLight) throw new Error("Missing logo fields");
    return {
      id: literal(node, "id"),
      name: literal(node, "name"),
      node,
      properties: { logo, logoLight },
    };
  });
  const imports = new Map<string, string>();
  let importEnd = 0;
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    importEnd = statement.getEnd();
    if (statement.importClause?.name && ts.isStringLiteral(statement.moduleSpecifier)) {
      imports.set(statement.importClause.name.text, statement.moduleSpecifier.text);
    }
  }
  return { file, teams, imports, importEnd };
}

function isPng(buffer: Buffer): boolean {
  return (
    buffer.length >= 33 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    buffer.toString("ascii", 12, 16) === "IHDR" &&
    buffer.readUInt32BE(16) > 0 &&
    buffer.readUInt32BE(20) > 0
  );
}

function resolveAsset(modulePath: string): string {
  return path.resolve(modulePath.startsWith(".") ? path.dirname(SOURCE) : ROOT, modulePath);
}

function normalizedName(name: string): string {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function assetName(team: Team): string {
  const name = team.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "").replace(/&/g, "And")
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_match, next: string | undefined) => next?.toUpperCase() ?? "");
  return "Soccer" + name + team.id;
}

async function atomicWrite(destination: string, content: string | Buffer) {
  const temporary = destination + "." + process.pid + ".tmp";
  try {
    await fs.promises.writeFile(temporary, content);
    await fs.promises.rename(temporary, destination);
  } finally {
    await fs.promises.rm(temporary, { force: true });
  }
}

export async function downloadSoccerTeamLogos(): Promise<void> {
  const source = await fs.promises.readFile(SOURCE, "utf8");
  const model = parse(source);
  const previous: DownloadReport = fs.existsSync(REPORT)
    ? JSON.parse(await fs.promises.readFile(REPORT, "utf8"))
    : { missing: [], sharedCollege: [], singleVariant: [] };
  const previousMissing = new Map(previous.missing.map((team) => [team.id, team.urls]));
  const report: DownloadReport = { missing: [], sharedCollege: previous.sharedCollege, singleVariant: previous.singleVariant };
  const placeholderPath = resolveAsset(model.imports.get("PlaceholderLogo") ?? "");
  const placeholder = await fs.promises.readFile(placeholderPath);
  if (!isPng(placeholder)) throw new Error("Invalid placeholder PNG");

  // Reuse only an unambiguous, exact school name already mapped to college art.
  // Soccer IDs and NCAA IDs belong to different namespaces.
  const colleges = new Map<string, Map<string, LogoPair>>();
  for (const team of model.teams) {
    const pair = Object.fromEntries(FIELDS.map((field) => [field, team.properties[field].initializer.getText(model.file)])) as LogoPair;
    const regularPath = model.imports.get(pair.logo);
    if (!regularPath?.includes("College_Logos/")) continue;
    const key = normalizedName(team.name);
    const choices = colleges.get(key) ?? new Map<string, LogoPair>();
    choices.set(regularPath, pair);
    colleges.set(key, choices);
  }

  const needsDownload = (team: Team) => FIELDS.some((field) => {
    const expression = team.properties[field].initializer;
    return ts.isStringLiteral(expression) || expression.getText(model.file) === "PlaceholderLogo";
  });
  const pending = model.teams.filter(needsDownload);
  console.log(`Soccer logos: ${model.teams.length} teams; ${pending.length} to resolve; ${model.teams.length - pending.length} already local.`);
  if (process.argv.includes("--dry-run")) {
    console.log("Dry run complete. No network requests or file changes were made.");
    return;
  }

  const cache = path.join(os.tmpdir(), "tempo-soccer-logo-downloads");
  await fs.promises.mkdir(cache, { recursive: true });
  const requests = new Map<string, Promise<Buffer | null>>();
  async function fetchPng(url: string): Promise<Buffer | null> {
    // Restrict this maintenance script to the existing public image CDN.
    if (!/^https:\/\/a\.espncdn\.com\/i\/teamlogos\/.+\.png$/.test(url)) {
      throw new Error("Unexpected logo URL: " + url);
    }
    const cachePath = path.join(cache, crypto.createHash("sha256").update(url).digest("hex") + ".png");
    if (fs.existsSync(cachePath)) {
      const buffer = await fs.promises.readFile(cachePath);
      if (isPng(buffer)) return buffer;
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
        if (response.status === 404 || response.status === 410) {
          await response.body?.cancel();
          return null;
        }
        if (!response.ok) {
          await response.body?.cancel();
          throw new Error(`HTTP ${response.status}: ${url}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        if (!isPng(buffer)) throw new Error("Invalid PNG: " + url);
        await atomicWrite(cachePath, buffer);
        return buffer;
      } catch (error) {
        if (attempt === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      }
    }
    throw new Error("Download failed: " + url);
  }
  function download(url: string) {
    let request = requests.get(url);
    if (!request) {
      request = fetchPng(url);
      requests.set(url, request);
    }
    return request;
  }

  const newImports = new Map<string, string>();
  const staged = new Map<string, Buffer>();
  const replacements = new Map<Team, LogoPair>();
  function stage(team: Team, field: Field, buffer: Buffer): string {
    const variable = assetName(team) + (field === "logo" ? "Logo" : "LogoLight");
    const modulePath = LOGOS + "/" + variable + ".png";
    if (model.imports.has(variable) && model.imports.get(variable) !== modulePath) {
      throw new Error("Conflicting logo import: " + variable);
    }
    const existing = staged.get(modulePath);
    if (existing && !existing.equals(buffer)) throw new Error("Conflicting logo file: " + modulePath);
    newImports.set(variable, modulePath);
    staged.set(modulePath, buffer);
    return variable;
  }

  async function resolveTeam(team: Team) {
    const urls = {} as LogoPair;
    const expressions = {} as LogoPair;
    const buffers: Record<Field, Buffer | null> = { logo: null, logoLight: null };
    for (const field of FIELDS) {
      const expression = team.properties[field].initializer;
      expressions[field] = expression.getText(model.file);
      urls[field] = ts.isStringLiteral(expression) ? expression.text
        : previousMissing.get(team.id)?.[field] ?? `https://a.espncdn.com/i/teamlogos/soccer/${field === "logo" ? "500" : "500-dark"}/${team.id}.png`;
      const localPath = model.imports.get(expressions[field]);
      if (localPath && expressions[field] !== "PlaceholderLogo") {
        buffers[field] = await fs.promises.readFile(resolveAsset(localPath));
        if (!isPng(buffers[field]!)) throw new Error("Invalid local logo: " + localPath);
      } else {
        buffers[field] = await download(urls[field]);
        // Some older teams have only the smaller CDN asset.
        if (!buffers[field]) buffers[field] = await download(urls[field].replace(/\/500(-dark)?\//, "/150$1/"));
        if (buffers[field]) expressions[field] = stage(team, field, buffers[field]!);
      }
    }
    if (!buffers.logo && !buffers.logoLight) {
      const choices = colleges.get(normalizedName(team.name));
      if (choices?.size === 1) {
        replacements.set(team, [...choices.values()][0]);
        report.sharedCollege.push({ id: team.id, name: team.name });
      } else {
        replacements.set(team, { logo: "PlaceholderLogo", logoLight: "PlaceholderLogo" });
        report.missing.push({ id: team.id, name: team.name, urls });
      }
      return;
    }
    if (!buffers.logo || !buffers.logoLight) {
      if (!buffers.logo) expressions.logo = expressions.logoLight;
      if (!buffers.logoLight) expressions.logoLight = expressions.logo;
      report.singleVariant.push({ id: team.id, name: team.name });
    }
    replacements.set(team, expressions);
  }

  let cursor = 0;
  let completed = 0;
  const failures: string[] = [];
  await Promise.all(Array.from({ length: Math.min(12, pending.length) }, async () => {
    while (cursor < pending.length) {
      const team = pending[cursor++];
      try {
        await resolveTeam(team);
      } catch (error) {
        failures.push(`${team.name} (${team.id}): ${String(error)}`);
      }
      completed++;
      if (completed % 100 === 0 || completed === pending.length) {
        console.log(`[${completed}/${pending.length}] ${staged.size} PNGs, ${report.missing.length} unavailable teams, ${failures.length} errors`);
      }
    }
  }));
  // Network/server errors must never silently turn working logos into placeholders.
  if (failures.length) throw new Error("No source changes made. Rerun to resume cached downloads.\n" + failures.join("\n"));

  const edits = [...replacements].flatMap(([team, pair]) => FIELDS.map((field) => ({
    start: team.properties[field].initializer.getStart(model.file),
    end: team.properties[field].initializer.getEnd(),
    text: pair[field],
  })));
  const imports = [...newImports].filter(([name]) => !model.imports.has(name))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, modulePath]) => `import ${name} from "${modulePath}";`);
  if (imports.length) edits.push({ start: model.importEnd, end: model.importEnd, text: "\n\n" + imports.join("\n") });
  let updated = source;
  for (const edit of edits.sort((left, right) => right.start - left.start)) {
    updated = updated.slice(0, edit.start) + edit.text + updated.slice(edit.end);
  }
  const prepared = parse(updated);
  if (prepared.teams.length !== model.teams.length) throw new Error("Team count changed");
  for (const team of prepared.teams) {
    for (const field of FIELDS) {
      const expression = team.properties[field].initializer;
      const modulePath = prepared.imports.get(expression.getText(prepared.file));
      if (!ts.isIdentifier(expression) || !modulePath) throw new Error("Unresolved logo for " + team.name);
      const buffer = staged.get(modulePath) ?? await fs.promises.readFile(resolveAsset(modulePath));
      if (!isPng(buffer)) throw new Error("Invalid asset for " + team.name);
    }
  }
  if (await fs.promises.readFile(SOURCE, "utf8") !== source) throw new Error("teamsSOCC.ts changed during downloads; rerun to preserve those edits");
  await fs.promises.mkdir(path.join(ROOT, LOGOS), { recursive: true });
  for (const [modulePath, buffer] of staged) {
    const destination = path.join(ROOT, modulePath);
    if (fs.existsSync(destination)) {
      if (!(await fs.promises.readFile(destination)).equals(buffer)) throw new Error("Refusing to overwrite existing asset: " + modulePath);
    } else {
      await atomicWrite(destination, buffer);
    }
  }
  for (const key of ["missing", "sharedCollege", "singleVariant"] as const) {
    report[key].sort((left, right) => Number(left.id) - Number(right.id));
  }
  await atomicWrite(REPORT, JSON.stringify(report, null, 2) + "\n");
  if (updated !== source) await atomicWrite(SOURCE, updated);
  console.log(`Soccer logos complete: ${staged.size} PNGs saved; all ${prepared.teams.length} teams use local imports.`);
  console.log(`${report.missing.length} teams have no CDN image and use PlaceholderLogo. Details: ${path.relative(ROOT, REPORT)}`);
}
