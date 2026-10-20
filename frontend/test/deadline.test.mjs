import assert from "node:assert/strict";
import test from "node:test";

process.env.TZ = "Asia/Almaty";
const { toApiDeadline, toLocalInput } = await import("../src/deadline.js");

test("datetime-local value is sent as an absolute UTC instant", () => {
  assert.equal(toApiDeadline("2026-10-21T18:30"), "2026-10-21T13:30:00.000Z");
  assert.equal(toApiDeadline(""), null);
});

test("API deadline round-trips through the datetime-local input", () => {
  assert.equal(toLocalInput("2026-10-21T13:30:00Z"), "2026-10-21T18:30");
  assert.equal(toApiDeadline(toLocalInput("2026-10-21T13:30:00Z")), "2026-10-21T13:30:00.000Z");
  assert.equal(toLocalInput(null), "");
});
