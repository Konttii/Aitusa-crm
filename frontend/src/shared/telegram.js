const KEY = "aitusa.telegram.initData";
let cachedInitData = "";
export const MISSING_SESSION_MESSAGE = "Telegram не передал данные входа. Откройте Mini App в Telegram или выберите демо-профиль.";

export function setDemoInitData(telegramId = 100000001) {
  const token = `demo:${telegramId}`;
  cachedInitData = token;
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(KEY, token);
    }
  } catch {
    // Ignore storage restrictions
  }
  return token;
}

export function getInitData() {
  // Telegram puts signed launch data in the fragment. Read it directly too:
  // the remote SDK or sessionStorage may be unavailable in a WebView.
  const launch = new URLSearchParams(window.location.hash.slice(1)).get("tgWebAppData");
  const current = launch || window.Telegram?.WebApp?.initData;
  if (current) cachedInitData = current;
  try {
    if (current) window.sessionStorage.setItem(KEY, current);
    cachedInitData ||= window.sessionStorage.getItem(KEY) || "";
  } catch {
    // The in-memory value still works when storage is blocked.
  }
  return cachedInitData;
}

export function appHref(path) {
  const url = new URL(path, window.location.href);
  if (
    url.origin !== window.location.origin ||
    !(url.pathname === "/" || url.pathname.startsWith("/committee/") || url.pathname.startsWith("/crm/") || url.pathname.startsWith("/Aitusa-crm/"))
  ) {
    return path;
  }
  const initData = getInitData();
  if (!initData) return path;
  const params = new URLSearchParams(url.hash.slice(1));
  for (const [key, value] of new URLSearchParams(window.location.hash.slice(1))) {
    if (key.startsWith("tgWebApp")) params.set(key, value);
  }
  params.set("tgWebAppData", initData);
  url.hash = params.toString();
  // Fragments never reach HTTP logs or the server. Only app routes on this
  // origin receive them; the backend still checks the signature and expiry.
  return url.pathname + url.search + url.hash;
}

export function prepareTelegram(color) {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  const paint = () => {
    try {
      if (tg.isVersionAtLeast?.("6.1")) tg.setBackgroundColor?.(color);
      if (tg.isVersionAtLeast?.("6.9")) tg.setHeaderColor?.(color);
      if (tg.isVersionAtLeast?.("7.10")) tg.setBottomBarColor?.(color);
    } catch {
      // Native chrome customization must not interrupt authentication or navigation.
    }
  };
  paint();
  for (const step of [() => tg.ready(), () => tg.expand(), () => tg.onEvent?.("themeChanged", paint)]) {
    try {
      step();
    } catch {
      // Older clients lack some methods; the app authenticates from signed launch data anyway.
    }
  }
}
