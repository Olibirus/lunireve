"use client";

import { jsPDF } from "jspdf";

/** CSV export — opens directly in Excel/Numbers/Sheets (#14). */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(";")).join("\r\n");
  // BOM so Excel reads UTF-8 accents correctly
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

/** Branded landscape PDF table export (#14). */
export function downloadTablePdf(
  title: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const colW = (W - M * 2) / headers.length;

  function header() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#1f2d52");
    doc.text(`Lunireve — ${title}`, M, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor("#7d87a5");
    doc.text(new Date().toLocaleString("fr-FR"), W - M, 40, { align: "right" });
    doc.setDrawColor(210, 210, 200);
    doc.line(M, 50, W - M, 50);
  }

  function colHeaders(y: number) {
    doc.setFillColor("#1f2d52");
    doc.rect(M, y - 12, W - M * 2, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor("#ffffff");
    headers.forEach((h, i) => doc.text(String(h), M + 4 + i * colW, y));
    return y + 16;
  }

  header();
  let y = colHeaders(70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#1f2d52");
  rows.forEach((row, ri) => {
    if (y > H - 40) {
      doc.addPage();
      header();
      y = colHeaders(70);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#1f2d52");
    }
    if (ri % 2 === 1) {
      doc.setFillColor("#faf5eb");
      doc.rect(M, y - 10, W - M * 2, 16, "F");
    }
    row.forEach((cell, i) => {
      const text = doc.splitTextToSize(String(cell), colW - 8)[0] ?? "";
      doc.text(text, M + 4 + i * colW, y);
    });
    y += 16;
  });

  doc.save(`lunireve-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
