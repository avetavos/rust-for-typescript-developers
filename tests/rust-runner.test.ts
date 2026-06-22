import { describe, it, expect } from 'vitest';
import { runRust } from '../src/components/rust-runner';

function fakeFetch(payload: object): typeof fetch {
  return (async () => new Response(JSON.stringify(payload), { status: 200 })) as unknown as typeof fetch;
}

describe('rust-runner', () => {
  it('returns stdout on success', async () => {
    const res = await runRust('fn main(){}', fakeFetch({ success: true, stdout: 'hi\n', stderr: 'Compiling...' }));
    expect(res.output).toBe('hi\n');
    expect(res.errors).toBe('');
  });
  it('returns stderr (compiler error) on failure', async () => {
    const res = await runRust('bad', fakeFetch({ success: false, stdout: '', stderr: 'error[E0382]: borrow of moved value' }));
    expect(res.errors).toMatch(/E0382/);
  });
  it('handles network errors gracefully', async () => {
    const failing = (async () => { throw new Error('net'); }) as unknown as typeof fetch;
    const res = await runRust('x', failing);
    expect(res.errors).toMatch(/unavailable/i);
  });
});
