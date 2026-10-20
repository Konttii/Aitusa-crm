import assert from "node:assert/strict";
import test from "node:test";
import { roleNames } from "../src/roles.js";

test("member roles are hidden behind a leadership role", () => {
  assert.equal(roleNames({ roles: ["head", "member"] }), "Глава комитета");
  assert.equal(roleNames({ roles: ["vice-president", "trainee"] }), "Вице-президент AITUSA");
});

test("plain members and empty profiles read as participants", () => {
  assert.equal(roleNames({ roles: ["trainee"] }), "Стажёр");
  assert.equal(roleNames({ roles: [] }), "Участник");
});
