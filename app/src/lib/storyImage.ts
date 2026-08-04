import manifest from "@/data/generated-images.json";

/**
 * Resolves generated cover images. The manifest (written by
 * `pnpm img:generate`) lists which slugs actually have a file on disk, so the
 * UI only swaps in a real <img> when one exists, otherwise it keeps the
 * gradient placeholder. No manifest entry = no broken image.
 *
 * Two WebP variants exist per slug (see `pnpm img:optimize`):
 *   <slug>.webp       1200w — hero / article header
 *   <slug>-card.webp   640w — grid cards, search results, carousels
 * Always use the card variant in lists: a story grid renders ~20 covers, and
 * serving hero-sized art there is what blew up the Vercel data-transfer bill.
 */
const storySet = new Set<string>(manifest.stories);
const blogSet = new Set<string>(manifest.blog);

/** Full-width cover (story hero, article header). */
export function storyImageSrc(slug: string): string | null {
  return storySet.has(slug) ? `/img/stories/${slug}.webp` : null;
}

/** Small cover for grids, carousels and search results. */
export function storyCardImageSrc(slug: string): string | null {
  return storySet.has(slug) ? `/img/stories/${slug}-card.webp` : null;
}

export function blogImageSrc(slug: string): string | null {
  return blogSet.has(slug) ? `/img/blog/${slug}.webp` : null;
}

export function blogCardImageSrc(slug: string): string | null {
  return blogSet.has(slug) ? `/img/blog/${slug}-card.webp` : null;
}
