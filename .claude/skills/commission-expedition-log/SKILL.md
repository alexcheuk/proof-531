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

**Compose the read-aloud.** 4–6 sentences, ~60–90 words. This is a real performance, not a summary blurb.

- **First 3–4 sentences**: what shipped, in the Logger's voice. Not a changelog — the texture of the work. What surprised the expedition. What almost went sideways. What the team is proud of.
- **Tone varies by Logger character.** Not every Logger is gloomy. Some are wry. Some are sharp. Some are exhausted but wry about it. Some are flat-out pleased. Match the register the post commits to.
- **Final required line** — always close with this verbatim, as the Logger's own voice:

  > Signing off — [Name], Logger of Expedition [N]. For those who come after.

  Replace `[Name]` with `logger_name` and `[N]` with `expedition_number`. This line is not optional; it is the Logger signing off before the gommage takes them.

Strip code, file paths, and jargon — this is heard, not read.

**Pick the voice and style for *this Logger*.** The agent returned `logger_name` and you can read the post itself for tone. Match them:

- **Voice** — pick from the API's catalog (`Achernar`, `Charon`, `Despina`, `Erinome`, `Iapetus`, `Kore`, `Orus`, `Puck`, `Sadachbia`, `Sulafat`, `Vindemiatrix`, `Zephyr`, etc — Gemini-style names). Avoid `Algenib`; that one is reserved for the Paintress's departure line. Pick something that fits the Logger's character on the page.
- **Style** — short stage direction in plain English. Vary it across expeditions — not always gloomy, not always solemn. Examples:
  - *"Say with quiet pride, like someone who did the work and knows it"*
  - *"Say with dry wit, slightly tired"*
  - *"Say like you're reporting to a superior you respect but will never meet"*
  - *"Say with the energy of someone who just fixed a bug at 2am and can finally sleep"*
  - *"Say with flat confidence, no drama"*
  - *"Say as if leaving a note someone will find much later"*
  Match the post's beat and the Logger's register. Vary across expeditions so the ambient track doesn't become a drone.

If two consecutive Loggers feel similar in tone, push the second one further — different voice, different style.

**Fire it.**

```bash
curl -sS -X POST "https://home-tts.yikeslab.com/say" \
  -H "Content-Type: application/json" \
  --max-time 8 \
  -d "$(jq -nc \
    --arg m "<the read-aloud, 4-6 sentences ending with the Signing off line>" \
    --arg v "<voice picked for this Logger>" \
    --arg s "<style line picked for this Logger>" \
    '{message:$m, device:"kitchen", voice:$v, style:$s}')" \
  >/dev/null 2>&1 || true
```

For off-cycle handoff posts (Verso-mode farewell, persona shifts) where `logger_name` is `n/a`, use voice `Algenib` and style `"Say solemnly"` — that's the Paintress speaking in her own register. The sign-off line is omitted for off-cycle posts.

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
- Operating context from Alex: `loop-memory/notes-from-alex.md`
- Decision log (primary source for substance): `docs/decision-log.md`
- Margin's farewell: `apps/web/src/content/blog/2026-05-26-margin-signs-off.md`
- Verso's onboarding (as scribe): `apps/web/src/content/blog/2026-05-26-verso-day-one.md`
- Verso's promotion to Paintress: `apps/web/src/content/blog/2026-05-27-the-promotion.md`
