"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { FoxMark } from "@/components/brand/FoxCloud";

/**
 * Single auth entry point (item #26): one button opens this modal with two
 * tabs, Connexion and Inscription. The tabs + forms live in AuthPanel,
 * shared with the standalone /connexion page.
 */
export function AuthModal({
  open,
  onOpenChange,
  onLoggedIn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoggedIn?: () => void;
}) {
  const t = useTranslations("auth");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FoxMark className="h-10 w-10" />
            <div>
              <DialogTitle>{t("modalTitle")}</DialogTitle>
              <DialogDescription>{t("modalSubtitle")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <AuthPanel
          onDone={() => {
            onOpenChange(false);
            onLoggedIn?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
