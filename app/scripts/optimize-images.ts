/**
 * Compress the generated cover art for the web.
 *
 *   pnpm img:optimize
 *
 * gpt-image-1 returns ~1.7 MB 1024px PNGs. Serving those raw (a story grid
 * renders ~20 cards) meant tens of MB per page view — the cause of the runaway
 * Vercel "Fast Data Transfer" bill. Each source PNG becomes two WebPs:
 *
 *   <slug>.webp        1200w  — hero / article header
 *   <slug>-card.webp    640w  — grid cards, search results, carousels
 *
 * Originals are moved to assets/img-originals/ (outside public/) so they stay
 * available for re-encoding but are never deployed or served. Re-runnable:
 * it picks up PNGs from either location.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd());
const PUBLIC_DIRS = [
  path.join(ROOT, "public/img/stories"),
  path.join(ROOT, "public/img/blog"),
];
const ORIGINALS_ROOT = path.join(ROOT, "assets/img-originals");

const HERO_WIDTH = 1200;
const CARD_WIDTH = 640;
const QUALITY = 74;

async function encode(src: string, out: string, width: number) {
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  return fs.statSync(out).size;
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const dir of PUBLIC_DIRS) {
    const kind = path.basename(dir); // stories | blog
    const originalsDir = path.join(ORIGINALS_ROOT, kind);
    fs.mkdirSync(originalsDir, { recursive: true });
    if (!fs.existsSync(dir)) continue;

    // Sources: PNGs still in public/, plus any already archived.
    const sources = new Map<string, string>();
    for (const f of fs.readdirSync(originalsDir).filter((f) => f.endsWith(".png"))) {
      sources.set(f, path.join(originalsDir, f));
    }
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".png"))) {
      sources.set(f, path.join(dir, f));
    }

    for (const [file, src] of sources) {
      const slug = file.replace(/\.png$/, "");
      const before = fs.statSync(src).size;
      totalBefore += before;

      const hero = await encode(src, path.join(dir, `${slug}.webp`), HERO_WIDTH);
      const card = await encode(src, path.join(dir, `${slug}-card.webp`), CARD_WIDTH);
      totalAfter += hero + card;

      // Archive the PNG out of public/ so it is never deployed or served.
      const archived = path.join(originalsDir, file);
      if (src !== archived) fs.renameSync(src, archived);

      console.log(
        `${kind}/${slug}: ${(before / 1024).toFixed(0)}KB -> hero ${(hero / 1024).toFixed(0)}KB + card ${(card / 1024).toFixed(0)}KB`
      );
    }
  }

  console.log(
    `\nTOTAL: ${(totalBefore / 1024 / 1024).toFixed(1)} MB -> ${(totalAfter / 1024 / 1024).toFixed(1)} MB` +
      (totalBefore ? ` (${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% smaller)` : "")
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
