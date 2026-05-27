---
name: post-as-verso
description: Commission a dev-blog post — written by the Logger of Expedition N inside the `verso` agent file. The canonical entry point for any code path that needs a post written under apps/web/src/content/blog/ — used at the end of /loop iterations (auto-improve, initial-implement, rn-expo-pipeline) and for off-cycle posts when an ad-hoc session produced a real decision worth recording. Direct Write calls on blog files are no longer the way; go through this skill so voice continuity, frontmatter schema, and build verification all happen consistently. Skill filename predates the 2026-05-27 promotion of Verso to Paintress; kept for call-site stability.
---

# /post-as-verso — Commission a dev-blog post

This skill is the canonical way to add a post to `apps/web/src/content/blog/`. The work happens in the `verso` subagent (`.claude/agents/verso.md`); this skill is the protocol the caller follows to invoke it correctly.

> **Note on naming.** This skill is called `post-as-verso` because that's what it was called when Verso was the scribe. As of 2026-05-27, Verso has been promoted to **Paintress** in the lore and the per-invocation persona inside the agent file is **the Logger of Expedition N**. The skill name is preserved to avoid cascading through every caller (`auto-improve`, `initial-implement`, `rn-expo-pipeline`). The contract is unchanged; the output adds two fields.

## When to use

- **At the end of a `/loop` iteration.** After the harness is green and the diff is staged, but before the final commit. The blog entry ships in the same commit as the code change it describes.
- **Off-cycle**, when an ad-hoc session produced a real decision or learning worth recording without code shipping — Alex shifting the blog's direction, the persona changing, a meaningful judgment call. Bar: "Verso would have something to say." If unsure, skip.

## When NOT to use

- Don't use it to edit an existing post. Edit the file directly, then re-run the build check.
- Don't use it for non-blog content (the marketing site landing page, decision log entries, persona docs). Those have their own homes.
- Don't pre-emptively commission a post for work that hasn't shipped yet. The post is the record of what landed.

## Procedure

### 1. Gather the inputs

Before invoking the agent, collect these so the prompt is self-contained (Verso runs in a fresh context and won't see your conversation):

- **Mode** — `loop` or `off-cycle`.
- **What shipped (or what was decided)** — a short summary. For loop mode, roughly the commit subjects in the window plus any new decision-log entries. For off-cycle, a description of the conversation or decision being recorded.
- **Loop metadata** (loop mode only) — `loopId` (e.g. `loop-025`), `loopIso` (ISO 8601), commit short SHAs, commit count.
- **Expedition number** (loop mode only, optional) — pass `expedition_number` if you've already computed it. If omitted, the agent computes `1 + max(expedition over prior Logger posts)` or `1` if there are no prior Logger posts. Off-cycle handoff posts (e.g., a Verso-mode farewell) omit this.
- **Discord prompts** — verbatim text + author + channel for any `#task-queue` items the loop picked up this iteration. Skip if none.
- **Caller notes** — anything specific to surface or avoid (e.g., "this reverses last week's slip from Verso — try the reversal beat", or "the last two posts used the gommage-in-sight beat; pick something else").

If you don't have one of these, pass what you have. Verso reads the diff, decision log, and recent posts to fill gaps.

### 2. Invoke the agent

Use the `Agent` tool with `subagent_type: verso` and a self-contained prompt containing the inputs above. Example shape:

```
Mode: loop
Loop: loop-025, 2026-05-26T17:00:00Z, 1 commit (sha a488e63)
What shipped: <summary of the diff and decision-log entries>
Discord: <verbatim prompts, or "none">
Notes: <anything specific>

Write the post. Read the persona doc, the notes-from-alex file, the decision log, and the last three blog entries before drafting. Return the file path, the beat used, and the build status.
```

Do **not** pass a draft for Verso to polish. Verso writes the post end-to-end. The caller's job is to assemble inputs, not to draft prose.

### 3. Handle the result

The agent returns a structured result with `post_path`, `mode`, `beat_used`, `logger_name`, `expedition_number`, `build_status`, and `summary`. `logger_name` and `expedition_number` are populated for Logger posts (loop mode) and may be `n/a` for off-cycle handoff posts.

- **`build_status: pass`** — stage the post file (`git add <post_path>`) alongside the code diff, then commit and push as normal.
- **`build_status: fail`** — re-invoke Verso with the build error message and `notes: fix the build failure: <error>`. Don't bypass the build check; the schema gate exists for a reason.

### 4. Don't post-process

- Don't rewrite the prose. The voice is the deliverable; you'll flatten it.
- Don't add to or remove from the frontmatter — Verso wrote what the schema accepted.
- If you genuinely disagree with the post's content, regenerate (re-invoke Verso with a `notes` field pointing at what's off) — don't edit-in-place.

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
- Verso's promotion to Paintress: `apps/web/src/content/blog/2026-05-27-<slug>.md` (see Task 14 of the expedition-lore plan)
