@AGENTS.md

# Mandatory rules for every session (Harry's defaults)

## Auto-commit + push at the end of every task
At the end of EVERY task, ALWAYS:
1. Run `pnpm build` and confirm it's green.
2. `git add -A && git commit -m "<one-line summary>"` — never ask permission.
3. `git push` to `main` — never ask permission.

Use a single short commit message line describing the change. If the
commit fails (pre-commit hook, type error), fix it and commit again.
Do not skip hooks. Do not amend pushed commits.

If you cannot push (network, auth), say so explicitly at the very end
of your reply: "PUSH FAILED — needs manual push." That's the only case
where you mention git. Otherwise stay silent about commits/pushes —
Harry doesn't want to see "I committed and pushed" every time.

## Parallel sessions A / B / C / D
Harry runs 4 sessions to manage context — see `../SESSION_GUIDE.md` for
the folder ownership map. **You should prefer your owned folders, but
when a task naturally requires editing a file outside your territory,
just do it.** Don't refuse, don't punt, don't ask Harry to "have
Session D handle this part." He pays in tokens and time for every
round-trip.

When you edit outside your territory:
- Make the change as you would in any session.
- Add ONE short line at the very top of `SESSION_GUIDE.md` under a
  `## Cross-session changes log` heading (create the heading if absent):
  `YYYY-MM-DD [Session X]: touched <folder> for <reason>`
- That's it. No long explanation. The log just keeps other sessions
  aware so they don't undo your change.

## Hard project rules (apply to every session)
- NO em dashes anywhere user-visible (use commas/colons).
- Admin shows REAL data only (zeros, never fake numbers).
- Age taxonomy: 1-2 / 3-4 / 5-6 / 7-8 / 9-10 / 11-12 (use `ageLabel`,
  `ageToRange` from `data/mock-stories.ts`).
- Client stores in `lib/*` must mirror the DB schema (`db/schema.ts`).
- `messages/fr.json` + `messages/en.json` must stay key-synced.
- Temp auth still active: `user/123456`, `admin/123456`.
