export type RunResult = { output: string; errors: string };

const ENDPOINT = 'https://play.rust-lang.org/execute';

export async function runRust(source: string, fetchImpl: typeof fetch = fetch): Promise<RunResult> {
  const body = {
    channel: 'stable',
    mode: 'debug',
    edition: '2021',
    crateType: 'bin',
    tests: false,
    backtrace: false,
    code: source,
  };
  try {
    const r = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await r.json()) as { success: boolean; stdout: string; stderr: string };
    if (data.success) return { output: data.stdout ?? '', errors: '' };
    return { output: data.stdout ?? '', errors: data.stderr || 'Compilation failed' };
  } catch {
    return { output: '', errors: 'Run service unavailable — try "Open in Rust Playground".' };
  }
}
