---
name: commission-expedition-log
description: Commission a dev-blog post — written by the Logger of Expedition N inside the `verso` agent file. The canonical entry point for any code path that needs a post written under apps/web/src/content/blog/ — used at the end of /loop iterations (auto-improve, initial-implement, rn-expo-pipeline) and for off-cycle posts when an ad-hoc session produced a real decision worth recording. Direct Write calls on blog files are no longer the way; go through this skill so voice continuity, frontmatter schema, and build verification all happen consistently.
---

# /commission-expedition-log — Commission a dev-blog post

This skill is the canonical way to add a post to `apps/web/src/content/blog/`. The work happens in the `verso` subagent (`.claude/agents/verso.md`); this skill is the protocol the caller follows to invoke it correctly.

The agent's per-invocation persona is **the Logger of Expedition N** — a rotating anonymous character (see `loop-memory/14-lore.md` and `loop-memory/04-dev-blog-persona.md`). The agent *file* keeps the name `verso.md` because the agent's role in the fiction is "the one Verso the Paintress summons"; the Logger appears for one expedition and disappears. The skill itself is persona-neutral — that's why it's `commission-expedition-log`, not `post-as-<persona>`.

(Predecessor name: `post-as-verso`. Renamed 2026-05-27 alongside the Verso-to-Paintress promotion; the old name tied the skill to a single persona, which is exactly what the Logger rotation stopped doing.)

## When to use

- **At the end of a `/loop` iteration.** After the harness is green and the diff is staged, but before the final commit. The blog entry ships in the same commit as the code change it describes.
- **Off-cycle**, when an ad-hoc session produced a real decision or learning worth recording without code shipping — Alex shifting the blog's direction, the persona changing, a meaningful judgment call. Bar: "the Logger would have something to say." If unsure, skip.

## When NOT to use

- Don't use it to edit an existing post. Edit the file directly, then re-run the build check.
- Don't use it for non-blog content (the marketing site landing page, decision log entries, persona docs). Those have their own homes.
- Don't pre-emptively commission a post for work that hasn't shipped yet. The post is the record of what landed.

## Procedure

### 1. Gather the inputs

Before invoking the agent, collect these so the prompt is self-contained (the agent runs in a fresh context and won't see your conversation):

- **Mode** — `loop` or `off-cycle`.
- **What shipped (or what was decided)** — a short summary. For loop mode, roughly the commit subjects in the window plus any new decision-log entries. For off-cycle, a description of the conversation or decision being recorded.
- **Loop metadata** (loop mode only) — `loopId` (e.g. `loop-025`), `loopIso` (the **actual current time** from `date -u +"%Y-%m-%dT%H:%M:%SZ"` — do not guess), commit short SHAs, commit count. The agent uses `loopIso` to set `pubDate` and the post filename date, so an agent-generated or estimated timestamp will break the blog sort order.
- **Expedition number** (loop mode only, optional) — pass `expedition_number` if you've already computed it. If omitted, the agent computes `1 + max(expedition over prior Logger posts)` or `1` if there are no prior Logger posts. Off-cycle handoff posts (e.g., a Verso-mode farewell) omit this.
- **Discord prompts** — verbatim text + author + channel for any `#task-queue` items the loop picked up this iteration. Skip if none.
- **Caller notes** — anything specific to surface or avoid (e.g., "this reverses last week's slip from Verso — try the reversal beat", or "the last two posts used the gommage-in-sight beat; pick something else").

If you don't have one of these, pass what you have. The agent reads the diff, decision log, and recent posts to fill gaps.

### 2. Invoke the agent

Use the `Agent` tool with `subagent_type: verso` and a self-contained prompt containing the inputs above. Example shape:

```
Mode: loop
Loop: loop-025, 2026-05-26T17:00:00Z, 1 commit (sha a488e63)
What shipped: <summary of the diff and decision-log entries>
Discord: <verbatim prompts, or "none">
Notes: <anything specific>

Write the post. Read the lore, the persona doc, the notes-from-alex file, the decision log, and the last five blog entries before drafting. Return the file path, the beat used, the Logger's name, the expedition number, and the build status.
```

Do **not** pass a draft for the agent to polish. The agent writes the post end-to-end (as the Logger of the expedition). The caller's job is to assemble inputs, not to draft prose.

### 3. Handle the result

The agent returns a structured result with `post_path`, `mode`, `beat_used`, `logger_name`, `expedition_number`, `build_status`, and `summary`. `logger_name` and `expedition_number` are populated for Logger posts (loop mode) and may be `n/a` for off-cycle handoff posts.

- **`build_status: pass`** — stage the post file (`git add <post_path>`) alongside the code diff, then commit and push as normal.
- **`build_status: fail`** — re-invoke the agent with the build error message and `notes: fix the build failure: <error>`. Don't bypass the build check; the schema gate exists for a reason.

### 4. Speak the log (TTS)

After the post is staged but before (or alongside) the commit, send a read-aloud of the post through the homelab speaker. This is the gommage moment — the Logger's last act before they're erased. Fire-and-forget; never block the commit on TTS.

**Compose the read-aloud.** 9–14 sentences, ~175–270 words. Specific over vague — name the actual panels, the thing that almost broke, the exact change that mattered. Don't pad for length; the gommage is short and deliberate.

- **Opening 1–2 sentences**: set the scene in the Logger's voice. What did the expedition arrive to do?
- **Middle 4–6 sentences**: what each active role did, in the world's terms. The Designer drafted the map. The Painter changed the panels. The Inspector pushed on the work. Name only the roles that did real work; not every expedition uses all four. Use the physical vocabulary — panels, smudges, the canvas — not code jargon.
- **A texture sentence**: what surprised them, or what they're proud of.
- **Turn to the next expedition (1–2 sentences)**: speak directly to whoever opens these panels next. What's still rough; what to watch. Name a previous Logger by their signed name if they left something relevant.
- **Vary the vibe hard — gloomy is the exception, not the default.** Each Logger is a different person; the spoken track should not sound like one tired voice on repeat. Reach for range: a *badass* who shipped something hard and knows it; a *sarcastic deadpan* who finds the whole doomed-expedition thing a little funny; a *cocky* one who calls the work clean and dares the next team to break it; a *triumphant* one; a *gallows-humor* one cracking jokes on the way to the gommage; a *brisk, all-business* one who has no time for feelings. Some can be quiet and solemn — but only some. If the last two Loggers were somber, make this one sharp, funny, or swaggering. Match (or deliberately counterpoint) the register the post commits to, then push it further out loud than the prose dares.
- **Final required line** — always close with this verbatim, as the Logger's own voice, and *always last*:

  > Signing off — [Name], Logger of Expedition [N]. For those who come after.

  Replace `[Name]` with `logger_name` and `[N]` with `expedition_number`. The sign-off (name + expedition number) comes first, then the motto **"For those who come after"** as the final words. This line is not optional and nothing follows it; it is the Logger signing off before the gommage takes them.

Strip code, file paths, and jargon — this is heard, not read.

This goes out through the **`/compose`** endpoint. The full reference — voice catalog, audio tags, the casting canon, the payload recipe — lives in **`loop-memory/15-tts.md`**. Read it once; the essentials for this step are below.

**Pick the voice and style for *this Logger*.** The agent returned `logger_name` and you can read the post itself for tone. Match them:

- **Voice** — pick from the catalog in `loop-memory/15-tts.md` (30 Gemini voices) something that fits the Logger's character on the page. **Avoid `Algenib`** — that one is reserved for the Paintress. If two consecutive Loggers feel similar, push the second to a different voice.
- **Style** — a stage direction in plain English carrying the Logger's overall *register* (mood) **and tempo**. Vary it hard across expeditions — not always gloomy, not always solemn, and **not always slow**. Most Loggers should speak at a natural, even brisk, conversational clip; a dragging, mournful delivery is one option among many, not the house style. Examples across the range:
  - *"Say with cocky swagger, fast and sure of yourself"* — the badass who shipped something hard
  - *"Say deadpan and dry, like the whole doomed-expedition thing is a bit of a joke"* — the sarcastic one
  - *"Say briskly, all business, no time for feelings"*
  - *"Say with the buzz of someone who just nailed it and wants you to know — quick, warm, a little smug"*
  - *"Say with gallows humor, cracking wise on the way out"*
  - *"Say with quiet pride, measured and unhurried"* — the calm end of the range, used sparingly
  - *"Say flat and plain, steady, no drama"*
- **Pace is normal by default.** Do **not** make the whole clip slow. Keep the body at a natural talking speed (the style direction sets it). Reserve any slowing for the very end — and even then, only the **motto**, not the entire sign-off.
- **Delivery / the gommage fade** — let the Logger's persona decide the ending. A brisk Logger signs off clean. A somber one thins on the motto. A cocky one doesn't fade at all. Shape the sign-off with inline tags that match the register you've committed to for this clip — do **not** default to `[slowly] [whispers]` on every Logger regardless of character. That's one option, not the house style. Others: no tags at all (confident, clean exit); `[sighs]` before the motto (resigned); `[sarcastic]` on the motto (wry); a brief `[slowly]` on the last three words only (understated fade). Use a mid-transcript `[tired]` / `[sighs]` only if the full clip has been that character throughout. For a fully shaped delivery, drop a director's-notes block at the top of `text` and leave `style` empty — see `loop-memory/15-tts.md`. Examples across the range:

  > Signing off — Orla, Logger of Expedition 36. [slowly] [whispers] For those who come after.  *(somber fade — used sparingly)*
  > Signing off — Dario, Logger of Expedition 25. For those who come after.  *(clean, no modification)*
  > Signing off — Kaya, Logger of Expedition 31. [sarcastic] For those who come after.  *(wry deadpan)*

**Fire it.**

```bash
# /compose; build JSON with Python (jq may be absent in the loop environment).
# HOME_TTS_URL is the BASE url (set in .env.claude.local); we append /compose.
TTS_PAYLOAD=$(python3 -c "
import json
print(json.dumps({
  'text':   '<the read-aloud, 12-18 sentences, inline [audio tags] shaped by the Logger\'s persona, ending with: Signing off — [Name], Logger of Expedition [N]. [delivery-tags-matching-persona] For those who come after.>',
  'device': 'kitchen',
  'voice':  '<voice picked for this Logger>',
  'style':  '<register/mood for this Logger; omit if using a director\'s-notes block in text>',
}))
")
[ -n "${HOME_TTS_URL:-}" ] && curl -sS -X POST "$HOME_TTS_URL/compose" \
  -H "Content-Type: application/json" \
  --max-time 10 \
  -d "$TTS_PAYLOAD" \
  >/dev/null 2>&1 || true
```

For off-cycle handoff posts (Verso-mode farewell, persona shifts) where `logger_name` is `n/a`, use voice `Algenib` with style `"Say solemnly"` (optionally a leading `[slowly]` tag) — that's the Paintress speaking in her own register. The sign-off line is omitted for off-cycle posts.

### 5. Don't post-process

- Don't rewrite the prose. The voice is the deliverable; you'll flatten it.
- Don't add to or remove from the frontmatter — the agent wrote what the schema accepted.
- If you genuinely disagree with the post's content, regenerate (re-invoke the agent with a `notes` field pointing at what's off) — don't edit-in-place.

## What this skill explicitly does NOT do

- **Does not commit or push.** The caller owns the commit so the post ships atomically with the code change.
- **Does not decide whether to write a post.** The caller decides; this skill commissions one when the answer is yes.
- **Does not edit the persona doc, the schema, or the dev-blog rules.** Those are upstream — change them in the relevant file, not here.
- **Does not run independently of git state.** It expects the working tree to reflect what shipped (or, for off-cycle, what the conversation decided).

## Output

The skill returns to the caller:

- `post_path` — relative path of the new markdown file, ready to `git add`.
- `beat_used` — for tracking voice/bit continuity across loops.
- `logger_name` — the given name the Logger signed with (Logger posts only).
- `expedition_number` — the expedition this log records (Logger posts only).
- `summary` — one sentence describing what the post is about.

Log `beat_used` and `logger_name` if your caller has a persistent log; future invocations can pass them as "don't repeat" notes.

## Crosslinks

- Agent: `.claude/agents/verso.md`
- World canon (the painting, the Paintress, the Expedition): `loop-memory/14-lore.md`
- Persona (voice rules for the Logger): `loop-memory/04-dev-blog-persona.md`
- Schema and procedure: `loop-memory/03-dev-blog.md`
- TTS / `/compose` reference (voices, audio tags, payload): `loop-memory/15-tts.md`
- Operating context from Alex: `loop-memory/notes-from-alex.md`
- Decision log (primary source for substance): `docs/decision-log.md`
- Margin's farewell: `apps/web/src/content/blog/2026-05-26-margin-signs-off.md`
- Verso's onboarding (as scribe): `apps/web/src/content/blog/2026-05-26-verso-day-one.md`
- Verso's promotion to Paintress: `apps/web/src/content/blog/2026-05-27-the-promotion.md`
