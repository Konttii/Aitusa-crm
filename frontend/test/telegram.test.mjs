import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/shared/telegram.js", import.meta.url), "utf8");
let instance = 0;
const raw = new URLSearchParams({
  auth_date: "1792570000",
  user: JSON.stringify({ id: 100001, first_name: "Әлия + Тест" }),
  hash: "fixture-signature",
}).toString();

async function page({ path = "/", sdk, storage = new Map(), blocked = false } = {}) {
  globalThis.window = { location: new URL(path, "https://fixture.example.test") };
  if (sdk !== undefined) window.Telegram = { WebApp: { initData: sdk } };
  Object.defineProperty(window, "sessionStorage", {
    get() {
      if (blocked) throw new Error("Storage is blocked in this WebView");
      return {
        getItem: (key) => storage.get(key),
        setItem: (key, value) => storage.set(key, value),
      };
    },
  });
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${++instance}`);
}

test("direct launch works when the Telegram SDK and storage are unavailable", async () => {
  const client = await page({ path: "/crm/#" + new URLSearchParams({ tgWebAppData: raw }), blocked: true });
  assert.equal(client.getInitData(), raw);
  window.location.hash = "";
  assert.equal(client.getInitData(), raw);
});

test("a new launch wins over stale SDK and stored sessions", async () => {
  const client = await page({ path: "/#" + new URLSearchParams({ tgWebAppData: raw }), sdk: "old" });
  assert.equal(client.getInitData(), raw);
});

test("demo initData can be set and read in local mode", async () => {
  const storage = new Map();
  const client = await page({ path: "/crm/", storage });
  assert.equal(client.setDemoInitData(100000002), "demo:100000002");
  assert.equal(client.getInitData(), "demo:100000002");
});

test("launch data is never appended to external links or API endpoints", async () => {
  const client = await page({ sdk: raw });
  for (const path of ["https://external.example/", "//external.example/crm/", "/api/v1/tasks"]) {
    assert.equal(client.appHref(path), path);
  }
});
