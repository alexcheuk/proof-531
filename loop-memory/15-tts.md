---
name: tts
description: Canonical reference for the homelab TTS — the ambient "theater" channel for the auto-improve loop. Read by callers that fire spoken audio (`auto-improve` Step 3 departure, `commission-expedition-log` Step 4 gommage sign-off). Documents the `/compose` endpoint, the voice catalog, audio tags, director's-notes blocks, the Paintress/Logger casting canon, and the fire-and-forget payload recipe. The two skills link here instead of inlining the API.
---

# TTS — the homelab `/compose` reference

This is the **single source of truth** for the homelab text-to-speech. Two skills speak through
it; both link here rather than re-documenting the API:

- **`auto-improve` Step 3 — the departure.** Verso the Paintress announces the expedition's goals.
- **`commission-expedition-log` Step 4 — the gommage.** The Logger reads their field log and signs
  off before the erasure.

It is **ambient theater**, not a hard dependency. Every call is **fire-and-forget**: if the speaker
is unreachable or `HOME_TTS_URL` is unset, the loop continues unbothered. Never block work on TTS.

## Endpoint

```
POST $HOME_TTS_URL/compose
Content-Type: application/json
```

`/compose` is the full-control Gemini-TTS endpoint (model fixed to `gemini-3.1-flash-tts-preview`).
It is a **superset of the old `/say`** — everything `/say` did, plus inline audio tags,
natural-language director's notes, and multi-speaker. We use it for both spoken moments.

> **Env-var convention:** `HOME_TTS_URL` is the **base URL** (e.g. `https://home-tts.yikeslab.com`),
> with **no path**. Callers append `/compose`. (It used to be the full `/say` URL — drop the trailing
> path in `.env.claude.local`. See `.env.claude.example`.) The endpoint is LAN/WireGuard-only and
> won't resolve from CI or external machines — that's expected; the call no-ops there.

## Request fields

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | string | — | **Required.** The transcript. Put `[audio tags]` inline here. (`message` is accepted as an alias — prefer `text`.) |
| `device` | string | `"all"` | We always use `"kitchen"`. |
| `voice` | string | `Kore` | Single-speaker voice (see catalog). |
| `style` | string | — | Natural-language director's note, prepended to the transcript. |
| `language` | string | — | Optional `languageCode` hint (`"en"`, …). Auto-detected otherwise. Rarely needed. |
| `temperature` | number | — | Optional sampling temperature. Rarely needed. |
| `generation_config` | object | — | Raw passthrough merged into `generationConfig`. Rarely needed. |

`speakers` (multi-speaker, up to 2) also exists — **we don't use it**, see below.

## Voice catalog

Pass any of these 30 prebuilt names as `voice`. The character is the voice's natural disposition;
you can still push it elsewhere with `style` / tags / director's notes.

| Voice | Character | Voice | Character |
| --- | --- | --- | --- |
| Zephyr | Bright | Erinome | Clear |
| Puck | Upbeat | Algenib | Gravelly |
| Charon | Informative | Rasalgethi | Informative |
| Kore | Firm | Laomedeia | Upbeat |
| Fenrir | Excitable | Achernar | Soft |
| Leda | Youthful | Alnilam | Firm |
| Orus | Firm | Schedar | Even |
| Aoede | Breezy | Gacrux | Mature |
| Callirrhoe | Easy-going | Pulcherrima | Forward |
| Autonoe | Bright | Achird | Friendly |
| Enceladus | Breathy | Zubenelgenubi | Casual |
| Iapetus | Clear | Vindemiatrix | Gentle |
| Umbriel | Easy-going | Sadachbia | Lively |
| Algieba | Smooth | Sadaltager | Knowledgeable |
| Despina | Smooth | Sulafat | Warm |

An unknown voice name is rejected by Gemini and surfaces as a `502` (synthesis error).

## Casting canon

- **`Algenib` is reserved for Verso the Paintress** — the departure announcement and any off-cycle
  Paintress handoff. Its gravelly register is Verso's register; do not give it to a Logger.

  **Verso's voice style** — pass this verbatim as the `style` field for every departure (it is the
  single source of truth; the `auto-improve` Step 3 curl reproduces it):

  > Speak as Verso: a battle-hardened, elegant nomad with more than a century behind him. A velvety,
  > low masculine voice, worn at the edges with quiet fatigue. Composed, articulate, unhurried; never
  > cheerful, never performative. Hold a steady pace with long, contemplative pauses. Somber and a
  > little mysterious, carrying an understated, world-weary gravity that hints at a grief he never
  > names. Maintain a consistent, level pitch and crisp energy throughout the entire text. Do not let
  > the voice drop or become fatigued.

  The departure is the **somber, mysterious** register. The warm, brotherly register the character
  uses in friendly dialogue never airs here: Verso does not speak in dialogue (see
  `loop-memory/14-lore.md`), so the only Paintress audio is this announcement. Let the rich `style`
  carry the texture (velvet, fatigue, gravity) and inline tags carry the pacing (`[slowly]`,
  `[serious]`, `[tired]`, a `...` beat for contemplation).

  **The `style` is the constant; the line is not.** Write the departure transcript **fresh every
  expedition** from that iteration's actual goals — never a fixed template like "Expedition N
  departs. The goals: …". Verso summons each Logger differently: vary the opening, the rhythm, the
  imagery, and which goal he lingers on, so the ambient track doesn't become a templated drone.
  Weave the work in as a charge to the Logger rather than reciting it as a list, and place tags where
  they serve the sentence, not in a set pattern. The `auto-improve` Step 3 caller carries example
  lines that show the range (to be written anew, never reused).
- **The Logger picks any *other* voice** that fits their character on the page (warm Loggers →
  `Sulafat`/`Achird`; clear/firm → `Iapetus`/`Orus`; soft/tired → `Achernar`/`Enceladus`; etc.).
  Vary it across expeditions so the ambient track doesn't become a drone — if two consecutive
  Loggers feel similar, push the second to a different voice.

  **Logger style field — required anchor sentence.** Every Logger `style` value must end with:
  > Maintain a consistent, level pitch and crisp energy throughout the entire text. Do not let the voice drop or become fatigued.

  Place it at the end of whatever register direction you've written, e.g.:
  > "Say with cocky swagger, fast and sure of yourself. Maintain a consistent, level pitch and crisp energy throughout the entire text. Do not let the voice drop or become fatigued."

## Audio tags (delivery, inline)

Bracketed cues placed **inline in `text`**; each modifies the delivery of the words *after* it.
This is how we shape pacing and emotion concretely — much more reliable than describing it in
prose and hoping the model obeys.

Common tags: `[amazed]` · `[crying]` · `[excited]` · `[sighs]` · `[giggles]` · `[laughs]` ·
`[sarcastic]` · `[serious]` · `[shouting]` · `[tired]` · `[whispers]` · `[bored]` · `[slowly]` ·
`[gasps]`

Tags can carry compound direction: `[slowly, almost a whisper]`, `[sarcastically, one word at a time]`.

**The gommage trail-off is built with tags, not described.** Instead of asking the `style` field to
"let the voice fade," put the cue where it happens — but **only on the motto**, not the whole line.
Keep the sign-off (name + expedition number) at the clip's normal pace; let just the final phrase
thin out:

```
Signing off — Solène, Logger of Expedition 24. [slowly] [whispers] For those who come after.
```

**Default pace is normal.** Don't make the whole clip slow — that's one register (the somber Logger),
not the house style. Most Loggers talk at a natural or brisk clip; the slow fade is a brief effect on
the last few words. Vary the register hard across expeditions (badass, sarcastic, cocky, brisk,
gallows-humor, occasionally solemn) so the ambient track isn't one mournful drone. See the
`commission-expedition-log` Step 4 style examples.

Rule of thumb: **delivery (pacing, fade, emotion) → inline tags in `text`; overall register/mood →
`style`.** They combine freely.

**Paragraph separators in `text`.** Periods at sentence boundaries trigger a tonal reset in the
autoregressive model — after a period the pitch tends to drop and the voice can sound fatigued by
the end of a long clip. To prevent drift, join paragraphs with ` — ` (em-dash with spaces) or `;`
(semicolon) rather than a period-space-capital pattern. Use periods only inside a single sentence
where they carry genuine meaning (abbreviations, etc.) or at the very end of the clip. This applies
to the full gommage read-aloud and to any Verso departure text.

## Director's-notes block (full control)

For a fully shaped delivery, write a structured block at the **top of `text`** and leave `style`
empty (so nothing competes with it). Audio tags still work inline below it. Example, adapted to a
Logger sign-off:

```
DIRECTOR'S NOTES: A tired field engineer recording a last log before the lights go out. Style —
quiet, steady, unsentimental; no performance. Pacing — unhurried, with a real pause before the
final line, which thins almost to nothing.

TRANSCRIPT:
The map came in clean this time. [tired] We changed three panels and the work held when we pushed
on it. [slowly] Signing off — Iven, Logger of Expedition 25. [whispers] For those who come after.
```

Keep instructions concrete — vague notes get ignored, or worse, read aloud verbatim.

## Multi-speaker — why we don't use it

`/compose` supports up to **2 speakers** (`speakers: [{speaker, voice}, …]` with matching labels in
`text`). It is tempting for a two-voice gommage handoff — the Logger reading the log, then Verso
speaking a closing line.

**We deliberately don't.** Canon (`loop-memory/14-lore.md`): *"Verso does not speak in dialogue.
Verso watches. Verso leaves slips."* And there is only ever **one Logger per expedition**. So every
clip is **single-voice**. The two-voice handoff that an earlier decision deferred as
"endpoint-unconfirmed" is now declined on canon grounds, not capability — the immersion we adopt is
audio tags + director's notes, not a second speaker.

## Payload recipe (fire-and-forget)

`jq` may be absent in the loop environment — build the JSON with Python, then POST with a short
timeout, guarded so an unset/unreachable endpoint is a clean no-op:

```bash
# HOME_TTS_URL is the BASE url (set in .env.claude.local); we append /compose.
TTS_PAYLOAD=$(python3 -c "
import json
print(json.dumps({
  'text':   '<transcript with inline [audio tags]>',
  'device': 'kitchen',
  'voice':  '<voice from the catalog>',
  'style':  '<overall register/mood, or omit if using a director\'s-notes block>',
}))
")
[ -n "${HOME_TTS_URL:-}" ] && curl -sS -X POST "$HOME_TTS_URL/compose" \
  -H "Content-Type: application/json" \
  --max-time 10 \
  -d "$TTS_PAYLOAD" \
  >/dev/null 2>&1 || true
```

## Limits & errors

- **Single-voice by canon** (the endpoint allows 2 speakers; we use 1).
- **~32k token** input window; quality drifts past a few minutes of audio — prefer several short
  clips over one long one. Our two moments are both short.
- Output is PCM 24 kHz mono, wrapped as `audio/wav`, cached by full input hash (changing voice,
  style, tags, or a word is a new file).
- **No fallback:** synthesis failure returns `502` with a traceback (visible on the Expedition TTS
  history page as a red `error` pill). Transient Gemini `5xx`/`429`/empty-audio responses are
  retried automatically (up to 3×); read timeouts are not. Because there's no fallback, **always
  fire-and-forget** — the loop must never wait on or depend on a successful cast.

## Crosslinks

- Departure caller: `.claude/skills/auto-improve/SKILL.md` (Step 3)
- Gommage caller: `.claude/skills/commission-expedition-log/SKILL.md` (Step 4)
- World canon (why single-voice): `loop-memory/14-lore.md`
- Env var: `.env.claude.example`
