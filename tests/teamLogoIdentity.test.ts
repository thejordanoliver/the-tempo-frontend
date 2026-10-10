import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

function loadCatalog(file: string) {
 const source = readFileSync(new URL(`../constants/${file}.ts`, import.meta.url), 'utf8');
 const exports: any = {};
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
 runInNewContext(code, { exports, require: (path: string) => {
  assert.ok(path.endsWith('.png'), `Unexpected runtime import ${path}`);
  return path;
 }});
 return exports;
}

test('every NBA ID selects its own logo in both themes, even when a summer ID collides', () => {
 const { teams, getNBATeam, getNBATeamLogo } = loadCatalog('teams');
 for (const team of teams) {
  assert.equal(getNBATeam(String(team.id)), team);
  assert.equal(getNBATeamLogo(String(team.id), false), team.logo);
  assert.equal(getNBATeamLogo(team.id, true), team.logoLight ?? team.logo);
 }
 assert.match(getNBATeamLogo(5, false), /Cavaliers/);
 assert.match(getNBATeamLogo(17, false), /Nets/);
 assert.match(getNBATeamLogo(5, false, true), /Hornets/);
 assert.match(getNBATeamLogo(17, false, true), /Lakers/);
 for (const team of teams) assert.equal(getNBATeamLogo(team.summerLeagueId, false, true), team.logo);
});

test('NFL, MLB and NHL IDs select their own logos in both themes', () => {
 for (const [file,list,helper] of [['teamsNFL','nflTeams','getNFLTeamLogo'],['teamsMLB','mlbTeams','getMLBTeamLogo'],['teamsNHL','nhlTeams','getNHLTeamLogo']]) {
  const catalog = loadCatalog(file);
  for (const team of catalog[list]) {
   assert.equal(catalog[helper](String(team.id), false), team.logo);
   assert.equal(catalog[helper](team.id, true), team.logoLight ?? team.logo);
  }
 }
});
