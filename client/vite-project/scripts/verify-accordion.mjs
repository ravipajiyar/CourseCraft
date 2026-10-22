import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const PORT = 9338;

const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
   `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-acc-profile', 'about:blank'],
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
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

async function evaluate(expr) {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval fail');
  return r.result.value;
}

const out = {};

/* seed a course via the mock API + assessment flow */
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2200);
await evaluate(`
  (() => {
    const i = document.querySelector('input[aria-label="Topic you want to learn"]');
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    set.call(i,'Modern JavaScript'); i.dispatchEvent(new Event('input',{bubbles:true})); return true;
  })()
`);
await sleep(300);
await evaluate(`[...document.querySelectorAll('button')].find(b=>b.innerText.trim().toLowerCase()==='start learning').click()`);
await sleep(2500);
for (let i = 0; i < 6; i++) {
  await evaluate(`
    (() => { const ta=document.querySelector('textarea');
      const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      set.call(ta,'Answer with detail.'); ta.dispatchEvent(new Event('input',{bubbles:true})); return true; })()
  `);
  await sleep(200);
  await evaluate(`
    (() => { const b=[...document.querySelectorAll('button')];
      (b.find(x=>x.innerText.toLowerCase().includes('next question'))||b.find(x=>x.innerText.toLowerCase().includes('generate my course'))).click(); return true; })()
  `);
  await sleep(650);
}
await sleep(1200);

/* go to player via client-side nav */
await evaluate(`
  (() => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.toLowerCase().includes('enter course player'));
    if(b) b.click(); return true; })()
`);
await sleep(2200);

/* accordion heights */
out.accordion = await evaluate(`
  (() => {
    const aside = document.querySelector('aside');
    const wrappers = [...aside.querySelectorAll('.grid > .overflow-hidden')];
    return {
      count: wrappers.length,
      heights: wrappers.map(w => Math.round(w.getBoundingClientRect().height)),
      gridRows: wrappers.map(w => getComputedStyle(w.parentElement).gridTemplateRows),
    };
  })()
`);

/* expand module 2 in the sidebar, then open a module-2 topic */
await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('aside button')].find(b => b.innerText.includes('The Event Loop'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(700);

out.afterExpandModule2 = await evaluate(`
  (() => {
    const aside = document.querySelector('aside');
    const wrappers = [...aside.querySelectorAll('.grid > .overflow-hidden')];
    return { heights: wrappers.map(w => Math.round(w.getBoundingClientRect().height)) };
  })()
`);

await evaluate(`
  (() => {
    const btn = [...document.querySelectorAll('aside button')].find(b => b.innerText.includes('Call stack, task queue and microtask queue'));
    if (btn) btn.click();
    return true;
  })()
`);
await sleep(2600);

out.notesInPlayer = await evaluate(`
  (() => ({
    hasMarkdown: !!document.querySelector('.markdown-body'),
    headings: [...document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')].map(h=>h.innerText),
    hasTable: !!document.querySelector('.markdown-body table'),
    hasCode: !!document.querySelector('.markdown-body pre code'),
    hasQuote: !!document.querySelector('.markdown-body blockquote'),
  }))()
`);

/* also verify the CoursePage accordion collapses */
await cdp.send('Page.navigate', { url: BASE + '/course' });
await sleep(2000);
out.courseAccordion = await evaluate(`
  (() => {
    const wraps = [...document.querySelectorAll('.grid > .overflow-hidden')];
    return {
      count: wraps.length,
      heights: wraps.map(w => Math.round(w.getBoundingClientRect().height)),
    };
  })()
`);

console.log(JSON.stringify(out, null, 2));
ws.close();
chrome.kill();
process.exit(0);
