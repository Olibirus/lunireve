import manifest from "@/data/generated-images.json";

/**
 * Resolves generated cover images. The manifest (written by
 * `pnpm img:generate`) lists which slugs actually have a file on disk, so the
 * UI only swaps in a real <img> when one exists, otherwise it keeps the
 * gradient placeholder. No manifest entry = no broken image.
 */
const storySet = new Set<string>(manifest.stories);
const blogSet = new Set<string>(manifest.blog);

export function storyImageSrc(slug: string): string | null {
  return storySet.has(slug) ? `/img/stories/${slug}.png` : null;
}

export function blogImageSrc(slug: string): string | null {
  return blogSet.has(slug) ? `/img/blog/${slug}.png` : null;
}
