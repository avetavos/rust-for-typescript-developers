// Compiles (and runs) every ```rust fence and every `export const xxxCode = `...`` literal in the
// EN lessons with the local stable rustc (edition 2024) and reports failures.
// Markers on line 1 of a snippet:
//   // @expect-error E0382 E0499   — must FAIL to compile with exactly these error codes
//   // @expect-error nocode        — must FAIL to compile with an uncoded diagnostic (no error[EXXXX])
//   // @skip-verify <reason>       — illustrative fragment / needs crates / stdin
//   // @no-run                     — compile only (long-running, threads with sleep, etc.)
//   // @expect-panic               — compiles, and the run must exit non-zero (panic)
// Snippets containing #[test] are built with `rustc --test` and the test binary is run (all tests must pass).
// A snippet without `fn main` is wrapped in `fn main() { ... }` for the check (reported as WRAP).
// Usage: node tools/verify-snippets.mjs [pathFilter] [--emit]
//   --emit writes each named literal's real stdout to .verify/outputs.json (file -> name -> output).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

// The `cargo`/`rustc` on PATH may be wrapped (rtk), and even `rustup which rustc`
// tracks whatever "stable" has drifted to (it self-updated mid-session once
// already). Pin to the exact 1.96.1 toolchain this course is verified against.
const RUSTC = spawnSync('rustup', ['which', '--toolchain', '1.96.1', 'rustc'], { encoding: 'utf8' }).stdout.trim() || 'rustc';

const args = process.argv.slice(2);
const emit = args.includes('--emit');
const filter = args.find((a) => !a.startsWith('--')) ?? '';
const root = 'src/content/docs/en';
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') && p.includes(filter) && files.push(p); } })(root);
const codesOf = (out) => [...new Set([...out.matchAll(/error\[(E\d{4})\]/g)].map((m) => m[1]))].sort();
const outputs = {};
let n = 0, failed = 0, skipped = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const snippets = [...src.matchAll(/```rust\n([\s\S]*?)```/g)].map((m) => ({ name: null, body: m[1] }))
    .concat([...src.matchAll(/export const (\w+Code) = `((?:[^`\\]|\\[\s\S])*)`/g)].map((m) => ({ name: m[1], body: Function('return `' + m[2] + '`')() })));
  let i = 0;
  for (const { name, body } of snippets) {
    i++; n++;
    const first = body.split('\n')[0];
    const skip = first.match(/^\/\/ @skip-verify(.*)$/);
    if (skip) { skipped++; console.log(`SKIP ${f}#${i}${skip[1] ? ' —' + skip[1] : ''}`); continue; }
    const expect = (first.match(/^\/\/ @expect-error (.+)$/)?.[1] ?? '').split(/\s+/).filter(Boolean).sort();
    const noRun = /^\/\/ @no-run/.test(first);
    const expectPanic = /^\/\/ @expect-panic/.test(first);
    // Snippets with #[test] are compiled as a test harness (`rustc --test`) and the test binary is run,
    // so code inside #[cfg(test)] is really type-checked instead of being cfg'd away.
    const isTest = /#\[test\]/.test(body);
    const wrap = !isTest && !/\bfn\s+main\s*\(/.test(body);
    const code = wrap ? `fn main() {\n${body}\n}\n` : body;
    const dir = `.verify/${f.replace(/[\/.]/g, '_')}`;
    mkdirSync(dir, { recursive: true });
    const srcFile = `${dir}/snippet${i}.rs`, bin = `${dir}/snippet${i}.bin`;
    writeFileSync(srcFile, code);
    const c = spawnSync(RUSTC, ['--edition', '2024', '-A', 'warnings', ...(isTest ? ['--test'] : []), '-o', bin, srcFile], { encoding: 'utf8', timeout: 120000 });
    const cerr = (c.stdout ?? '') + (c.stderr ?? '');
    const codes = codesOf(cerr);
    let ok, line = `${f}#${i}${name ? ` (${name})` : ''}${wrap ? ' WRAP' : ''}${isTest ? ' TEST' : ''}`;
    if (expect.length) {
      // `// @expect-error nocode` = must fail to compile with a diagnostic that carries no E-code
      // (e.g. the edition-2024 match-ergonomics errors).
      const want = expect.filter((e) => e !== 'nocode');
      ok = c.status !== 0 && JSON.stringify(codes) === JSON.stringify(want);
      line += ` expect[${expect}] got[${codes}]`;
    } else if (c.status !== 0) {
      ok = false; line += ` compile-error[${codes}]\n` + cerr.split('\n').slice(0, 8).join('\n');
    } else if (noRun) {
      ok = true; line += ' (compile only)';
    } else {
      const r = spawnSync(resolve(bin), [], { encoding: 'utf8', timeout: 20000, cwd: dir });
      ok = expectPanic ? r.status !== 0 : r.status === 0;
      if (!ok) line += ` run exit=${r.status}\n` + ((r.stdout ?? '') + (r.stderr ?? '')).trim().split('\n').slice(0, 6).join('\n');
      if (ok && name) (outputs[f] ??= {})[name] = (r.stdout ?? '').replace(/\n$/, '');
      rmSync(bin, { force: true });
    }
    if (!ok) failed++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${line}`);
  }
}
if (emit) { mkdirSync('.verify', { recursive: true }); writeFileSync('.verify/outputs.json', JSON.stringify(outputs, null, 2)); console.log('wrote .verify/outputs.json'); }
console.log(`${n} snippets, ${failed} failed, ${skipped} skipped (rustc ${spawnSync(RUSTC, ['--version'], { encoding: 'utf8' }).stdout.trim()})`);
process.exit(failed ? 1 : 0);
