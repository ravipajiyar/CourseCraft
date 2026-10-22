/**
 * Local mock of the CourseCraft API (server + NLP services) so the full
 * assessment → course → notes flow can be exercised without MongoDB or a
 * Gemini key. Dev-only helper.
 *
 *   npm run mock:api
 *   VITE_API_URL=http://127.0.0.1:3100 npm run dev
 *
 * Port 3100 is used by default to avoid colliding with the real backend on
 * :3000 — override with MOCK_PORT if needed.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_PORT || 3100);

const QUESTIONS = {
  basic: [
    'What is a closure in JavaScript, and when would you use one?',
    'Explain the difference between `let`, `const` and `var`.',
  ],
  intermediate: [
    'How does prototypal inheritance differ from class-based inheritance?',
    'Describe the event loop and how microtasks are scheduled.',
  ],
  advanced: [
    'How would you detect memory leaks in a long-running Node.js service?',
    'Explain how the V8 garbage collector decides what to collect.',
  ],
};

const COURSE = {
  title: 'Modern JavaScript: From Fundamentals to Runtime Internals',
  modules: [
    {
      moduleNumber: 1,
      moduleName: 'Core Language Fundamentals',
      contents: [
        'Variable scoping and the lexical environment',
        'Closures and their memory model',
        'Hoisting and temporal dead zones',
      ],
    },
    {
      moduleNumber: 2,
      moduleName: 'The Event Loop & Asynchrony',
      contents: [
        'Call stack, task queue and microtask queue',
        'Promises and the microtask checkpoint',
        'async/await under the hood',
      ],
    },
    {
      moduleNumber: 3,
      moduleName: 'Runtime & Performance Internals',
      contents: [
        'How V8 parses and optimises your code',
        'Garbage collection strategies',
        'Diagnosing memory leaks in production',
      ],
    },
  ],
};

const NOTES = `# Closures and the Lexical Environment

A **closure** is the combination of a function bundled together with its
*lexical environment* — the scope in which that function was originally
declared.

\`\`\`js
function counter() {
  let count = 0;
  return () => ++count;
}
const next = counter();
next(); // 1
next(); // 2
\`\`\`

## Why it matters

| Concept | Description |
| --- | --- |
| Scope chain | Resolution walks outward through parent scopes |
| Capture | Variables are captured **by reference**, not by value |

> Closures keep their enclosing scope alive, which is a common cause of
> memory pressure in long-running services.

### Practical notes

1. Prefer explicit state over captured closures in hot paths.
2. Use \`WeakRef\` / \`FinalizationRegistry\` for caches that can be collected.
3. Always null out references to large object graphs on teardown.

See the [MDN docs](https://developer.mozilla.org) for more.
`;

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    const url = req.url.replace(/\?.*$/, '');
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      /* ignore */
    }

    if (url.endsWith('/generate-questions')) {
      return send(res, 201, { status: 'success', data: QUESTIONS });
    }
    if (url.endsWith('/generate-module')) {
      return send(res, 200, { status: 'success', course: COURSE });
    }
    if (url.endsWith('/get-notes')) {
      return send(res, 200, {
        status: 'success',
        notes: { topic: body.topic, note: NOTES },
      });
    }
    if (url.endsWith('/login')) {
      return send(res, 200, {
        status: 'success',
        token: 'mock-token',
        data: { user: { name: 'Ravi', email: body.email } },
        user: { name: 'Ravi', email: body.email },
      });
    }
    send(res, 404, { status: 'error', message: 'Not found' });
  });
}).listen(PORT, () => console.log('mock API on http://127.0.0.1:' + PORT));
