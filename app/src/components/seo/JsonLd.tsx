/**
 * Renders a schema.org JSON-LD block. Server component: the structured data
 * ships in the initial HTML where crawlers read it.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
