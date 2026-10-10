import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { normalizeFavoriteTeamKeys } from '../types/favorites';
import { normalizeNHLTeamId } from '../utils/nhlTeamId';

test('NHL frontend IDs match the provider for every team', () => {
  const source = readFileSync(new URL('../constants/teamsNHL.ts', import.meta.url), 'utf8');
  const teams = [...source.matchAll(/\bid: (\d+),/g)];
  assert.equal(teams.length, 32);
  assert.equal(new Set(teams.map(team => team[1])).size, 32);
  assert.deepEqual(teams.map(team => Number(team[1])).sort((a,b) => a-b),
    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,25,26,27,28,29,30,37,124292,129764]);
});

test('persisted NHL favorites migrate without changing other leagues or canonical IDs', () => {
  assert.deepEqual(normalizeFavoriteTeamKeys(['nhl:684', 'nhl:26', 'nhl:1436', 'nhl:2483', 'nba:684', 'sb:670']),
    ['nhl:26', 'nhl:124292', 'nhl:129764', 'nba:684', 'sb:670']);
  assert.equal(normalizeNHLTeamId(27), 27);
});
