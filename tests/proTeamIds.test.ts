import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { normalizeFavoriteTeamKeys } from '../types/favorites';

for (const [file,minimum] of [['teams',30],['teamsNFL',32]] as const) {
 test(`${file} IDs and rivalry pairs use canonical identities`, () => {
  const source=readFileSync(new URL(`../constants/${file}.ts`,import.meta.url),'utf8');
  const teams=[...source.matchAll(/\bid: (\d+),\s+espnId: (\d+),/g)];
  assert.ok(teams.length>=minimum);
  assert.equal(new Set(teams.map(t=>t[1])).size,teams.length);
  for (const team of teams) assert.equal(team[1],team[2]);
  const ids=new Set(teams.map(t=>Number(t[1])));
  for(const pair of source.matchAll(/teamIds: \[(\d+), (\d+)\]/g)) {
   assert.ok(ids.has(Number(pair[1])));assert.ok(ids.has(Number(pair[2])));
  }
  // Catch valid IDs pointing to the wrong team in the best-known rivalries.
  if (file==='teams') assert.match(source,/id: "celtics-lakers",[\s\S]*?teamIds: \[2, 13\]/);
  else assert.match(source,/id: "cowboys-49ers",[\s\S]*?teamIds: \[6, 25\]/);
 });
}
test('NFL/NBA API favorite keys cannot be mistaken for legacy cached values',()=>{
 assert.deepEqual(normalizeFavoriteTeamKeys(['nfl:13','nba:13','mlb:13']),['nfl:13','nba:13','mlb:13']);
 const hook=readFileSync(new URL('../hooks/UserHooks/useFavoriteTeams.ts',import.meta.url),'utf8');
 const profile=readFileSync(new URL('../utils/userProfileCache.ts',import.meta.url),'utf8');
 assert.match(hook,/favoriteTeams:v3/);assert.match(profile,/USER_PROFILE_CACHE_VERSION = 5/);
});
