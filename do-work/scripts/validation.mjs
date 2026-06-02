#!/usr/bin/env node
import { execSync } from 'node:child_process';
// do-work validation state machine for UI-validation debt.
//
// The loop ships UI changes immediately and tracks the resulting validation
// debt here rather than blocking each commit on a device build. At a milestone
// it runs build-and-validate.sh out of band and ingests the verdict next tick.
//
// Subcommands:
//   debt
//     Print how many UI-affecting commits have landed since the last validated
//     marker. A commit counts as UI-affecting when it touches any path under the
//     mobile source tree (see the UI array). Read this to decide when the debt
//     is high enough to spend a build-and-validate cycle.
//
//   status
//     Print the last-validated marker and any build records in do-work/builds/.
//
//   ingest <commit> <PASS|FAIL> [findingsFile]
//     Record a build-and-validate verdict. On PASS the last-validated marker
//     advances to <commit>, zeroing the debt up to that point. On FAIL the
//     findings are appended to work/validation-debt.md for the next tick to act
//     on and the marker is left where it was. In both cases a header line is
//     appended to the ledger: "### <commit>: <PASS|FAIL>".
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DW = join(dirname(fileURLToPath(import.meta.url)), '..'); // do-work/
const BUILDS = join(DW, 'builds');
const MARKER = join(BUILDS, 'last-validated');
const DEBT_MD = join(DW, 'work', 'validation-debt.md');
// In proof-531 every source path is repo-root-relative (e.g. "apps/mobile/src/...").
// Match the whole mobile source tree; a bare "features/" prefix would match nothing
// and silently yield an always-zero debt ledger.
const UI = ['apps/mobile/src/'];
const sh = (c) => execSync(c, { encoding: 'utf8' }).trim();

function lastValidated() {
  return existsSync(MARKER) ? readFileSync(MARKER, 'utf8').trim() : '';
}
function uiCommitsSince(sha) {
  const range = sha ? `${sha}..HEAD` : 'HEAD';
  const log = sh(`git log --format=%H ${range}`).split('\n').filter(Boolean);
  const debt = [];
  for (const c of log) {
    const files = sh(`git show --name-only --format= ${c}`).split('\n').filter(Boolean);
    if (files.some((f) => UI.some((p) => f.startsWith(p)))) debt.push(c.slice(0, 8));
  }
  return debt;
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'debt') {
  const sha = lastValidated();
  const debt = uiCommitsSince(sha);
  console.log(`last-validated: ${sha || '(none)'}`);
  console.log(
    `UI-affecting commits since: ${debt.length}${debt.length ? ` [${debt.join(', ')}]` : ''}`,
  );
} else if (cmd === 'status') {
  console.log(`last-validated: ${lastValidated() || '(none)'}`);
  const builds = existsSync(BUILDS)
    ? sh(`ls ${BUILDS}`)
        .split('\n')
        .filter((f) => f.endsWith('.json'))
    : [];
  console.log(`build records: ${builds.join(', ') || '(none)'}`);
} else if (cmd === 'ingest') {
  // ingest <commit> <PASS|FAIL> [findingsFile]
  const [commit, result, findingsFile] = args;
  if (!commit || !result) {
    console.error('usage: ingest <commit> <PASS|FAIL> [findingsFile]');
    process.exit(2);
  }
  const findings =
    findingsFile && existsSync(findingsFile)
      ? readFileSync(findingsFile, 'utf8').trim()
      : '(no findings file)';
  appendFileSync(DEBT_MD, `\n### ${commit}: ${result}\n${findings}\n`);
  if (result === 'PASS') {
    mkdirSync(BUILDS, { recursive: true });
    writeFileSync(MARKER, `${commit}\n`);
    console.log(`PASS -> last-validated advanced to ${commit}`);
  } else {
    console.log(
      `FAIL recorded for ${commit}; findings appended to validation-debt.md for next tick`,
    );
  }
} else {
  console.error('usage: validation.mjs debt | status | ingest <commit> <PASS|FAIL> [findingsFile]');
  process.exit(2);
}
