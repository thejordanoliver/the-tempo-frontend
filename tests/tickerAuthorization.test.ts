import assert from "node:assert/strict";
import test from "node:test";
import { createProtectedGattAuthorizer } from "../services/ticker/authorization";
import type { TickerTransport } from "../services/ticker/transport";
const device = { id: "peripheral", name: "Tempo-Ticker-4580" };
const status = Uint8Array.from([
  1, 3, 0, 0, 0, 0, 15, 50, 1, 1, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0,
]);
function transport(readAuthorization?: TickerTransport["readAuthorization"]) {
  return { readAuthorization } as TickerTransport;
}
test("control authorization awaits the native protected read", async () => {
  let resolve: (frame: Uint8Array) => void = () => {};
  let requested: string | undefined;
  let completed = false;
  const auth = createProtectedGattAuthorizer(
    transport((id) => {
      requested = id;
      return new Promise((done) => {
        resolve = done;
      });
    }),
  );
  const operation = auth.verify(device).then((value) => {
    completed = true;
    return value;
  });
  assert.equal(requested, device.id);
  assert.equal(completed, false);
  resolve(status);
  assert.equal(await operation, true);
});
test("native pairing rejection or missing protected support cannot unlock", async () => {
  await assert.rejects(
    createProtectedGattAuthorizer(transport()).verify(device),
    /unavailable/,
  );
  await assert.rejects(
    createProtectedGattAuthorizer(
      transport(async () => {
        throw new Error("OS pairing cancelled");
      }),
    ).verify(device),
    /cancelled/,
  );
  const legacy = status.slice();
  legacy[6] = 0;
  assert.equal(
    await createProtectedGattAuthorizer(transport(async () => legacy)).verify(
      device,
    ),
    false,
  );
});
test("malformed protected payload cannot be treated as authorized", async () => {
  await assert.rejects(
    createProtectedGattAuthorizer(
      transport(async () => new Uint8Array(19)),
    ).verify(device),
    /Unsupported/,
  );
});
