import { useState } from 'preact/hooks';
import { runRust } from './rust-runner';

export default function Playground({ code }: { code: string }) {
  const [out, setOut] = useState<string | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true); setErr(''); setOut(null);
    try {
      const data = await runRust(code);
      setErr(data.errors || ''); setOut(data.output ?? '');
    } catch {
      setErr('Run failed — try "Open in Rust Playground".');
    } finally { setLoading(false); }
  }

  return (
    <div class="pg">
      <div class="pg__bar">
        <button class="pg__run" onClick={run} disabled={loading}>{loading ? 'Running…' : 'Run ▸'}</button>
        <a class="pg__run" href="https://play.rust-lang.org/" target="_blank" rel="noopener" onClick={() => navigator.clipboard.writeText(code)}>Open in Rust Playground</a>
      </div>
      <pre><code>{code}</code></pre>
      {loading && <p class="pg__hint">Compiling…</p>}
      {err && <pre class="pg__err"><code>{err}</code></pre>}
      {out !== null && <pre class="pg__out"><code>{out || '(no output)'}</code></pre>}
    </div>
  );
}
