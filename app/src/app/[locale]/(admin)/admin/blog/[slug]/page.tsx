"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import {
  getArticle,
  saveArticle,
  slugify,
  parseSections,
  sectionsToRaw,
  uploadBlogImage,
  COVER_OPTIONS,
  type AdminArticle,
} from "@/lib/adminBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Bold,
  Eye,
  Heading2,
  Image as ImageIcon,
  Italic,
  List,
  Loader2,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Blog editor (#13 + #7) — full create/edit with a formatting toolbar, live
 * preview and Supabase Storage image upload (cover + inline). "nouveau" slug =
 * new article. Body uses a markdown-lite format (## Heading, **bold**,
 * *italic*, - list, ![alt](url)); TLDR is one bullet per line. Saving writes to
 * the store and returns to the list.
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
  // Article language: drives which locale's blog lists it (FR default).
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [cover, setCover] = useState<string>("cover-indigo");
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [readingMinutes, setReadingMinutes] = useState(5);
  const [excerpt, setExcerpt] = useState("");
  const [tldr, setTldr] = useState("");
  const [body, setBody] = useState("");

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState<null | "cover" | "inline">(null);
  const [uploadNote, setUploadNote] = useState<string>("");

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    const a = getArticle(params.slug);
    if (!a) return;
    setOriginalSlug(a.slug);
    setTitle(a.title);
    setSlug(a.slug);
    setSlugTouched(true);
    setTag(a.tag);
    setLanguage(a.language ?? "fr");
    setCover(a.cover);
    setCoverImageUrl(a.coverImageUrl);
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

  /** Wrap the current selection (or insert a placeholder) with markdown marks. */
  function wrapSelection(before: string, after: string, placeholder: string) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = body.slice(start, end) || placeholder;
    const next = body.slice(0, start) + before + sel + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + sel.length;
    });
  }

  /** Insert text at the caret (or replace the selection). */
  function insertAtCaret(text: string) {
    const el = bodyRef.current;
    if (!el) {
      setBody((b) => b + text);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = body.slice(0, start) + text + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + text.length;
    });
  }

  async function onPickInlineImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("inline");
    setUploadNote("");
    const { url, fallback } = await uploadBlogImage(file);
    insertAtCaret(`\n\n![${file.name.replace(/\.[^.]+$/, "")}](${url})\n\n`);
    setUploading(null);
    if (fallback)
      setUploadNote("Supabase Storage non configuré : image intégrée localement (à reconfigurer avant publication).");
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("cover");
    setUploadNote("");
    const { url, fallback } = await uploadBlogImage(file);
    setCoverImageUrl(url);
    setUploading(null);
    if (fallback)
      setUploadNote("Supabase Storage non configuré : couverture intégrée localement (à reconfigurer avant publication).");
  }

  function save(publish: boolean) {
    const article: AdminArticle = {
      slug: slug || slugify(title),
      title,
      tag,
      language,
      cover,
      coverImageUrl,
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

          {/* Body editor with toolbar + live preview */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="b-body">Contenu</Label>
              <div className="flex rounded-lg border border-[var(--color-ink-100)] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
                    tab === "write" ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]" : "text-[var(--color-ink-500)]"
                  )}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rédaction
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
                    tab === "preview" ? "bg-[var(--color-ink-800)] text-[var(--color-cream-50)]" : "text-[var(--color-ink-500)]"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Aperçu
                </button>
              </div>
            </div>

            {tab === "write" ? (
              <>
                {/* Toolbar */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-[var(--color-ink-100)] bg-[var(--color-cream-100)] p-1.5">
                  <ToolbarButton label="Titre de section" onClick={() => insertAtCaret("\n\n## Titre de section\n\n")}>
                    <Heading2 className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton label="Gras" onClick={() => wrapSelection("**", "**", "texte en gras")}>
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton label="Italique" onClick={() => wrapSelection("*", "*", "texte en italique")}>
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>
                  <ToolbarButton label="Liste à puces" onClick={() => insertAtCaret("\n- ")}>
                    <List className="h-4 w-4" />
                  </ToolbarButton>
                  <span className="mx-1 h-5 w-px bg-[var(--color-ink-100)]" />
                  <ToolbarButton
                    label="Insérer une image"
                    onClick={() => inlineInputRef.current?.click()}
                    busy={uploading === "inline"}
                  >
                    {uploading === "inline" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  </ToolbarButton>
                  <input ref={inlineInputRef} type="file" accept="image/*" hidden onChange={onPickInlineImage} />
                </div>
                <Textarea
                  id="b-body"
                  ref={bodyRef}
                  rows={20}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="rounded-t-none font-mono text-xs"
                />
                <p className="mt-1.5 text-xs text-[var(--color-ink-400)]">
                  <code>## Titre</code> pour une section, <code>**gras**</code>, <code>*italique*</code>,{" "}
                  <code>- puce</code>, <code>![texte](url)</code> pour une image. Une ligne vide entre les paragraphes.
                </p>
              </>
            ) : (
              <div className="mt-1.5 rounded-xl border border-[var(--color-ink-100)] bg-[var(--color-cream-50)] p-5">
                {coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImageUrl} alt="" className="mb-6 aspect-[21/9] w-full rounded-2xl object-cover" />
                ) : (
                  <div aria-hidden className={cn(cover, "mb-6 aspect-[21/9] w-full rounded-2xl")} />
                )}
                {body.trim() ? (
                  <MarkdownPreview source={body} />
                ) : (
                  <p className="text-sm text-[var(--color-ink-400)]">Rien à prévisualiser pour le moment.</p>
                )}
              </div>
            )}

            {uploadNote && (
              <p className="mt-2 rounded-lg bg-[var(--color-fox-300)]/15 px-3 py-2 text-xs text-[var(--color-fox-700)]">
                {uploadNote}
              </p>
            )}
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
              <Label>Langue de l&apos;article</Label>
              <div className="mt-1.5 flex gap-1.5">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm",
                      language === l
                        ? "border-transparent bg-[var(--color-ink-800)] text-[var(--color-cream-50)]"
                        : "border-[var(--color-ink-100)] hover:bg-[var(--color-cream-100)]"
                    )}
                  >
                    {l === "fr" ? "Français" : "English"}
                  </button>
                ))}
              </div>
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

            {/* Cover image upload */}
            <div>
              <Label>Image de couverture</Label>
              {coverImageUrl ? (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="" className="aspect-[21/9] w-full rounded-lg object-cover" />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-100)] px-2.5 py-1.5 text-xs hover:bg-[var(--color-cream-100)]"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      Remplacer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(undefined)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ink-100)] px-2.5 py-1.5 text-xs text-[var(--color-ink-500)] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Retirer
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading === "cover"}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-ink-200)] px-3 py-4 text-xs text-[var(--color-ink-500)] hover:bg-[var(--color-cream-100)] disabled:opacity-60"
                >
                  {uploading === "cover" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Téléversement…
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      Téléverser une image
                    </>
                  )}
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={onPickCover} />
            </div>

            {/* Gradient fallback (used when no image is uploaded) */}
            <div>
              <Label>Ou un dégradé</Label>
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
                      !coverImageUrl && cover === c ? "border-[var(--color-ink-800)]" : "border-transparent"
                    )}
                  />
                ))}
              </div>
              {coverImageUrl && (
                <p className="mt-1.5 text-xs text-[var(--color-ink-400)]">
                  Le dégradé s&apos;applique seulement sans image de couverture.
                </p>
              )}
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

function ToolbarButton({
  label,
  onClick,
  busy,
  children,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      title={label}
      aria-label={label}
      className="rounded-md p-1.5 text-[var(--color-ink-600)] hover:bg-[var(--color-cream-200)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Inline markdown → React: **bold**, *italic*, ![alt](url), [text](url). */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1] !== undefined) {
      // image
      // eslint-disable-next-line @next/next/no-img-element
      nodes.push(<img key={key} src={m[2]} alt={m[1]} className="my-4 w-full rounded-2xl" />);
    } else if (m[3] !== undefined) {
      nodes.push(
        <a key={key} href={m[4]} className="text-[var(--color-ink-700)] underline">
          {m[3]}
        </a>
      );
    } else if (m[5] !== undefined) {
      nodes.push(<strong key={key}>{m[5]}</strong>);
    } else if (m[6] !== undefined) {
      nodes.push(<em key={key}>{m[6]}</em>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Lightweight preview renderer for the markdown-lite body (editor only). */
function MarkdownPreview({ source }: { source: string }) {
  const blocks = source.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-4">
      {blocks.map((block, bi) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={bi} className="font-serif text-2xl tracking-tight">
              {block.replace(/^##\s*/, "")}
            </h2>
          );
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-5 text-[1.0625rem] leading-relaxed text-[var(--color-ink-700)]">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^-\s*/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        // Standalone image block
        const imgOnly = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgOnly) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={bi} src={imgOnly[2]} alt={imgOnly[1]} className="w-full rounded-2xl" />;
        }
        return (
          <p key={bi} className="text-[1.0625rem] leading-relaxed text-[var(--color-ink-700)]">
            {renderInline(block, String(bi))}
          </p>
        );
      })}
    </div>
  );
}
