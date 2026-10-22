import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = '/tmp/shots';
const PORT = 9336;

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=/tmp/chrome-flow-profile',
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
await cdp.send('Log.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

let errors = [];
cdp.on((msg) => {
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    errors.push(`exception: ${d.exception?.description || d.text}`);
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push(
      `console.error: ${msg.params.args.map((a) => a.description || a.value).join(' ')}`
    );
  }
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

const log = [];

/* ---------------------------------------------------------- 1. landing */
errors = [];
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2200);
await shot('flow-1-landing');

/* ------------------------------------------- 2. type topic + start */
await evaluate(`
  (() => {
    const input = document.querySelector('input[aria-label="Topic you want to learn"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'Modern JavaScript');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()
`);
await sleep(400);
const chipState = await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toLowerCase() === 'start learning');
    return { disabled: btn ? btn.disabled : 'missing', label: btn ? btn.innerText.trim() : null };
  })()
`);
await shot('flow-2-topic-typed');

await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.trim().toLowerCase() === 'start learning');
    btn.click();
    return true;
  })()
`);
await sleep(2500);

/* ------------------------------------------------------- 3. genchat */
const chat = await evaluate(`
  (() => {
    const h = document.querySelector('h1');
    const ta = document.querySelector('textarea');
    const progress = document.querySelector('.bg-brand-gradient');
    return {
      url: location.pathname,
      h1: h ? h.innerText : null,
      hasTextarea: !!ta,
      tier: document.body.innerText.includes('Basic level'),
      progressWidth: progress ? progress.style.width : null,
      answered: document.body.innerText.match(/(\\d+) answered/)?.[0],
    };
  })()
`);
await shot('flow-3-genchat');

/* ---------------------------------------- 4. answer all six questions */
for (let i = 0; i < 6; i++) {
  await evaluate(`
    (() => {
      const ta = document.querySelector('textarea');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, 'I have hands-on experience with this and understand the underlying mechanics well enough to explain them.');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()
  `);
  await sleep(250);
  await evaluate(`
    (() => {
      const btns = [...document.querySelectorAll('button')];
      const next = btns.find(b => b.innerText.trim().toLowerCase().includes('next question'));
      const gen = btns.find(b => b.innerText.trim().toLowerCase().includes('generate my course'));
      (next || gen).click();
      return true;
    })()
  `);
  await sleep(700);
}
await sleep(800);

/* ------------------------------------------------------ 4. course page */
const course = await evaluate(`
  (() => {
    const h = document.querySelector('h1');
    const h2 = [...document.querySelectorAll('h2')].map(x => x.innerText);
    return {
      url: location.pathname,
      h1: h ? h.innerText : null,
      h2s: h2,
      moduleButtons: document.body.innerText.match(/Module \\d+/g)?.slice(0, 6),
      hasTopicText: document.body.innerText.includes('Closures and their memory model'),
    };
  })()
`);
await shot('flow-4-course');

/* ------------------------------------- 5. expand module + open notes */
await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Core Language Fundamentals'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(600);
const expanded = await evaluate(`
  (() => ({
    topicsVisible: document.body.innerText.includes('Variable scoping and the lexical environment'),
  }))()
`);
await shot('flow-5-module-expanded');

await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Closures and their memory model'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(2000);
const notes = await evaluate(`
  (() => {
    const mb = document.querySelector('.markdown-body');
    return {
      hasMarkdown: !!mb,
      headings: mb ? [...mb.querySelectorAll('h1,h2,h3')].map(h => h.innerText) : [],
      hasTable: mb ? !!mb.querySelector('table') : false,
      hasCode: mb ? !!mb.querySelector('pre code') : false,
      hasBlockquote: mb ? !!mb.querySelector('blockquote') : false,
      hasLink: mb ? !!mb.querySelector('a') : false,
      codeColor: mb ? getComputedStyle(mb.querySelector('code')).color : null,
    };
  })()
`);
await shot('flow-6-notes');

/* ------------------------------------------------ 6. course player */
await cdp.send('Page.navigate', { url: BASE + '/coursecontent' });
await sleep(2000);
const player = await evaluate(`
  (() => ({
    url: location.pathname,
    title: document.querySelector('h1') ? document.querySelector('h1').innerText : null,
    sidebarModules: document.body.innerText.match(/Module \\d+/g)?.slice(0, 6),
    hasSidebar: !!document.querySelector('aside'),
    asideSticky: document.querySelector('aside') ? getComputedStyle(document.querySelector('aside')).position : null,
  }))()
`);
await shot('flow-7-player');

await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Closures and their memory model'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(2200);
const playerNotes = await evaluate(`
  (() => ({
    hasMarkdown: !!document.querySelector('.markdown-body'),
    headings: [...document.querySelectorAll('.markdown-body h1, .markdown-body h2')].map(h => h.innerText),
  }))()
`);
await shot('flow-8-player-notes');

/* ---------------------------------------------------- 7. course list */
await cdp.send('Page.navigate', { url: BASE + '/courselist' });
await sleep(1800);
const list = await evaluate(`
  (() => ({
    hasLive: document.body.innerText.includes('Your latest course'),
    liveTitle: document.body.innerText.includes('Modern JavaScript'),
    cards: document.querySelectorAll('article').length,
  }))()
`);
await shot('flow-9-courselist');

log.push(
  { step: '2-topic-typed', chipState, errors: [...errors] },
  { step: '3-genchat', chat, errors: [...errors] },
  { step: '4-course', course, errors: [...errors] },
  { step: '5-expanded', expanded, errors: [...errors] },
  { step: '6-notes', notes, errors: [...errors] },
  { step: '7-player', player, errors: [...errors] },
  { step: '8-player-notes', playerNotes, errors: [...errors] },
  { step: '9-courselist', list, errors: [...errors] }
);

console.log(JSON.stringify(log, null, 2));
ws.close();
chrome.kill();
process.exit(0);
