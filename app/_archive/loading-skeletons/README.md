# Library / story `loading.tsx` — removed on purpose

These two `loading.tsx` files were removed on 2026-08-10.

## Why

Both routes are statically prerendered (`force-static` + revalidate). With a
`loading.tsx`, Next wraps the segment in a Suspense boundary and bakes the
FALLBACK into the prerendered HTML, so the real content never made it into
the static page:

- `/histoires` shipped a skeleton grid: filters from a deep link
  (`?theme=emotions`) never applied, and crawlers saw zero stories.
- `/histoires/<slug>` shipped a skeleton: the story text itself was invisible
  to Google.

Removing them restored full prerendering (12 story cards + the promo card in
`/histoires`, the whole story body on detail pages).

## If you want a loading state back

Do NOT restore these as `loading.tsx`. Either:
- render the skeleton *inside* the client component while its own data is
  pending, or
- keep the route dynamic (drop `force-static`) and accept the function cost.

The skeleton components themselves are still available at
`src/components/story/StorySkeleton.tsx`.
