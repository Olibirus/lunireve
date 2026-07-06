"use client";

import { AccountShell } from "@/components/account/AccountShell";

/** Parent area — chrome lives in AccountShell (shared with /creer). */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
