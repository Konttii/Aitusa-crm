import { prepareTelegram } from "./shared/telegram.js";

const tg = window.Telegram?.WebApp ?? null;

export function initTelegramApp() {
  prepareTelegram("#050814");
  try {
    if (tg?.isVersionAtLeast?.("7.7")) tg.disableVerticalSwipes?.();
  } catch {
    // Older clients keep vertical swipes.
  }
}

export function hapticFeedback(type = "light") {
  try {
    const hf = tg?.HapticFeedback;
    if (!hf) return;

    if (type === "success" || type === "warning" || type === "error") {
      hf.notificationOccurred?.(type);
    } else if (type === "selection") {
      hf.selectionChanged?.();
    } else {
      const validStyles = ["light", "medium", "heavy", "rigid", "soft"];
      const style = validStyles.includes(type) ? type : "light";
      hf.impactOccurred?.(style);
    }
  } catch {
    // Never let haptic feedback interrupt application flow
  }
}
