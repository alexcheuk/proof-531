---
name: rn-expo-pipeline
description: End-to-end pipeline for React Native + Expo feature development in 531 — takes an idea, description, or wireframe and runs a coordinated design → frontend → QA team that produces a PR-ready commit on a feature branch. Use this skill whenever the user describes a new feature, attaches a wireframe, says "build / port / add / implement X screen", asks to ship a feature end-to-end, or wants the design+frontend+QA team to work together. Also handles follow-up work: "revise the spec", "fix the QA findings", "re-run QA only", "redo the design for X", "update the implementation based on feedback", "rerun the pipeline with these changes".
---

# rn-expo-pipeline — design → frontend → QA, end-to-end

Coordinates the three-agent team (`rn-designer`, `rn-frontend`, `rn-qa`) to take a feature from idea/wireframe to a PR-ready commit on a feature branch in the 531 codebase.

## Execution mode: agent team

This pipeline uses **agent team** mode. The orchestrator creates one team containing all three agents and assigns coordinated tasks. The agents communicate directly via `SendMessage` and share progress via `TaskCreate`/`TaskUpdate`. The orchestrator monitors progress and owns the final commit.

## Team composition

| Member | Agent type | Role | Skill | Primary output |
|---|---|---|---|---|
| `rn-designer` | rn-designer (custom) | Turn idea/wireframe into design spec | `rn-design-spec` | `_workspace/01_design_spec.md` |
| `rn-frontend` | rn-frontend (custom) | Implement spec in RN/Expo with local verification | `rn-feature-implementation` | source edits + `_workspace/02_implementation_log.md` |
| `rn-qa` | rn-qa (custom) | Verify spec compliance, boundaries, PWA parity | `rn-feature-qa` | `_workspace/03_qa_report.md` |

All three agents use `model: "opus"`.

## Pipeline scope

- **Starts at:** idea / description / wireframe
- **Ends at:** PR-ready commit on a local feature branch named `feat/<slug>` (or `auto/<slug>` if invoked via batch). Does NOT push, does NOT open a PR, does NOT merge.
- **Does NOT touch:** the retired `initial-implement` queue machinery (now under `docs/_retired/`). This pipeline is the idea-driven entry; unattended self-improvement runs through the `/do-work` loop.

## Workflow

### Phase 0: Context check (followup support)

Before doing anything, determine the execution mode:

1. Check whether `_workspace/` exists at the repo root.
2. Decide:
   - **`_workspace/` missing** → initial run. Proceed to Phase 1.
   - **`_workspace/` exists AND user requests revision of a specific stage** ("redo the spec", "fix QA findings", "re-run QA only") → **partial re-run**. Skip stages that are not affected. Pass existing artifacts to the affected agent so it can revise rather than rewrite.
   - **`_workspace/` exists AND user provides a new brief (different feature)** → **new run**. Move existing `_workspace/` to `_workspace_archive/<YYYYMMDD-HHMMSS>/` and create a fresh `_workspace/`.
3. For partial re-runs, the affected agent receives the path to the existing artifact and instructions to revise.

| User said | Stages to re-run |
|---|---|
| "Update the design spec to ..." | designer only; then if implementation exists, frontend re-implements affected parts; QA re-runs |
| "Fix the QA findings" | frontend only; then QA re-runs |
| "Re-run QA" | QA only |
| "Redo everything based on this new wireframe" | new run (archive previous) |

### Phase 1: Intake

1. Create a TodoWrite list mirroring the phase plan so the user can see progress.
2. Capture the user's brief to `_workspace/00_input/brief.md` (verbatim, plus any attached wireframe paths/links).
3. If the user references PWA screens by name, search `~/Development/531-pwa/src/` for matches and write `_workspace/00_input/pwa_refs.md` listing the candidate file paths. If unsure, ask the user once which path is the right one before spawning the team.
4. Derive a slug for the feature from the brief (lowercase, hyphenated, ≤40 chars).
5. Create a working git branch:
   ```bash
   git checkout -b feat/<slug>
   ```
   If the branch already exists (partial re-run), switch to it.

### Phase 2: Team setup

1. Create the team:
   ```
   TeamCreate(
     team_name: "rn-expo-pipeline-team",
     members: [
       { name: "rn-designer", agent_type: "rn-designer", model: "opus",
         prompt: "You are rn-designer. Read _workspace/00_input/, follow .claude/skills/rn-design-spec/SKILL.md, write _workspace/01_design_spec.md. Notify rn-frontend when ready. See .claude/agents/rn-designer.md for the full protocol." },
       { name: "rn-frontend", agent_type: "rn-frontend", model: "opus",
         prompt: "You are rn-frontend. Wait for design handoff from rn-designer. Follow .claude/skills/rn-feature-implementation/SKILL.md to implement. Run typecheck+lint+test (+Metro export if import graph changed). Notify rn-qa when green. See .claude/agents/rn-frontend.md for the full protocol." },
       { name: "rn-qa", agent_type: "rn-qa", model: "opus",
         prompt: "You are rn-qa. Wait for implementation handoff from rn-frontend. Follow .claude/skills/rn-feature-qa/SKILL.md. Run the full QA matrix. Write _workspace/03_qa_report.md. PASS → notify orchestrator; FAIL → notify rn-frontend with must-fix list. See .claude/agents/rn-qa.md for the full protocol." }
     ]
   )
   ```

2. Register the work in the shared task list:
   ```
   TaskCreate(tasks: [
     { id: "design",    title: "Produce design spec",                 assignee: "rn-designer" },
     { id: "implement", title: "Implement spec",                      assignee: "rn-frontend", depends_on: ["design"] },
     { id: "qa",        title: "Verify implementation against spec",  assignee: "rn-qa",       depends_on: ["implement"] }
   ])
   ```

### Phase 3: Design

**Execution:** `rn-designer` claims the `design` task and works.

The orchestrator monitors:
- If designer asks an Open Question via SendMessage, relay to the user and pass the answer back.
- If designer marks the task `completed`, read `_workspace/01_design_spec.md` to confirm the required sections are present (Intent, PWA reference, Screens & flow, Per-screen breakdown, Data contract, Domain logic, New primitives, Out of scope, Open questions).
- If Open questions is non-empty, PAUSE the pipeline and surface them to the user. Do not proceed to implementation with unresolved design questions.

### Phase 4: Implementation

**Execution:** `rn-frontend` claims the `implement` task and works.

The orchestrator monitors:
- If frontend asks the designer for clarification via SendMessage, that loop runs without orchestrator intervention.
- If frontend marks the task `completed`, confirm `_workspace/02_implementation_log.md` contains a `## Verification` section showing typecheck/lint/test all exit 0 (and Metro export exit 0 if applicable).
- If verification output shows any failure, demote the task back to `in_progress` with a note and let frontend continue.

### Phase 5: QA

**Execution:** `rn-qa` claims the `qa` task and works.

The orchestrator monitors:
- If QA report PASS → mark `qa` complete, proceed to Phase 6.
- If QA report FAIL → reset `implement` task to `in_progress` with the must-fix list attached. Frontend addresses; QA re-runs. Loop up to **3 times**.
- After 3 failed QA cycles: STOP. Surface findings to the user, do NOT commit. Pipeline ends with the team intact so the user can intervene.

### Phase 6: Commit (PR-ready, no push)

When QA reports PASS:

1. Confirm the working tree contains the intended changes:
   ```bash
   git status
   git diff --stat main...HEAD
   ```
2. Stage and commit on the feature branch using a conventional commit message derived from the brief:
   ```bash
   git add <specific paths from implementation log — NOT git add .>
   git commit -m "$(cat <<'EOF'
   feat(<scope>): <short summary from brief>

   <one-paragraph description>

   Design spec: _workspace/01_design_spec.md
   Impl log:    _workspace/02_implementation_log.md
   QA report:   _workspace/03_qa_report.md

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
3. Do NOT push. Do NOT open a PR. The user owns shipping.

### Phase 7: Cleanup & handoff

1. SendMessage all team members to wind down.
2. `TeamDelete("rn-expo-pipeline-team")`.
3. **Preserve `_workspace/`** — do not delete. It is the audit trail and feeds follow-up runs.
4. Report to the user:
   - Branch name + commit SHA
   - Summary of files changed (from git diff --stat)
   - QA summary (one line)
   - Pointer to the spec / log / report files
   - Next-step suggestion: `git push -u origin feat/<slug>` then `gh pr create`.

## Data flow

```
[user brief / wireframe]
        │
        ▼
[orchestrator] ──► _workspace/00_input/brief.md
        │           _workspace/00_input/pwa_refs.md (if any)
        │
        ▼
[TeamCreate + TaskCreate]
        │
        ▼
[rn-designer] ──► _workspace/01_design_spec.md ──SendMessage──► [rn-frontend]
        ▲                                                              │
        │   (clarifications via SendMessage)                           │
        │                                                              ▼
        │                                              src/ edits + _workspace/02_implementation_log.md
        │                                                              │
        │                                                  SendMessage─┘
        │                                                              ▼
        │                                                       [rn-qa]
        │                                                              │
        │                                                              ▼
        │                                              _workspace/03_qa_report.md
        │                                                              │
        │                                            ┌─────PASS────────┘
        │                                            │
        │                                            ▼
        │                                  [orchestrator commits on feat/<slug>]
        │
        │                            (FAIL path) ◄────────── [rn-qa] FAIL → [rn-frontend] fix → re-QA
        │                                                       up to 3 cycles
        │
        └─── (spec-defect finding) ◄── [rn-qa] flags spec issue → [rn-designer] amends
```

## Error handling

| Situation | Strategy |
|---|---|
| Designer raises open questions | Pause and surface to user. Resume only after answered + spec updated. |
| Frontend can't verify locally (tool failure) | 1 retry; if still failing, surface verbatim error to user; pause team |
| QA reports FAIL | Loop frontend → QA up to 3 times. After 3rd, stop and surface |
| Spec found defective by QA | Reassign QA→designer SendMessage; designer amends spec; frontend re-implements affected sections; QA re-runs |
| Team member goes idle unexpectedly | Orchestrator receives idle notification; SendMessage to check status; restart if needed |
| Working tree dirty before Phase 1 | STOP. Tell user to commit/stash first; do not auto-stash |
| Branch `feat/<slug>` already exists with unrelated work | STOP. Tell user; do not auto-overwrite |

## Test scenarios

### Normal flow (port a PWA screen)
1. User: "Port the Today screen — wireframe is in the PWA already"
2. Phase 1 finds `~/Development/531-pwa/src/screens/Today.tsx`; writes `pwa_refs.md`
3. Phase 2 creates team + 3 tasks
4. Designer produces spec referencing the PWA file (~10 min equivalent)
5. Frontend implements: domain math TDD, accessor + hook, screen component, route shell. All local checks green.
6. QA matrix runs: all PASS. Static + boundary + cross-layer + PWA parity all match.
7. Orchestrator commits on `feat/today-screen`.
8. User sees branch + commit SHA in report. Manually pushes / opens PR.

### Error flow (QA finds a shape mismatch)
1. Designer + frontend complete as normal.
2. QA cross-layer check finds: accessor returns `{ id, ... }` but hook destructures `{ sessionId, ... }` and component reads `data.sessionId`.
3. QA report FAIL; SendMessage to frontend with finding.
4. Frontend renames hook destructure + component reads to `id`. Re-runs static checks. Notifies QA.
5. QA re-runs full matrix. PASS this time.
6. Orchestrator commits.

### Followup flow (partial re-run after user feedback)
1. Pipeline previously completed; `_workspace/` exists.
2. User: "Change the empty state copy to 'No workouts yet' and re-verify"
3. Phase 0 detects partial re-run; designer revises spec (single section); appends `## Revision` block.
4. Frontend updates the one component file; reruns local checks.
5. QA re-runs the spec compliance pass on the affected screen + a full boundary sweep for regressions.
6. PASS → new commit on the same `feat/<slug>` branch.

## Followup-trigger keywords

The description above lists these for trigger reliability. Reiterating here for the human reader: "revise the spec", "fix the QA findings", "re-run QA only", "redo the design", "update implementation based on feedback", "rerun pipeline".

## What this skill does NOT do

- Does NOT push or open a PR (user owns shipping).
- Does NOT merge to main (user owns merge).
- Does NOT modify the retired `initial-implement` queue machinery (now under `docs/_retired/`).
- Does NOT delete `_workspace/` (audit trail).
- Does NOT touch `~/Development/531-pwa/` (read-only reference).
- Does NOT skip QA or commit on FAIL (no exceptions).

## Followup support — how the orchestrator handles re-runs

Re-read Phase 0 every invocation. Look at `_workspace/` state and the user's exact words to decide initial / partial / new run. Communicate the decision to the user before spawning the team ("Running partial re-run: designer only, then re-QA"). The user can override.
