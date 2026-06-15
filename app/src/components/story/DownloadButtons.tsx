"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadStoryPdf, type StoryPdfInput } from "@/lib/pdf/storyPdf";
import { Download, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Real PDF download (#2/#7): builds a branded multi-page document
 * (cover, story, quiz, glossary) via jsPDF — not a screenshot. ePub needs
 * real file generation (n8n batch) and stays "soon".
 */
export function DownloadButtons({ pdf, stacked = false }: { pdf: StoryPdfInput; stacked?: boolean }) {
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

  const pdfBtn = (
    <Button
      variant="secondary"
      size="sm"
      onClick={onPdf}
      disabled={busy}
      className={stacked ? "w-full justify-start" : undefined}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {t("downloadPdf")}
    </Button>
  );

  const epubBtn = (
    <Button
      variant="secondary"
      size="sm"
      disabled
      title={t("soon")}
      className={cn("relative", stacked && "w-full justify-start")}
    >
      <FileText className="h-4 w-4" />
      {t("downloadEpub")}
      <span className="ml-1 rounded-full bg-[var(--color-cream-200)] px-1.5 text-[10px] uppercase tracking-wider text-[var(--color-ink-500)]">
        {t("soon")}
      </span>
    </Button>
  );

  if (stacked) {
    return (
      <div className="flex w-44 flex-col gap-2">
        {pdfBtn}
        {epubBtn}
      </div>
    );
  }

  return (
    <>
      {pdfBtn}
      {epubBtn}
    </>
  );
}
