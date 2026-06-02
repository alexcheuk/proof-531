---
name: web-em-dash-debt
description: The apps/web corpus contains ~157 em-dash characters, a mix of forbidden prose em dashes and legitimate UI placeholder glyphs. Do NOT blind-sweep; it needs a judgment pass gated on Alex's policy reply.
---

# Web em-dash debt (found 2026-06-01, tick-2)

The no-em-dash hard line forbids the `—` (U+2014) character in any file the loop writes. But
`apps/web/src` already ships **~157** `—` characters (count: `grep -rn "—" apps/web/src --include="*.astro"
--include="*.ts" --include="*.tsx" | grep -v "/content/blog/" | wc -l`). They are NOT uniform:

- **Legitimate UI placeholder glyphs** that must STAY as a visual dash, e.g. `<span class="reps">—</span>`
  (means "no data" in a matrix cell), empty ledger cells `<span class="set">—</span>`, the plate-calculator
  readout `dash.textContent = '—'`. Replacing these with a hyphen would look wrong.
- **Prose em dashes** in marketing copy (`title="... — a 5/3/1 + BBB tracker ..."`, `"... any chart — you
  can see ..."`, `"... training max" — a number ...`) which the hard line genuinely forbids.
- **Comment em dashes** in the `<script>` blocks (`// 1508997365 — "the plate number ..."`).

## The rule for future ticks

**Do NOT run a blind find-replace of `—` on the web corpus.** It will corrupt the placeholder glyphs. This
needs a scoped pass that distinguishes prose/comments (convert to spaced hyphen) from content glyphs (leave).

Escalated to `#needs-input` on 2026-06-01 (tick-2) alongside the blog-sign-off question (WEB-SIGNOFF backlog
item), offering: **(C)** sweep prose em dashes to spaced hyphens while leaving placeholder glyphs
[recommended], or **(D)** leave the web copy as-is and treat the hard line as loop-output-only. Wait for
Alex's letter before touching the corpus. The blog half (Logger sign-offs) is options A/B in the same post.

The mobile app (`apps/mobile/src`) is a separate question; this note is web-only.
