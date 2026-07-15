"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadStoryPdf, type StoryPdfInput } from "@/lib/pdf/storyPdf";
import { Download, Loader2 } from "lucide-react";

/**
 * Real PDF download (#2/#7): builds a branded multi-page document
 * (cover, story, quiz, glossary) via jsPDF — not a screenshot. The ePub
 * button is removed until real ePub generation exists (V2).
 */
export function DownloadButtons({
  pdf,
  stacked = false,
  locale,
}: {
  pdf: StoryPdfInput;
  stacked?: boolean;
  locale?: string;
}) {
  const t = useTranslations("story");
  const [busy, setBusy] = useState(false);

  async function onPdf() {
    setBusy(true);
    try {
      await downloadStoryPdf({ ...pdf, locale: locale === "en" ? "en" : "fr" });
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

  if (stacked) {
    return <div className="flex w-44 flex-col gap-2">{pdfBtn}</div>;
  }

  return pdfBtn;
}
