"use client";

import { jsPDF } from "jspdf";
import type { QuizQuestion, GlossaryEntry } from "@/data/mock-stories";

/**
 * Branded multi-page story PDF (#2): not a screenshot — a laid-out document.
 * Page 1 cover (title + meta), story text flowing across pages, quiz on its
 * own page, glossary on its own page. Every page carries the Lunireve header
 * and footer watermark. Pure client-side via jsPDF (zero server cost).
 */

const INK = "#1f2d52";
const MINT = "#6db592";
const MUTED = "#7d87a5";
const CREAM = "#faf5eb";

export type StoryPdfInput = {
  title: string;
  meta: string; // "Conte · 5–6 ans · 6 min"
  paragraphs: string[];
  quiz?: QuizQuestion[];
  glossary?: GlossaryEntry[];
};

export function downloadStoryPdf(data: StoryPdfInput) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56; // margin
  const contentW = W - M * 2;

  let firstPage = true;

  function brandFooter() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text("Lunireve · lunireve.com", M, H - 28);
    // Free-tier licence: personal use only, no commercial use (#24)
    doc.text("Usage personnel uniquement, pas d'usage commercial", W - M, H - 28, {
      align: "right",
    });
    doc.setDrawColor(220, 220, 210);
    doc.line(M, H - 38, W - M, H - 38);
  }

  function brandHeader() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(INK);
    doc.text("LUNIREVE", M, 40);
    doc.setDrawColor(220, 220, 210);
    doc.line(M, 50, W - M, 50);
  }

  function newPage() {
    doc.addPage();
    brandHeader();
    brandFooter();
    return 76; // starting y below header
  }

  // ---------- Cover ----------
  doc.setFillColor(CREAM);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(INK);
  doc.rect(0, 0, W, 220, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor("#b7dfcc");
  doc.text("LUNIREVE", M, 70);
  doc.setFontSize(30);
  doc.setTextColor("#ffffff");
  const titleLines = doc.splitTextToSize(data.title, contentW);
  doc.text(titleLines, M, 130);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor("#aab1d4");
  doc.text(data.meta, M, 130 + titleLines.length * 30 + 8);
  brandFooter();

  // ---------- Story ----------
  let y = newPage();
  doc.setFont("times", "normal");
  doc.setFontSize(13);
  doc.setTextColor(INK);
  firstPage = false;
  for (const p of data.paragraphs) {
    const lines = doc.splitTextToSize(p, contentW);
    for (const line of lines) {
      if (y > H - 70) y = newPage();
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.setTextColor(INK);
      doc.text(line, M, y);
      y += 20;
    }
    y += 10; // paragraph gap
  }

  // ---------- Quiz ----------
  if (data.quiz && data.quiz.length) {
    y = newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(INK);
    doc.text("Le petit quiz", M, y);
    y += 30;
    data.quiz.forEach((q, i) => {
      if (y > H - 120) y = newPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(INK);
      const qLines = doc.splitTextToSize(`${i + 1}. ${q.question}`, contentW);
      doc.text(qLines, M, y);
      y += qLines.length * 18 + 4;
      q.choices.forEach((c, ci) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(ci === q.answer ? MINT : MUTED);
        const mark = ci === q.answer ? "* " : "  ";
        const cLines = doc.splitTextToSize(`${mark}${c}`, contentW - 16);
        doc.text(cLines, M + 16, y);
        y += cLines.length * 16;
      });
      y += 14;
    });
  }

  // ---------- Glossary ----------
  if (data.glossary && data.glossary.length) {
    y = newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(INK);
    doc.text("Glossaire", M, y);
    y += 30;
    for (const g of data.glossary) {
      if (y > H - 90) y = newPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(INK);
      doc.text(g.word, M, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(MUTED);
      const dLines = doc.splitTextToSize(g.definition, contentW);
      doc.text(dLines, M, y);
      y += dLines.length * 15 + 12;
    }
  }

  void firstPage;
  const slug = data.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`lunireve-${slug || "histoire"}.pdf`);
}
