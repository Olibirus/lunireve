"use client";

/**
 * In-app notifications (#10) — localStorage now, DB + realtime later.
 * V1 use: "your story is ready" while the user keeps browsing.
 * V2: promotional pushes (with their own opt-out).
 */

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  /** App-relative URL to open on click (e.g. /histoire-perso/<id>) */
  href?: string;
  read: boolean;
  createdAt: string;
};

const KEY = "lunireve:notifications";
const EVENT = "lunireve:notifications-changed";

export function readNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as AppNotification[];
  } catch {
    return [];
  }
}

function write(items: AppNotification[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(-20)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* non-fatal */
  }
}

export function pushNotification(n: Omit<AppNotification, "id" | "read" | "createdAt">) {
  write([
    ...readNotifications(),
    { ...n, id: crypto.randomUUID(), read: false, createdAt: new Date().toISOString() },
  ]);
}

export function markAllRead() {
  write(readNotifications().map((n) => ({ ...n, read: true })));
}

/** Subscribe to changes (same-tab event + cross-tab storage). */
export function onNotificationsChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
