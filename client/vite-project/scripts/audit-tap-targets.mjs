import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const PORT = 9339;

const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
   `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-tap-profile', 'about:blank'],
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
    } catch {}
    await sleep(250);
  }
  throw new Error('no target');
}
class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout')); } }, 20000);
    });
  }
}
const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new CDP(ws);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

async function evaluate(expr) {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval fail');
  return r.result.value;
}

const AUDIT = `
  (() => {
    const sel = 'a[href], button, input, select, textarea, [role="button"], [role="tab"], [role="switch"]';
    const small = [];
    const seen = new Set();
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (cs.opacity === '0') continue;
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.tagName).trim().slice(0, 40);
      // skip inputs/textarea (text targets are naturally short) unless tiny in both dims
      const isTextField = ['INPUT','TEXTAREA','SELECT'].includes(el.tagName);
      if (isTextField) continue;
      if (r.height < 32 || r.width < 32) {
        const key = text + '|' + Math.round(r.width) + 'x' + Math.round(r.height);
        if (seen.has(key)) continue;
        seen.add(key);
        small.push({ text, tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), cls: el.className.toString().slice(0, 90) });
      }
    }
    return small;
  })()
`;

const routes = ['/', '/features', '/about', '/courselist', '/genchat', '/course', '/coursecontent'];
const report = {};
for (const route of routes) {
  await cdp.send('Page.navigate', { url: BASE + route });
  await sleep(1600);
  report[route] = await evaluate(AUDIT);
}

console.log(JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
process.exit(0);
