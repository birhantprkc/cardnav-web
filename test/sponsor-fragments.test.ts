import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

test('visible sponsor sections refresh, clear failed content and resume after hiding', async () => {
  const listeners = new Map<string, () => void>();
  const timers = new Map<number, () => void>();
  let timerId = 0;
  let failing = false;
  let requests = 0;
  const container = {
    dataset: { sponsorFragment: '/api/sponsors?placement=page-bottom&pageType=about&locale=en' },
    innerHTML: '',
    replaceChildren() { this.innerHTML = ''; },
  };
  const document = {
    hidden: false,
    querySelectorAll: () => [container],
    addEventListener: (name: string, handler: () => void) => listeners.set(name, handler),
  };
  vm.runInNewContext(await readFile(new URL('../src/scripts/sponsor-fragments.js', import.meta.url), 'utf8'), {
    document, window: { addEventListener() {} }, console: { error() {} },
    AbortSignal,
    setTimeout: (handler: () => void) => { timers.set(++timerId, handler); return timerId; },
    clearTimeout: (id: number) => timers.delete(id),
    fetch: async () => {
      requests++;
      if (failing) throw new Error('Network unavailable');
      return { ok: true, text: async () => '<section>Current sponsor</section>' };
    },
  });
  const settle = () => new Promise<void>(resolve => setImmediate(resolve));
  await settle();
  assert.equal(container.innerHTML, '<section>Current sponsor</section>');
  failing = true;
  [...timers.values()][0]();
  await settle();
  assert.equal(container.innerHTML, '');
  document.hidden = true;
  listeners.get('visibilitychange')!();
  assert.equal(timers.size, 0);
  failing = false;
  document.hidden = false;
  listeners.get('visibilitychange')!();
  await settle();
  assert.equal(requests, 3);
  assert.equal(container.innerHTML, '<section>Current sponsor</section>');
});
