import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reconcileDirectMessages } from '../utils/reconcileDirectMessages';
import type { DirectMessageItem } from '../types/messages';
const message = (id: string, extra: Partial<DirectMessageItem> = {}): DirectMessageItem => ({
  id, conversationId: 'thread', text: id, timestamp: '', isCurrentUser: false, ...extra,
});

test('snapshot recovers missed messages and removes offline deletions', () => {
  const cached = [message('old'), message('deleted')];
  assert.deepEqual(reconcileDirectMessages(cached, cached, [message('old'), message('missed')]).map(m => m.id), ['old', 'missed']);
});

test('snapshot preserves failed and pending sends and reconciles a saved clientId', () => {
  const cached = [message('pending', { status: 'pending', clientId: 'c1' }), message('failed', { status: 'failed' })];
  const result = reconcileDirectMessages(cached, cached, [message('saved', { clientId: 'c1' })]);
  assert.deepEqual(result.map(m => m.id), ['saved', 'failed']);
  assert.equal(result[0].status, undefined);
});

test('realtime additions and acknowledgements during refresh survive stale history', () => {
  const pending = message('pending', { status: 'pending', clientId: 'c1' });
  const saved = message('saved', { clientId: 'c1', status: 'sent' });
  const live = message('live');
  assert.deepEqual(reconcileDirectMessages([pending], [saved, live], []).map(m => m.id), ['saved', 'live']);
});

test('a deletion during refresh is not resurrected by a stale response', () => {
  const cached = message('deleted');
  assert.deepEqual(reconcileDirectMessages([cached], [], [cached]), []);
  assert.deepEqual(reconcileDirectMessages([], [], [cached], new Set(['deleted'])), []);
});
