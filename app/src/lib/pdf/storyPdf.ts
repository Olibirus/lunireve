"use client";

import { jsPDF } from "jspdf";
import type { QuizQuestion, GlossaryEntry, InteractiveNode } from "@/data/mock-stories";

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
  /** When set, the PDF lays out the FULL branching story (every section) with
      page references at each choice, gamebook-style, instead of `paragraphs`. */
  interactive?: InteractiveNode;
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
  firstPage = false;
  let y = 76;
  if (data.interactive) {
    renderInteractive(data.interactive);
  } else {
    y = newPage();
    doc.setFont("times", "normal");
    doc.setFontSize(13);
    doc.setTextColor(INK);
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
  }

  /**
   * Interactive story → a gamebook: every unique segment becomes a numbered
   * section; each choice points to the page where its branch continues, so a
   * reader can follow any path on paper. Two passes: the first measures to map
   * section → page (page refs sit on their own single line, so pagination does
   * not depend on the numbers), the second draws with the resolved pages.
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
      let page: number;
      let y: number;
      if (draw) {
        y = newPage();
        page = doc.getNumberOfPages();
      } else {
        page = 2; // first interactive page (page 1 is the cover)
        y = 76;
      }
      const brk = () => {
        if (draw) {
          y = newPage();
          page = doc.getNumberOfPages();
        } else {
          page += 1;
          y = 76;
        }
      };

      // Intro instruction
      doc.setFont("times", "italic");
      doc.setFontSize(11);
      const intro = doc.splitTextToSize(
        "Histoire dont vous êtes le héros : à chaque choix, rendez-vous à la page indiquée pour continuer.",
        contentW
      );
      for (const line of intro) {
        if (y > H - 70) brk();
        if (draw) {
          doc.setFont("times", "italic");
          doc.setFontSize(11);
          doc.setTextColor(MUTED);
          doc.text(line, M, y);
        }
        y += 16;
      }
      y += 12;

      for (const sec of sections) {
        if (y > H - 110) brk();
        pageOf.set(sec.no, page);
        if (draw) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(INK);
          doc.text(sec.no === 1 ? "Début" : `Section ${sec.no}`, M, y);
        }
        y += 22;

        for (const p of sec.paragraphs) {
          doc.setFont("times", "normal");
          doc.setFontSize(12);
          const lines = doc.splitTextToSize(p, contentW);
          for (const line of lines) {
            if (y > H - 70) brk();
            if (draw) {
              doc.setFont("times", "normal");
              doc.setFontSize(12);
              doc.setTextColor(INK);
              doc.text(line, M, y);
            }
            y += 17;
          }
          y += 7;
        }

        if (sec.question && sec.choices.length) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11.5);
          const qLines = doc.splitTextToSize(sec.question, contentW);
          if (y > H - 90) brk();
          for (const line of qLines) {
            if (y > H - 70) brk();
            if (draw) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(11.5);
              doc.setTextColor(INK);
              doc.text(line, M, y);
            }
            y += 16;
          }
          y += 4;
          sec.choices.forEach((c, ci) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const labelLines = doc.splitTextToSize(`${letters[ci]}.  ${c.label}`, contentW - 18);
            for (const line of labelLines) {
              if (y > H - 70) brk();
              if (draw) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(INK);
                doc.text(line, M + 16, y);
              }
              y += 15;
            }
            if (y > H - 70) brk();
            if (draw) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(10);
              doc.setTextColor(MINT);
              doc.text(`rendez-vous page ${pageOf.get(c.target) ?? "?"}`, M + 24, y);
            }
            y += 18;
          });
        } else {
          if (y > H - 70) brk();
          if (draw) {
            doc.setFont("times", "italic");
            doc.setFontSize(11);
            doc.setTextColor(MUTED);
            doc.text("Fin de cette histoire.", M, y);
          }
          y += 18;
        }

        y += 14; // gap between sections
      }
    }
  }

  // ---------- Quiz (#23: questions + lettered choices, solutions at the end) ----------
  if (data.quiz && data.quiz.length) {
    const letters = ["A", "B", "C", "D"];
    y = newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(INK);
    doc.text("Le petit quiz", M, y);
    y += 30;
    // Questions with choices — NO answer marked
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

    // Solutions block at the bottom (new page if little room left)
    if (y > H - 140) y = newPage();
    else y += 10;
    doc.setDrawColor(220, 220, 210);
    doc.line(M, y, W - M, y);
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(INK);
    doc.text("Solutions", M, y);
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
