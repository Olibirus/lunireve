            <form className="mt-6 max-w-sm" aria-label={t("footer.newsletterLabel")}>
              <label htmlFor="newsletter-email" className="text-xs uppercase tracking-widest text-[var(--color-mint-400)]">
                {t("footer.newsletterHeading")}
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder={t("footer.newsletterPlaceholder")}
                  className="bg-[var(--color-ink-700)] border-[var(--color-ink-600)] text-[var(--color-cream-50)] placeholder:text-[var(--color-indigo-soft-300)] focus:border-[var(--color-mint-400)]"
                />
                <Button variant="mint" size="md" type="submit">
                  {t("footer.newsletterSubmit")}
                </Button>
              </div>
              <p className="mt-3 text-xs text-[var(--color-indigo-soft-300)]">
                {t("footer.newsletterNote")}
              </p>
            </form>
