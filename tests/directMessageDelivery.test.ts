import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deliverDirectMessage } from '../services/directMessageDelivery';

test('successful socket acknowledgement avoids REST', async () => {
  const result = await deliverDirectMessage<string>({
    socketSend: ack => ack({ message: 'saved' }),
    restSend: async () => { throw new Error('Unexpected REST'); },
  });
  assert.equal(result, 'saved');
});

test('missing acknowledgement falls back once and ignores a late acknowledgement', async () => {
  let acknowledge: ((response: { message?: string }) => void) | undefined;
  let calls = 0;
  const result = await deliverDirectMessage<string>({
    timeoutMs: 5,
    socketSend: ack => { acknowledge = ack; },
    restSend: async () => { calls++; return 'REST saved'; },
  });
  acknowledge!({ message: 'late socket saved' });
  assert.equal(result, 'REST saved');
  assert.equal(calls, 1);
});

test('socket rejection is reconciled through REST and failure propagates', async () => {
  await assert.rejects(deliverDirectMessage<string>({
    socketSend: ack => ack({ error: 'socket failed' }),
    restSend: async () => { throw new Error('REST failed'); },
  }), /REST failed/);
});

test('disconnected delivery uses REST directly', async () => {
  assert.equal(await deliverDirectMessage<string>({ restSend: async () => 'saved' }), 'saved');
});
