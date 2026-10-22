import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = '/tmp/shots';
const PORT = 9337;

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/chrome-flow2-profile',
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
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) this.listeners.forEach((fn) => fn(msg));
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
  on(fn) {
    this.listeners.push(fn);
  }
}

const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const cdp = new CDP(ws);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

let errors = [];
cdp.on((msg) => {
  if (msg.method === 'Runtime.exceptionThrown')
    errors.push(`exception: ${msg.params.exceptionDetails.exception?.description}`);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
    errors.push(
      `console.error: ${msg.params.args.map((a) => a.description || a.value).join(' ')}`
    );
});

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

async function shot(name) {
  const s = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(s.data, 'base64'));
}

const out = {};

/* --- run the assessment to produce a course ------------------------- */
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2200);
await evaluate(`
  (() => {
    const input = document.querySelector('input[aria-label="Topic you want to learn"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'Modern JavaScript');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()
`);
await sleep(300);
await evaluate(`
  [...document.querySelectorAll('button')].find(b => b.innerText.trim().toLowerCase() === 'start learning').click()
`);
await sleep(2500);

out.progressBar = await evaluate(`
  (() => {
    const bar = [...document.querySelectorAll('div')].find(d => d.className.includes('bg-brand-gradient') && d.style.width);
    const tier = document.body.innerText.match(/(BASIC|INTERMEDIATE|ADVANCED)\\s*LEVEL/i);
    return { width: bar ? bar.style.width : null, tierLabel: tier ? tier[0] : null, dots: document.querySelectorAll('.h-2.flex-1').length };
  })()
`);

for (let i = 0; i < 6; i++) {
  await evaluate(`
    (() => {
      const ta = document.querySelector('textarea');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, 'Solid hands-on experience with this topic, including the underlying internals.');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()
  `);
  await sleep(200);
  await evaluate(`
    (() => {
      const btns = [...document.querySelectorAll('button')];
      (btns.find(b => b.innerText.trim().toLowerCase().includes('next question')) ||
       btns.find(b => b.innerText.trim().toLowerCase().includes('generate my course'))).click();
      return true;
    })()
  `);
  await sleep(650);
}
await sleep(1200);

/* --- client-side nav into the player -------------------------------- */
await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toLowerCase().includes('enter course player'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(2200);

out.playerViaClick = await evaluate(`
  (() => {
    const aside = document.querySelector('aside');
    return {
      url: location.pathname,
      h1: document.querySelector('h1')?.innerText ?? null,
      hasAside: !!aside,
      asidePosition: aside ? getComputedStyle(aside).position : null,
      modules: [...document.querySelectorAll('aside button')].length,
      contentAreaTopics: document.body.innerText.includes('Call stack, task queue and microtask queue'),
    };
  })()
`);
await shot('flow2-player');

/* --- open a topic inside the player --------------------------------- */
await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Call stack, task queue and microtask queue'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(2500);
out.playerNotes = await evaluate(`
  (() => ({
    hasMarkdown: !!document.querySelector('.markdown-body'),
    headings: [...document.querySelectorAll('.markdown-body h1, .markdown-body h2')].map(h => h.innerText),
    hasTable: !!document.querySelector('.markdown-body table'),
  }))()
`);
await shot('flow2-player-notes');

/* --- HARD RELOAD on /coursecontent (persistence check) --------------- */
await cdp.send('Page.reload', { ignoreCache: false });
await sleep(2500);
out.afterReload = await evaluate(`
  (() => ({
    url: location.pathname,
    h1: document.querySelector('h1')?.innerText ?? null,
    hasAside: !!document.querySelector('aside'),
    titleInDom: document.body.innerText.includes('Modern JavaScript: From Fundamentals to Runtime Internals'),
  }))()
`);
await shot('flow2-after-reload');

/* --- hard reload on /genchat (assessment persistence) --------------- */
await cdp.send('Page.navigate', { url: BASE + '/genchat' });
await sleep(2000);
out.genchatAfterReload = await evaluate(`
  (() => ({
    hasTextarea: !!document.querySelector('textarea'),
    question: document.querySelector('h2')?.innerText ?? null,
    topic: document.body.innerText.includes('Modern JavaScript'),
  }))()
`);

/* --- hard reload on /courselist ------------------------------------- */
await cdp.send('Page.navigate', { url: BASE + '/courselist' });
await sleep(2000);
out.listAfterReload = await evaluate(`
  (() => ({
    hasLive: document.body.innerText.includes('Your latest course'),
    liveTitle: document.body.innerText.includes('Modern JavaScript'),
    cards: document.querySelectorAll('article').length,
  }))()
`);
await shot('flow2-courselist');

out.errors = errors;
console.log(JSON.stringify(out, null, 2));
ws.close();
chrome.kill();
process.exit(0);
