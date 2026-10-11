import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { normalizeFavoriteTeamKeys } from '../types/favorites';

test('all 30 MLB team IDs match ESPN IDs', () => {
 const source = readFileSync(new URL('../constants/teamsMLB.ts', import.meta.url), 'utf8');
 const teams = [...source.matchAll(/\bid: (\d+),/g)];
 assert.equal(teams.length, 30);
 assert.equal(new Set(teams.map(team => team[1])).size, 30);
 assert.deepEqual(teams.map(t=>Number(t[1])).sort((a,b)=>a-b),Array.from({length:30},(_,i)=>i+1));
});
test('canonical MLB favorites are never translated as legacy IDs', () => {
 assert.deepEqual(normalizeFavoriteTeamKeys(['mlb:2','mlb:29','mlb:11','nhl:26']),['mlb:2','mlb:29','mlb:11','nhl:26']);
});
test('old favorite and profile caches cannot be read as canonical MLB IDs', () => {
 const hook = readFileSync(new URL('../hooks/UserHooks/useFavoriteTeams.ts', import.meta.url),'utf8');
 const profile = readFileSync(new URL('../utils/userProfileCache.ts', import.meta.url),'utf8');
 assert.match(hook,/STORAGE_KEY_PREFIX = "favoriteTeams:v6"/);
 assert.match(profile,/USER_PROFILE_CACHE_VERSION = 8/);
});
