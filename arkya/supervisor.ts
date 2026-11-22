// Arkya all-in-one entrypoint for It's a Plan.
//
// One ACS container runs api + worker + web, and this process listens on $PORT
// (set by Arkya) as the single public origin:
//   /api/*                                   -> api :3000 (prefix removed)
//   /.well-known/oauth-authorization-server* -> api :3000 (as is)
//   /.well-known/oauth-protected-resource*   -> api :3000
//   /.well-known/openid-configuration*       -> api :3000
//   everything else                          -> web :3001
// This is the "API_URL as a path on the web's host" layout of docs/self-hosting.md.
//
// Migrations run first. If any child exits, the whole container exits so Arkya
// restarts it; SIGTERM is forwarded to the children.

const API = 'http://127.0.0.1:3000';
const WEB = 'http://127.0.0.1:3001';
const PORT = Number(process.env.PORT ?? 8080);

const children: ReturnType<typeof Bun.spawn>[] = [];
let stopping = false;

function stopAll(code: number) {
  if (stopping) return;
  stopping = true;
  for (const c of children) c.kill('SIGTERM');
  setTimeout(() => process.exit(code), 8000).unref();
  Promise.allSettled(children.map((c) => c.exited)).then(() => process.exit(code));
}
process.on('SIGTERM', () => stopAll(0));
process.on('SIGINT', () => stopAll(0));

// Arkya resolves ${alias.HOST}/${alias.PORT} as whole values, so the URL is built here.
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const e = process.env;
  process.env.DATABASE_URL =
    `postgres://${encodeURIComponent(e.DB_USER ?? '')}:${encodeURIComponent(e.DB_PASSWORD ?? '')}` +
    `@${e.DB_HOST}:${e.DB_PORT ?? '5432'}/${e.DB_NAME ?? ''}`;
}

// The pre-migration pg_dump needs a persistent folder: an Arkya disk mounted on /data.
// Without one, the root filesystem is read-only and the dump would stop the startup.
if (!process.env.BACKUP_DIR) {
  const { mkdirSync, accessSync, constants } = await import('node:fs');
  try {
    mkdirSync('/data/backups', { recursive: true });
    accessSync('/data/backups', constants.W_OK);
    process.env.BACKUP_DIR = '/data/backups';
  } catch {
    console.warn('[arkya] no writable disk on /data: migrations run without a pg_dump backup');
    process.env.SKIP_PRE_MIGRATION_BACKUP = '1';
  }
}

// 1) Migrations (blocking). The api image would do this in its CMD.
const migrate = Bun.spawn(['bun', 'run', 'packages/db/src/migrate.ts'], {
  cwd: '/app',
  env: { ...process.env },
  stdout: 'inherit',
  stderr: 'inherit',
});
const migrateCode = await migrate.exited;
if (migrateCode !== 0) {
  console.error(`[arkya] migrations failed (${migrateCode})`);
  process.exit(1);
}

// Target of the /web/apps/web/.next/cache symlink baked into the image.
(await import('node:fs')).mkdirSync('/tmp/next-cache', { recursive: true });

// 2) Long-running services.
function start(name: string, cmd: string[], env: Record<string, string>, cwd = '/app') {
  const child = Bun.spawn(cmd, {
    cwd,
    env: { ...process.env, ...env },
    stdout: 'inherit',
    stderr: 'inherit',
  });
  children.push(child);
  child.exited.then((code) => {
    if (stopping) return;
    console.error(`[arkya] ${name} exited (${code}), stopping container`);
    stopAll(1);
  });
}

start('api', ['bun', 'run', 'apps/api/src/index.ts'], { API_PORT: '3000' });
start('worker', ['bun', 'run', 'apps/worker/src/index.ts'], {}, '/worker');
start(
  'web',
  ['node', 'apps/web/server.js'],
  { PORT: '3001', HOSTNAME: '127.0.0.1', SERVICE_URL_API: API },
  '/web',
);

// 3) Front proxy.
const HOP = [
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-connection',
  'te',
  'trailer',
];

function target(url: URL): string {
  const p = url.pathname;
  if (p === '/api' || p.startsWith('/api/')) {
    return API + (p.slice(4) || '/') + url.search;
  }
  if (
    p.startsWith('/.well-known/oauth-authorization-server') ||
    p.startsWith('/.well-known/oauth-protected-resource') ||
    p.startsWith('/.well-known/openid-configuration')
  ) {
    return API + p + url.search;
  }
  return WEB + p + url.search;
}

// Over HTTPS this instance names its session cookies `__Host-better-auth.*`. A
// `__Secure-better-auth.<session cookie>` comes from another better-auth app on a parent
// domain (.arkya.gg): the web gate takes it for a session, the api refuses it, and the
// sign-out cannot clear a parent-domain cookie, so the browser loops between / and /login.
const FOREIGN_SESSION_COOKIE =
  /^__Secure-better-auth\.(session_token|session_data|account_data|dont_remember)$/;

Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  idleTimeout: 0, // SSE streams from the api stay open
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/__arkya/health') return new Response('ok');
    const headers = new Headers(req.headers);
    for (const h of HOP) headers.delete(h);
    const host = req.headers.get('host') ?? url.host;
    headers.set('x-forwarded-host', host);
    if (!headers.has('x-forwarded-proto')) headers.set('x-forwarded-proto', 'https');
    const cookie = req.headers.get('cookie');
    if (cookie) {
      const kept = cookie
        .split(';')
        .filter((c) => !FOREIGN_SESSION_COOKIE.test(c.split('=')[0].trim()));
      if (kept.length) headers.set('cookie', kept.join(';'));
      else headers.delete('cookie');
    }
    try {
      const res = await fetch(target(url), {
        method: req.method,
        headers,
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
        redirect: 'manual',
        // keep upstream bytes and content-encoding as they are
        decompress: false,
      } as RequestInit);
      if (res.status === 401 || res.status === 403) {
        const names = (req.headers.get('cookie') ?? '')
          .split(';')
          .map((c) => c.split('=')[0].trim())
          .filter(Boolean);
        console.warn(
          `[arkya] ${res.status} ${req.method} ${url.pathname} cookies=[${names.join(',')}]`,
        );
      }
      const out = new Headers(res.headers);
      for (const h of HOP) out.delete(h);
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: out,
      });
    } catch {
      return new Response('Service is starting, retry in a few seconds.', { status: 503 });
    }
  },
});
console.log(`[arkya] proxy listening on :${PORT}`);
