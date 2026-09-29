/** Live sponsor sections stay independent from cached page HTML. */
const requests = new Map();
function requestFragment(url) {
  if (!requests.has(url)) {
    requests.set(url, fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) }).then(async response => {
      if (!response.ok) throw new Error(`Sponsor request failed: ${response.status}`);
      return response.text();
    }).finally(() => requests.delete(url)));
  }
  return requests.get(url);
}

for (const container of document.querySelectorAll('[data-sponsor-fragment]')) {
  let timer;
  let inFlight = false;
  async function refresh() {
    clearTimeout(timer);
    if (inFlight) return;
    inFlight = true;
    try {
      container.innerHTML = await requestFragment(container.dataset.sponsorFragment);
    } catch (error) {
      container.replaceChildren();
      console.error('Unable to load sponsors', error);
    } finally {
      inFlight = false;
      if (!document.hidden) timer = setTimeout(refresh, 60_000);
    }
  }
  void refresh();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else void refresh();
  });
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', event => { if (event.persisted) void refresh(); });
}
