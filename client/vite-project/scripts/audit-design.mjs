import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const PORT = 9341;

const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
   `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-audit-profile', 'about:blank'],
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
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout')); } }, 25000);
    });
  }
}
const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new CDP(ws);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

async function evaluate(expr) {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval fail');
  return r.result.value;
}

const AUDIT = `
  (() => {
    const lum = (c) => {
      const [r,g,b] = c.match(/\\d+(\\.\\d+)?/g).slice(0,3).map(Number).map(v => {
        v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
      });
      return 0.2126*r + 0.7152*g + 0.0722*b;
    };
    const parse = (c) => {
      const m = c.match(/rgba?\\(([^)]+)\\)/);
      if (!m) return null;
      const p = m[1].split(',').map(s => parseFloat(s));
      return { rgb: p.slice(0,3), a: p.length > 3 ? p[3] : 1 };
    };
    const effectiveBg = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const c = parse(getComputedStyle(node).backgroundColor);
        if (c && c.a > 0.85) return c.rgb;
        node = node.parentElement;
      }
      return [5,5,10];
    };
    const contrast = (fg, bg) => {
      const L1 = lum('rgb(' + fg.join(',') + ')'), L2 = lum('rgb(' + bg.join(',') + ')');
      const [hi,lo] = L1 > L2 ? [L1,L2] : [L2,L1];
      return (hi + 0.05) / (lo + 0.05);
    };

    const lowContrast = [];
    const lightBleed = [];   // light background behind dark text (legacy light theme)
    const badRadius = [];
    const seen = new Set();

    for (const el of document.querySelectorAll('p, span, a, li, h1, h2, h3, h4, button, label, td, th')) {
      const text = (el.textContent || '').trim();
      if (!text || el.children.length > 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.15) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.color === 'rgba(0, 0, 0, 0)') continue; // gradient text

      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = effectiveBg(el);
      const cr = contrast(fg.rgb, bg);

      const key = cs.color + '|' + bg.join(',');
      if (cr < 4.5 && !seen.has(key)) {
        seen.add(key);
        lowContrast.push({ text: text.slice(0,34), color: cs.color, bg: 'rgb(' + bg.join(',') + ')', ratio: Math.round(cr*100)/100 });
      }
      // legacy light theme: near-white solid bg with dark text
      const isLight = bg[0] > 200 && bg[1] > 200 && bg[2] > 200;
      if (isLight && fg.rgb[0] < 90) lightBleed.push({ text: text.slice(0,34), bg: 'rgb(' + bg.join(',') + ')', color: cs.color });
    }

    // radius consistency on cards/buttons
    for (const el of document.querySelectorAll('button, article, .card, [class*="rounded-"]')) {
      const cs = getComputedStyle(el);
      if (!cs.borderRadius || cs.borderRadius === '0px') continue;
    }

    const body = getComputedStyle(document.body);
    return {
      bodyBg: body.backgroundColor,
      bodyColor: body.color,
      lowContrast,
      lightBleed: lightBleed.slice(0, 8),
      lightBleedCount: lightBleed.length,
      fonts: [...new Set([...document.querySelectorAll('h1,h2,p,span,button,a')].map(e => getComputedStyle(e).fontFamily.split(',')[0]))].slice(0,6),
    };
  })()
`;

const routes = ['/', '/features', '/about', '/courselist', '/genchat', '/course', '/coursecontent', '/nope'];
const report = {};
for (const route of routes) {
  await cdp.send('Page.navigate', { url: BASE + route });
  await sleep(1700);
  report[route] = await evaluate(AUDIT);
}

let totalLow = 0, totalBleed = 0;
for (const [r, v] of Object.entries(report)) {
  totalLow += v.lowContrast.length;
  totalBleed += v.lightBleedCount;
  console.log(`\n### ${r}  bg=${v.bodyBg} color=${v.bodyColor}`);
  console.log('   fonts:', v.fonts.join(', '));
  if (v.lowContrast.length) {
    for (const c of v.lowContrast) console.log(`   LOW ${c.ratio}  "${c.text}" ${c.color} on ${c.bg}`);
  }
  if (v.lightBleedCount) {
    for (const c of v.lightBleed) console.log(`   LIGHTBLEED "${c.text}" ${c.color} on ${c.bg}`);
  }
}
console.log(`\nTOTAL low-contrast groups: ${totalLow}, light-theme bleeds: ${totalBleed}`);
ws.close();
chrome.kill();
process.exit(0);
