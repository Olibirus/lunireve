import { useTranslations } from "next-intl";

/**
 * Full-width parallax image band (CSS background-attachment: fixed). A calm
 * brand scene between the hero and the story carousels.
 */
export function ParallaxBand() {
  const t = useTranslations("homeV2");
  return (
    <section
      className="relative flex h-[46vh] min-h-[320px] md:h-[64vh] items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/img/website/homepage-parallax.jpg)", backgroundAttachment: "fixed" }}
    >
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30" />
      <div className="relative mx-auto max-w-3xl px-5 text-center text-white">
        <h2
          className="font-serif text-3xl md:text-5xl tracking-tight leading-[1.08] drop-shadow"
          style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 60, 'wght' 500" }}
        >
          {t("parallaxTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/85 leading-relaxed">{t("parallaxBody")}</p>
      </div>
    </section>
  );
}
