"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import {
  getArticle,
  saveArticle,
  slugify,
  parseSections,
  sectionsToRaw,
  COVER_OPTIONS,
  type AdminArticle,
} from "@/lib/adminBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Blog editor (#13) — full create/edit. "nouveau" slug = new article.
 * Body uses a markdown-lite format (## Heading then paragraphs); TLDR is
 * one bullet per line. Saving writes to the store and returns to the list.
 */
export default function BlogEditorPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const isNew = params.slug === "nouveau";

  const [originalSlug, setOriginalSlug] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tag, setTag] = useState("Rituel");
  const [cover, setCover] = useState<string>("cover-indigo");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [readingMinutes, setReadingMinutes] = useState(5);
  const [excerpt, setExcerpt] = useState("");
  const [tldr, setTldr] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (isNew) return;
    const a = getArticle(params.slug);
    if (!a) return;
    setOriginalSlug(a.slug);
    setTitle(a.title);
    setSlug(a.slug);
    setSlugTouched(true);
    setTag(a.tag);
    setCover(a.cover);
    setStatus(a.status);
    setReadingMinutes(a.readingMinutes);
    setExcerpt(a.excerpt);
    setTldr(a.tldr.join("\n"));
    setBody(sectionsToRaw(a.sections));
  }, [isNew, params.slug]);

  // Auto-slug from title until the slug is edited manually
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  function save(publish: boolean) {
    const article: AdminArticle = {
      slug: slug || slugify(title),
      title,
      tag,
      cover,
      readingMinutes,
      excerpt,
      tldr: tldr.split("\n").map((l) => l.trim()).filter(Boolean),
      sections: parseSections(body),
      publishedAt: publish ? new Date().toISOString().slice(0, 10) : null,
      status: publish ? "published" : "draft",
    };
    saveArticle(article, originalSlug);
    router.push("/admin/blog");
  }

  const canSave = title.trim().length >= 3 && body.trim().length >= 20;

  return (
    <>
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux articles
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl tracking-tight">
          {isNew ? "Nouvel article" : "Modifier l'article"}
        </h1>
        <div className="flex gap-2">
          {!isNew && (
            <Button asChild variant="ghost" size="sm">
              <Link href={{ pathname: "/blog/[slug]", params: { slug } }}>
                <Eye className="h-4 w-4" />
                Aperçu
              </Link>
            </Button>
          )}
          <Button variant="secondary" size="sm" disabled={!canSave} onClick={() => save(false)}>
            Brouillon
          </Button>
          <Button variant="primary" size="sm" disabled={!canSave} onClick={() => save(true)}>
            <Save className="h-4 w-4" />
            Publier
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="b-title">Titre</Label>
            <Input id="b-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="b-excerpt">Chapô / résumé</Label>
            <Textarea id="b-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="b-tldr">TLDR (une puce par ligne)</Label>
            <Textarea id="b-tldr" rows={4} value={tldr} onChange={(e) => setTldr(e.target.value)} className="mt-1.5 font-mono text-xs" />
          </div>
          <div>
            <Label htmlFor="b-body">Contenu</Label>
            <p className="text-xs text-[var(--color-ink-400)]">
              Utilisez <code>## Titre de section</code> pour un titre, et une ligne vide entre les paragraphes.
            </p>
            <Textarea id="b-body" rows={20} value={body} onChange={(e) => setBody(e.target.value)} className="mt-1.5 font-mono text-xs" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-4 space-y-4">
            <div>
              <Label htmlFor="b-slug">Slug (URL)</Label>
              <Input
                id="b-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="mt-1.5 font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="b-tag">Tag</Label>
              <Input id="b-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="b-mins">Temps de lecture (min)</Label>
              <Input
                id="b-mins"
                type="number"
                min={1}
                max={30}
                value={readingMinutes}
                onChange={(e) => setReadingMinutes(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Image de couverture</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {COVER_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCover(c)}
                    aria-label={c}
                    className={cn(
                      c,
                      "h-10 rounded-lg border-2",
                      cover === c ? "border-[var(--color-ink-800)]" : "border-transparent"
                    )}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Statut actuel</Label>
              <p className="mt-1.5 text-sm">
                {status === "published" ? "Publié" : "Brouillon"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
