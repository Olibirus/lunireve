"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  readNotifications,
  markAllRead,
  onNotificationsChange,
  type AppNotification,
} from "@/lib/notifications";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Navbar notification bell (#10) — dot when unread, dropdown list. */
export function NotificationBell() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => setItems([...readNotifications()].reverse());
    refresh();
    return onNotificationsChange(refresh);
  }, []);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("label")}
        aria-expanded={open}
        onClick={toggleOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-ink-100)] bg-[var(--color-cream-50)]/80 text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)] hover:bg-[var(--color-cream-100)]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-fox-500)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="w-80 rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-2 shadow-[var(--shadow-float)]">
            <p className="px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--color-ink-400)]">
              {t("title")}
            </p>
            {items.length === 0 ? (
              <p className="px-3 py-5 text-sm text-[var(--color-ink-500)]">{t("empty")}</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        if (n.href) router.push(n.href as never);
                      }}
                      className={cn(
                        "block w-full rounded-xl px-3 py-2.5 text-left hover:bg-[var(--color-cream-100)]",
                        !n.read && "bg-[var(--color-mint-50)]"
                      )}
                    >
                      <span className="block text-sm font-medium text-[var(--color-ink-800)]">
                        {n.title}
                      </span>
                      {n.body && (
                        <span className="block text-xs text-[var(--color-ink-500)]">{n.body}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
