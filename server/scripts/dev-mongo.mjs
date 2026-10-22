/**
 * Local MongoDB for development.
 *
 * The MongoDB Atlas cluster referenced in `config.env`
 * (cluster0.whhqiyu.mongodb.net) no longer resolves, so this starts a
 * self-contained mongod on a fixed port and keeps it running with a
 * persisted data directory in `server/.mongo-data`.
 *
 *   npm run mongo:dev
 *
 * Connection string to use as DATABASE:
 *   mongodb://127.0.0.1:27017/CourseCraft
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const PORT = Number(process.env.MONGO_PORT || 27017);
const DB_NAME = process.env.MONGO_DB || 'CourseCraft';
const DATA_DIR = path.resolve('./.mongo-data');
const START_TIMEOUT_MS = Number(process.env.MONGO_START_TIMEOUT || 120000);

mkdirSync(DATA_DIR, { recursive: true });

const portInUse = (port) =>
  new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(true));
    srv.once('listening', () => srv.close(() => resolve(false)));
    srv.listen(port, '127.0.0.1');
  });

// mongod refuses to start when a previous run left a lock file behind.
if (await portInUse(PORT)) {
  console.log(`MongoDB is already listening on :${PORT} — nothing to do.`);
  process.exit(0);
}

for (const entry of readdirSync(DATA_DIR)) {
  if (entry.endsWith('.lock') || entry === 'mongod.lock') {
    rmSync(path.join(DATA_DIR, entry), { force: true, recursive: true });
    console.log(`Removed stale lock: ${entry}`);
  }
}

let mongod;
try {
  mongod = await Promise.race([
    MongoMemoryServer.create({
      instance: {
        port: PORT,
        dbName: DB_NAME,
        dbPath: DATA_DIR,
        storageEngine: 'wiredTiger',
      },
    }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timed out after ${START_TIMEOUT_MS}ms`)),
        START_TIMEOUT_MS
      )
    ),
  ]);
} catch (err) {
  console.error('Failed to start MongoDB:', err.message);
  process.exit(1);
}

console.log('MongoDB is running.');
console.log('  URI:      mongodb://127.0.0.1:' + PORT + '/');
console.log('  Database: ' + DB_NAME);
console.log('  Data dir: ' + DATA_DIR);
console.log('Press Ctrl+C to stop.');

const shutdown = async () => {
  await mongod.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
