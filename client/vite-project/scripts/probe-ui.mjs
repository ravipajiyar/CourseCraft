import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const PORT = 9335;

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/chrome-verify-profile3',
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
    } catch {}
    await sleep(250);
  }
  throw new Error('no target');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
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
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('timeout ' + method));
        }
      }, 20000);
    });
  }
}

const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new CDP(ws);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

async function evaluate(expr) {
  const r = await cdp.send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails)
    throw new Error(r.exceptionDetails.exception?.description || 'eval fail');
  return r.result.value;
}

async function view(width, height) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
}

const out = {};

/* ---------------------------------------------------------- desktop 1440 */
await view(1440, 900);
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2500);

out.desktop = await evaluate(`
  (() => {
    const burger = document.querySelector('button[aria-label="Toggle menu"]');
    const navLinks = [...document.querySelectorAll('nav a')].filter(a => a.textContent.trim()==='Features');
    const desktopRow = navLinks[0]?.closest('div');
    return {
      viewport: window.innerWidth,
      burgerDisplay: burger ? getComputedStyle(burger).display : 'missing',
      desktopRowDisplay: desktopRow ? getComputedStyle(desktopRow).display : 'missing',
      h1Size: getComputedStyle(document.querySelector('h1')).fontSize,
      h1Weight: getComputedStyle(document.querySelector('h1')).fontWeight,
      heroMaxWidth: getComputedStyle(document.querySelector('h1')).maxWidth,
    };
  })()
`);

out.glassNow = await evaluate(`
  [...document.querySelectorAll('.glass')].slice(0,3).map(el => {
    const s = getComputedStyle(el);
    return { backdrop: s.backdropFilter, border: s.borderTopWidth, bg: s.backgroundImage.slice(0,50) };
  })
`);

out.statsGrid = await evaluate(`
  (() => {
    const el = [...document.querySelectorAll('div')].find(d => d.textContent.trim().startsWith('6') && d.textContent.includes('Diagnostic questions'));
    const grid = [...document.querySelectorAll('.grid')].find(g => g.textContent.includes('Diagnostic questions'));
    if (!grid) return null;
    const s = getComputedStyle(grid);
    return { display: s.display, cols: s.gridTemplateColumns, gap: s.gap, border: s.borderTopWidth, bg: s.backgroundImage.slice(0,50) };
  })()
`);

out.fonts = await evaluate(`
  (async () => {
    await document.fonts.ready;
    const loaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight);
    return {
      plusJakarta: document.fonts.check('600 16px "Plus Jakarta Sans"'),
      jetbrains: document.fonts.check('400 12px "JetBrains Mono"'),
      loadedFamilies: [...new Set(loaded)].slice(0, 8),
    };
  })()
`);

/* ----------------------------------------------------------- mobile 390 */
await view(390, 844);
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2000);

out.mobile = await evaluate(`
  (() => {
    const burger = document.querySelector('button[aria-label="Toggle menu"]');
    const navLinks = [...document.querySelectorAll('nav a')].filter(a => a.textContent.trim()==='Features');
    const row = navLinks[0]?.closest('div');
    const grid = [...document.querySelectorAll('.grid')].find(g => g.textContent.includes('Diagnostic questions'));
    return {
      viewport: window.innerWidth,
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      burgerDisplay: burger ? getComputedStyle(burger).display : 'missing',
      desktopRowDisplay: row ? getComputedStyle(row).display : 'missing',
      h1Size: getComputedStyle(document.querySelector('h1')).fontSize,
      statsCols: grid ? getComputedStyle(grid).gridTemplateColumns : 'missing',
      tapTargets: [...document.querySelectorAll('button,a')].filter(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 32;
      }).length,
    };
  })()
`);

/* ------------------------------------------------- open mobile menu */
await evaluate(`
  document.querySelector('button[aria-label="Toggle menu"]').click()
`);
await sleep(500);
out.mobileMenuOpen = await evaluate(`
  (() => {
    const links = [...document.querySelectorAll('nav a')].map(a => a.textContent.trim());
    return { visibleLinks: links.filter(Boolean), bodyOverflow: document.body.style.overflow };
  })()
`);

console.log(JSON.stringify(out, null, 2));
ws.close();
chrome.kill();
process.exit(0);
