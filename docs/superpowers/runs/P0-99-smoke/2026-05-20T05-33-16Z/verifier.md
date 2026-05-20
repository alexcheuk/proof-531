{
  "task_id": "P0-99-smoke",
  "result": "pass",
  "harness": {
    "install": "pass",
    "typecheck": "pass",
    "lint": "pass",
    "test": "pass"
  },
  "criteria": [
    {"criterion": "apps/mobile/SMOKE.md exists", "result": "pass", "evidence": "test -f"},
    {"criterion": "apps/mobile/SMOKE.md contains 'orchestrator smoke ok'", "result": "pass", "evidence": "grep -q"},
    {"criterion": "pnpm typecheck passes", "result": "pass", "evidence": "exit 0"},
    {"criterion": "pnpm lint passes", "result": "pass", "evidence": "exit 0"}
  ],
  "summary": "Smoke test simulated all four orchestrator components end-to-end."
}
