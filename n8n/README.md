# Lunireve — n8n workflows

## Story Generation (`lunireve-story-generation.json`)

Generates a complete library story (title, body, quiz, glossary, image prompt)
with Claude and inserts it into Supabase `stories`.

**Status:** already created in n8n (`n8n.olibriusweb.com`, workflow id
`EgBcdBhzTZkhCPop`, name "Lunireve - Story Generation"), **inactive**, with the
real Anthropic + Supabase keys already injected — ready to open and run.

### Flow
1. **Manual Trigger** (test) → later a Webhook called by the app
2. **Story Inputs** (Set) — genre / ageRange / theme / language (edit to test)
3. **Generate with Claude** — POST api.anthropic.com, model `claude-sonnet-4-6`,
   returns strict JSON
4. **Parse Story JSON** (Code) — extracts JSON, builds slug + reading_minutes
5. **Insert to Supabase** — POST `/rest/v1/stories`

### To test
1. Open the workflow in n8n
2. Adjust **Story Inputs** if you like
3. Click **Execute Workflow**
4. Check the **Insert to Supabase** node output for the created row

### Before it inserts cleanly
The `stories` table columns must accept: `slug, title, excerpt, language,
age_range, genre, theme, body (jsonb), quiz (jsonb), glossary (jsonb),
image_prompt, status, reading_minutes`. If a column name differs, tweak the
**Parse Story JSON** node keys to match `src/db/schema.ts`.

### Notes
- The committed JSON uses `REPLACE_WITH_*` placeholders (no secrets in git).
  The live workflow in n8n already has the real keys.
- Next: swap the Manual Trigger for a Webhook and call it from the app's
  personalized-story action; add image + audio steps.
