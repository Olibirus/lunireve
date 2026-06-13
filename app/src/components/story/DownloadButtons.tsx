"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadStoryPdf, type StoryPdfInput } from "@/lib/pdf/storyPdf";
import { Download, FileText, Loader2 } from "lucide-react";

/**
 * Real PDF download (#2/#7): builds a branded multi-page document
 * (cover, story, quiz, glossary) via jsPDF — not a screenshot. ePub needs
 * real file generation (n8n batch) and stays "soon".
 */
export function DownloadButtons({ pdf }: { pdf: StoryPdfInput }) {
  const t = useTranslations("story");
  const [busy, setBusy] = useState(false);

  async function onPdf() {
    setBusy(true);
    try {
      downloadStoryPdf(pdf);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={onPdf} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t("downloadPdf")}
      </Button>
      <Button variant="secondary" size="sm" disabled title={t("soon")} className="relative">
        <FileText className="h-4 w-4" />
        {t("downloadEpub")}
        <span className="ml-1 rounded-full bg-[var(--color-cream-200)] px-1.5 text-[10px] uppercase tracking-wider text-[var(--color-ink-500)]">
          {t("soon")}
        </span>
      </Button>
    </>
  );
}
