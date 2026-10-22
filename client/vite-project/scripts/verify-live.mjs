import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = '/tmp/shots/live';
const PORT = 9342;

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
   `--remote-debugging-port=${PORT}`, '--user-data-dir=/tmp/chrome-live-profile', 'about:blank'],
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
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('timeout ' + method)); } }, 30000);
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

let errors = [];
const logs = [];
await cdp.send('Runtime.consoleAPICalled').catch(() => {});
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (msg.params.exceptionDetails.exception?.description || '').slice(0, 200));
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
    errors.push('console.error: ' + msg.params.args.map(a => a.description || a.value).join(' ').slice(0, 200));
});

async function evaluate(expr) {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval fail');
  return r.result.value;
}
async function shot(name) {
  const s = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(s.data, 'base64'));
}
const out = {};

/* 1. landing -> type topic */
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2500);
await evaluate(`
  (() => { const i=document.querySelector('input[aria-label="Topic you want to learn"]');
    const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    set.call(i,'Modern JavaScript'); i.dispatchEvent(new Event('input',{bubbles:true})); return true; })()
`);
await sleep(400);
await shot('01-landing');
await evaluate(`[...document.querySelectorAll('button')].find(b=>b.innerText.trim().toLowerCase()==='start learning').click()`);

/* 2. wait for real Gemini questions */
out.genchat = await (async () => {
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    const st = await evaluate(`
      (() => ({ ta: !!document.querySelector('textarea'), url: location.pathname,
        q: document.querySelector('h2')?.innerText ?? null,
        loading: document.body.innerText.toLowerCase().includes('generating') }))()
    `);
    if (st.ta && st.q) return { ok: true, ...st, waitedSec: i + 1 };
  }
  return { ok: false };
})();
await shot('02-genchat');

/* 3. answer all 6 */
for (let i = 0; i < 6; i++) {
  await evaluate(`
    (() => { const ta=document.querySelector('textarea');
      const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      set.call(ta,'I have solid hands-on experience with this, including how it works under the hood, and I have debugged real production issues with it.');
      ta.dispatchEvent(new Event('input',{bubbles:true})); return true; })()
  `);
  await sleep(300);
  await evaluate(`
    (() => { const b=[...document.querySelectorAll('button')];
      (b.find(x=>x.innerText.toLowerCase().includes('next question'))||b.find(x=>x.innerText.toLowerCase().includes('generate my course'))).click(); return true; })()
  `);
  await sleep(900);
}

/* 4. wait for course generation (real Gemini + Mongo) */
out.course = await (async () => {
  for (let i = 0; i < 300; i++) {
    await sleep(1000);
    const st = await evaluate(`
      (() => ({ url: location.pathname,
        title: document.querySelector('h1')?.innerText ?? null,
        h2: [...document.querySelectorAll('h2')].map(x=>x.innerText),
        modules: document.body.innerText.match(/Module \\d+/g)?.length ?? 0,
        loading: document.body.innerText.toLowerCase().includes('generating') }))()
    `);
    if (st.url === '/course' && st.h2.length) return { ok: true, ...st, waitedSec: i + 1 };
  }
  return { ok: false };
})();
await shot('03-course');

/* 5. expand a module + open notes (real Gemini notes) */
await evaluate(`
  (() => { const b=[...document.querySelectorAll('button')].find(x=>/Module \\d/i.test(x.innerText)||x.innerText.length>5);
    if(b) b.click(); return true; })()
`);
await sleep(1200);
await shot('04-course-expanded');

out.notes = await (async () => {
  const topicBtn = await evaluate(`
    (() => { const b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim().length>25 && !/Module/.test(x.innerText));
      if(b){b.click(); return b.innerText.trim().slice(0,60);} return null; })()
  `);
  if (!topicBtn) return { ok: false, reason: 'no topic button' };
  for (let i = 0; i < 300; i++) {
    await sleep(1000);
    const st = await evaluate(`
      (() => ({ hasMarkdown: !!document.querySelector('.markdown-body'),
        headings: [...document.querySelectorAll('.markdown-body h1,.markdown-body h2,.markdown-body h3')].map(h=>h.innerText).slice(0,6),
        hasTable: !!document.querySelector('.markdown-body table'),
        hasCode: !!document.querySelector('.markdown-body pre code'),
        len: document.querySelector('.markdown-body')?.innerText.length ?? 0 }))()
    `);
    if (st.hasMarkdown && st.len > 200) return { ok: true, topic: topicBtn, waitedSec: i + 1, ...st };
  }
  return { ok: false, topic: topicBtn };
})();
await shot('05-notes');

/* 6. course list */
await cdp.send('Page.navigate', { url: BASE + '/courselist' });
await sleep(2000);
out.courselist = await evaluate(`
  (() => ({ cards: document.querySelectorAll('article').length,
    text: document.body.innerText.slice(0,200) }))()
`);
await shot('06-courselist');

/* 7. login modal */
await cdp.send('Page.navigate', { url: BASE + '/' });
await sleep(2000);
await evaluate(`
  (() => { const b=[...document.querySelectorAll('button')].find(x=>/log ?in|sign ?in/i.test(x.innerText));
    if(b) b.click(); return !!b; })()
`);
await sleep(900);
out.loginModal = await evaluate(`
  (() => ({ visible: !!document.querySelector('#login-email'),
    title: document.querySelector('.glass-strong h2')?.innerText ?? null }))()
`);
await shot('07-login');

/* 8. actually log in */
await evaluate(`
  (() => {
    const setV=(el,v)=>{const set=Object.getOwnPropertyDescriptor(el.constructor.prototype,'value').set; set.call(el,v); el.dispatchEvent(new Event('input',{bubbles:true}));};
    setV(document.querySelector('#login-email'),'testuser@example.com');
    setV(document.querySelector('#login-password'),'Test@12345');
    return true; })()
`);
await sleep(300);
await evaluate(`document.querySelector('form').requestSubmit()`);
await sleep(2500);
out.loggedIn = await evaluate(`
  (() => ({ token: !!localStorage.getItem('token'),
    navText: document.querySelector('nav')?.innerText.replace(/\\n/g,' | ').slice(0,160) }))()
`);
await shot('08-logged-in');

out.errors = errors;
console.log(JSON.stringify(out, null, 2));
ws.close();
chrome.kill();
process.exit(0);
