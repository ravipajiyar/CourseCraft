/**
 * Headless Chrome verification harness (dev-only, not part of the app).
 *
 * Boots Chrome with the DevTools protocol, visits every route, captures
 * console/page errors, asserts a set of computed styles, and writes
 * screenshots to /tmp/shots.
 *
 *   node scripts/verify-ui.mjs
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = '/tmp/shots';
const PORT = 9333;

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/chrome-verify-profile',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await res.json();
      const page = tabs.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error('Chrome did not expose a debugging target');
}

/* --------------------------------------------------------------- CDP client */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.listeners.forEach((fn) => fn(msg));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 20000);
    });
  }
  on(fn) {
    this.listeners.push(fn);
  }
}

const routes = [
  { path: '/', name: 'landing', wait: 1200 },
  { path: '/features', name: 'features', wait: 900 },
  { path: '/about', name: 'about', wait: 900 },
  { path: '/courselist', name: 'courselist', wait: 900 },
  { path: '/genchat', name: 'genchat', wait: 900 },
  { path: '/course', name: 'course-empty', wait: 900 },
  { path: '/coursecontent', name: 'coursecontent-empty', wait: 900 },
  { path: '/definitely-missing', name: 'notfound', wait: 900 },
];

const results = [];

const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new CDP(ws);

await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Log.enable');

let errors = [];
cdp.on((msg) => {
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    errors.push(
      `exception: ${d.exception?.description || d.text} @ ${
        d.url || ''
      }:${d.lineNumber}`
    );
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push(
      `console.error: ${msg.params.args
        .map((a) => a.description || a.value)
        .join(' ')}`
    );
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    errors.push(`log: ${msg.params.entry.text} ${msg.params.entry.url || ''}`);
  }
});

async function evaluate(expr) {
  const r = await cdp.send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
  }
  return r.result.value;
}

for (const route of routes) {
  errors = [];
  await cdp.send('Page.navigate', { url: BASE + route.path });
  await sleep(route.wait);

  const probe = await evaluate(`(() => {
    const pick = (sel) => document.querySelector(sel);
    const cs = (el, props) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)]));
    };
    const body = pick('body');
    const h1 = pick('h1');
    const nav = pick('nav');
    const footer = pick('footer');
    const btn = pick('.btn-brand');
    const glass = pick('.glass, .glass-strong');
    const svg = pick('svg');
    return {
      title: document.title,
      textLen: document.body.innerText.trim().length,
      bodyBg: body ? getComputedStyle(body).backgroundColor : null,
      bodyColor: body ? getComputedStyle(body).color : null,
      bodyFont: body ? getComputedStyle(body).fontFamily : null,
      h1: h1 ? { text: h1.innerText.slice(0, 70), fontSize: getComputedStyle(h1).fontSize } : null,
      nav: cs(nav, ['position', 'background-color', 'backdrop-filter']),
      footerPresent: !!footer,
      btn: cs(btn, ['background-image', 'border-radius', 'color']),
      glass: cs(glass, ['background-color', 'backdrop-filter', 'border-top-width']),
      svgCount: document.querySelectorAll('svg').length,
      emptyIconSpans: document.querySelectorAll('i.fas, i.fa-solid').length,
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  })()`);

  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  });
  writeFileSync(`${OUT}/${route.name}.png`, Buffer.from(shot.data, 'base64'));

  results.push({ route: route.path, probe, errors: [...errors] });
}

console.log(JSON.stringify(results, null, 2));

ws.close();
chrome.kill();
process.exit(0);
