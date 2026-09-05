import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const LOGO_DIR = path.resolve(ROOT, "assets", "College_Logos");
const PLACEHOLDER_PATH = path.resolve(
  ROOT,
  "assets",
  "Placeholders",
  "teamPlaceholder.png",
);
const IMPORT_PATH = "assets/College_Logos";
const REGULAR_CDN = "https://a.espncdn.com/i/teamlogos/ncaa/500";
const LIGHT_CDN = "https://a.espncdn.com/i/teamlogos/ncaa/500-dark";
const CONCURRENCY = 12;
const TIMEOUT_MS = 15_000;
const RETRIES = 3;
const DRY_RUN = process.argv.includes("--dry-run");

type SourceSpec = {
  label: string;
  relativePath: string;
  arrayName: string;
  authoritative: boolean;
  placeholderTeamNames?: string[];
};

const SOURCE_SPECS: SourceSpec[] = [
  {
    label: "CFB",
    relativePath: "constants/teamsCFB.ts",
    arrayName: "cfbTeams",
    authoritative: true,
  },
  {
    label: "CBB",
    relativePath: "constants/teamsCBB.ts",
    arrayName: "cbbTeams",
    authoritative: true,
  },
  {
    label: "WCBB",
    relativePath: "constants/teamsWCBB.ts",
    arrayName: "wcbbTeams",
    authoritative: true,
  },
  {
    label: "College baseball",
    relativePath: "constants/teamsCB.ts",
    arrayName: "cbTeams",
    authoritative: false,
  },
  {
    label: "College softball",
    relativePath: "constants/teamsSB.ts",
    arrayName: "sbTeams",
    authoritative: false,
  },
  {
    label: "College soccer references",
    relativePath: "constants/teamsSOCC.ts",
    arrayName: "soccerTeams",
    authoritative: false,
    placeholderTeamNames: ["West Florida"],
  },
];

type TeamBlock = {
  block: string;
  start: number;
  end: number;
  elementIndex: number;
  id: string | null;
  espnId: string | null;
  name: string;
  fullName: string | null;
  code: string | null;
  logoExpression: string | null;
  logoLightExpression: string | null;
};

type SourceModel = {
  spec: SourceSpec;
  filePath: string;
  source: string;
  blocks: TeamBlock[];
  collegeImports: Map<string, string>;
};

type Asset = {
  espnId: string;
  name: string;
  assetName: string;
  regularVariable: string;
  lightVariable: string;
  regularFileName: string;
  lightFileName: string;
  occurrences: { source: SourceModel; team: TeamBlock }[];
};

type TeamMapping = {
  source: SourceModel;
  team: TeamBlock;
  asset: Asset | null;
  reason: string;
};

type PreparedSource = {
  model: SourceModel;
  mappings: TeamMapping[];
  content: string;
};

type DiscoveryResult = {
  urls: string[];
  teamNames: string[];
};

type DownloadSummary = {
  regularEspnCount: number;
  lightEspnCount: number;
  regularDiscoveryTeams: string[];
  lightDiscoveryTeams: string[];
  lightFallbackTeams: string[];
  placeholderTeams: string[];
};

type Transaction = {
  root: string;
  stageDir: string;
  preparedDir: string;
  sourceBackupDir: string;
  oldLogoDir: string;
};

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function normalizeKey(value: string | null): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function getAssetName(teamName: string): string {
  const value = teamName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, "And")
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_match, next: string | undefined) =>
      next ? next.toUpperCase() : "",
    )
    .replace(/^./, (character) => character.toUpperCase());

  if (!value) {
    throw new Error("Could not generate an asset name for " + teamName);
  }

  return /^[0-9]/.test(value) ? "Team" + value : value;
}

function isPng(buffer: Buffer): boolean {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

function propertyName(property: ts.ObjectLiteralElementLike): string | null {
  if (!("name" in property) || !property.name) {
    return null;
  }

  if (
    ts.isIdentifier(property.name) ||
    ts.isStringLiteral(property.name) ||
    ts.isNumericLiteral(property.name)
  ) {
    return property.name.text;
  }

  return null;
}

function propertyAssignment(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.PropertyAssignment | null {
  for (const property of object.properties) {
    if (
      ts.isPropertyAssignment(property) &&
      propertyName(property) === name
    ) {
      return property;
    }
  }

  return null;
}

function stringValue(
  object: ts.ObjectLiteralExpression,
  name: string,
): string | null {
  const property = propertyAssignment(object, name);

  if (
    property &&
    (ts.isStringLiteral(property.initializer) ||
      ts.isNoSubstitutionTemplateLiteral(property.initializer))
  ) {
    return property.initializer.text;
  }

  return null;
}

function numericValue(
  object: ts.ObjectLiteralExpression,
  name: string,
): string | null {
  const property = propertyAssignment(object, name);

  return property && ts.isNumericLiteral(property.initializer)
    ? property.initializer.text
    : null;
}

function expressionValue(
  object: ts.ObjectLiteralExpression,
  name: string,
  sourceFile: ts.SourceFile,
): string | null {
  const property = propertyAssignment(object, name);
  return property ? property.initializer.getText(sourceFile) : null;
}

function findArray(
  sourceFile: ts.SourceFile,
  arrayName: string,
): ts.ArrayLiteralExpression {
  let result: ts.ArrayLiteralExpression | null = null;

  function visit(node: ts.Node): void {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === arrayName &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      result = node.initializer;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (!result) {
    throw new Error("Could not find exported array " + arrayName);
  }

  return result;
}

function getCollegeImports(sourceFile: ts.SourceFile): Map<string, string> {
  const imports = new Map<string, string>();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !statement.importClause?.name ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }

    const modulePath = statement.moduleSpecifier.text;
    const match = modulePath.match(/College_Logos\/([^/]+\.png)$/i);

    if (match) {
      imports.set(statement.importClause.name.text, match[1]);
    }
  }

  return imports;
}

function readSource(spec: SourceSpec): SourceModel {
  const filePath = path.resolve(ROOT, spec.relativePath);
  const source = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const array = findArray(sourceFile, spec.arrayName);
  const blocks: TeamBlock[] = [];

  array.elements.forEach((element, elementIndex) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw new Error(
        spec.label +
          " contains a non-object entry at index " +
          String(elementIndex),
      );
    }

    const parsedName = stringValue(element, "name");
    const fallbackName =
      stringValue(element, "fullName") ||
      stringValue(element, "code") ||
      numericValue(element, "id") ||
      "team at index " + String(elementIndex);
    const name = parsedName || fallbackName;

    if (!parsedName && spec.authoritative) {
      throw new Error(
        spec.label + " team at index " + String(elementIndex) + " has no name",
      );
    }

    const start = element.getStart(sourceFile);
    const end = element.getEnd();

    blocks.push({
      block: source.slice(start, end),
      start,
      end,
      elementIndex,
      id: numericValue(element, "id"),
      espnId: numericValue(element, "espnId"),
      name,
      fullName: stringValue(element, "fullName"),
      code: stringValue(element, "code"),
      logoExpression: expressionValue(element, "logo", sourceFile),
      logoLightExpression: expressionValue(element, "logoLight", sourceFile),
    });
  });

  return {
    spec,
    filePath,
    source,
    blocks,
    collegeImports: getCollegeImports(sourceFile),
  };
}

function sameSchool(left: TeamBlock, right: TeamBlock): boolean {
  const leftName = normalizeKey(left.name);
  const rightName = normalizeKey(right.name);
  const leftFullName = normalizeKey(left.fullName);
  const rightFullName = normalizeKey(right.fullName);
  const leftCode = normalizeKey(left.code);
  const rightCode = normalizeKey(right.code);

  return (
    leftName === rightName ||
    (Boolean(leftFullName) && leftFullName === rightFullName) ||
    (Boolean(leftCode) && leftCode === rightCode)
  );
}

function buildAssets(models: SourceModel[]): {
  assets: Asset[];
  assetByOccurrence: Map<TeamBlock, Asset>;
  nameVariants: string[];
  invalidEspnIds: string[];
  assetNameDisambiguations: string[];
} {
  const byId = new Map<string, Asset>();
  const assetByOccurrence = new Map<TeamBlock, Asset>();
  const conflicts: string[] = [];
  const nameVariants: string[] = [];
  const invalidEspnIds: string[] = [];

  for (const model of models.filter((item) => item.spec.authoritative)) {
    for (const team of model.blocks) {
      if (!team.espnId || Number(team.espnId) <= 0) {
        invalidEspnIds.push(
          model.spec.label + ": " + team.name + " has no valid espnId",
        );
        continue;
      }

      const existing = byId.get(team.espnId);

      if (existing) {
        const first = existing.occurrences[0].team;

        if (!sameSchool(first, team)) {
          conflicts.push(
            "ESPN ID " +
              team.espnId +
              ": " +
              existing.occurrences[0].source.spec.label +
              " " +
              first.name +
              " vs " +
              model.spec.label +
              " " +
              team.name,
          );
          continue;
        }

        if (normalizeKey(first.name) !== normalizeKey(team.name)) {
          nameVariants.push(
            "ESPN ID " +
              team.espnId +
              ": " +
              first.name +
              " / " +
              team.name,
          );
        }

        existing.occurrences.push({ source: model, team });
        assetByOccurrence.set(team, existing);
        continue;
      }

      const assetName = getAssetName(team.name);
      const asset: Asset = {
        espnId: team.espnId,
        name: team.name,
        assetName,
        regularVariable: assetName + "Logo",
        lightVariable: assetName + "LogoLight",
        regularFileName: assetName + "Logo.png",
        lightFileName: assetName + "LogoLight.png",
        occurrences: [{ source: model, team }],
      };

      byId.set(team.espnId, asset);
      assetByOccurrence.set(team, asset);
    }
  }

  if (conflicts.length > 0) {
    throw new Error(
      "Conflicting schools share an ESPN ID:\n" +
        conflicts.map((item) => "- " + item).join("\n"),
    );
  }

  const byAssetName = new Map<string, Asset[]>();
  const assetNameDisambiguations: string[] = [];

  for (const asset of byId.values()) {
    const key = asset.assetName.toLowerCase();
    byAssetName.set(key, [...(byAssetName.get(key) ?? []), asset]);
  }

  for (const group of byAssetName.values()) {
    if (group.length < 2) {
      continue;
    }

    group.sort((left, right) => Number(left.espnId) - Number(right.espnId));
    const baseName = group[0].assetName;

    for (const asset of group.slice(1)) {
      const disambiguated = baseName + "Espn" + asset.espnId;
      assetNameDisambiguations.push(
        asset.name +
          " (ESPN " +
          asset.espnId +
          ") -> " +
          disambiguated,
      );
      asset.assetName = disambiguated;
      asset.regularVariable = disambiguated + "Logo";
      asset.lightVariable = disambiguated + "LogoLight";
      asset.regularFileName = disambiguated + "Logo.png";
      asset.lightFileName = disambiguated + "LogoLight.png";
    }
  }

  return {
    assets: [...byId.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    assetByOccurrence,
    nameVariants: [...new Set(nameVariants)].sort(),
    invalidEspnIds,
    assetNameDisambiguations,
  };
}

function addLookup(
  lookup: Map<string, Set<Asset>>,
  key: string,
  asset: Asset,
): void {
  if (!key) {
    return;
  }

  const values = lookup.get(key) ?? new Set<Asset>();
  values.add(asset);
  lookup.set(key, values);
}

function uniqueLookup(
  lookup: Map<string, Set<Asset>>,
  key: string,
): Asset | null {
  const values = lookup.get(key);
  return values?.size === 1 ? [...values][0] : null;
}

function buildMappings(
  models: SourceModel[],
  assetByOccurrence: Map<TeamBlock, Asset>,
): { mappings: TeamMapping[]; unresolved: string[] } {
  const nameLookup = new Map<string, Set<Asset>>();
  const fullNameLookup = new Map<string, Set<Asset>>();
  const codeLookup = new Map<string, Set<Asset>>();
  const legacyFileLookup = new Map<string, Set<Asset>>();

  for (const model of models.filter((item) => item.spec.authoritative)) {
    for (const team of model.blocks) {
      const asset = assetByOccurrence.get(team);

      if (!asset) {
        continue;
      }

      addLookup(nameLookup, normalizeKey(team.name), asset);
      addLookup(fullNameLookup, normalizeKey(team.fullName), asset);
      addLookup(codeLookup, normalizeKey(team.code), asset);

      for (const expression of [
        team.logoExpression,
        team.logoLightExpression,
      ]) {
        if (expression && /^[A-Za-z_$][\w$]*$/.test(expression)) {
          const fileName = model.collegeImports.get(expression);

          if (fileName) {
            addLookup(legacyFileLookup, fileName.toLowerCase(), asset);
          }
        }
      }
    }
  }

  const mappings: TeamMapping[] = [];
  const unresolved: string[] = [];

  for (const model of models) {
    for (const team of model.blocks) {
      const direct = assetByOccurrence.get(team);

      if (direct) {
        mappings.push({
          source: model,
          team,
          asset: direct,
          reason: "espnId " + direct.espnId,
        });
        continue;
      }

      const usesCollegeAsset = [
        team.logoExpression,
        team.logoLightExpression,
      ].some(
        (expression) =>
          Boolean(expression) &&
          /^[A-Za-z_$][\w$]*$/.test(expression as string) &&
          model.collegeImports.has(expression as string),
      );
      const isKnownCollegePlaceholder =
        model.spec.placeholderTeamNames?.includes(team.name) ?? false;

      if (
        !model.spec.authoritative &&
        !usesCollegeAsset &&
        !isKnownCollegePlaceholder
      ) {
        continue;
      }

      let asset: Asset | null = null;
      let reason = "";

      for (const expression of [
        team.logoExpression,
        team.logoLightExpression,
      ]) {
        if (!expression || !/^[A-Za-z_$][\w$]*$/.test(expression)) {
          continue;
        }

        const fileName = model.collegeImports.get(expression);

        if (fileName) {
          asset = uniqueLookup(legacyFileLookup, fileName.toLowerCase());

          if (asset) {
            reason = "shared legacy asset " + fileName;
            break;
          }
        }
      }

      if (!asset) {
        asset = uniqueLookup(nameLookup, normalizeKey(team.name));
        reason = asset ? "matching team name" : "";
      }

      if (!asset) {
        asset = uniqueLookup(fullNameLookup, normalizeKey(team.fullName));
        reason = asset ? "matching full name" : "";
      }

      if (!asset) {
        asset = uniqueLookup(codeLookup, normalizeKey(team.code));
        reason = asset ? "matching team code" : "";
      }

      if (!asset) {
        reason = "no valid ESPN ID or unambiguous shared-school match";
        unresolved.push(model.spec.label + ": " + team.name);
      }

      mappings.push({ source: model, team, asset, reason });
    }
  }

  return { mappings, unresolved: [...new Set(unresolved)].sort() };
}

function addMissingProperty(
  block: string,
  field: "logo" | "logoLight",
  expression: string,
): string {
  const closingBrace = block.lastIndexOf("}");

  if (closingBrace < 0) {
    throw new Error("Malformed team object while adding " + field);
  }

  const indent = block.match(/\n(\s+)[A-Za-z_$][\w$]*\s*:/)?.[1] ?? "  ";
  const beforeClose = block.slice(0, closingBrace).trimEnd();
  const comma =
    beforeClose.endsWith(",") || beforeClose.endsWith("{") ? "" : ",";

  return (
    beforeClose +
    comma +
    "\n" +
    indent +
    field +
    ": " +
    expression +
    ",\n" +
    block.slice(closingBrace)
  );
}

function replacePropertyExpression(
  block: string,
  field: "logo" | "logoLight",
  expression: string,
): string {
  const fieldMatch = new RegExp("\\b" + field + "\\s*:\\s*", "m").exec(block);

  if (!fieldMatch || fieldMatch.index == null) {
    return addMissingProperty(block, field, expression);
  }

  const start = fieldMatch.index + fieldMatch[0].length;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;
  let end = block.length;

  for (let index = start; index < block.length; index += 1) {
    const character = block[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        inString = false;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === String.fromCharCode(96)) {
      inString = true;
      quote = character;
    } else if (character === "{") {
      braceDepth += 1;
    } else if (character === "}") {
      if (braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
        end = index;
        break;
      }
      braceDepth -= 1;
    } else if (character === "[") {
      bracketDepth += 1;
    } else if (character === "]") {
      bracketDepth -= 1;
    } else if (character === "(") {
      parenDepth += 1;
    } else if (character === ")") {
      parenDepth -= 1;
    } else if (
      character === "," &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      parenDepth === 0
    ) {
      end = index;
      break;
    }
  }

  const original = block.slice(start, end);
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";

  return (
    block.slice(0, start) +
    leading +
    expression +
    trailing +
    block.slice(end)
  );
}

function isRootCollegeLogoImport(line: string): boolean {
  return /^\s*import\s+[A-Za-z_$][\w$]*\s+from\s+(?:"[^"]*College_Logos\/[^/"]+\.png"|'[^']*College_Logos\/[^/']+\.png');?\s*$/.test(
    line,
  );
}

function findLastImportEnd(lines: string[]): number {
  let inImport = false;
  let lastEnd = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trimStart();

    if (!inImport && trimmed.startsWith("import ")) {
      inImport = true;
    }

    if (inImport && lines[index].includes(";")) {
      lastEnd = index;
      inImport = false;
    }
  }

  return lastEnd;
}

function rewriteSource(
  model: SourceModel,
  mappings: TeamMapping[],
): PreparedSource {
  let content = model.source;
  const sorted = [...mappings].sort(
    (left, right) => right.team.start - left.team.start,
  );

  for (const mapping of sorted) {
    const regular = mapping.asset
      ? mapping.asset.regularVariable
      : "PlaceholderLogo";
    const light = mapping.asset
      ? mapping.asset.lightVariable
      : "PlaceholderLogo";
    let block = mapping.team.block;
    block = replacePropertyExpression(block, "logo", regular);
    block = replacePropertyExpression(block, "logoLight", light);
    content =
      content.slice(0, mapping.team.start) +
      block +
      content.slice(mapping.team.end);
  }

  content = content
    .split("\n")
    .filter((line) => !isRootCollegeLogoImport(line))
    .join("\n");

  const assets = [
    ...new Map(
      mappings
        .filter((mapping) => mapping.asset)
        .map((mapping) => [
          (mapping.asset as Asset).espnId,
          mapping.asset as Asset,
        ]),
    ).values(),
  ].sort((left, right) => left.assetName.localeCompare(right.assetName));
  const importLines = assets.flatMap((asset) => [
    "import " +
      asset.regularVariable +
      ' from "' +
      IMPORT_PATH +
      "/" +
      asset.regularFileName +
      '";',
    "import " +
      asset.lightVariable +
      ' from "' +
      IMPORT_PATH +
      "/" +
      asset.lightFileName +
      '";',
  ]);
  const lines = content.split("\n");
  lines.splice(findLastImportEnd(lines) + 1, 0, "", ...importLines);
  content = lines.join("\n").replace(/^\n+/, "");

  validatePreparedSource(model, mappings, content);
  return { model, mappings, content };
}

function validatePreparedSource(
  model: SourceModel,
  mappings: TeamMapping[],
  content: string,
): void {
  const sourceFile = ts.createSourceFile(
    model.filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const parseErrors = (
    sourceFile as unknown as { parseDiagnostics: readonly ts.Diagnostic[] }
  ).parseDiagnostics;

  if (parseErrors.length > 0) {
    throw new Error(
      model.spec.label +
        " rewrite has TypeScript parse errors: " +
        parseErrors.map((item) => item.messageText).join("; "),
    );
  }

  const reparsedArray = findArray(sourceFile, model.spec.arrayName);
  const imports = new Map<string, string>();
  const duplicateImports: string[] = [];

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause?.name &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const identifier = statement.importClause.name.text;

      if (imports.has(identifier)) {
        duplicateImports.push(identifier);
      }

      imports.set(identifier, statement.moduleSpecifier.text);
    }
  }

  if (duplicateImports.length > 0) {
    throw new Error(
      model.spec.label +
        " rewrite has duplicate imports: " +
        [...new Set(duplicateImports)].join(", "),
    );
  }

  for (const mapping of mappings) {
    const element = reparsedArray.elements[mapping.team.elementIndex];

    if (!element || !ts.isObjectLiteralExpression(element)) {
      throw new Error(
        model.spec.label +
          " lost team object at index " +
          String(mapping.team.elementIndex),
      );
    }

    const expectedRegular = mapping.asset
      ? mapping.asset.regularVariable
      : "PlaceholderLogo";
    const expectedLight = mapping.asset
      ? mapping.asset.lightVariable
      : "PlaceholderLogo";
    const regular = expressionValue(element, "logo", sourceFile);
    const light = expressionValue(element, "logoLight", sourceFile);

    if (regular !== expectedRegular || light !== expectedLight) {
      throw new Error(
        model.spec.label +
          " rewrite failed for " +
          mapping.team.name +
          ": expected " +
          expectedRegular +
          " / " +
          expectedLight +
          ", found " +
          String(regular) +
          " / " +
          String(light),
      );
    }
  }

  const remainingRootImports = content
    .split("\n")
    .filter(isRootCollegeLogoImport)
    .filter((line) => !/Logo(?:Light)?\.png["']/.test(line));

  if (remainingRootImports.length > 0) {
    throw new Error(
      model.spec.label + " still contains legacy college-logo imports",
    );
  }

  if (
    model.spec.authoritative &&
    /teamlogos\/ncaa\//i.test(content)
  ) {
    throw new Error(
      model.spec.label + " still contains a remote ESPN NCAA logo URL",
    );
  }
}

function shouldRetry(error: unknown): boolean {
  return (
    !(error instanceof HttpError) ||
    error.status === 408 ||
    error.status === 429 ||
    error.status >= 500
  );
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchPng(url: string): Promise<Buffer> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "image/png,image/*;q=0.9,*/*;q=0.1",
          "User-Agent": "TheTempo-College-Logo-Refresh/2.0",
        },
      });

      if (!response.ok) {
        throw new HttpError(
          "HTTP " + response.status + " for " + url,
          response.status,
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      if (!isPng(buffer)) {
        throw new Error("Response is not a valid PNG: " + url);
      }

      return buffer;
    } catch (error) {
      lastError = error;

      if (attempt === RETRIES || !shouldRetry(error)) {
        break;
      }

      await pause(400 * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to download " + url);
}

function collectLogoUrls(value: unknown, urls: Set<string>): void {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectLogoUrls(item, urls));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (
      (key === "href" || key === "url") &&
      typeof child === "string" &&
      /^https:\/\/[^ ]+\.png(?:\?|$)/i.test(child) &&
      /espncdn\.com/i.test(child)
    ) {
      urls.add(child);
    } else if (
      key === "logos" ||
      key === "logo" ||
      key === "images" ||
      key === "team"
    ) {
      collectLogoUrls(child, urls);
    }
  }
}

async function discoverEspnLogos(espnId: string): Promise<DiscoveryResult> {
  const endpoints = [
    "https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/" +
      espnId,
    "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/" +
      espnId,
    "https://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams/" +
      espnId,
  ];
  const urls = new Set<string>();
  const teamNames = new Set<string>();

  await Promise.all(
    endpoints.map(async (endpoint) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: { "User-Agent": "TheTempo-College-Logo-Refresh/2.0" },
        });

        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as {
          team?: { displayName?: string };
        };
        collectLogoUrls(body, urls);

        if (body.team?.displayName) {
          teamNames.add(body.team.displayName);
        }
      } catch {
        // Discovery is best-effort. The validated placeholder is the final fallback.
      } finally {
        clearTimeout(timeout);
      }
    }),
  );

  return { urls: [...urls], teamNames: [...teamNames] };
}

async function firstValidPng(
  urls: string[],
): Promise<{ buffer: Buffer; url: string } | null> {
  for (const url of [...new Set(urls)]) {
    try {
      return { buffer: await fetchPng(url), url };
    } catch {
      // Try the next ESPN-provided URL.
    }
  }

  return null;
}

async function downloadAsset(
  asset: Asset,
  stageDir: string,
  placeholder: Buffer,
  summary: DownloadSummary,
): Promise<void> {
  const regularUrl = REGULAR_CDN + "/" + asset.espnId + ".png";
  const lightUrl = LIGHT_CDN + "/" + asset.espnId + ".png";
  let discovery: DiscoveryResult | null = null;
  let regular: Buffer;
  let usedPlaceholder = false;

  try {
    regular = await fetchPng(regularUrl);
    summary.regularEspnCount += 1;
  } catch {
    discovery = await discoverEspnLogos(asset.espnId);
    const candidate = await firstValidPng(
      discovery.urls.filter(
        (url) => url !== regularUrl && !/500-dark/i.test(url),
      ),
    );

    if (candidate) {
      regular = candidate.buffer;
      summary.regularEspnCount += 1;
      summary.regularDiscoveryTeams.push(asset.name);
      console.log(
        "[ESPN DISCOVERY] " + asset.name + " -> " + candidate.url,
      );
    } else {
      regular = Buffer.from(placeholder);
      usedPlaceholder = true;
      summary.placeholderTeams.push(
        asset.name + " (ESPN " + asset.espnId + ")",
      );
      console.warn(
        "[PLACEHOLDER] " +
          asset.name +
          " -> ESPN exposes no valid PNG for ID " +
          asset.espnId,
      );
    }
  }

  let light: Buffer;

  if (usedPlaceholder) {
    light = Buffer.from(placeholder);
  } else {
    try {
      light = await fetchPng(lightUrl);
      summary.lightEspnCount += 1;
    } catch {
      discovery ??= await discoverEspnLogos(asset.espnId);
      const candidate = await firstValidPng(
        discovery.urls.filter(
          (url) => url !== regularUrl && url !== lightUrl && /dark/i.test(url),
        ),
      );

      if (candidate) {
        light = candidate.buffer;
        summary.lightEspnCount += 1;
        summary.lightDiscoveryTeams.push(asset.name);
        console.log(
          "[ESPN DISCOVERY] " +
            asset.name +
            " light -> " +
            candidate.url,
        );
      } else {
        light = Buffer.from(regular);
        summary.lightFallbackTeams.push(asset.name);
        console.warn(
          "[NO LIGHT LOGO] " + asset.name + " -> using regular logo",
        );
      }
    }
  }

  await Promise.all([
    fs.promises.writeFile(
      path.join(stageDir, asset.regularFileName),
      regular,
    ),
    fs.promises.writeFile(
      path.join(stageDir, asset.lightFileName),
      light,
    ),
  ]);
}

async function stageAssets(
  assets: Asset[],
  stageDir: string,
): Promise<DownloadSummary> {
  const placeholder = await fs.promises.readFile(PLACEHOLDER_PATH);

  if (!isPng(placeholder)) {
    throw new Error("Team placeholder is not a valid PNG: " + PLACEHOLDER_PATH);
  }

  const summary: DownloadSummary = {
    regularEspnCount: 0,
    lightEspnCount: 0,
    regularDiscoveryTeams: [],
    lightDiscoveryTeams: [],
    lightFallbackTeams: [],
    placeholderTeams: [],
  };
  const failures: string[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor;
      cursor += 1;

      if (index >= assets.length) {
        return;
      }

      const asset = assets[index];
      console.log(
        "[" + String(index + 1) + "/" + String(assets.length) + "] " + asset.name,
      );
      try {
        await downloadAsset(asset, stageDir, placeholder, summary);
      } catch (error) {
        failures.push(
          asset.name +
            " (" +
            asset.espnId +
            "): " +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(CONCURRENCY, assets.length) },
      () => worker(),
    ),
  );

  if (failures.length > 0) {
    throw new Error(
      "Failed to stage " +
        String(failures.length) +
        " team asset pair(s):\n" +
        failures.map((item) => "- " + item).join("\n"),
    );
  }

  for (const key of [
    "regularDiscoveryTeams",
    "lightDiscoveryTeams",
    "lightFallbackTeams",
    "placeholderTeams",
  ] as const) {
    summary[key].sort((left, right) => left.localeCompare(right));
  }

  return summary;
}

async function listRootPngs(directory = LOGO_DIR): Promise<string[]> {
  return (await fs.promises.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.png$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function validateStagedAssets(
  assets: Asset[],
  stageDir: string,
): Promise<void> {
  const expected = new Set(
    assets.flatMap((asset) => [
      asset.regularFileName,
      asset.lightFileName,
    ]),
  );
  const actual = await listRootPngs(stageDir);

  if (
    actual.length !== expected.size ||
    actual.some((fileName) => !expected.has(fileName))
  ) {
    throw new Error(
      "Staged asset set mismatch: expected " +
        String(expected.size) +
        ", found " +
        String(actual.length),
    );
  }

  for (const fileName of actual) {
    const buffer = await fs.promises.readFile(path.join(stageDir, fileName));

    if (!isPng(buffer)) {
      throw new Error("Invalid staged PNG: " + fileName);
    }
  }
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const temporary =
    filePath + "." + String(process.pid) + "." + String(Date.now()) + ".tmp";

  try {
    await fs.promises.writeFile(temporary, content, "utf8");
    await fs.promises.rename(temporary, filePath);
  } catch (error) {
    await fs.promises.rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}

async function directorySnapshot(directory: string): Promise<string> {
  const entries: string[] = [];

  async function visit(current: string): Promise<void> {
    for (const entry of (await fs.promises.readdir(current, {
      withFileTypes: true,
    })).sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(directory, absolute);

      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        const hash = crypto
          .createHash("sha256")
          .update(await fs.promises.readFile(absolute))
          .digest("hex");
        entries.push(relative + ":" + hash);
      }
    }
  }

  await visit(directory);
  return entries.join("\n");
}

async function createTransaction(): Promise<Transaction> {
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "tempo-college-logo-refresh-"),
  );
  const stageDir = path.join(root, "stage");
  const preparedDir = path.join(root, "prepared");
  const sourceBackupDir = path.join(root, "source-backups");
  const oldLogoDir = await fs.promises.mkdtemp(
    path.join(LOGO_DIR, ".college-logo-rollback-"),
  );

  await Promise.all([
    fs.promises.mkdir(stageDir),
    fs.promises.mkdir(preparedDir),
    fs.promises.mkdir(sourceBackupDir),
  ]);

  return { root, stageDir, preparedDir, sourceBackupDir, oldLogoDir };
}

async function backupAndPrepareSources(
  prepared: PreparedSource[],
  transaction: Transaction,
): Promise<void> {
  for (const item of prepared) {
    const fileName = path.basename(item.model.filePath);
    await Promise.all([
      fs.promises.copyFile(
        item.model.filePath,
        path.join(transaction.sourceBackupDir, fileName),
      ),
      fs.promises.writeFile(
        path.join(transaction.preparedDir, fileName),
        item.content,
        "utf8",
      ),
    ]);
  }
}

async function rollback(
  prepared: PreparedSource[],
  transaction: Transaction,
): Promise<void> {
  for (const fileName of await listRootPngs().catch(() => [])) {
    await fs.promises.rm(path.join(LOGO_DIR, fileName), { force: true });
  }

  for (const fileName of await listRootPngs(transaction.oldLogoDir).catch(
    () => [],
  )) {
    await fs.promises.rename(
      path.join(transaction.oldLogoDir, fileName),
      path.join(LOGO_DIR, fileName),
    );
  }

  for (const item of prepared) {
    const backup = path.join(
      transaction.sourceBackupDir,
      path.basename(item.model.filePath),
    );

    if (fs.existsSync(backup)) {
      await fs.promises.copyFile(backup, item.model.filePath);
    }
  }
}

async function installTransaction(
  assets: Asset[],
  prepared: PreparedSource[],
  transaction: Transaction,
): Promise<{ removed: number; installed: number }> {
  const oldFiles = await listRootPngs();

  try {
    for (const fileName of oldFiles) {
      await fs.promises.rename(
        path.join(LOGO_DIR, fileName),
        path.join(transaction.oldLogoDir, fileName),
      );
    }

    const stagedFiles = await listRootPngs(transaction.stageDir);

    for (const fileName of stagedFiles) {
      await fs.promises.copyFile(
        path.join(transaction.stageDir, fileName),
        path.join(LOGO_DIR, fileName),
      );
    }

    for (const item of prepared) {
      await atomicWrite(item.model.filePath, item.content);
    }

    await validateInstalledState(assets, prepared);
    return { removed: oldFiles.length, installed: stagedFiles.length };
  } catch (error) {
    await rollback(prepared, transaction);
    throw error;
  }
}

async function validateInstalledState(
  assets: Asset[],
  prepared: PreparedSource[],
): Promise<void> {
  const files = await listRootPngs();
  const expected = new Set(
    assets.flatMap((asset) => [
      asset.regularFileName,
      asset.lightFileName,
    ]),
  );

  if (
    files.length !== expected.size ||
    files.some((fileName) => !expected.has(fileName))
  ) {
    throw new Error(
      "Installed college-logo set does not exactly match the staged set",
    );
  }

  for (const fileName of files) {
    const buffer = await fs.promises.readFile(path.join(LOGO_DIR, fileName));

    if (!isPng(buffer)) {
      throw new Error("Installed file is not a valid PNG: " + fileName);
    }
  }

  for (const item of prepared) {
    const content = await fs.promises.readFile(item.model.filePath, "utf8");
    validatePreparedSource(item.model, item.mappings, content);
    const sourceFile = ts.createSourceFile(
      item.model.filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        continue;
      }

      const match = statement.moduleSpecifier.text.match(
        /College_Logos\/([^/]+\.png)$/i,
      );

      if (match && !fs.existsSync(path.join(LOGO_DIR, match[1]))) {
        throw new Error(
          path.basename(item.model.filePath) +
            " imports missing asset " +
            match[1],
        );
      }
    }
  }

  const texasTech = assets.find((asset) => asset.name === "Texas Tech");

  if (
    !texasTech ||
    !fs.existsSync(path.join(LOGO_DIR, texasTech.regularFileName))
  ) {
    throw new Error("Texas Tech fresh local logo validation failed");
  }
}

function printList(title: string, values: string[]): void {
  console.log("");
  console.log(title + " (" + String(values.length) + "):");

  if (values.length === 0) {
    console.log("- None");
    return;
  }

  values.forEach((value) => console.log("- " + value));
}

async function main(): Promise<void> {
  if (!fs.existsSync(LOGO_DIR)) {
    throw new Error("College logo directory not found: " + LOGO_DIR);
  }

  const conferenceDir = path.join(LOGO_DIR, "Conference_Logos");
  const conferenceBefore = await directorySnapshot(conferenceDir);
  const models = SOURCE_SPECS.map(readSource);
  const {
    assets,
    assetByOccurrence,
    nameVariants,
    invalidEspnIds,
    assetNameDisambiguations,
  } = buildAssets(models);
  const { mappings, unresolved } = buildMappings(
    models,
    assetByOccurrence,
  );
  const prepared = models.map((model) =>
    rewriteSource(
      model,
      mappings.filter((mapping) => mapping.source === model),
    ),
  );
  const oldFiles = await listRootPngs();
  const authoritativeOccurrences = models
    .filter((model) => model.spec.authoritative)
    .flatMap((model) => model.blocks)
    .filter((team) => team.espnId && Number(team.espnId) > 0).length;

  console.log("");
  console.log("College Logo Full Refresh");
  console.log("=========================");
  console.log("Unique college teams found: " + String(assets.length));

  for (const model of models.filter((item) => item.spec.authoritative)) {
    console.log(
      model.spec.label + " teams: " + String(model.blocks.length),
    );
  }

  for (const model of models.filter((item) => !item.spec.authoritative)) {
    const sharedReferences = mappings.filter(
      (mapping) => mapping.source === model,
    ).length;
    console.log(
      model.spec.label +
        " using shared college assets: " +
        String(sharedReferences),
    );
  }

  console.log(
    "Duplicate ESPN IDs deduplicated: " +
      String(authoritativeOccurrences - assets.length),
  );
  console.log("Existing team PNG files: " + String(oldFiles.length));
  console.log("Fresh regular logos expected: " + String(assets.length));
  console.log("Fresh light logos expected: " + String(assets.length));
  console.log("Files that will be deleted: " + String(oldFiles.length));
  console.log("Files that will be created: " + String(assets.length * 2));
  console.log("Source files that will be rewritten:");
  prepared.forEach((item) =>
    console.log("- " + path.relative(ROOT, item.model.filePath)),
  );

  if (nameVariants.length > 0) {
    printList("Same-school ESPN ID name variants", nameVariants);
  }

  if (assetNameDisambiguations.length > 0) {
    printList(
      "Deterministic ESPN-ID filename disambiguations",
      assetNameDisambiguations,
    );
  }

  if (invalidEspnIds.length > 0) {
    printList("Invalid or missing ESPN IDs", invalidEspnIds);
  }

  if (unresolved.length > 0) {
    printList("References that will use PlaceholderLogo", unresolved);
  }

  if (DRY_RUN) {
    console.log("");
    console.log("Dry run complete. No network requests or file changes were made.");
    return;
  }

  const transaction = await createTransaction();
  let installed: { removed: number; installed: number } | null = null;
  let committed = false;

  try {
    await backupAndPrepareSources(prepared, transaction);
    console.log("");
    console.log("Downloading every fresh ESPN logo into staging...");
    const summary = await stageAssets(assets, transaction.stageDir);
    await validateStagedAssets(assets, transaction.stageDir);
    installed = await installTransaction(assets, prepared, transaction);

    const conferenceAfter = await directorySnapshot(conferenceDir);

    if (conferenceAfter !== conferenceBefore) {
      throw new Error("Conference_Logos changed during the team-logo refresh");
    }

    await fs.promises.rm(transaction.oldLogoDir, {
      recursive: true,
      force: true,
    });
    committed = true;

    console.log("");
    console.log("College logo refresh complete");
    console.log("");
    console.log("Unique teams processed: " + String(assets.length));
    console.log(
      "Fresh ESPN regular logos: " + String(summary.regularEspnCount),
    );
    console.log("Fresh ESPN light logos: " + String(summary.lightEspnCount));
    console.log(
      "Regular logos discovered through ESPN fallback: " +
        String(summary.regularDiscoveryTeams.length),
    );
    console.log(
      "Light logos using regular fallback: " +
        String(summary.lightFallbackTeams.length),
    );
    console.log(
      "Placeholder teams: " + String(summary.placeholderTeams.length),
    );
    console.log("Old team files removed: " + String(installed.removed));
    console.log("New team files installed: " + String(installed.installed));
    console.log("Constants files updated: " + String(prepared.length));
    console.log(
      "Backup locations: " +
        transaction.sourceBackupDir +
        " and " +
        transaction.oldLogoDir +
        " (removed after successful commit)",
    );
    printList(
      "Regular ESPN URL discovery teams",
      summary.regularDiscoveryTeams,
    );
    printList("Light ESPN URL discovery teams", summary.lightDiscoveryTeams);
    printList(
      "Regular-as-light fallback teams",
      summary.lightFallbackTeams,
    );
    printList("ESPN placeholder teams", summary.placeholderTeams);
    printList("Source references using PlaceholderLogo", unresolved);
  } finally {
    if (!committed) {
      const rollbackFiles = await listRootPngs(transaction.oldLogoDir).catch(
        () => [],
      );

      if (rollbackFiles.length > 0) {
        await rollback(prepared, transaction).catch(() => undefined);
      }
    }

    await fs.promises.rm(transaction.oldLogoDir, {
      recursive: true,
      force: true,
    });
    await fs.promises.rm(transaction.root, {
      recursive: true,
      force: true,
    });
  }
}

main().catch((error) => {
  console.error("");
  console.error("College logo refresh failed:");
  console.error(error instanceof Error ? error.message : String(error));
  console.error("");
  process.exitCode = 1;
});
