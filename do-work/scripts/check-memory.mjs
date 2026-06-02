#!/usr/bin/env node
// Validates the do-work memory tree is well-formed. Exits non-zero on any problem.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'); // do-work/
const errors = [];

// 531's design spec lives at docs/DESIGN.md (outside do-work/), so it is not
// listed here. These five files are the durable memory tree the loop relies on.
const REQUIRED = [
  'SOUL.md',
  'DOCTRINE.md',
  'work/backlog.md',
  'work/validation-debt.md',
  'work/LOG.md',
];
for (const rel of REQUIRED) {
  if (!existsSync(join(ROOT, rel))) errors.push(`missing required file: do-work/${rel}`);
}

// Parse backlog items: "## <ID>: <Title>" then "- key: value" lines.
const backlogPath = join(ROOT, 'work/backlog.md');
if (existsSync(backlogPath)) {
  const text = readFileSync(backlogPath, 'utf8');
  const items = {};
  let current = null;
  for (const line of text.split('\n')) {
    const h = line.match(/^##\s+(\S+):\s+(.+)$/);
    if (h) {
      current = h[1];
      items[current] = { title: h[2].trim(), body: [] };
      continue;
    }
    if (!current) continue;
    items[current].body.push(line);
    const kv = line.match(/^-\s+(status|blocked_by|proof):\s*(.+)$/);
    if (kv) items[current][kv[1]] = kv[2].trim();
  }
  const ids = new Set(Object.keys(items));
  if (ids.size === 0) errors.push('work/backlog.md has no items');
  const STATUSES = new Set(['todo', 'doing', 'done', 'blocked']);
  for (const [id, item] of Object.entries(items)) {
    for (const field of ['status', 'blocked_by', 'proof']) {
      if (!item[field]) errors.push(`item ${id}: missing "${field}"`);
    }
    if (item.status && !STATUSES.has(item.status)) {
      errors.push(`item ${id}: invalid status "${item.status}"`);
    }
    if (item.blocked_by && item.blocked_by !== 'none') {
      for (const dep of item.blocked_by.split(',').map((s) => s.trim())) {
        if (!ids.has(dep)) errors.push(`item ${id}: blocked_by unknown id "${dep}"`);
      }
    }
    // Definition-of-done invariant. A done-when checklist uses GFM checkboxes; an
    // item may only be `done` when EVERY criterion is checked. This makes "is the
    // blocker finished?" a mechanical check, not a judgment call, so blocked_by
    // chains are trustworthy. Items without checkboxes are unaffected (legacy
    // prose-proof items).
    const unchecked = (item.body || []).filter((l) => /^\s*-\s+\[ \]\s+/.test(l)).length;
    if (item.status === 'done' && unchecked > 0) {
      errors.push(
        `item ${id}: status is "done" but has ${unchecked} unchecked done-when criteria (\`- [ ]\`)`,
      );
    }
  }
}

if (errors.length) {
  console.error('do-work memory check FAILED:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('do-work memory check OK');
