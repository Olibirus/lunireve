"use client";

import { jsPDF } from "jspdf";
import type { QuizQuestion, GlossaryEntry, InteractiveNode } from "@/data/mock-stories";

/**
 * Branded multi-page story PDF (#2): not a screenshot, a laid-out document.
 * Cover (title + meta + illustration), story text flowing across pages, quiz
 * and glossary. Interactive stories print every branch gamebook-style, one
 * section per page. Structural labels follow the site language. Pure
 * client-side via jsPDF (zero server cost).
 */

const INK = "#1f2d52";
const MINT = "#6db592";
const MUTED = "#7d87a5";
const CREAM = "#faf5eb";

const LABELS = {
  fr: {
    quiz: "Le petit quiz",
    solutions: "Solutions",
    glossary: "Glossaire",
    section: "Section",
    start: "Début",
    endPath: "Fin de cette histoire.",
    intro:
      "Histoire dont vous êtes le héros : à chaque choix, rendez-vous à la page indiquée pour continuer.",
    gotoPage: "rendez-vous page",
    footer: "Usage personnel uniquement, pas d'usage commercial",
  },
  en: {
    quiz: "The little quiz",
    solutions: "Answers",
    glossary: "Glossary",
    section: "Section",
    start: "Start",
    endPath: "End of this path.",
    intro:
      "Choose your own adventure: at each choice, go to the page shown to continue.",
    gotoPage: "go to page",
    footer: "Personal use only, no commercial use",
  },
} as const;

export type StoryPdfInput = {
  title: string;
  meta: string; // "Conte · 5–6 ans · 6 min"
  paragraphs: string[];
  quiz?: QuizQuestion[];
  glossary?: GlossaryEntry[];
  /** When set, the PDF lays out the FULL branching story (every section), one
      section per page, with page references at each choice. */
  interactive?: InteractiveNode;
  /** Cover illustration URL (drawn on the cover page). */
  coverImage?: string;
  /** Site language: drives the structural labels. */
  locale?: "fr" | "en";
};

async function fetchDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(typeof r.result === "string" ? r.result : null);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadStoryPdf(data: StoryPdfInput) {
  const L = LABELS[data.locale === "en" ? "en" : "fr"];
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56; // margin
  const contentW = W - M * 2;

  const coverData = data.coverImage ? await fetchDataUrl(data.coverImage) : null;
  const logoData = await fetchDataUrl("/logo-s.png");

  function brandFooter() {
    doc.setDrawColor(220, 220, 210);
    doc.line(M, H - 46, W - M, H - 46);
    // Logo bottom-left on every page; licence note bottom-right.
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", M, H - 38, 52, 15);
      } catch {
        /* ignore */
      }
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(INK);
      doc.text("LUNIREVE", M, H - 28);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(L.footer, W - M, H - 28, { align: "right" });
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
  if (coverData) {
    // Square illustration, fit to content width, centered below the band.
    const size = Math.min(contentW, H - 300);
    const imgX = (W - size) / 2;
    const imgY = 250;
    try {
      doc.addImage(coverData, "PNG", imgX, imgY, size, size);
      // Logo in the bottom-right corner of the illustration, on a soft pill
      // so it stays legible over any artwork.
      if (logoData) {
        const lw = 58;
        const lh = 17;
        const pad = 8;
        const lx = imgX + size - lw - pad;
        const ly = imgY + size - lh - pad;
        doc.setFillColor("#faf5eb");
        doc.roundedRect(lx - 5, ly - 4, lw + 10, lh + 8, 6, 6, "F");
        doc.addImage(logoData, "PNG", lx, ly, lw, lh);
      }
    } catch {
      /* ignore bad image data */
    }
  }
  brandFooter();

  let y = 76;

  // ---------- Story ----------
  if (data.interactive) {
    renderInteractive(data.interactive);
  } else {
    y = newPage();
    for (const p of data.paragraphs) {
      // Set the font BEFORE measuring so wrapping matches the drawn size and
      // text never overflows the margin (works for every story).
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      const lines = doc.splitTextToSize(p, contentW);
      for (const line of lines) {
        if (y > H - 78) y = newPage();
        doc.setFont("times", "normal");
        doc.setFontSize(13);
        doc.setTextColor(INK);
        doc.text(line, M, y);
        y += 20;
      }
      y += 10; // paragraph gap
    }
  }

  /**
   * Interactive story -> a gamebook: every unique segment is a numbered
   * section, ONE SECTION PER PAGE, with page references at each choice. Two
   * passes: measure to map section -> page (page refs sit on their own line so
   * pagination is number-independent), then draw with the resolved pages.
   */
  function renderInteractive(root: InteractiveNode) {
    const idOf = new Map<InteractiveNode, number>();
    const list: InteractiveNode[] = [];
    const getId = (n: InteractiveNode) => {
      if (!idOf.has(n)) {
        idOf.set(n, list.length + 1);
        list.push(n);
      }
      return idOf.get(n)!;
    };
    getId(root);
    for (let i = 0; i < list.length; i++) {
      (list[i].choices ?? []).forEach((c) => getId(c.next));
    }
    const sections = list.map((n, idx) => ({
      no: idx + 1,
      paragraphs: n.paragraphs,
      question: n.question,
      choices: (n.choices ?? []).map((c) => ({ label: c.label, target: idOf.get(c.next)! })),
    }));

    const letters = ["A", "B", "C", "D"];
    const pageOf = new Map<number, number>();

    for (const pass of ["measure", "draw"] as const) {
      const draw = pass === "draw";
      // Intro on its own page first.
      let page: number;
      let yy: number;
      if (draw) {
        yy = newPage();
        page = doc.getNumberOfPages();
      } else {
        page = 2;
        yy = 76;
      }
      const brk = () => {
        if (draw) {
          yy = newPage();
          page = doc.getNumberOfPages();
        } else {
          page += 1;
          yy = 76;
        }
      };

      doc.setFont("times", "italic");
      doc.setFontSize(11);
      const intro = doc.splitTextToSize(L.intro, contentW);
      for (const line of intro) {
        if (yy > H - 70) brk();
        if (draw) {
          doc.setFont("times", "italic");
          doc.setFontSize(11);
          doc.setTextColor(MUTED);
          doc.text(line, M, yy);
        }
        yy += 16;
      }

      sections.forEach((sec) => {
        // Each section starts on a fresh page (#: avoid confusion).
        brk();
        pageOf.set(sec.no, page);
        if (draw) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(INK);
          doc.text(sec.no === 1 ? L.start : `${L.section} ${sec.no}`, M, yy);
        }
        yy += 24;

        for (const p of sec.paragraphs) {
          doc.setFont("times", "normal");
          doc.setFontSize(12);
          const lines = doc.splitTextToSize(p, contentW);
          for (const line of lines) {
            if (yy > H - 70) brk();
            if (draw) {
              doc.setFont("times", "normal");
              doc.setFontSize(12);
              doc.setTextColor(INK);
              doc.text(line, M, yy);
            }
            yy += 17;
          }
          yy += 7;
        }

        if (sec.question && sec.choices.length) {
          if (yy > H - 90) brk();
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11.5);
          const qLines = doc.splitTextToSize(sec.question, contentW);
          for (const line of qLines) {
            if (yy > H - 70) brk();
            if (draw) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(11.5);
              doc.setTextColor(INK);
              doc.text(line, M, yy);
            }
            yy += 16;
          }
          yy += 4;
          sec.choices.forEach((c, ci) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const labelLines = doc.splitTextToSize(`${letters[ci]}.  ${c.label}`, contentW - 18);
            for (const line of labelLines) {
              if (yy > H - 70) brk();
              if (draw) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(INK);
                doc.text(line, M + 16, yy);
              }
              yy += 15;
            }
            if (yy > H - 70) brk();
            if (draw) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(10);
              doc.setTextColor(MINT);
              doc.text(`${L.gotoPage} ${pageOf.get(c.target) ?? "?"}`, M + 24, yy);
            }
            yy += 18;
          });
        } else {
          if (yy > H - 70) brk();
          if (draw) {
            doc.setFont("times", "italic");
            doc.setFontSize(11);
            doc.setTextColor(MUTED);
            doc.text(L.endPath, M, yy);
          }
          yy += 18;
        }
      });
    }
  }

  // ---------- Quiz ----------
  if (data.quiz && data.quiz.length) {
    const letters = ["A", "B", "C", "D"];
    y = newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(INK);
    doc.text(L.quiz, M, y);
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
        doc.setTextColor(MUTED);
        const cLines = doc.splitTextToSize(`${letters[ci]}.  ${c}`, contentW - 16);
        doc.text(cLines, M + 16, y);
        y += cLines.length * 16;
      });
      y += 14;
    });

    if (y > H - 140) y = newPage();
    else y += 10;
    doc.setDrawColor(220, 220, 210);
    doc.line(M, y, W - M, y);
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(INK);
    doc.text(L.solutions, M, y);
    y += 20;
    data.quiz.forEach((q, i) => {
      if (y > H - 70) y = newPage();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(MINT);
      const sol = `${i + 1}. ${letters[q.answer]} : ${q.choices[q.answer]}`;
      const sLines = doc.splitTextToSize(sol, contentW);
      doc.text(sLines, M, y);
      y += sLines.length * 14 + 4;
    });
  }

  // ---------- Glossary ----------
  if (data.glossary && data.glossary.length) {
    y = newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(INK);
    doc.text(L.glossary, M, y);
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

  const slug = data.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  doc.save(`lunireve-${slug || "histoire"}.pdf`);
}
