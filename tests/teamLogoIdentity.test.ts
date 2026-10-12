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

test('missing and unbranded teams use the bundled placeholder image', () => {
 for (const [file, helper] of [['teams', 'getNBATeamLogo'], ['teamsNFL', 'getNFLTeamLogo'], ['teamsGLeague', 'getGLeagueTeamLogo']]) {
  const catalog = loadCatalog(file);
  for (const isDark of [false, true]) {
   assert.equal(catalog[helper](undefined, isDark), 'assets/Placeholders/teamPlaceholder.png');
   assert.equal(catalog[helper]('missing-team', isDark), 'assets/Placeholders/teamPlaceholder.png');
  }
 }
 const nba = loadCatalog('teams');
 assert.equal(nba.getNBATeamLogo(134478, false), 'assets/Placeholders/teamPlaceholder.png');
 assert.equal(nba.getNBATeamLogo(134478, true), 'assets/Placeholders/teamPlaceholder.png');
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

test('college catalogs use unique canonical IDs, string favorites, and rivalry lookups', () => {
 for (const [file,list,getTeam,getLogo,rivalries,count] of [
  ['teamsMCBB','mcbbTeams','getMCBBTeam','getMCBBTeamLogo','MCBB_RIVALRIES',463],
  ['teamsWCBB','wcbbTeams','getWCBBTeam','getWCBBTeamLogo','WCBB_RIVALRIES',460],
 ] as const) {
  const catalog = loadCatalog(file);
  assert.equal(catalog[list].length,count);
  assert.equal(new Set(catalog[list].map((t: any)=>t.id)).size,count);
  for(const team of catalog[list]) {
   if(team.espnId != null) assert.equal(team.id,team.espnId);
   assert.equal(catalog[getTeam](String(team.id)),team);
   assert.equal(catalog[getLogo](String(team.id),false),team.logo);
   assert.equal(catalog[getLogo](team.id,true),team.logoLight ?? team.logo);
  }
  for(const rivalry of catalog[rivalries])for(const id of rivalry.teamIds)assert.ok(catalog[getTeam](id));
  assert.match(catalog[getTeam](302).fullName,/UC Davis/);
  assert.match(catalog[getTeam](2569).fullName,/South Carolina State/);
  assert.equal(catalog[getTeam](153).code,'UNC');
 }
});

test('college football canonical IDs preserve logos, favorites and rivalries', () => {
 const { cfbTeams, getCFBTeam, getCFBTeamLogo, CFB_RIVALRIES, getCFBRivalry } = loadCatalog('teamsCFB');
 assert.equal(cfbTeams.length, 578);
 assert.equal(new Set(cfbTeams.map((team: any) => team.id)).size, cfbTeams.length);
 for (const team of cfbTeams) {
  if (team.espnId != null) assert.equal(team.id, team.espnId);
  assert.equal(getCFBTeam(String(team.id)), team);
  assert.equal(getCFBTeamLogo(String(team.id), false), team.logo);
  assert.equal(getCFBTeamLogo(team.id, true), team.logoLight ?? team.logo);
 }
 for (const rivalry of CFB_RIVALRIES) {
  for (const id of rivalry.teamIds) assert.ok(getCFBTeam(id));
  assert.equal(getCFBRivalry(String(rivalry.teamIds[1]), rivalry.teamIds[0]), rivalry);
 }
 assert.match(getCFBTeam(57).fullName, /Florida Gators/);
 assert.match(getCFBTeam(251).fullName, /Texas Longhorns/);
 assert.match(getCFBTeam(2390).fullName, /Miami/);
 assert.match(getCFBTeam(193).fullName, /Miami/);
 assert.notEqual(getCFBTeamLogo(2390, false), getCFBTeamLogo(193, false));
});

test('WNBA canonical IDs preserve logos, favorites and All-Star entries', () => {
 const { wnbaTeams, getWNBATeam, getWNBATeamLogo } = loadCatalog('teamsWNBA');
 assert.equal(wnbaTeams.length, 18);
 assert.equal(new Set(wnbaTeams.map((team: any) => team.id)).size, 18);
 for (const team of wnbaTeams) {
  if (team.espnId != null) assert.equal(team.id, team.espnId);
  assert.equal(getWNBATeam(String(team.id)), team);
  assert.equal(getWNBATeamLogo(String(team.id), false), team.logo);
  assert.equal(getWNBATeamLogo(team.id, true), team.logoLight ?? team.logo);
 }
 assert.match(getWNBATeam(20).fullName, /Atlanta Dream/);
 assert.match(getWNBATeam(19).fullName, /Chicago Sky/);
 assert.match(getWNBATeam(129689).fullName, /Golden State/);
 assert.match(getWNBATeam(132052).fullName, /Portland Fire/);
 assert.match(getWNBATeam(131935).fullName, /Toronto Tempo/);
 assert.equal(getWNBATeam(162), undefined);
 assert.equal(getWNBATeam(133384).isAllStar, true);
 assert.equal(getWNBATeam(133383).isAllStar, true);
});
