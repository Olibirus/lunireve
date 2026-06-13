"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

/**
 * Working PDF download (#7/#17): opens the browser print dialog with a
 * print stylesheet that keeps only the story (title + text) — "save as
 * PDF" produces a clean watermarked document with zero server cost.
 * ePub needs real file generation (n8n batch) and is marked "soon".
 */
export function DownloadButtons() {
  const t = useTranslations("story");

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        <Download className="h-4 w-4" />
        {t("downloadPdf")}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled
        title={t("soon")}
        className="relative"
      >
        <FileText className="h-4 w-4" />
        {t("downloadEpub")}
        <span className="ml-1 rounded-full bg-[var(--color-cream-200)] px-1.5 text-[10px] uppercase tracking-wider text-[var(--color-ink-500)]">
          {t("soon")}
        </span>
      </Button>
    </>
  );
}
