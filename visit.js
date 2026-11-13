(() => {
  'use strict';
  const origin = 'https://grid-robotics-official.github.io';
  const prefix = '/agentic-robotics-roadmap/';
  const endpoint = 'https://grid-roadmap-analytics.pages.dev/__visit';
  const queryKeys = ['lang', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  if (location.origin !== origin || !location.pathname.startsWith(prefix) ||
      window.__githubRoadmapVisitInstalled || typeof fetch !== 'function' ||
      typeof globalThis.crypto?.randomUUID !== 'function') return;
  window.__githubRoadmapVisitInstalled = true;
  let pending = true;
  let navigation = 'load';

  function safeReferrer() {
    try {
      const url = new URL(document.referrer);
      return ['http:', 'https:'].includes(url.protocol) ? (url.origin + url.pathname).slice(0, 1024) : '';
    } catch {
      return '';
    }
  }

  function transmit(body, attempt = 0) {
    // Explicitly omit credentials; retries reuse this event's UUID.
    try {
      fetch(endpoint, { method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body,
        referrerPolicy: 'no-referrer', cache: 'no-store',
      }).then((result) => {
        if (attempt === 0 && result.status >= 500) setTimeout(() => transmit(body, 1), 1000);
      }).catch(() => {
        if (attempt === 0) setTimeout(() => transmit(body, 1), 1000);
      });
    } catch {
      // Analytics failures must not interrupt the website.
    }
  }

  function flush() {
    if (!pending || document.prerendering || document.visibilityState !== 'visible') return;
    pending = false;
    if (location.origin !== origin || !location.pathname.startsWith(prefix)) return;
    try {
      const source = new URL(location.href);
      const url = new URL(source.pathname, origin);
      for (const key of queryKeys) {
        const value = source.searchParams.get(key);
        if (value) url.searchParams.set(key, value.slice(0, 128));
      }
      if (url.href.length > 2048) return;
      const body = JSON.stringify({ event_id: crypto.randomUUID(), url: url.href,
        referrer: safeReferrer(), language: (navigator.language || '').slice(0, 64),
        navigation_type: navigation });
      if (new TextEncoder().encode(body).byteLength <= 4096) transmit(body);
    } catch {
      // Never change page behavior for an unavailable analytics capability.
    }
  }

  document.addEventListener('visibilitychange', flush);
  document.addEventListener('prerenderingchange', flush);
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    pending = true;
    navigation = 'back_forward';
    flush();
  });
  flush();
})();
